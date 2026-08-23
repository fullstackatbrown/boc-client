import { describe, it, expect } from "vitest";
import {
  SignupStatus,
  TripClass,
  TripRole,
  TripSignUp,
  TripStatus,
  TripWithSignup,
} from "@/models/models";
import { SignupVariant, selectSignupVariant } from "../signupVariant";

function makeSignup(over: Partial<TripSignUp> = {}): TripSignUp {
  return {
    tripId: 1,
    tripRole: TripRole.Participant,
    status: SignupStatus.SignedUp,
    needPaperwork: false,
    confirmed: false,
    paid: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

function makeTrip(over: Partial<TripWithSignup> = {}): TripWithSignup {
  return {
    id: 1,
    tripName: "Test Trip",
    category: "Hiking",
    plannedDate: "2026-10-15",
    plannedEndDate: null,
    maxSize: 10,
    class: TripClass.A,
    priceOverride: null,
    sentenceDesc: "A trip.",
    blurb: "A longer description of a trip.",
    image: null,
    status: TripStatus.Open,
    planningChecklist: "{}",
    date: null,
    userData: null,
    participants: null,
    leaders: [],
    ...over,
  };
}

/** A participant on a trip, with the given signup fields applied. */
function asParticipant(
  signup: Partial<TripSignUp>,
  trip: Partial<TripWithSignup> = {},
): TripWithSignup {
  return makeTrip({
    ...trip,
    userData: makeSignup({ ...signup, tripRole: TripRole.Participant }),
  });
}

describe("selectSignupVariant — participants", () => {
  it("shows the waiting message before the lottery has run", () => {
    expect(selectSignupVariant(asParticipant({ status: SignupStatus.SignedUp })))
      .toBe(SignupVariant.SignedUp);
  });

  it("shows the rejection message when not selected", () => {
    expect(selectSignupVariant(asParticipant({ status: SignupStatus.NotSelected })))
      .toBe(SignupVariant.NotSelected);
  });

  describe("waitlisted", () => {
    it("prompts for confirmation when not yet confirmed", () => {
      expect(selectSignupVariant(asParticipant({
        status: SignupStatus.Waitlisted, confirmed: false,
      }))).toBe(SignupVariant.Waitlisted);
    });

    it("acknowledges confirmed interest once confirmed", () => {
      expect(selectSignupVariant(asParticipant({
        status: SignupStatus.Waitlisted, confirmed: true,
      }))).toBe(SignupVariant.WaitlistedConfirmed);
    });

    it("ignores paid — a waitlisted participant is never asked to pay", () => {
      expect(selectSignupVariant(asParticipant({
        status: SignupStatus.Waitlisted, confirmed: true, paid: true,
      }))).toBe(SignupVariant.WaitlistedConfirmed);
    });
  });

  describe("selected", () => {
    it("asks the participant to confirm their spot first", () => {
      expect(selectSignupVariant(asParticipant({
        status: SignupStatus.Selected, confirmed: false,
      }))).toBe(SignupVariant.Selected);
    });

    it("asks for confirmation before payment, even if already paid", () => {
      expect(selectSignupVariant(asParticipant({
        status: SignupStatus.Selected, confirmed: false, paid: true,
      }))).toBe(SignupVariant.Selected);
    });

    it("chases payment once confirmed on a paid trip", () => {
      expect(selectSignupVariant(asParticipant({
        status: SignupStatus.Selected, confirmed: true, paid: false,
      }))).toBe(SignupVariant.Confirmed);
    });

    it("is fully set once confirmed and paid", () => {
      expect(selectSignupVariant(asParticipant({
        status: SignupStatus.Selected, confirmed: true, paid: true,
      }))).toBe(SignupVariant.ConfirmedAndPaid);
    });

    it("never chases payment on a free trip", () => {
      expect(selectSignupVariant(asParticipant(
        { status: SignupStatus.Selected, confirmed: true, paid: false },
        { class: TripClass.Free },
      ))).toBe(SignupVariant.ConfirmedFree);
    });
  });

  describe("attended", () => {
    it("thanks a participant who paid", () => {
      expect(selectSignupVariant(asParticipant({
        status: SignupStatus.Attended, paid: true,
      }))).toBe(SignupVariant.Attended);
    });

    it("thanks a participant on a free trip without chasing payment", () => {
      expect(selectSignupVariant(asParticipant(
        { status: SignupStatus.Attended, paid: false },
        { class: TripClass.Free },
      ))).toBe(SignupVariant.Attended);
    });

    it("chases payment from a participant who attended but hasn't paid", () => {
      expect(selectSignupVariant(asParticipant({
        status: SignupStatus.Attended, paid: false,
      }))).toBe(SignupVariant.AttendedNeedPay);
    });
  });

  it("reports a no show", () => {
    expect(selectSignupVariant(asParticipant({ status: SignupStatus.NoShow })))
      .toBe(SignupVariant.NoShow);
  });

  it("renders nothing for a participant signup with a null status", () => {
    // Shouldn't happen — the backend only nulls status for Leader-role signups.
    // Pinned so the blank panel stays a deliberate outcome rather than a
    // silent fall-through.
    expect(selectSignupVariant(asParticipant({ status: null })))
      .toBe(SignupVariant.Nothing);
  });

  it("ignores trip status entirely for participants", () => {
    // A participant's panel is driven by their own signup, not the trip's stage.
    for (const status of Object.values(TripStatus)) {
      expect(selectSignupVariant(asParticipant(
        { status: SignupStatus.NoShow },
        { status },
      ))).toBe(SignupVariant.NoShow);
    }
  });
});

describe("selectSignupVariant — non-participants", () => {
  const viewers: [string, TripWithSignup["userData"]][] = [
    ["a logged-out visitor", null],
    ["a trip leader", makeSignup({ tripRole: TripRole.Leader, status: null })],
  ];

  for (const [label, userData] of viewers) {
    describe(label, () => {
      it("is told the trip isn't public while it's in Staging", () => {
        expect(selectSignupVariant(makeTrip({ status: TripStatus.Staging, userData })))
          .toBe(SignupVariant.Staging);
      });

      it("is offered the signup button while the trip is Open", () => {
        expect(selectSignupVariant(makeTrip({ status: TripStatus.Open, userData })))
          .toBe(SignupVariant.SignUp);
      });

      it.each([TripStatus.PreTrip, TripStatus.PostTrip, TripStatus.Complete])(
        "is told signups are closed once the trip reaches %s",
        (status) => {
          expect(selectSignupVariant(makeTrip({ status, userData })))
            .toBe(SignupVariant.SignupsClosed);
        },
      );
    });
  }

  it("covers every trip status for a non-participant", () => {
    // Guards against a new TripStatus slipping through with no defined panel.
    for (const status of Object.values(TripStatus)) {
      expect(selectSignupVariant(makeTrip({ status, userData: null })))
        .not.toBe(SignupVariant.Nothing);
    }
  });
});
