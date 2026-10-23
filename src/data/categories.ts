// ============================================================
// Pixel Pedia — Data-Driven Categories
// Used as fallback when Supabase is not configured
// ============================================================

import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-video',
    name: 'Video Editing',
    slug: 'video-editing',
    description: 'Professional video editing and post-production',
    iconName: 'Film',
    sortOrder: 1,
    isActive: true,
    children: [
      { id: 'cat-youtube', name: 'YouTube Videos', slug: 'youtube-videos', description: 'Long-form YouTube content editing', parentId: 'cat-video', sortOrder: 1, isActive: true },
      { id: 'cat-shortform', name: 'Short-Form Content', slug: 'short-form', description: 'Reels, TikTok, Shorts editing', parentId: 'cat-video', sortOrder: 2, isActive: true },
      { id: 'cat-gaming', name: 'Gaming & Esports', slug: 'gaming-esports', description: 'Gaming highlights, esports content', parentId: 'cat-video', sortOrder: 3, isActive: true },
      { id: 'cat-podcasts', name: 'Podcasts', slug: 'podcasts-video', description: 'Video podcast editing', parentId: 'cat-video', sortOrder: 4, isActive: true },
      { id: 'cat-commercials', name: 'Commercials', slug: 'commercials', description: 'Commercial and ad video editing', parentId: 'cat-video', sortOrder: 5, isActive: true },
    ],
  },
  {
    id: 'cat-motion',
    name: 'Motion Graphics & Animation',
    slug: 'motion-graphics',
    description: 'Animated titles, explainers, VFX, compositing',
    iconName: 'Sparkles',
    sortOrder: 2,
    isActive: true,
    children: [
      { id: 'cat-titles', name: 'Animated Titles', slug: 'animated-titles', description: 'Motion title design and animation', parentId: 'cat-motion', sortOrder: 1, isActive: true },
      { id: 'cat-explainers', name: 'Explainer Videos', slug: 'explainers', description: 'Animated explainer videos', parentId: 'cat-motion', sortOrder: 2, isActive: true },
      { id: 'cat-vfx', name: 'VFX', slug: 'vfx', description: 'Visual effects and compositing', parentId: 'cat-motion', sortOrder: 3, isActive: true },
      { id: 'cat-compositing', name: 'Compositing', slug: 'compositing', description: 'Multi-layer compositing', parentId: 'cat-motion', sortOrder: 4, isActive: true },
    ],
  },
  {
    id: 'cat-photo',
    name: 'Photo Editing',
    slug: 'photo-editing',
    description: 'Retouching, product photography, color correction',
    iconName: 'Image',
    sortOrder: 3,
    isActive: true,
    children: [
      { id: 'cat-retouching', name: 'Photo Retouching', slug: 'retouching', description: 'Beauty and portrait retouching', parentId: 'cat-photo', sortOrder: 1, isActive: true },
      { id: 'cat-product', name: 'Product Photography', slug: 'product-photography', description: 'E-commerce product photo editing', parentId: 'cat-photo', sortOrder: 2, isActive: true },
      { id: 'cat-colorgrade', name: 'Color Correction', slug: 'color-correction', description: 'Professional color grading', parentId: 'cat-photo', sortOrder: 3, isActive: true },
    ],
  },
  {
    id: 'cat-graphic',
    name: 'Graphic Design',
    slug: 'graphic-design',
    description: 'Thumbnails, posters, social media graphics, branding',
    iconName: 'Palette',
    sortOrder: 4,
    isActive: true,
    children: [
      { id: 'cat-thumbnails', name: 'Thumbnails', slug: 'thumbnails', description: 'YouTube and social media thumbnails', parentId: 'cat-graphic', sortOrder: 1, isActive: true },
      { id: 'cat-posters', name: 'Posters', slug: 'posters', description: 'Poster and print design', parentId: 'cat-graphic', sortOrder: 2, isActive: true },
      { id: 'cat-social', name: 'Social Media Graphics', slug: 'social-graphics', description: 'Social media visual content', parentId: 'cat-graphic', sortOrder: 3, isActive: true },
      { id: 'cat-branding', name: 'Branding', slug: 'branding', description: 'Brand identity and logo design', parentId: 'cat-graphic', sortOrder: 4, isActive: true },
    ],
  },
  {
    id: 'cat-audio',
    name: 'Audio Editing',
    slug: 'audio-editing',
    description: 'Podcast cleanup, dialogue editing, sound design, mixing',
    iconName: 'Headphones',
    sortOrder: 5,
    isActive: true,
    children: [
      { id: 'cat-podcast-cleanup', name: 'Podcast Cleanup', slug: 'podcast-cleanup', description: 'Audio cleanup and enhancement', parentId: 'cat-audio', sortOrder: 1, isActive: true },
      { id: 'cat-dialogue', name: 'Dialogue Editing', slug: 'dialogue-editing', description: 'Dialogue editing and ADR', parentId: 'cat-audio', sortOrder: 2, isActive: true },
      { id: 'cat-sounddesign', name: 'Sound Design', slug: 'sound-design', description: 'Custom sound design and foley', parentId: 'cat-audio', sortOrder: 3, isActive: true },
      { id: 'cat-mixing', name: 'Mixing & Mastering', slug: 'mixing-mastering', description: 'Professional audio mixing and mastering', parentId: 'cat-audio', sortOrder: 4, isActive: true },
    ],
  },
  {
    id: 'cat-other',
    name: 'Other Creative Services',
    slug: 'other',
    description: 'Other creative editing services',
    iconName: 'Layers',
    sortOrder: 6,
    isActive: true,
    children: [],
  },
];

/** Flatten categories into a single array (parents + children) */
export function flattenCategories(cats: Category[]): Category[] {
  const result: Category[] = [];
  for (const cat of cats) {
    const { children, ...parent } = cat;
    result.push(parent);
    if (children) {
      result.push(...children);
    }
  }
  return result;
}

/** Find a category by slug */
export function findCategoryBySlug(cats: Category[], slug: string): Category | undefined {
  for (const cat of cats) {
    if (cat.slug === slug) return cat;
    if (cat.children) {
      const child = cat.children.find((c) => c.slug === slug);
      if (child) return child;
    }
  }
  return undefined;
}

/** Get parent categories only */
export function getParentCategories(cats: Category[]): Category[] {
  return cats.filter((c) => !c.parentId);
}
