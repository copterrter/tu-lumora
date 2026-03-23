/**
 * Staff purchase flow (secret link + password). OFF by default.
 * Set NEXT_PUBLIC_STAFF_ORDERING_ENABLED=true to enable.
 */
export function isStaffOrderingEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_STAFF_ORDERING_ENABLED?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "on";
}
