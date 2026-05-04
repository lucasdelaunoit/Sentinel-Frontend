/**
 * Sizes - Canonical size scale shared across all custom components.
 *
 * Use this type (or a subset via Extract/Exclude) whenever a component exposes
 * a `size` prop, so that naming stays consistent project-wide.
 *
 * Full scale: "xs" | "sm" | "base" | "lg" | "xl"
 *
 * To restrict to a subset inside a component:
 *   size?: Extract<ComponentSize, "sm" | "base" | "lg">
 */
type Sizes = "xs" | "sm" | "base" | "lg" | "xl";
