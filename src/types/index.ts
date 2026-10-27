// ============================================================
// Pixel Media — Marketplace Type Definitions
// ============================================================

export type SupportedLanguage = 'en' | 'hi' | 'de' | 'fr';

export type UserRole = 'client' | 'editor' | 'admin';

export type ExperienceLevel = 'beginner' | 'pro';

export type Availability = 'available' | 'busy' | 'unavailable';

export type PortfolioStatus = 'draft' | 'published' | 'unpublished';

export type MediaType = 'image' | 'video' | 'audio' | 'animation' | 'external_link';

export type RequestStatus =
  | 'pending'
  | 'quoted'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'declined'
  | 'cancelled';

export type ReportTargetType = 'portfolio_item' | 'profile' | 'project_request';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

// --- Core User Profile ---
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  company?: string;
  avatarUrl?: string;
  preferredLanguage: SupportedLanguage;
  createdAt: string;
  // Marketplace fields
  role: UserRole;
  bio?: string;
  headline?: string;
  experienceLevel?: ExperienceLevel;
  availability?: Availability;
  startingPrice?: number;
  contactForQuote?: boolean;
  location?: string;
  websiteUrl?: string;
  isPublished?: boolean;
  onboardingCompleted?: boolean;
}

// --- Category ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  iconName?: string;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
}

// --- Editor Service ---
export interface EditorService {
  id: string;
  editorId: string;
  categoryId: string;
  category?: Category;
}

// --- Editor Software ---
export interface EditorSoftware {
  id: string;
  editorId: string;
  name: string;
}

// --- Portfolio Item ---
export interface PortfolioItem {
  id: string;
  editorId?: string;
  title: string;
  description?: string;
  categoryId?: string;
  category?: Category | ServiceCategory | string;
  categoryLabel?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  externalLink?: string;
  softwareUsed?: string[];
  editorRole?: string;
  projectDuration?: string;
  durationOrScope?: string;
  clientName?: string;
  year?: string;
  tags?: string[];
  deliverables?: string[];
  demoType?: string;
  status?: PortfolioStatus;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

// --- Milestone Agreement (Escrow & Payment Ready Structure) ---
export interface MilestoneAgreement {
  id: string;
  title: string;
  description?: string;
  amount: number;
  percentage?: number;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
}

// --- Project Proposal / Creator Quote ---
export interface ProjectProposal {
  id: string;
  requestId: string;
  editorId: string;
  quotedPrice: number;
  estimatedDelivery: string;
  scopeSummary: string;
  revisionsIncluded: number;
  notes?: string;
  deliverablesFormat?: string;
  milestones: MilestoneAgreement[];
  submittedAt: string;
  clientFeedback?: string;
  decidedAt?: string;
}

// --- Project Request ---
export interface ProjectRequest {
  id: string;
  clientId: string;
  editorId: string;
  title: string;
  description: string;
  categoryId?: string;
  category?: Category;
  deliverables?: string;
  referenceLinks: string[];
  budgetMin?: number;
  budgetMax?: number;
  requestQuote: boolean;
  deadline?: string;
  additionalNotes?: string;
  status: RequestStatus;
  proposal?: ProjectProposal;
  finalDeliverablesUrl?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Joined data
  client?: UserProfile;
  editor?: UserProfile;
}

// --- Project Collaboration, Messaging & Creative Review ---
export interface ProjectMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderRole: 'client' | 'editor';
  senderName?: string;
  senderAvatarUrl?: string;
  content: string;
  readBy?: string[];
  createdAt: string;
}

export type ReviewVersionStatus = 'pending_review' | 'changes_requested' | 'approved';

export interface ReviewComment {
  id: string;
  versionId: string;
  requestId: string;
  authorId: string;
  authorRole: 'client' | 'editor';
  authorName?: string;
  authorAvatarUrl?: string;
  timestampSeconds?: number;
  timestampDisplay?: string;
  content: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  replyContent?: string;
  repliedAt?: string;
  repliedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewVersion {
  id: string;
  requestId: string;
  versionNumber: number;
  title: string;
  videoUrl: string;
  notes?: string;
  submittedBy: string;
  submittedByName?: string;
  status: ReviewVersionStatus;
  createdAt: string;
  updatedAt?: string;
  commentsCount?: number;
  unresolvedCommentsCount?: number;
}

// --- Report ---
export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

// --- Editor Card (for discovery) ---
export interface EditorCard {
  id: string;
  fullName: string;
  headline?: string;
  avatarUrl?: string;
  experienceLevel?: ExperienceLevel;
  availability?: Availability;
  startingPrice?: number;
  contactForQuote?: boolean;
  location?: string;
  services: Category[];
  software: string[];
  portfolioPreview: PortfolioItem[];
  portfolioCount: number;
}

// --- Search/Filter params ---
export interface EditorSearchParams {
  query?: string;
  categorySlug?: string;
  experienceLevel?: ExperienceLevel;
  availability?: Availability;
  minPrice?: number;
  maxPrice?: number;
  priceTier?: 'all' | 'under_250' | '250_500' | '500_1000' | '1000_plus';
  software?: string;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'newest';
  page?: number;
  limit?: number;
}

// --- Admin Settings ---
export interface AdminSetting {
  key: string;
  value: unknown;
  updatedAt: string;
}

// --- Common software list (for autocomplete) ---
export const COMMON_SOFTWARE = [
  'Adobe Premiere Pro',
  'Adobe After Effects',
  'Adobe Photoshop',
  'Adobe Lightroom',
  'Adobe Illustrator',
  'Adobe Audition',
  'DaVinci Resolve',
  'Final Cut Pro',
  'Logic Pro',
  'Pro Tools',
  'Blender',
  'Cinema 4D',
  'Nuke',
  'Figma',
  'Canva',
  'CapCut',
  'iZotope RX',
  'Ableton Live',
  'FL Studio',
  'Unreal Engine',
  'Houdini',
] as const;

// Re-export legacy types for backward compatibility
export type ServiceCategory =
  | 'video_editing'
  | 'image_editing'
  | 'audio_editing'
  | 'esports_gaming'
  | 'graphic_design'
  | 'motion_graphics';

export type ProjectStatus = 'requested' | 'in_progress' | 'in_review' | 'completed' | 'cancelled';

export type TicketCategory = 'general' | 'billing' | 'project_revision' | 'technical' | 'deadline';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Project {
  id: string;
  clientId: string;
  title: string;
  category: ServiceCategory;
  status: ProjectStatus;
  progress: number;
  deadline?: string;
  description: string;
  deliverablesUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  serviceCategory: ServiceCategory;
  projectTitle: string;
  description: string;
  urgency: 'standard' | 'express' | 'rush';
  budgetRange?: string;
  assetsUrl?: string;
  targetFormat?: string;
  status: 'pending' | 'approved' | 'in_production' | 'rejected';
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  clientId: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  message: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceDetail {
  id: ServiceCategory;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  turnaround: string;
  deliverables: string[];
  workflow: string[];
  supportedFormats: string[];
  startingPrice: string;
}
