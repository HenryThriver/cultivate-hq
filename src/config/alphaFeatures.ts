export interface AlphaFeature {
  key: string;
  title: string;
  description: string;
  category: 'intelligence' | 'automation' | 'strategy' | 'communication' | 'platform';
  phase: 'current' | 'alpha' | 'soon' | 'roadmap';
  badge?: string;
}

export const ALPHA_FEATURES: AlphaFeature[] = [
  // Current Features (already live)
  {
    key: 'contact_intelligence',
    title: 'AI-Powered Contact Intelligence',
    description: 'Automatically capture and organize every detail about your contacts - names, interests, family details, preferences, and conversation history.',
    category: 'intelligence',
    phase: 'current'
  },
  {
    key: 'smart_follow_up',
    title: 'Smart Follow-up System',
    description: 'Get personalized follow-up suggestions within 24 hours of meeting someone, with draft messages based on your conversation and shared interests.',
    category: 'automation',
    phase: 'current'
  },
  {
    key: 'relationship_sessions',
    title: 'Guided Relationship Sessions',
    description: 'Weekly guided sessions that help you strategically nurture your most important relationships with pre-loaded insights and actionable next steps.',
    category: 'strategy',
    phase: 'current'
  },
  {
    key: 'voice_memos',
    title: 'Voice Memo Intelligence',
    description: 'Capture relationship insights on the go - just record a quick voice memo and our AI extracts and organizes all the important details.',
    category: 'intelligence',
    phase: 'current'
  },

  // Alpha Launch Features (Phase 1-4)
  {
    key: 'mobile_first_experience',
    title: 'Mobile-First Quick Capture',
    description: 'Optimized mobile interface for capturing relationship insights in real-time - perfect for conferences, meetings, and on-the-go networking.',
    category: 'platform',
    phase: 'alpha',
    badge: 'New'
  },
  {
    key: 'cost_analytics',
    title: 'Transparent Usage Analytics',
    description: 'Track your AI usage and costs in real-time, ensuring complete transparency and control over your investment in relationship intelligence.',
    category: 'platform',
    phase: 'alpha',
    badge: 'New'
  },
  {
    key: 'supporter_tier',
    title: 'Elite Supporter Access',
    description: '$3,000 for 5 years of premium access - includes early feature access, direct founder communication, and strategic consultation privileges.',
    category: 'platform',
    phase: 'alpha',
    badge: 'Limited'
  },
  {
    key: 'relationship_progress',
    title: 'Progress Tracking & Milestones',
    description: 'Visual analytics showing relationship growth, milestone celebrations, and strategic progress toward your networking goals.',
    category: 'intelligence',
    phase: 'alpha',
    badge: 'New'
  },

  // Coming Soon Features (Phase 5-6)
  {
    key: 'email_reminders',
    title: 'Smart Email Reminders',
    description: 'Intelligent notification system that reminds you to nurture relationships at the perfect moment - never let important connections go cold.',
    category: 'automation',
    phase: 'soon'
  },
  {
    key: 'goal_system',
    title: 'Strategic Goal Setting',
    description: 'Set and track relationship-building goals with AI-powered suggestions for achieving ambitious outcomes through strategic connections.',
    category: 'strategy',
    phase: 'soon'
  },
  {
    key: 'daily_check_in',
    title: 'Quick Daily Check-ins',
    description: '2-minute daily workflow to maintain relationship momentum - the toothbrush test for professional networking.',
    category: 'automation',
    phase: 'soon'
  },
  {
    key: 'relationship_health',
    title: 'Relationship Health Scoring',
    description: 'AI-powered analysis of relationship strength with alerts when important connections need attention.',
    category: 'intelligence',
    phase: 'soon'
  },

  // Roadmap Features (Phase 7+)
  {
    key: 'linkedin_mass_analysis',
    title: 'LinkedIn Connection Analysis',
    description: 'Import and analyze thousands of LinkedIn connections at once - discover hidden patterns and opportunities in your existing network.',
    category: 'intelligence',
    phase: 'roadmap'
  },
  {
    key: 'deep_research',
    title: 'Deep Research Intelligence',
    description: 'Automated dossier generation from public sources - podcast appearances, articles, interviews - for comprehensive pre-meeting intelligence.',
    category: 'intelligence',
    phase: 'roadmap'
  },
  {
    key: 'personal_branding',
    title: 'AI Personal Branding Suite',
    description: 'Generate compelling elevator pitches, one-liners, and introduction emails that capture your unique value proposition.',
    category: 'communication',
    phase: 'roadmap'
  },
  {
    key: 'conference_intelligence',
    title: 'Conference Networking Intelligence',
    description: 'Pre-event attendee analysis, strategic targeting, and post-event follow-up tracking for maximum conference ROI.',
    category: 'strategy',
    phase: 'roadmap'
  },
  {
    key: 'meeting_coach',
    title: 'Real-time Meeting Coach',
    description: 'Zoom integration providing real-time coaching and conversation optimization during important meetings.',
    category: 'communication',
    phase: 'roadmap'
  },
  {
    key: 'visual_scraping',
    title: 'Visual Content Intelligence',
    description: 'AI-powered scraping of LinkedIn Messenger, Circle, and other platforms - convert any conversation into actionable relationship intelligence.',
    category: 'intelligence',
    phase: 'roadmap'
  }
];

// Helper functions
export const getFeaturesByPhase = (phase: AlphaFeature['phase']): AlphaFeature[] => {
  return ALPHA_FEATURES.filter(feature => feature.phase === phase);
};

export const getFeaturesByCategory = (category: AlphaFeature['category']): AlphaFeature[] => {
  return ALPHA_FEATURES.filter(feature => feature.category === category);
};