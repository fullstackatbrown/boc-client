import { TripWithSignup, TripRole, TripStatus, SignupStatus, TripClass } from "@/models/models";

/**
 * The distinct states the signup panel on a trip page can be in.
 *
 * This is deliberately just a tag: the actual JSX for each variant lives in
 * SignupButton.tsx, because those elements close over request helpers and
 * component state and so can't be lifted out. Keeping the *decision* pure is
 * what makes it testable.
 */
export enum SignupVariant {
  /** Trip is in Staging and the viewer isn't a participant on it. */
  Staging = "Staging",
  /** Trip is Open — offer the signup button. */
  SignUp = "SignUp",
  /** Trip has moved past Open — signups are no longer accepted. */
  SignupsClosed = "SignupsClosed",
  /** Viewer is signed up; lottery hasn't run yet. */
  SignedUp = "SignedUp",
  NotSelected = "NotSelected",
  Waitlisted = "Waitlisted",
  WaitlistedConfirmed = "WaitlistedConfirmed",
  /** Selected but hasn't confirmed their spot yet. */
  Selected = "Selected",
  /** Confirmed, payment still outstanding. */
  Confirmed = "Confirmed",
  /** Confirmed on a free (class Z) trip — no payment to chase. */
  ConfirmedFree = "ConfirmedFree",
  ConfirmedAndPaid = "ConfirmedAndPaid",
  Attended = "Attended",
  /** Attended but still owes payment. */
  AttendedNeedPay = "AttendedNeedPay",
  NoShow = "NoShow",
  /**
   * Nothing to show. Reached only when the viewer is a Participant whose
   * signup carries a null status, which the backend shouldn't produce for a
   * Participant-role signup. Renders as empty, matching the previous
   * behaviour of falling out of the switch with `content` undefined.
   */
  Nothing = "Nothing",
}

/**
 * Decides which signup panel a viewer should see for a trip.
 *
 * Depends only on the trip and the viewer's own signup (`trip.userData`),
 * both of which come straight from `GET /trip/:id`.
 *
 * Note that leaders and logged-out/not-signed-up visitors take the same path:
 * on an Open trip a trip's own leader is shown the signup button. That matches
 * the behaviour this was extracted from.
 */
export function selectSignupVariant(trip: TripWithSignup): SignupVariant {
  const signup = trip.userData;
  const role = signup ? signup.tripRole : TripRole.None;

  if (role === TripRole.Participant) {
    // Non-null: role came from signup, so signup is non-null here.
    return participantVariant(trip, signup!);
  }

  if (trip.status === TripStatus.Staging) return SignupVariant.Staging;
  if (trip.status === TripStatus.Open) return SignupVariant.SignUp;
  return SignupVariant.SignupsClosed;
}

function participantVariant(
  trip: TripWithSignup,
  signup: NonNullable<TripWithSignup["userData"]>,
): SignupVariant {
  const isFree = trip.class === TripClass.Free;

  switch (signup.status) {
    case SignupStatus.SignedUp:
      return SignupVariant.SignedUp;

    case SignupStatus.NotSelected:
      return SignupVariant.NotSelected;

    case SignupStatus.Waitlisted:
      return signup.confirmed
        ? SignupVariant.WaitlistedConfirmed
        : SignupVariant.Waitlisted;

    case SignupStatus.Selected:
      if (!signup.confirmed) return SignupVariant.Selected;
      if (isFree) return SignupVariant.ConfirmedFree;
      return signup.paid
        ? SignupVariant.ConfirmedAndPaid
        : SignupVariant.Confirmed;

    case SignupStatus.Attended:
      return signup.paid || isFree
        ? SignupVariant.Attended
        : SignupVariant.AttendedNeedPay;

    case SignupStatus.NoShow:
      return SignupVariant.NoShow;

    case null:
      return SignupVariant.Nothing;

    default: {
      // Compile-time exhaustiveness guard: if a new SignupStatus is added and
      // not handled above, this assignment fails to typecheck. It deliberately
      // does not throw — an unexpected value at runtime still renders nothing,
      // exactly as before.
      const _exhaustive: never = signup.status;
      return SignupVariant.Nothing;
    }
  }
}
