import { Project, ServiceRequest, SupportTicket } from '../types';

export const getInitialProjectsForUser = (userId: string): Project[] => [
  {
    id: `proj-${userId}-1`,
    clientId: userId,
    title: 'Kinetic Brand Launch Video (4K Edit)',
    category: 'video_editing',
    status: 'in_progress',
    progress: 65,
    deadline: '2026-10-25',
    description: 'Rough cut approved. Final color grading and dialogue mastering underway.',
    deliverablesUrl: 'https://drive.google.com/drive/folders/sample-client-deliverables-1',
    createdAt: '2026-10-12T10:00:00Z',
    updatedAt: '2026-10-18T14:30:00Z',
  },
  {
    id: `proj-${userId}-2`,
    clientId: userId,
    title: 'Esports Tournament Highlight Reel',
    category: 'esports_gaming',
    status: 'in_review',
    progress: 90,
    deadline: '2026-10-21',
    description: 'VOD edit complete with beat-synced transitions. Awaiting client notes on music cue.',
    deliverablesUrl: 'https://drive.google.com/drive/folders/sample-client-deliverables-2',
    createdAt: '2026-10-14T11:20:00Z',
    updatedAt: '2026-10-17T18:00:00Z',
  },
  {
    id: `proj-${userId}-3`,
    clientId: userId,
    title: 'Spring Lookbook Beauty Retouching',
    category: 'image_editing',
    status: 'completed',
    progress: 100,
    deadline: '2026-10-10',
    description: '16 high-resolution TIFF plates delivered with print press color profiles.',
    deliverablesUrl: 'https://drive.google.com/drive/folders/sample-client-deliverables-3',
    createdAt: '2026-10-01T09:15:00Z',
    updatedAt: '2026-10-09T16:45:00Z',
  },
];

export const getInitialTicketsForUser = (userId: string): SupportTicket[] => [
  {
    id: `ticket-${userId}-1`,
    clientId: userId,
    subject: 'Request audio stem export for YouTube Shorts',
    category: 'project_revision',
    priority: 'normal',
    message: 'Can the senior audio engineer provide vocal and music stems separated for our social reel editor?',
    status: 'in_progress',
    createdAt: '2026-10-16T14:00:00Z',
    updatedAt: '2026-10-17T09:30:00Z',
  },
];

export const getInitialRequestsForUser = (userId: string): ServiceRequest[] => [
  {
    id: `req-${userId}-1`,
    clientId: userId,
    serviceCategory: 'motion_graphics',
    projectTitle: '3D Logo Animation & UI Explainer',
    description: '15-second loopable 3D emblem reveal with transparent alpha channel for our website hero header.',
    urgency: 'standard',
    budgetRange: '$600 - $1000',
    assetsUrl: 'https://drive.google.com/drive/folders/sample-logo-vectors',
    targetFormat: 'ProRes 4444 + Lottie JSON',
    status: 'pending',
    createdAt: '2026-10-17T15:00:00Z',
  },
];
