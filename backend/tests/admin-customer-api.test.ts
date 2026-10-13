import { describe, it, expect, vi, beforeEach } from "vitest";
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  deleteUser: vi.fn(),
  delete: vi.fn(),
  getUser: vi.fn(),
  claims: vi.fn(),
  send: vi.fn(),
}));
vi.mock("@/lib/auth/server", () => ({ requireAdmin: m.auth }));
vi.mock("nodemailer", () => ({
  default: { createTransport: () => ({ sendMail: m.send }) },
}));
vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: {
    deleteUser: m.deleteUser,
    getUser: m.getUser,
    setCustomUserClaims: m.claims,
  },
  adminDb: {
    collection: () => ({
      doc: () => ({ get: m.get, update: m.update, delete: m.delete }),
    }),
  },
}));
import { DELETE } from "../src/app/api/admin/users/[userId]/route";
import { POST as message } from "../src/app/api/admin/users/[userId]/message/route";
import { POST as approve } from "../src/app/api/auth/promote-delivery/route";
const req = (body = {}) =>
  new Request("http://localhost/api/admin/users/customer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.resetAllMocks();
  m.auth.mockResolvedValue({ uid: "admin" });
  m.get.mockResolvedValue({
    exists: true,
    data: () => ({ email: "customer@example.test", role: "delivery_pending" }),
  });
  m.getUser.mockResolvedValue({ customClaims: { existing: true } });
});
describe("Customer actions", () => {
  it("deletes the selected account using the same admin permission check as the panel", async () => {
    expect(
      (await DELETE(req(), { params: { userId: "customer" } })).status,
    ).toBe(200);
    expect(m.deleteUser).toHaveBeenCalledWith("customer");
    expect(m.delete).toHaveBeenCalled();
  });
  it("protects the signed-in admin account", async () => {
    expect((await DELETE(req(), { params: { userId: "admin" } })).status).toBe(
      400,
    );
    expect(m.deleteUser).not.toHaveBeenCalled();
  });
  it("approves only pending delivery applicants and preserves existing claims", async () => {
    expect((await approve(req({ targetUid: "customer" }))).status).toBe(200);
    expect(m.claims).toHaveBeenCalledWith("customer", {
      existing: true,
      role: "delivery_partner",
    });
    m.get.mockResolvedValue({ exists: true, data: () => ({ role: "admin" }) });
    expect((await approve(req({ targetUid: "admin" }))).status).toBe(400);
  });
  it("does not pretend an email was sent without SMTP", async () => {
    vi.stubEnv("SMTP_USER", "");
    vi.stubEnv("SMTP_PASS", "");
    expect(
      (
        await message(
          req({ subject: "Order update", message: "A test message" }),
          { params: { userId: "customer" } },
        )
      ).status,
    ).toBe(503);
    expect(m.send).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
  it("uses the actual customer email instead of a caller-supplied recipient", async () => {
    vi.stubEnv("SMTP_USER", "store@example.test");
    vi.stubEnv("SMTP_PASS", "test-only");
    expect(
      (
        await message(
          req({
            subject: "Order update",
            message: "A test message",
            customerEmail: "someone-else@example.test",
          }),
          { params: { userId: "customer" } },
        )
      ).status,
    ).toBe(200);
    expect(m.send.mock.calls[0][0].to).toBe("customer@example.test");
    vi.unstubAllEnvs();
  });
});
