import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  emailLogin: vi.fn(), popupLogin: vi.fn(), signOut: vi.fn(),
  push: vi.fn(), refresh: vi.fn(), fetch: vi.fn(),
}));
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: mocks.emailLogin,
  signInWithPopup: mocks.popupLogin,
  GoogleAuthProvider: class {}, FacebookAuthProvider: class {},
}));
vi.mock("@/lib/firebase/client", () => ({ auth: { signOut: mocks.signOut } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

import LoginPage from "../src/app/(auth)/login/page";

describe("Customer login", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("fetch", mocks.fetch);
    mocks.popupLogin.mockResolvedValue({ user: { displayName: "Customer", getIdToken: async () => "id-token" } });
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ role: "customer" }) });
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("takes a Google customer to their account after establishing a session", async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Log in with Google" }));
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/"));
    expect(mocks.fetch).toHaveBeenCalledWith("/api/auth/session", expect.objectContaining({ body: JSON.stringify({ idToken: "id-token" }) }));
  });

  it("explains when a social provider is unavailable", async () => {
    mocks.popupLogin.mockRejectedValue({ code: "auth/operation-not-allowed" });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Log in with Facebook" }));
    expect((await screen.findByRole("alert")).textContent).toContain("currently unavailable");
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("does not send admin social accounts into the customer account page", async () => {
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ role: "admin" }) });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Log in with Google" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Please use Admin Login");
    expect(mocks.signOut).toHaveBeenCalled();
    expect(mocks.fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("shows a password recovery message for invalid email credentials", async () => {
    mocks.emailLogin.mockRejectedValue({ code: "auth/invalid-credential" });
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "customer@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect((await screen.findByRole("alert")).textContent).toContain("reset your password");
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
});
