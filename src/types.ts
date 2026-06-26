export type CountryCode =
  | 'GB' | 'FR' | 'DE' | 'ES' | 'IT' | 'PT' | 'NL' | 'PL' | 'RO' | 'SE'
  | 'NO' | 'DK' | 'FI' | 'GR' | 'CZ' | 'SK' | 'HU' | 'HR' | 'RS' | 'BG'
  | 'SI' | 'UA' | 'LT' | 'LV' | 'EE' | 'IS' | 'AL' | 'TR' | 'CA' | 'EU'
  | 'GL' | 'IE' | 'CY' | 'LU' | 'MT';

export interface Language {
  code: string;
  name: string;
  localName: string;
  flag: string;
  currency: string;
  symbol: string;
  rate: number; // exchange rate against USD
}

export type ApplicationStatus =
  | 'PENDING_VERIFICATION'
  | 'PASSPORT_REJECTED'
  | 'DOCUMENT_REQUESTED'
  | 'APPROVED_AWAITING_PAYMENT'
  | 'PAYMENT_PENDING_CONFIRMATION'
  | 'CLEARANCE_GRANTED'
  | 'SUSPENDED';

export type PriorityLevel = 'STANDARD' | 'EXECUTIVE' | 'EXECUTIVE_VIP';

export interface MatchSelection {
  id: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  date: string;
  stage: 'Group Stage' | 'Round of 32' | 'Round of 16' | 'Quarter-Final' | 'Semi-Final' | 'Final';
  category: 'Category 1' | 'Category 2' | 'Club Suite' | 'Presidential Box';
  estimatedPrice: number; // in USD
}

export interface Application {
  id: string;
  applicationNumber: string;
  timestamp: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    birthDate: string;
    nationality: string;
  };
  addressInfo: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  passportInfo: {
    passportNumber: string;
    expiryDate: string;
    issueCountry: string;
  };
  documents: {
    passportScanUrl: string; // base64 or placeholder
    passportPhotoUrl: string;
    selfieUrl: string;
    identityDocUrl?: string;
  };
  travelOrigin: {
    departureCity: string;
    departureCountry: string;
    preferredAirlineClass: 'Economy' | 'Business' | 'Private Jet Offering';
  };
  matchPreferences: MatchSelection[];
  attendanceType: 'FULL' | 'GROUP_STAGE_ONLY' | 'KNOCKOUTS_ONLY' | 'VIP_FINALS';
  accommodationPreferences: {
    tier: 'Premium Hotel' | 'Luxury Resort' | 'Private Villa' | 'Sovereign Suite';
    requirements: string;
  };
  additionalInfo: string;
  costBreakdown: {
    baseUSD: number;
    matchCostUSD: number;
    accommodationCostUSD: number;
    priorityUpgradeCostUSD: number;
    totalUSD: number;
  };
  status: ApplicationStatus;
  applicationScore: number; // 0 - 100 base score
  travelReadinessScore: number; // 0 - 100
  priorityLevel: PriorityLevel;
  approvalTimeline: string; // e.g. "48 Hours"
  reservationStatus: string; // e.g. "PROVISIONAL" or "CONFIRMED"
  attendanceIndex: string; // security metric
  paymentDetails?: {
    method: 'ETH' | 'BTC' | 'SOL';
    address?: string;
    referenceId?: string;
    amountCrypto?: number;
    proofUrl?: string; // payment verification image
    txHash?: string;
    paidAt?: string;
    uploadedAt?: string;
    approvedAt?: string;
    deadline?: string; // timestamp
    status?: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    internalNotes?: string;
    depositAmountUSD?: number;
  };
}

export interface Announcement {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  scope: 'all' | 'priority_only' | 'country_specific';
  targetCountry?: string;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  timestamp: string;
  text: string;
}

export interface SupportTicket {
  id: string;
  applicationId: string;
  applicationNumber: string;
  userId: string;
  userName: string;
  subject: string;
  status: 'OPEN' | 'RESOLVED';
  messages: TicketMessage[];
}

export interface HostCity {
  name: string;
  country: string;
  stadium: string;
  capacity: string;
  description: string;
  image: string;
}
