import React, { StrictMode } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SweatshirtCollection } from "../src/components/SweatshirtCollection";
import type { CatalogProduct } from "../src/types";

const { subscribe, unsubscribe } = vi.hoisted(() => ({ subscribe: vi.fn(), unsubscribe: vi.fn() }));
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return { ...actual, scroll: subscribe };
});

afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("attaches scroll tracking to a mounted element and cleans up across product changes and Strict Mode", () => {
  subscribe.mockImplementation((_callback, options) => {
    expect(options.target).toBeInstanceOf(HTMLElement);
    expect(options.target.isConnected).toBe(true);
    return unsubscribe;
  });
  const product = { id: "shirt", slug: "shirt", name: "Shirt", basePriceMinor: 2000, imagePaths: ["/man.jpg"], colors: [], colorVariants: [] } as unknown as CatalogProduct;
  const view = (products: CatalogProduct[]) => <StrictMode><SweatshirtCollection products={products} /></StrictMode>;
  const { rerender, unmount } = render(view([]));
  expect(subscribe).not.toHaveBeenCalled();
  rerender(view([product]));
  expect(subscribe).not.toHaveBeenCalled();
  rerender(view([product, { ...product, id: "second", slug: "second" }]));
  expect(subscribe).toHaveBeenCalled();
  expect(subscribe.mock.lastCall?.[1].target.style.height).toBe("200dvh");
  rerender(view([product, { ...product, id: "second", slug: "second" }, { ...product, id: "third", slug: "third" }]));
  expect(subscribe.mock.lastCall?.[1].target.style.height).toBe("300dvh");
  rerender(view([product]));
  expect(unsubscribe.mock.calls.length).toBe(subscribe.mock.calls.length);
  expect(subscribe.mock.lastCall?.[1].target.style.height).toBe("");
  rerender(view([product, { ...product, id: "second", slug: "second" }]));
  unmount();
  expect(unsubscribe.mock.calls.length).toBe(subscribe.mock.calls.length);
});
