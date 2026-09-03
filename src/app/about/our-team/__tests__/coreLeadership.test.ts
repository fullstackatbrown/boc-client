import { describe, expect, it } from "vitest";
import { CoreSlot, TeamMember, partitionTeam, positionFor } from "../coreLeadership";

//Leadership positions live in their own `core` collection: each slot names the team doc
//that holds it, so reassigning a position never touches either person's record.

const member = (id: string, index: number, extra: Partial<TeamMember> = {}): TeamMember =>
  ({ id, index, ...extra });

const NEW_TEAM: TeamMember[] = [
  member("ella-creane", 0),
  member("alex-tully", 1),
  member("vanessa-tao", 3),
  member("william-stone", 4),
  member("alice-xie", 20),
  member("adnan-aldabbagh", 13),
];
const SLOTS: CoreSlot[] = [
  { id: "treasurer2", leader: "william-stone", position: "Treasurer", order: 4 },
  { id: "co-president1", leader: "ella-creane", position: "Co-President", order: 0 },
  { id: "treasurer1", leader: "vanessa-tao", position: "Treasurer", order: 3 },
  { id: "co-president2", leader: "alex-tully", position: "Co-President", order: 1 },
];


describe("partitionTeam, new shape", () => {
  const { core, general } = partitionTeam(NEW_TEAM, SLOTS);

  it("takes core membership and ordering from the slots, not the team docs", () => {
    expect(core.map((e) => e.member.id)).toEqual([
      "ella-creane", "alex-tully", "vanessa-tao", "william-stone",
    ]);
  });

  it("labels each core member from their slot, so both co-presidents read the same", () => {
    expect(core.map((e) => e.position)).toEqual([
      "Co-President", "Co-President", "Treasurer", "Treasurer",
    ]);
  });

  it("treats everyone no slot points at as a trip leader, ordered by index", () => {
    expect(general.map((m) => m.id)).toEqual(["adnan-aldabbagh", "alice-xie"]);
  });

  it("reassigning a slot moves the card between sections without touching team docs", () => {
    const reassigned = SLOTS.map((s) =>
      s.id === "treasurer2" ? { ...s, leader: "alice-xie" } : s);
    const { core: c, general: g } = partitionTeam(NEW_TEAM, reassigned);
    expect(c.map((e) => e.member.id)).toContain("alice-xie");
    expect(g.map((m) => m.id)).toContain("william-stone");
    expect(g.map((m) => m.id)).not.toContain("alice-xie");
  });

  it("drops a slot pointing at a missing team doc rather than rendering a hole", () => {
    const dangling = [...SLOTS, { id: "vice-president", leader: "nobody", position: "Vice President", order: 2 }];
    expect(partitionTeam(NEW_TEAM, dangling).core.map((e) => e.member.id)).not.toContain(undefined);
    expect(partitionTeam(NEW_TEAM, dangling).core).toHaveLength(4);
  });

  it("keeps a hidden core member hidden instead of demoting them into the grid", () => {
    const team = NEW_TEAM.map((m) => m.id === "alex-tully" ? { ...m, display: false } : m);
    const { core: c, general: g } = partitionTeam(team, SLOTS);
    expect(c.map((e) => e.member.id)).not.toContain("alex-tully");
    expect(g.map((m) => m.id)).not.toContain("alex-tully");
  });

  it("hides a trip leader with display false", () => {
    const team = NEW_TEAM.map((m) => m.id === "alice-xie" ? { ...m, display: false } : m);
    expect(partitionTeam(team, SLOTS).general.map((m) => m.id)).not.toContain("alice-xie");
  });
});


describe("positionFor", () => {
  it("returns the label of whichever slot points at this leader", () => {
    expect(positionFor("vanessa-tao", SLOTS)).toBe("Treasurer");
  });

  it("returns nothing for a leader no slot points at", () => {
    expect(positionFor("alice-xie", SLOTS)).toBe("");
  });

});
