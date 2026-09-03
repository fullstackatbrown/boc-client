import { test, expect, type Page } from "@playwright/test";
import {
  CO_LEADER,
  LEADER,
  PARTICIPANTS,
  WALK_ON,
  backendGet,
  clickAndSettle,
  emailsWithStatus,
  loginAs,
  participantsOf,
  runTripNow,
  watchDialogs,
} from "./fixtures/harness";

/**
 * Walks one trip through its entire lifecycle:
 *
 *   Staging -> Open -> Pre-Trip -> Post-Trip -> Complete
 *
 * with a leader and six participants acting in sequence. This is the coverage the
 * vitest suite cannot reach: it tests the WIRING (right endpoint, right payload, right
 * refresh) rather than the branch logic, and it reaches late-lifecycle states that are
 * otherwise prohibitively expensive to get to by hand.
 *
 * Actions go through the UI. The backend is queried only to discover state the test
 * cannot predict - chiefly who the random lottery selected.
 */

const TRIP_SIZE = 4; // 6 sign up -> 4 selected, 2 waitlisted
const TODAY = new Date().toISOString().slice(0, 10);
const TRIP_NAME = `E2E Lifecycle ${Date.now()}`;

/**
 * Navigates to a trip page and waits for it to finish its initial fetch.
 *
 * Retries on ERR_ABORTED: a reload triggered by a previous action can still be in
 * flight and will cancel this navigation.
 */
async function openTripPage(page: Page, tripId: number) {
  for (let attempt = 0; ; attempt++) {
    try {
      await page.goto(`/trips/view?id=${tripId}`);
      break;
    } catch (err) {
      if (attempt >= 2 || !String(err).includes("ERR_ABORTED")) throw err;
      await page.waitForTimeout(500);
    }
  }
  await expect(page.getByRole("heading", { name: TRIP_NAME })).toBeVisible();
}

