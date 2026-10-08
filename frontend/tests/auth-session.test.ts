import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  createCookie: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  cookieSet: vi.fn(),
  transaction: vi.fn(),
  doc: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: () => ({ set: mocks.cookieSet }) }));
vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: { verifyIdToken: mocks.verify, createSessionCookie: mocks.createCookie },
  adminDb: {
    collection: () => ({ doc: mocks.doc }),
    runTransaction: mocks.transaction,
  },
}));

import { POST } from "../src/app/api/auth/session/route";

function signInRequest() {
  return new Request("https://store.example/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: "verified-token" }),
  });
}

describe("Sign-in session", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.verify.mockResolvedValue({
      uid: "customer-uid",
      email: "customer@example.com",
      name: "Customer Name",
      picture: "https://example.com/avatar.png",
      auth_time: Math.floor(Date.now() / 1000),
    });
    mocks.createCookie.mockResolvedValue("session-cookie");
    mocks.doc.mockReturnValue("user-profile-ref");
    mocks.get.mockResolvedValue({ exists: false });
    mocks.transaction.mockImplementation(callback => callback({ get: mocks.get, set: mocks.set }));
  });

  it("creates an account profile before completing a first social sign-in", async () => {
    const response = await POST(signInRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, role: "customer" });
    expect(mocks.set).toHaveBeenCalledWith("user-profile-ref", expect.objectContaining({
      uid: "customer-uid", email: "customer@example.com", displayName: "Customer Name",
      photoURL: "https://example.com/avatar.png", role: "customer",
    }));
    expect(mocks.set.mock.invocationCallOrder[0]).toBeLessThan(mocks.cookieSet.mock.invocationCallOrder[0]);
  });

  it("preserves an existing admin profile and role", async () => {
    mocks.get.mockResolvedValue({ exists: true, data: () => ({ role: "admin" }) });
    const response = await POST(signInRequest());
    expect(await response.json()).toEqual({ success: true, role: "admin" });
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("retains a verified privileged claim when recovering a missing profile", async () => {
    const token = await mocks.verify();
    mocks.verify.mockResolvedValue({ ...token, role: "delivery_partner" });
    const response = await POST(signInRequest());
    expect(await response.json()).toEqual({ success: true, role: "delivery_partner" });
    expect(mocks.set).toHaveBeenCalledWith("user-profile-ref", expect.objectContaining({ role: "delivery_partner" }));
  });

  it("does not issue a cookie if the profile cannot be loaded", async () => {
    mocks.transaction.mockRejectedValue(new Error("Database unavailable"));
    const response = await POST(signInRequest());
    expect(response.status).toBe(401);
    expect(mocks.cookieSet).not.toHaveBeenCalled();
  });

  it("rejects unverified tokens before writing profiles", async () => {
    mocks.verify.mockRejectedValue(new Error("Invalid token"));
    const response = await POST(signInRequest());
    expect(response.status).toBe(401);
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.cookieSet).not.toHaveBeenCalled();
  });
});
