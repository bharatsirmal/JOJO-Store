import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HomeClient } from "../src/components/HomeClient";

class IntersectionObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn();
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

describe("Home Page Smoke Test", () => {
  it("renders the main heading", () => {
    render(<HomeClient featuredProducts={[]} />);
    
    // Check for the main hero text
    const heading = screen.getByText(/ELEVATE YOUR/i);
    expect(heading).toBeDefined();
  });
});