test("a trip runs from creation through attendance", async ({ page, request }) => {
  const dialogs = watchDialogs(page);
  let tripId = 0;

  await test.step("leader creates a trip, which starts in Staging", async () => {
    await loginAs(page, LEADER);
    await page.goto("/trips/creation-form");

    // The form requires at least one co-leader besides yourself.
    await page.locator("select").first().selectOption(CO_LEADER);
    await page.selectOption('select[name="category"]', "Hiking");
    await page.fill('input[name="tripName"]', TRIP_NAME);
    await page.fill('input[name="plannedDate"]', TODAY);
    await page.fill('input[name="plannedEndDate"]', TODAY);
    await page.fill('input[name="maxSize"]', String(TRIP_SIZE));
    // Class A ($5) rather than a free trip, so the payment path gets exercised.
    await page.fill('input[name="class"]', "A");
    // openTrip refuses to publish a trip missing either description.
    await page.fill('input[name="sentenceDesc"]', "An end-to-end test trip.");
    await page.fill('textarea[name="blurb"]', "A longer blurb for the test trip.");

    await page.getByRole("button", { name: "Create Trip" }).click();

    const link = page.getByRole("link", { name: "here" });
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    tripId = Number(new URL(href!, "http://localhost:3000").searchParams.get("id"));
    expect(tripId).toBeGreaterThan(0);

    await openTripPage(page, tripId);
    await expect(page.getByText("This trip is not yet public")).toBeVisible();
  });

  await test.step("a Staging trip is invisible to everyone else", async () => {
    await loginAs(page, PARTICIPANTS[0]);
    const res = await request.get(`http://localhost:8080/trip/${tripId}`, {
      headers: { Authorization: `Bearer e2e:${PARTICIPANTS[0]}` },
    });
    expect(res.status()).toBe(401);
  });

  await test.step("leader opens the trip for signups", async () => {
    await loginAs(page, LEADER);
    await openTripPage(page, tripId);
    await page.getByText("Open Trip", { exact: true }).click();
    await expect(page.getByText("Trip Open", { exact: true })).toBeVisible();
  });

  await test.step("six participants sign up", async () => {
    for (const email of PARTICIPANTS) {
      await loginAs(page, email);
      await openTripPage(page, tripId);
      await page.getByRole("button", { name: "Sign up for this trip!" }).click();
      await expect(page.getByText("You are signed up!")).toBeVisible();
    }

    const participants = await participantsOf(request, tripId);
    expect(participants).toHaveLength(PARTICIPANTS.length);
    expect(emailsWithStatus(participants, "Signed Up").sort())
      .toEqual([...PARTICIPANTS].sort());
  });

  let selected: string[] = [];
  let waitlisted: string[] = [];

  await test.step("leader runs the lottery", async () => {
    await loginAs(page, LEADER);
    await openTripPage(page, tripId);
    await page.getByText("Run Lottery", { exact: true }).click();
    await expect(page.getByText("Pre-Trip", { exact: true }).first()).toBeVisible();

    const participants = await participantsOf(request, tripId);
    selected = emailsWithStatus(participants, "Selected");
    waitlisted = emailsWithStatus(participants, "Waitlisted");

    // maxSize caps selection; everyone else is waitlisted (nobody is outright rejected).
    expect(selected).toHaveLength(TRIP_SIZE);
    expect(waitlisted).toHaveLength(PARTICIPANTS.length - TRIP_SIZE);
    expect(emailsWithStatus(participants, "Not Selected")).toEqual([]);
  });

  await test.step("a selected participant confirms and pays", async () => {
    const payer = selected[0];
    await loginAs(page, payer);
    await openTripPage(page, tripId);

    await expect(page.getByText(/Congrats, you were selected!/)).toBeVisible();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByText(/Remember to pay when you can!/)).toBeVisible();

    // The Pay button opens Brown's payment site in a new tab; swallow the popup.
    page.context().on("page", (popup) => popup.close().catch(() => {}));
    await page.getByRole("button", { name: "Pay" }).click();
    await expect(page.getByText(/you're all set for the trip!/)).toBeVisible();

    const me = await backendGet(request, payer, "/user/profile");
    const signup = me.TripSignUps.find((s: any) => s.tripId === tripId);
    expect(signup.confirmed).toBe(true);
    expect(signup.paid).toBe(true);
  });

  await test.step("a waitlisted participant confirms interest", async () => {
    const eager = waitlisted[0];
    await loginAs(page, eager);
    await openTripPage(page, tripId);

    await expect(page.getByText(/You are currently on the waitlist/)).toBeVisible();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByText(/Thanks for confirming your interest!/)).toBeVisible();
  });

  await test.step("leader removes a participant, dropping them to Not Selected", async () => {
    const victim = selected[selected.length - 1];
    await loginAs(page, LEADER);
    await openTripPage(page, tripId);

    await page.getByRole("button", { name: /Participant List/ }).click();
    await page.getByRole("cell", { name: new RegExp(victim.split("@")[0]) })
      .first()
      .click();
    await clickAndSettle(page, page.getByText("Remove Participant"));

    await expect
      .poll(async () => {
        const ps = await participantsOf(request, tripId);
        return emailsWithStatus(ps, "Not Selected");
      })
      .toEqual([victim]);

    selected = selected.filter((e) => e !== victim);
  });

  await test.step("leader pulls a replacement off the waitlist", async () => {
    await openTripPage(page, tripId);
    await page.getByRole("button", { name: /Participant List/ }).click();
    //The button only reveals the count input; the reload comes after Enter submits it
    await page.getByText("Add from Waitlist").click();
    const countInput = page.getByRole("spinbutton");
    await countInput.fill("1");
    const reloaded = page.waitForEvent("load", { timeout: 20_000 }).catch(() => {});
    await countInput.press("Enter");
    await reloaded;

    await expect
      .poll(async () => {
        const ps = await participantsOf(request, tripId);
        return emailsWithStatus(ps, "Selected").length;
      })
      .toBe(TRIP_SIZE);

    const ps = await participantsOf(request, tripId);
    selected = emailsWithStatus(ps, "Selected");
    // Confirmed waitlisters get priority, so the eager one should have been pulled.
    expect(selected).toContain(waitlisted[0]);
  });

  await test.step("the trip date arrives and the trip runs", async () => {
    runTripNow(tripId);

    const ps = await participantsOf(request, tripId);
    // Anyone still waitlisted when the trip runs drops to Not Selected.
    expect(emailsWithStatus(ps, "Waitlisted")).toEqual([]);
    expect(emailsWithStatus(ps, "Selected")).toHaveLength(TRIP_SIZE);
  });

  await test.step("leader takes attendance, including a walk-on", async () => {
    await loginAs(page, LEADER);
    await openTripPage(page, tripId);

    await page.getByText("Attendance", { exact: true }).click();

    // The form fires two independent fetches and the status selects are controlled by
    // React state. Selecting while the second one is still in flight lets its re-render
    // put the select back to its "No Show" default - a rare flake that silently records
    // the wrong attendance. Wait for both to settle before touching anything.
    await page.waitForLoadState("networkidle");

    // One of each outcome across the four selected participants.
    const outcomes: Record<string, string> = {
      [selected[0]]: "Attended",
      [selected[1]]: "Attended",
      [selected[2]]: "No Show",
      [selected[3]]: "Excused Absence",
    };
    for (const [email, outcome] of Object.entries(outcomes)) {
      const select = page.locator("li").filter({ hasText: email }).locator("select");
      await select.selectOption(outcome);
      // Confirm it stuck - a reverted select would otherwise only surface much later,
      // as a confusing mismatch in the status assertions below.
      await expect(select).toHaveValue(outcome);
    }

    // Somebody who never signed up but turned up anyway.
    await page.getByPlaceholder("Enter Participant Email").first().fill(WALK_ON);

    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Trip Complete!")).toBeVisible();

    const ps = await participantsOf(request, tripId);
    const byStatus = (s: string) => emailsWithStatus(ps, s).sort();

    expect(byStatus("Attended")).toEqual([selected[0], selected[1], WALK_ON].sort());
    expect(byStatus("No Show")).toEqual([selected[2]]);
    // An excused absence deletes the signup outright rather than recording a status.
    expect(ps.map((p) => p.email)).not.toContain(selected[3]);
  });

  await test.step("attendance is reflected on the participant's profile", async () => {
    const attendee = selected[0];
    const before = await backendGet(request, attendee, "/user/profile");
    expect(before.tripsParticipated).toBeGreaterThanOrEqual(1);

    await loginAs(page, attendee);
    await page.goto("/user");
    await page.getByRole("button", { name: "Show Past Trips" }).click();
    await expect(page.getByText(TRIP_NAME)).toBeVisible();
  });

  await test.step("the walk raised no error alerts", async () => {
    // Every backend rejection in this app surfaces as an alert(), so a clean walk
    // means no 403s or 422s were provoked anywhere above.
    dialogs.assertNone("the lifecycle walk");
  });
});
