export interface FaqItem {
  id: string;
  category: 'production' | 'files' | 'revisions' | 'billing';
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'production',
    question: 'How fast will my video or graphic project be delivered?',
    answer:
      'Standard turnaround is 3 to 5 business days for typical video editing and graphic packages. If you have an urgent deadline, our Express (48 hours) and Rush (24 hours) priority options can be selected directly when submitting your service request.',
  },
  {
    id: 'faq-2',
    category: 'files',
    question: 'How do I provide raw footage, audio stems, and brand assets?',
    answer:
      'When placing an order, you can provide a direct cloud share link (Google Drive, Dropbox, Box, OneDrive, or WeTransfer). Please ensure file permissions are set to "Anyone with the link can view/edit" so our senior editors can ingest the files immediately.',
  },
  {
    id: 'faq-3',
    category: 'revisions',
    question: 'What is Pixel Media’s revision policy?',
    answer:
      'Every project includes 2 full rounds of creative revisions at no extra cost. In Phase 2, our integrated online editor will also let you leave timecode-stamped visual comments directly on the video player.',
  },
  {
    id: 'faq-4',
    category: 'files',
    question: 'What video codecs and resolutions do you output?',
    answer:
      'We deliver broadcast-grade Apple ProRes 422/4444, DNxHR, and optimized H.264/H.265 MP4 files. We support vertical 9:16 (TikTok/Reels), 1:1 square, 16:9 widescreen, and ultra-wide cinematic ratios up to 8K resolution.',
  },
  {
    id: 'faq-5',
    category: 'billing',
    question: 'How does client invoicing and project billing work?',
    answer:
      'After submitting a service request, your dedicated producer reviews the creative brief and issues a formal project estimate. Upon your approval, work begins immediately and payment milestones are managed through your client account.',
  },
  {
    id: 'faq-6',
    category: 'production',
    question: 'Can I request custom audio mastering or voiceover cleanup separately?',
    answer:
      'Yes! Our Audio Production & Podcast Mastering service operates independently or as an add-on. We conform to EBU R128 and Apple Podcast broadcast loudness standards (-16 LUFS / -14 LUFS).',
  },
];
