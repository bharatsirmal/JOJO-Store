import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), verify: vi.fn(), profile: vi.fn(), push: vi.fn(), replace: vi.fn() }));
vi.mock("firebase/auth", () => ({ createUserWithEmailAndPassword: mocks.create, updateProfile: mocks.update, sendEmailVerification: mocks.verify }));
vi.mock("@/lib/firebase/client", () => ({ auth: {} }));
vi.mock("@/app/actions/auth", () => ({ createCustomerProfile: mocks.profile }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push, replace: mocks.replace }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));
import RegisterDialog from "../src/components/RegisterDialog";

function fillForm(confirm = "Password1") {
  fireEvent.change(screen.getByRole("textbox", { name: "Full name" }), { target: { value: "Customer Name" } });
  fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), { target: { value: "customer@example.com" } });
  fireEvent.change(screen.getByLabelText("Password", { exact: true }), { target: { value: "Password1" } });
  fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: confirm } });
  fireEvent.click(screen.getByRole("button", { name: "SIGN UP" }));
}
describe("Signup popup", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.create.mockResolvedValue({ user: { uid: "customer", email: "customer@example.com" } });
    mocks.profile.mockResolvedValue({ success: true });
  });
  afterEach(cleanup);
  it("opens as a dialog and closes through Escape", () => {
    render(<RegisterDialog />);
    expect(screen.getByRole("dialog", { name: "Create an Account" })).toBeDefined();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(mocks.replace).toHaveBeenCalledWith("/");
  });
  it("keeps verification confirmation in the popup after registration", async () => {
    render(<RegisterDialog />);
    fillForm();
    expect(await screen.findByRole("dialog", { name: "Check your email" })).toBeDefined();
    expect(mocks.profile).toHaveBeenCalledWith("customer", "customer@example.com", "Customer Name");
    expect(mocks.verify).toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Go to Login" }).getAttribute("href")).toBe("/login");
  });
  it("validates confirmation before creating an account", async () => {
    render(<RegisterDialog />);
    fillForm("Different1");
    expect(await screen.findByText("Passwords do not match")).toBeDefined();
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
