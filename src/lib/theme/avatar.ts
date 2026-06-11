export type AvatarSize = Extract<Sizes, "base" | "lg" | "xl" | "2xl">;

/** Shared sizing for all square initials-avatars (user, project, holiday…). */
export const AVATAR_SIZE: Record<AvatarSize, string> = {
  base: "size-8 text-[11px] font-bold",
  lg: "size-10 text-[13px] font-medium",
  xl: "size-14 text-[15px] font-semibold",
  "2xl": "size-20 text-xl font-bold",
};
