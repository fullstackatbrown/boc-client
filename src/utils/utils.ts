//Expects dates of the form yyyy-mm-dd (as they are stored on the backend)
//Use this - NOT new Date().toLocaleString()! THIS WILL SHIFT THE DATE BACK A DAY (stupid timezone thing)
export function formatDateString(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${Number(month)}/${Number(day)}/${year}`; // e.g., 7/8/2025
}

//null means neither a class nor a price override is set - the Trip type permits it even
//though both the creation form and the cost editor try to prevent it
export function formatCost(cost: number | null): string {
  if (cost === null) return "Not set";
  return cost === 0 ? "Free!" : `$${cost}`;
}

//Mirrors boc-server's trip_classes table; a change to either must be made to both, since
//payment matching compares a receipt's price against the server's copy
export const CLASS_COST: Record<string, number> = { A: 5, B: 10, C: 15, D: 20, E: 25, F: 30, G: 35, H: 40, I: 45, J: 50, Z: 0 };

export function tripCost(trip: { class: string | null, priceOverride: number | null }): number | null {
  return trip.class ? CLASS_COST[trip.class] ?? null : trip.priceOverride;
}

//Class letters that sum to a cost with no matching store item (a multiple of 5, > 0):
//the class for the remainder under $50, then as many J ($50) as fit. Ascending order.
export function classCombination(cost: number): string[] {
  const remainder = cost % 50;
  const js = Array<string>(Math.floor(cost / 50)).fill("J");
  return remainder ? [String.fromCharCode(64 + remainder / 5), ...js] : js;
}
