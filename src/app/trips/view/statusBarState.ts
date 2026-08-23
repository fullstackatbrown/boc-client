import { TripStatus } from "@/models/models";

/** How a single stage button in the leader status bar should be rendered. */
export enum StatusState {
  /** Stage already passed — dimmed and inert. */
  Past = "Past",
  /** The trip's current stage. */
  Current = "Current",
  /** The stage the leader can advance to. The only clickable one. */
  Next = "Next",
  /** Further out than Next — dimmed and inert. */
  Future = "Future",
}

/**
 * Position of each trip status in the lifecycle. The lifecycle only ever moves
 * forward: Staging -> Open -> Pre-Trip -> Post-Trip -> Complete.
 */
export const TRIP_STATUS_ORDER: Record<TripStatus, number> = {
  [TripStatus.Staging]: 0,
  [TripStatus.Open]: 1,
  [TripStatus.PreTrip]: 2,
  [TripStatus.PostTrip]: 3,
  [TripStatus.Complete]: 4,
};

/**
 * Given the stage a button represents and the trip's current status, decide how
 * that button should render. Exactly one stage is ever Next, and only that one
 * is clickable.
 */
export function stageState(stage: TripStatus, current: TripStatus): StatusState {
  const stagePos = TRIP_STATUS_ORDER[stage];
  const currentPos = TRIP_STATUS_ORDER[current];

  if (stagePos < currentPos) return StatusState.Past;
  if (stagePos === currentPos) return StatusState.Current;
  if (stagePos === currentPos + 1) return StatusState.Next;
  return StatusState.Future;
}
