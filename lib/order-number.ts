/* ------------------------------------------------------------------
   Order numbers: LUXE-YYYYMMDD-0001
   ------------------------------------------------------------------ */

const PREFIX = "LUXE";

/** UTC day key so the sequence is deterministic across servers. */
export function orderDayKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}${month}${day}`;
}

export function orderNumberPrefix(date: Date = new Date()): string {
  return `${PREFIX}-${orderDayKey(date)}`;
}

export function formatOrderNumber(sequence: number, date: Date = new Date()): string {
  const safeSequence = Math.max(1, Math.floor(sequence));
  return `${orderNumberPrefix(date)}-${`${safeSequence}`.padStart(4, "0")}`;
}

/** Parses `LUXE-20260930-0007` → `{ dayKey, sequence }`, or null. */
export function parseOrderNumber(
  orderNumber: string,
): { dayKey: string; sequence: number } | null {
  const match = /^LUXE-(\d{8})-(\d{4,})$/.exec(orderNumber.trim().toUpperCase());
  if (!match) return null;
  return { dayKey: match[1], sequence: Number(match[2]) };
}

/** Pulls the numeric sequence out of a list of same-day order numbers. */
export function highestSequence(orderNumbers: string[], date = new Date()): number {
  const prefix = orderNumberPrefix(date);
  return orderNumbers.reduce((max, value) => {
    if (!value.startsWith(prefix)) return max;
    const parsed = parseOrderNumber(value);
    return parsed ? Math.max(max, parsed.sequence) : max;
  }, 0);
}
