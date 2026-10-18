export type SupportedLanguage = 'en' | 'hi' | 'de' | 'fr';

export type ServiceCategory =
  | 'video_editing'
  | 'image_editing'
  | 'audio_editing'
  | 'esports_gaming'
  | 'graphic_design'
  | 'motion_graphics';

export type ProjectStatus = 'requested' | 'in_progress' | 'in_review' | 'completed' | 'cancelled';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  company?: string;
  avatarUrl?: string;
  preferredLanguage: SupportedLanguage;
  createdAt: string;
}

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

export type TicketCategory = 'general' | 'billing' | 'project_revision' | 'technical' | 'deadline';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

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

export interface PortfolioItem {
  id: string;
  title: string;
  category: ServiceCategory;
  categoryLabel: string;
  clientName: string;
  year: string;
  description: string;
  thumbnail: string;
  tags: string[];
  durationOrScope: string;
  deliverables: string[];
  demoType: 'Video Commercial' | 'Color Grade' | 'Esports Highlight' | '3D Motion' | 'Brand Identity' | 'Podcast Master';
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
