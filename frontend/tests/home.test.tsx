import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HomeClient } from "../src/components/HomeClient";
import React from "react";

vi.mock("next/image", () => ({ default: ({ fill, priority, ...props }: any) => <img {...props} /> }));

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
    
    const heading = screen.getByRole("heading", { name: "New Arrivals." });
    expect(heading).toBeDefined();
  });
});

