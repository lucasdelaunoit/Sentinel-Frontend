/** Signed delta string: `+3`, `-2`, or `±0` for zero. */
export function formatDelta(delta: number) {
  return delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "±0";
}
