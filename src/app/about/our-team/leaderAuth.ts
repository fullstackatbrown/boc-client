import { signInWithCustomToken, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/scripts/firebase";
import { Requesters } from "@/scripts/requests";

//Profile edits write to Firestore/Storage from the browser, which next-auth's Google token
//means nothing to. boc-server mints a Firebase custom token for leaders instead (uid = BOC
//user id, claims = {email}), and that uid is what the LeaderPhotos/<uid>/ Storage rule keys
//off. Both our-team pages need this exchange, hence the shared module.
//Deliberately re-signs in on every mutation rather than reusing auth.currentUser: that
//persists across next-auth logins, so a cached identity could attribute one leader's upload
//to another. Mutations here are rare enough that the extra round-trip doesn't matter.
export async function signInAsLeader(reqs: Requesters): Promise<FirebaseUser> {
  const { data } = await reqs.backendGet("/leader/firebase-token");
  const cred = await signInWithCustomToken(auth, data.token);
  return cred.user;
}

//Same shape as AttendanceForm's handleNetError, plus the two cases specific to this flow:
//503 (the server has no signing key) is a misconfiguration, not a permission problem, and
//a failed token exchange surfaces as a Firebase auth/* code rather than an HTTP status.
export function handleEditError(err: any) {
  switch (err?.status) {
    case (401):
      alert("You're either signed out or not a trip leader, so you can't edit this profile. Try signing in again.");
      break;
    case (503):
      alert("Profile editing isn't configured on this server yet. Let the website's admin know - this isn't something you did wrong.");
      break;
    default:
      //Shouldn't be reachable - the UI only offers controls on your own profile - but a
      //rules denial deserves the truth rather than the generic "contact an admin" panic.
      if (err?.code === "permission-denied") {
        alert("Firebase wouldn't allow that change. You can only edit your own profile.");
      } else if (typeof err?.code === "string" && err.code.startsWith("auth/")) {
        alert(`We couldn't verify you with Firebase (${err.code}). Let the website's admin know and send them this message.`);
      } else {
        alert(`ERROR. You shouldn't be seeing this! Contact the website's admin and send them a picture of this message! ${err}`);
      }
      console.log(err);
      break;
  }
}
