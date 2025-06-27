export enum TripStatus { Staging = 'Staging', Open = 'Open', PreTrip = "Pre-Trip", PostTrip = "Post-Trip", Complete = "Complete"}
export enum TripClass { A = 'A', B = 'B', C = 'C', D = 'D', E = 'E', F = 'F', G = 'G', H = 'H', I = 'I', J = 'J', Free = 'Z' } //I know this looks silly, plz don't make fun of me
export interface Trip { 
  //Backend fields
  id: number,
  tripName: string, 
  category: string,
  plannedDate: string,
  plannedEndDate: string | null,
  maxSize: number,
  class: TripClass | null,
  priceOverride: number | null, 
  sentenceDesc: string | null, 
  blurb: string | null, 
  status: TripStatus,
  planningChecklist: string
  //Fields for Frontend convenience
  date: Date | null
}

export enum Role { Leader = 'Leader', Participant = 'Participant', Admin = 'Admin', None = 'None' }
export interface User extends SimpleUser {
  phone: string, 
  role: Role,
  hasWaiver: boolean,
  tripsLead: number, 
  tripsParticipated: number 
}

export enum TripRole { Leader = 'Leader', Participant = 'Participant', None = 'None' }
export enum SignupStatus { SignedUp = 'Signed Up', Selected = 'Selected', NotSelected = 'Not Selected', Attended = 'Attended', NoShow = 'No Show' }
export interface TripSignUp {
  tripId: number;
  tripRole: TripRole;
  status: string | null;
  needPaperwork: boolean | null;
  confirmed: boolean;
  paid: boolean
  createdAt: string;
  updatedAt: string;
}

export interface TripWithSignup extends Trip {
  userData: TripSignUp | null,
  participants: TripSignUp[] | null,
  leaders: SimpleUser[],
}

export interface SimpleUser {
  firstName: string,
  lastName: string,
  email: string,
}