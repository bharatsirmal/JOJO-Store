import { it, expect, vi, beforeEach, afterEach } from "vitest";
const m = vi.hoisted(() => ({ cookie: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: () => ({ get: m.cookie }) }));
import { backendRequest } from "../src/lib/backend/request";
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_BACKEND_URL", "http://localhost:4000");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("forwards only the session cookie for server-rendered private reads", async () => {
  m.cookie.mockReturnValue({ value: "signed-session" });
  const fetch = vi.fn().mockResolvedValue(Response.json({ uid: "u" }));
  vi.stubGlobal("fetch", fetch);
  expect(await backendRequest("/api/auth/profile")).toEqual({ uid: "u" });
  const [url, options] = fetch.mock.calls[0];
  expect(String(url)).toBe("http://localhost:4000/api/auth/profile");
  expect(options.headers.Cookie).toBe("__session=signed-session");
  expect(options.cache).toBe("no-store");
});
it("does not access cookies or credentials for cached public catalog reads", async () => {
  m.cookie.mockImplementation(() => {
    throw Error("Cookie access inside public cache");
  });
  const fetch = vi.fn().mockResolvedValue(Response.json({ rows: [] }));
  vi.stubGlobal("fetch", fetch);
  await backendRequest("/api/data/read", { path: "products" }, true);
  expect(m.cookie).not.toHaveBeenCalled();
  expect(fetch.mock.calls[0][1].headers.Cookie).toBeUndefined();
});
it("preserves backend authorization failures", async () => {
  m.cookie.mockReturnValue(undefined);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ error: "Forbidden" }, { status: 403 }),
      ),
  );
  await expect(
    backendRequest("/api/data/read", { path: "users" }),
  ).rejects.toMatchObject({ message: "Forbidden", status: 403 });
});
