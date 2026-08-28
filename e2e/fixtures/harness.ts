import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import { execFileSync } from "child_process";
import path from "path";

const SERVER_DIR = path.resolve(__dirname, "../../../boc-server");
export const BACKEND = "http://localhost:8080";

/** The seeded cast these tests act as. See boc-server/default_insts.mjs. */
export const LEADER = "william_l_stone@brown.edu";
export const CO_LEADER = "radia.perlman@brown.edu";
export const PARTICIPANTS = [
  "ada.lovelace@brown.edu",
  "grace.hopper@brown.edu",
  "alan.turing@brown.edu",
  "katherine.johnson@brown.edu",
  "barbara.liskov@brown.edu",
  "donald.knuth@brown.edu",
];
/** Deliberately never signs up - used to test attendance for a walk-on. */
export const WALK_ON = "margaret.hamilton@risd.edu";

/**
 * Signs the browser in as `email` without going through Google, using the `e2e`
 * Credentials provider (registered only when NEXT_PUBLIC_E2E=1).
 *
 * Replaces any existing session, so it doubles as "switch user". This is the whole
 * reason the lifecycle is testable: it needs a leader and several participants acting
 * in sequence, which one real Google account cannot do.
 */
export async function loginAs(page: Page, email: string): Promise<void> {
  await page.context().clearCookies();

  const csrfRes = await page.request.get("/api/auth/csrf");
  expect(csrfRes.ok(), "could not fetch CSRF token").toBeTruthy();
  const { csrfToken } = await csrfRes.json();

  const res = await page.request.post("/api/auth/callback/e2e", {
    form: { csrfToken, email, callbackUrl: "/", json: "true" },
  });
  expect(res.ok(), `e2e sign-in failed for ${email} (${res.status()})`).toBeTruthy();

  const session = await (await page.request.get("/api/auth/session")).json();
  expect(session?.user?.email, `session not established for ${email}`).toBe(email);
}

/** Drops the session entirely, so the page is browsed logged out. */
export async function logout(page: Page): Promise<void> {
  await page.context().clearCookies();
}

/**
 * Reads server state directly, as `email`.
 *
 * Used only to DISCOVER state (who the lottery picked, what a signup's status is),
 * never to perform actions - every action in these tests goes through the UI. The
 * lottery is random, so the test has to ask rather than assume.
 */
export async function backendGet(
  request: APIRequestContext,
  email: string,
  route: string,
): Promise<any> {
  const res = await request.get(`${BACKEND}${route}`, {
    headers: { Authorization: `Bearer e2e:${email}` },
  });
  expect(res.ok(), `GET ${route} as ${email} failed (${res.status()})`).toBeTruthy();
  return res.json();
}

/**
 * Forces Pre-Trip -> Post-Trip.
 *
 * This transition has no UI trigger and no route - only the 5am cron performs it - so
 * this is the one place the test must reach around the interface. runTrip's own guards
 * still apply; nothing is bypassed.
 */
export function runTripNow(tripId: number): void {
  execFileSync("node", ["test-helpers/run-trip.mjs", String(tripId)], {
    cwd: SERVER_DIR,
    stdio: "inherit",
  });
}

/**
 * Clicks something whose handler ends in `window.location.reload()`, and waits for
 * that reload to actually happen.
 *
 * This app mutates by posting and then reloading the whole page rather than updating
 * state in place. Without waiting, the next navigation races the reload and aborts it
 * (net::ERR_ABORTED). Any click that changes server state needs this.
 */
export async function clickAndSettle(page: Page, locator: Locator): Promise<void> {
  const reloaded = page.waitForEvent("load", { timeout: 20_000 }).catch(() => {});
  await locator.click();
  await reloaded;
}

/**
 * Records every browser dialog the page raises.
 *
 * The app reports every backend rejection through `alert()`, so on a walk that is
 * supposed to succeed, ANY dialog is a failure. Installing this once gives free
 * assertion coverage over every 403/422 the server can produce - without it Playwright
 * would silently auto-dismiss them and the walk would appear to pass.
 */
export function watchDialogs(page: Page) {
  const messages: string[] = [];
  page.on("dialog", async (dialog) => {
    messages.push(dialog.message());
    await dialog.dismiss();
  });
  return {
    messages,
    assertNone(context: string) {
      expect(messages, `Unexpected alert(s) during ${context}:\n  ${messages.join("\n  ")}`)
        .toEqual([]);
    },
  };
}

/** A participant row as returned by /trip/:id/lead/participants. */
export interface Participant {
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  confirmed: boolean;
  paid: boolean;
}

export async function participantsOf(
  request: APIRequestContext,
  tripId: number,
): Promise<Participant[]> {
  return backendGet(request, LEADER, `/trip/${tripId}/lead/participants`);
}

export const emailsWithStatus = (ps: Participant[], status: string): string[] =>
  ps.filter((p) => p.status === status).map((p) => p.email);
