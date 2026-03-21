/**
 * Staff purchase flow (secret link + password). OFF by default.
 * Set NEXT_PUBLIC_STAFF_ORDERING_ENABLED=true in env to allow (e.g. local testing).
 */
export function isStaffOrderingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STAFF_ORDERING_ENABLED === "true";
}
