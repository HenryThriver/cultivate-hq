export interface FunctionalFeature {
  key: string;
  title: string;
  description: string;
  category: 'find' | 'nurture' | 'strategy' | 'events';
  icon?: string;
}

export const FUNCTIONAL_FEATURES: FunctionalFeature[] = [
  // Finding the Right People
  {
    key: 'linkedin_analysis',
    title: 'LinkedIn Network Analysis',
    description: 'Analyze your entire LinkedIn network to surface hidden connections and identify high-value relationships you should be cultivating.',
    category: 'find'
  },
  {
    key: 'smart_introductions',
    title: 'Strategic Introduction Engine',
    description: 'Automatically identify mutually beneficial connections within your network and facilitate warm introductions that create value for everyone.',
    category: 'find'
  },
  {
    key: 'opportunity_detection',
    title: 'Opportunity Detection',
    description: 'AI-powered pattern recognition that identifies when the right person appears in your orbit at exactly the right moment.',
    category: 'find'
  },
  {
    key: 'network_mapping',
    title: 'Network Mapping & Visualization',
    description: 'See your professional ecosystem visualized, revealing connection clusters, influence paths, and strategic relationship gaps.',
    category: 'find'
  },

  // Nurturing Relationships
  {
    key: 'contact_intelligence',
    title: 'Comprehensive Contact Intelligence',
    description: 'Never forget a detail - automatically capture names, interests, family information, preferences, and conversation history in rich contact profiles.',
    category: 'nurture'
  },
  {
    key: 'smart_follow_up',
    title: 'Intelligent Follow-up System',
    description: 'Get personalized follow-up suggestions within 24 hours of meeting someone, with draft messages based on your conversation context.',
    category: 'nurture'
  },
  {
    key: 'voice_capture',
    title: 'Voice Memo Intelligence',
    description: 'Capture relationship insights on the go - record quick voice memos and our AI extracts all important details into your contact profiles.',
    category: 'nurture'
  },
  {
    key: 'artifact_creation',
    title: 'Multi-Channel Artifact Creation',
    description: 'Transform every interaction into relationship intelligence - from Gmail threads and calendar meetings to LinkedIn messages and community forums.',
    category: 'nurture'
  },
  {
    key: 'public_monitoring',
    title: 'Public Sphere Monitoring',
    description: 'Stay informed about your contacts\' professional milestones, thought leadership, and public activities to find natural reconnection opportunities.',
    category: 'nurture'
  },

  // Strategic Relationship Management
  {
    key: 'relationship_sessions',
    title: 'Guided Relationship Sessions',
    description: 'Weekly strategic sessions that help you systematically nurture your most important relationships with actionable insights and next steps.',
    category: 'strategy'
  },
  {
    key: 'reciprocity_index',
    title: 'Reciprocity Intelligence',
    description: 'Track the balance of giving and receiving in each relationship to ensure sustainable, mutually beneficial connections.',
    category: 'strategy'
  },
  {
    key: 'ask_management',
    title: 'Strategic Ask Management',
    description: 'Know exactly when and how to make requests, with AI-powered timing suggestions based on relationship strength and reciprocity balance.',
    category: 'strategy'
  },
  {
    key: 'goal_alignment',
    title: 'Goal-Aligned Networking',
    description: 'Connect your relationship building directly to strategic objectives, with AI recommendations for which connections can accelerate specific goals.',
    category: 'strategy'
  },
  {
    key: 'progress_tracking',
    title: 'Relationship Progress Analytics',
    description: 'Visual dashboards showing relationship growth, milestone achievements, and strategic progress toward your networking objectives.',
    category: 'strategy'
  },
  {
    key: 'natural_queries',
    title: 'Natural Language Intelligence',
    description: 'Ask questions like "Who can help me enter the biotech industry?" and get intelligent recommendations from your network.',
    category: 'strategy'
  },

  // Conferences & Events
  {
    key: 'event_intelligence',
    title: 'Pre-Event Intelligence Briefs',
    description: 'Comprehensive research briefs on attendees, speakers, and companies before you arrive, ensuring every conversation has strategic purpose.',
    category: 'events'
  },
  {
    key: 'attendee_targeting',
    title: 'Strategic Attendee Targeting',
    description: 'Identify the exact people you should connect with at events based on your goals, with personalized outreach templates for each.',
    category: 'events'
  },
  {
    key: 'event_hosting',
    title: 'Strategic Event Curation',
    description: 'AI-powered guest list recommendations ensuring the perfect mix of attendees for maximum network effects at your hosted events.',
    category: 'events'
  },
  {
    key: 'meeting_scheduling',
    title: 'Intelligent Meeting Orchestration',
    description: 'Optimize your conference schedule with AI that suggests meeting times, locations, and even conversation topics for maximum impact.',
    category: 'events'
  },
  {
    key: 'deep_research',
    title: 'Deep Contact Research',
    description: 'Automated intelligence gathering from podcasts, articles, interviews, and public speaking to create comprehensive briefs before important meetings.',
    category: 'events'
  },
  {
    key: 'post_event_activation',
    title: 'Post-Event Activation',
    description: 'Systematic follow-up workflows that transform event connections into lasting professional relationships with personalized nurture sequences.',
    category: 'events'
  }
];

export const getFeaturesByCategory = (category: FunctionalFeature['category']): FunctionalFeature[] => {
  return FUNCTIONAL_FEATURES.filter(feature => feature.category === category);
};

export const CATEGORY_INFO = {
  find: {
    title: 'Find the Right People at the Right Time',
    subtitle: 'Discover high-value connections hiding in plain sight within your existing network and beyond.',
    icon: 'search'
  },
  nurture: {
    title: 'Nurture Relationships Effectively', 
    subtitle: 'Build deeper connections with intelligent tools that remember every detail and suggest perfect touchpoints.',
    icon: 'favorite'
  },
  strategy: {
    title: 'Connect Strategically',
    subtitle: 'Align your relationship building with strategic objectives and know exactly when to activate connections.',
    icon: 'target'
  },
  events: {
    title: 'Master Conferences & Events',
    subtitle: 'Transform networking events from overwhelming to strategic with intelligence that ensures every interaction counts.',
    icon: 'event'
  }
};