import { describe, it, expect } from "vitest";
import { TripStatus } from "@/models/models";
import { StatusState, TRIP_STATUS_ORDER, stageState } from "../statusBarState";

const STAGES = [
  TripStatus.Staging,
  TripStatus.Open,
  TripStatus.PreTrip,
  TripStatus.PostTrip,
  TripStatus.Complete,
];

describe("stageState", () => {
  it("marks the trip's own stage as Current", () => {
    for (const stage of STAGES) {
      expect(stageState(stage, stage)).toBe(StatusState.Current);
    }
  });

  it("marks exactly one stage as Next, and only when one remains", () => {
    for (const current of STAGES) {
      const next = STAGES.filter((s) => stageState(s, current) === StatusState.Next);
      const remaining = STAGES.length - 1 - TRIP_STATUS_ORDER[current];
      expect(next).toHaveLength(remaining > 0 ? 1 : 0);
    }
  });

  it("offers Open as the next step from Staging", () => {
    expect(stageState(TripStatus.Open, TripStatus.Staging)).toBe(StatusState.Next);
  });

  it("offers no next step once the trip is Complete", () => {
    for (const stage of STAGES) {
      expect(stageState(stage, TripStatus.Complete)).not.toBe(StatusState.Next);
    }
  });

  it("marks earlier stages Past and later ones Future", () => {
    expect(stageState(TripStatus.Staging, TripStatus.PreTrip)).toBe(StatusState.Past);
    expect(stageState(TripStatus.Open, TripStatus.PreTrip)).toBe(StatusState.Past);
    expect(stageState(TripStatus.PostTrip, TripStatus.PreTrip)).toBe(StatusState.Next);
    expect(stageState(TripStatus.Complete, TripStatus.PreTrip)).toBe(StatusState.Future);
  });

  it("assigns every stage/status pair exactly one state", () => {
    for (const current of STAGES) {
      for (const stage of STAGES) {
        expect(Object.values(StatusState)).toContain(stageState(stage, current));
      }
    }
  });
});
