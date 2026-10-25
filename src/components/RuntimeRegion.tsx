import { createElement } from "react";

/** Trusted, authored markup whose descendants belong to the existing DOM controller.
 * React owns the boundary, so animation/tab mutations cannot invalidate its child fibers.
 */
export default function RuntimeRegion({
  as = "div",
  html,
  ...props
}: {
  as?: "div" | "h2" | "a" | "span";
  html: string;
} & Record<string, unknown>) {
  return createElement(as, {
    ...props,
    dangerouslySetInnerHTML: { __html: html },
  });
}
