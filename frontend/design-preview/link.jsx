import React from "react";
import { useRouter } from "./navigation";
export default function Link({ href, children, onClick, ...props }) {
  const router = useRouter();
  return <a href={href} {...props} onClick={event => { event.preventDefault(); onClick?.(event); router.push(href); }}>{children}</a>;
}
