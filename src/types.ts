export type UserRole = 'citizen' | 'admin' | 'government';

export interface User {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  ipAddress?: string;
  latitude?: number;
  longitude?: number;
  role: UserRole;
  state: string;
  district: string;
  village: string;
  avatarUrl?: string;
  department?: string; // e.g. "Public Works", "Water Supply" for government officers
  officerIdNumber?: string; // Official Government Officer / Employee ID number
  officerProofDoc?: string; // Uploaded Official ID badge / Government service card proof URL or base64
  officerDesignation?: string; // e.g. "District Magistrate & Collector (DM)"
}

export type ComplaintCategory =
  | 'Roads'
  | 'Water'
  | 'Electricity'
  | 'Drainage'
  | 'Sanitation'
  | 'Healthcare'
  | 'Education'
  | 'Agriculture'
  | 'Other';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Verified'
  | 'In Progress'
  | 'Resolved';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface StatusHistoryItem {
  status: ComplaintStatus;
  timestamp: string;
  note: string;
  actor: string;
  actorRole: string;
}

export interface Complaint {
  id: string; // e.g. "GV-10482"
  title: string;
  category: ComplaintCategory;
  description: string;
  audioUrl?: string;
  audioTranscript?: string;
  audioLanguage?: string;
  images: string[];
  state: string;
  district: string;
  village: string;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  departmentAssigned?: string;
  estimatedTimeline?: string;
  aiSummary?: string;
  aiFormalDraft?: string;
  aiCategoryReason?: string;
  aiKeyIssues?: string[];
  userId: string;
  userName: string;
  userPhone?: string;
  supportersCount: number;
  supporterIds: string[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryItem[];
  resolutionProofImage?: string;
  resolutionProofPhoto?: string;
  resolutionRemarks?: string;
  formalLetter?: string;
}

export interface PetitionSupporter {
  userId: string;
  userName: string;
  userVillage: string;
  comment?: string;
  createdAt: string;
}

export interface Petition {
  id: string;
  complaintId?: string;
  title: string;
  category: ComplaintCategory;
  story: string;
  photoUrl: string;
  state: string;
  district: string;
  village: string;
  targetGoal: number;
  currentSupporters: number;
  supporterIds: string[];
  recentSupporters: PetitionSupporter[];
  status: 'Active' | 'Under Government Review' | 'Goal Reached' | 'Passed';
  createdBy: string;
  creatorName: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  complaintId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
  isOfficial?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status_change' | 'verified' | 'resolved' | 'petition_milestone' | 'comment';
  complaintId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  headName: string;
  email: string;
  icon: string;
  activeGrievances: number;
  resolvedCount: number;
  avgDaysToResolve: number;
}

export interface PlatformStats {
  totalComplaints: number;
  pendingCount: number;
  underReviewCount: number;
  verifiedCount: number;
  inProgressCount: number;
  resolvedCount: number;
  activePetitions: number;
  activeVillages: number;
  avgResolutionDays: number;
  categoryBreakdown: { category: ComplaintCategory; count: number }[];
  districtBreakdown: { district: string; count: number; resolved: number }[];
}
