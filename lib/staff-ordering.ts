/**
 * Staff purchase flow (secret link + password). ON by default.
 * Set NEXT_PUBLIC_STAFF_ORDERING_ENABLED=false to disable.
 */
export function isStaffOrderingEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_STAFF_ORDERING_ENABLED?.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "off") return false;
  return true;
}
