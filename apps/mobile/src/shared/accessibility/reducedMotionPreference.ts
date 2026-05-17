export function mergeReducedMotionPreference(
  systemReducedMotion: boolean,
  userReducedMotion: boolean,
): boolean {
  return systemReducedMotion || userReducedMotion;
}
