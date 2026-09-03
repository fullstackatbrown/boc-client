import { collection, getDocs } from "firebase/firestore";
import db from "@/scripts/firebase";

//One of the club's leadership positions: which team doc currently holds it, the label to
//show under that person's name, and where it sorts. `leader` is a plain team doc id rather
//than a DocumentReference - the listing already loads every team doc, so resolving it is a
//map lookup instead of an extra read, and it stays hand-editable in the Firebase console.
export interface CoreSlot {
  id: string;
  leader: string;
  position: string;
  order: number;
}

//Only the fields these helpers need; the pages carry richer types of their own.
export interface TeamMember {
  id: string;
  index: number;
  display?: boolean;
}

//The `core` collection is the source of truth for who holds which position, so a position
//can be reassigned without touching anyone's team doc.
export async function loadCoreSlots(): Promise<CoreSlot[]> {
  const snap = await getDocs(collection(db, "core"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CoreSlot));
}

/**
 * Splits the team into the Core Leadership row and the Trip Leaders grid.
 *
 * Core membership, labels and ordering all come from the slots, so reassigning a position
 * moves a card between the two sections without editing either person's team doc. Anyone
 * no slot points at is a trip leader.
 */
export function partitionTeam<T extends TeamMember>(team: T[], slots: CoreSlot[]) {
  const shown = (m: T) => m.display !== false;

  const core = [...slots]
    .sort((a, b) => a.order - b.order)
    .map((slot) => ({ member: team.find((m) => m.id === slot.leader), position: slot.position }))
    //A slot pointing at a missing or hidden doc simply drops out of the row
    .filter((e): e is { member: T, position: string } => !!e.member && shown(e.member));

  //Excluded by slot reference rather than by the filtered core list above: a core member
  //hidden with display:false must stay hidden, not fall through into the trip leader grid.
  const slotLeaderIds = new Set(slots.map((s) => s.leader));
  const general = team
    .filter((m) => !slotLeaderIds.has(m.id))
    .filter(shown)
    .sort((a, b) => a.index - b.index);

  return { core, general };
}

//The label to show on one leader's own profile page: whatever slot points at them, if any.
export function positionFor(leaderId: string, slots: CoreSlot[]) {
  return slots.find((s) => s.leader === leaderId)?.position ?? "";
}
