export interface Trip { 
  //Backend fields
  id: number,
  tripName: string, 
  plannedDate: string,
  maxSize: number,
  class: string | null,
  priceOverride: number | null, 
  sentenceDesc: string | null, 
  blurb: string | null, 
  status: string,
  planningChecklist: string
  //Fields for Frontend convenience
  date: Date | null
}

export enum Role { Leader = 'Leader', Participant = 'Participant', Admin = 'Admin', None = 'None' }
export interface User {
  firstName: string,
  lastName: string,
  email: string, 
  phone: string, 
  role: Role,
  hasWaiver: boolean,
  tripsLead: number, 
  tripsParticipated: number 
}

export enum TripRole { Leader = 'Leader', Participant = 'Participant'}
export interface TripSignUp {
  tripId: number;
  tripRole: TripRole;
  status: string | null;
  needPaperwork: boolean | null;
  confirmed: boolean | null;
  createdAt: string;
  updatedAt: string;
}