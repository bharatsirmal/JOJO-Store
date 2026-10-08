import React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NavClient } from "../src/components/NavClient";

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), refresh: vi.fn(), push: vi.fn(), logout: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }) }));
vi.mock("@/lib/auth/client", () => ({ logout: mocks.logout }));
const profile = { uid: "customer-id", displayName: "Customer Name", email: "customer@example.com", role: "customer", emailVerified: true, phoneNumber: "", createdAt: "2026-01-01T00:00:00Z" };

describe("Customer profile popup", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("fetch", mocks.fetch);
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => profile });
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(() => [{ width: 44, height: 44 }] as unknown as DOMRectList);
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it("opens the profile from navigation without changing pages and closes on Escape", async () => {
    render(<NavClient user={{ displayName: profile.displayName, role: "customer" }} />);
    const trigger = screen.getByRole("button", { name: "Account" });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "My Account" });
    expect(await within(dialog).findByText(profile.email)).toBeDefined();
    expect(within(dialog).getByText("Verified")).toBeDefined();
    expect(within(dialog).getByText(profile.uid)).toBeDefined();
    expect(mocks.push).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
  });

  it("saves only the edited name and refreshes customer information", async () => {
    render(<NavClient user={{ displayName: profile.displayName, role: "customer" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Account" }));
    const input = await screen.findByRole("textbox", { name: "Full name" });
    fireEvent.change(input, { target: { value: " New Name " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect((await screen.findByRole("status")).textContent).toContain("updated");
    expect(mocks.fetch).toHaveBeenCalledWith("/api/auth/profile", expect.objectContaining({ method: "PATCH", body: JSON.stringify({ displayName: "New Name" }) }));
    expect(mocks.refresh).toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "My Account" })).toBeDefined();
  });

  it("opens the same popup from the mobile account button", async () => {
    render(<NavClient user={{ displayName: profile.displayName, role: "customer" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(screen.getByRole("button", { name: "My Account" }));
    expect(await screen.findByRole("dialog", { name: "My Account" })).toBeDefined();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("runs logout from the popup and shows failed saves without claiming success", async () => {
    render(<NavClient user={{ displayName: profile.displayName, role: "customer" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Account" }));
    const input = await screen.findByRole("textbox", { name: "Full name" });
    mocks.fetch.mockResolvedValue({ ok: false });
    fireEvent.change(input, { target: { value: "New Name" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Unable to save");
    expect(mocks.refresh).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));
    expect(mocks.logout).toHaveBeenCalled();
  });
});
