import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { DeferredVideo } from "../src/components/DeferredVideo";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("does not request the video until it approaches the viewport", () => {
  let notify: IntersectionObserverCallback;
  const disconnect = vi.fn();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { notify = callback; }
    observe = vi.fn();
    disconnect = disconnect;
  });
  const { container, unmount } = render(<DeferredVideo />);
  const video = container.querySelector("video")!;
  expect(video.hasAttribute("src")).toBe(false);
  act(() => notify([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(video.hasAttribute("src")).toBe(false);
  act(() => notify([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(video.getAttribute("src")).toBe("/video.mp4");
  expect(disconnect).toHaveBeenCalled();
  unmount();
  expect(disconnect).toHaveBeenCalledTimes(2);
});
