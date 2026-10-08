import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ signOut: vi.fn(), fetch: vi.fn(), assign: vi.fn() }));
vi.mock("@/lib/firebase/client", () => ({ auth: { signOut: mocks.signOut } }));
import { logout } from "../src/lib/auth/client";

describe("Logout", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("fetch", mocks.fetch);
    vi.stubGlobal("window", { location: { assign: mocks.assign } });
    mocks.fetch.mockResolvedValue({ ok: true });
  });
  afterEach(() => vi.unstubAllGlobals());
  it("clears the server and Firebase sessions before returning to login", async () => {
    await logout();
    expect(mocks.fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    expect(mocks.signOut).toHaveBeenCalled();
    expect(mocks.assign).toHaveBeenCalledWith("/login");
    expect(mocks.signOut.mock.invocationCallOrder[0]).toBeLessThan(mocks.assign.mock.invocationCallOrder[0]);
  });
  it("keeps the current page when server logout fails", async () => {
    mocks.fetch.mockResolvedValue({ ok: false });
    await expect(logout()).rejects.toThrow("Unable to log out");
    expect(mocks.assign).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
