/**
 * Dummy Data Generator for Dashboard Components
 * 
 * This file contains compelling dummy data that demonstrates the sophisticated
 * relationship intelligence capabilities of Cultivate HQ. The data is designed
 * to showcase executive-level insights and strategic networking scenarios.
 * 
 * Brand Voice: The Magnetic Advisor - sophisticated, empowering, confident, warm,
 * with moments of delightful surprise (the 15% pattern-breaking rule).
 */

import type { Contact } from '@/types';

// Executive-level contact profiles for demonstration
export const dummyContacts: Partial<Contact>[] = [
  {
    id: 'contact-1',
    name: 'Sarah Chen',
    linkedin_url: 'https://linkedin.com/in/sarahchen',
    professional_context: {
      current_role: 'VP Product',
      current_company: 'TechFlow Dynamics',
      expertise_areas: ['AI/ML Strategy', 'Product-Led Growth', 'B2B SaaS'],
      goals: ['Strategic partnerships in AI space', 'Board positions at emerging tech companies'],
      networking_objectives: ['Find technical co-founder for side project', 'Connect with AI researchers'],
      opportunities_to_help: ['Introduction to VCs', 'Product strategy insights', 'Team building advice']
    },
    personal_context: {
      interests: ['Classical music', 'Marathon running', 'Sustainable technology'],
      family: {
        partner: { name: 'David', relationship: 'Partner', details: 'Software architect at Meta' },
        children: [{ name: 'Emma', relationship: 'Daughter', details: 'Age 8, loves robotics' }]
      },
      conversation_starters: {
        professional: ['Ask about her AI ethics framework', 'Discuss the future of product management'],
        personal: ['Her recent marathon in Boston', 'Family trip to Japan last summer']
      }
    },
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-07-20').toISOString()
  },
  {
    id: 'contact-2',
    name: 'Marcus Rodriguez',
    linkedin_url: 'https://linkedin.com/in/marcusrodriguez',
    professional_context: {
      current_role: 'Chief Technology Officer',
      current_company: 'InnovateAI Solutions',
      expertise_areas: ['Machine Learning Infrastructure', 'Technical Leadership', 'Startup Scaling'],
      goals: ['IPO preparation', 'Expand engineering team globally'],
      networking_objectives: ['Connect with technical talent', 'Find strategic partnerships'],
      opportunities_to_help: ['Technical due diligence', 'Engineering culture advice', 'ML implementation']
    },
    personal_context: {
      interests: ['Photography', 'Rock climbing', 'Mentoring junior developers'],
      conversation_starters: {
        professional: ['His thoughts on the future of AI infrastructure', 'Scaling engineering teams'],
        personal: ['Recent climbing trip to Yosemite', 'Photography exhibition in SF']
      }
    },
    created_at: new Date('2024-02-10').toISOString(),
    updated_at: new Date('2024-07-18').toISOString()
  },
  {
    id: 'contact-3',
    name: 'Jennifer Walsh',
    linkedin_url: 'https://linkedin.com/in/jenniferwalsh',
    professional_context: {
      current_role: 'Former CEO',
      current_company: 'InnovateCorp (Exited)',
      expertise_areas: ['Corporate Strategy', 'M&A', 'Board Governance', 'Digital Transformation'],
      goals: ['Board positions at high-growth companies', 'Angel investing in femtech'],
      networking_objectives: ['Connect with promising startups', 'Find board opportunities'],
      opportunities_to_help: ['Strategic advisory', 'Executive coaching', 'Investor introductions']
    },
    personal_context: {
      interests: ['Wine collecting', 'Art curation', 'Women in tech mentorship'],
      family: {
        children: [
          { name: 'Alex', relationship: 'Son', details: 'Stanford MBA student' },
          { name: 'Taylor', relationship: 'Daughter', details: 'Pediatric resident at UCSF' }
        ]
      },
      conversation_starters: {
        professional: ['Her experience with digital transformation', 'Board governance best practices'],
        personal: ['Recent wine tasting trip to Tuscany', 'Art collection featuring emerging artists']
      }
    },
    created_at: new Date('2024-03-05').toISOString(),
    updated_at: new Date('2024-07-25').toISOString()
  },
  {
    id: 'contact-4',
    name: 'Dr. Amit Patel',
    linkedin_url: 'https://linkedin.com/in/drapatel',
    professional_context: {
      current_role: 'Director of AI Research',
      current_company: 'Stanford AI Lab',
      expertise_areas: ['Natural Language Processing', 'Ethical AI', 'Research Commercialization'],
      goals: ['Launch AI ethics consultancy', 'Publish book on responsible AI'],
      networking_objectives: ['Connect with industry leaders', 'Find commercial applications for research'],
      opportunities_to_help: ['AI ethics consultation', 'Research collaboration', 'Technical advisory']
    },
    personal_context: {
      interests: ['Indian classical music', 'Cooking', 'Teaching meditation'],
      family: {
        partner: { name: 'Priya', relationship: 'Wife', details: 'Pediatric surgeon at Stanford' },
        children: [{ name: 'Arjun', relationship: 'Son', details: 'Age 12, chess prodigy' }]
      },
      conversation_starters: {
        professional: ['Latest research on AI bias mitigation', 'The future of human-AI collaboration'],
        personal: ['His meditation practice', 'Family cooking traditions']
      }
    },
    created_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date('2024-07-22').toISOString()
  }
];

// Strategic insights that demonstrate AI pattern recognition
export const dummyInsights = [
  {
    id: 'insight-1',
    type: 'opportunity' as const,
    title: 'Strategic Introduction Opportunity Detected',
    description: 'Sarah Chen and Marcus Rodriguez both mentioned AI partnerships in recent conversations. Sarah\'s need for technical co-founder aligns perfectly with Marcus\'s expansion goals. Confidence score: 94%',
    source: 'Cross-Conversation Analysis',
    confidence: 94,
    priority: 'high' as const,
    timestamp: '2 hours ago',
    actionable: true,
    contacts: ['Sarah C.', 'Marcus R.'],
    context: 'Based on voice memo analysis from your coffee with Sarah (Tuesday) and LinkedIn activity from Marcus'
  },
  {
    id: 'insight-2',
    type: 'pattern' as const,
    title: 'Fintech Network Activation Surge',
    description: 'Your fintech connections show 340% higher engagement this week, particularly around regulatory discussions. Three contacts mentioned "regulatory clarity" - suggests industry inflection point.',
    source: 'LinkedIn Intelligence + Meeting Analysis',
    confidence: 87,
    priority: 'medium' as const,
    timestamp: '4 hours ago',
    actionable: true,
    contacts: ['John K.', 'Lisa P.', 'David M.']
  },
  {
    id: 'insight-3',
    type: 'intelligence' as const,
    title: 'Board Position Timing Opportunity',
    description: 'Jennifer Walsh mentioned "exploring new ventures" in your last meeting. Her LinkedIn activity shows increased engagement with board governance content. Perfect timing for your ask.',
    source: 'Meeting Intelligence + Social Listening',
    confidence: 96,
    priority: 'high' as const,
    timestamp: '6 hours ago',
    actionable: true,
    contacts: ['Jennifer W.']
  },
  {
    id: 'insight-4',
    type: 'trend' as const,
    title: 'Conversation Depth Evolution',
    description: 'Your conversations are averaging 40% deeper strategic topics this month. The shift from operational to visionary discussions indicates maturing relationship portfolio quality.',
    source: 'Conversation Intelligence',
    confidence: 78,
    priority: 'low' as const,
    timestamp: '1 day ago',
    actionable: false
  },
  {
    id: 'insight-5',
    type: 'pattern' as const,
    title: 'Mentorship Request Pattern',
    description: 'Four contacts have mentioned seeking mentorship or advisory roles this quarter. Your experience profile suggests high value-add opportunity for strategic positioning.',
    source: 'Pattern Recognition Across Communications',
    confidence: 82,
    priority: 'medium' as const,
    timestamp: '2 days ago',
    actionable: true,
    contacts: ['Dr. Amit P.', 'Sarah C.', 'Two Others']
  }
];

// High-impact action items that demonstrate strategic thinking
export const dummyActions = [
  {
    id: 'action-1',
    type: 'pog' as const,
    title: 'Facilitate AI Partnership Introduction',
    description: 'Connect Sarah Chen (TechFlow) with Marcus Rodriguez (InnovateAI) - their complementary needs in AI partnerships present a strategic value opportunity',
    contact: {
      name: 'Sarah Chen',
      role: 'VP Product, TechFlow Dynamics'
    },
    priority: 'urgent' as const,
    estimatedTime: 8,
    dueDate: 'Today',
    tags: ['AI/ML', 'Strategic Partnerships', 'High Value'],
    actionable: true,
    context: 'Based on Tuesday coffee conversation + Marcus\'s LinkedIn expansion signals'
  },
  {
    id: 'action-2',
    type: 'follow_up' as const,
    title: 'Jennifer\'s Board Search Strategy Session',
    description: 'Perfect timing to offer strategic support for her board positioning - she\'s actively evaluating opportunities',
    contact: {
      name: 'Jennifer Walsh',
      role: 'Former CEO, InnovateCorp'
    },
    priority: 'high' as const,
    estimatedTime: 15,
    dueDate: 'This week',
    tags: ['Board positions', 'Strategic advisory', 'Executive coaching'],
    actionable: true,
    context: 'LinkedIn activity analysis shows active board governance engagement'
  },
  {
    id: 'action-3',
    type: 'session' as const,
    title: 'Fintech Network Strategic Session',
    description: 'Capitalize on 340% engagement surge in your fintech connections - regulatory clarity discussions suggest major opportunity',
    priority: 'high' as const,
    estimatedTime: 45,
    tags: ['Fintech', 'Regulatory', 'Industry timing'],
    actionable: true,
    context: 'Network activity analysis shows unusual concentration of regulatory discussions'
  },
  {
    id: 'action-4',
    type: 'ask' as const,
    title: 'Request Stanford AI Lab Advisory Introduction',
    description: 'Dr. Patel mentioned interest in commercialization - perfect timing to request strategic introductions',
    contact: {
      name: 'Dr. Amit Patel',
      role: 'Director of AI Research, Stanford'
    },
    priority: 'medium' as const,
    estimatedTime: 12,
    dueDate: 'Next week',
    tags: ['AI research', 'Academia-industry bridge', 'Strategic advisory'],
    actionable: true,
    context: 'Recent conversation about bridging research and commercial applications'
  },
  {
    id: 'action-5',
    type: 'connection' as const,
    title: 'Executive Mentorship Circle Formation',
    description: 'Four contacts seeking mentorship/advisory - opportunity to create strategic value circle',
    priority: 'medium' as const,
    estimatedTime: 30,
    tags: ['Mentorship', 'Strategic positioning', 'Network effects'],
    actionable: true,
    context: 'Pattern analysis across recent conversations shows mentorship theme'
  }
];

// Recent achievements that demonstrate relationship ROI
export const dummyAchievements = [
  {
    id: 'achievement-1',
    type: 'loop_completed' as const,
    title: 'Strategic Partnership Catalyzed',
    description: 'Your introduction between Sarah and Marcus led to a signed partnership agreement worth $2.3M ARR!',
    timestamp: '3 hours ago',
    contact: { name: 'Sarah Chen' },
    celebrationLevel: 'significant' as const,
    value: '$2.3M ARR impact'
  },
  {
    id: 'achievement-2',
    type: 'goal_completed' as const,
    title: 'Q3 Network Expansion Exceeded',
    description: 'Surpassed your strategic connection goal by 150% - 15 meaningful relationships vs. 10 target',
    timestamp: '1 day ago',
    celebrationLevel: 'significant' as const,
    value: '15/10 connections (150%)'
  },
  {
    id: 'achievement-3',
    type: 'reciprocity_milestone' as const,
    title: 'Reciprocity Excellence Achieved',
    description: 'Your giving-to-receiving ratio hit 2.1x - demonstrating exceptional value-first relationship building',
    timestamp: '2 days ago',
    celebrationLevel: 'moderate' as const,
    value: '2.1x ratio'
  },
  {
    id: 'achievement-4',
    type: 'milestone_reached' as const,
    title: 'Industry Influence Recognition',
    description: 'Three executives cited your strategic insights in their board presentations this quarter',
    timestamp: '1 week ago',
    celebrationLevel: 'moderate' as const,
    value: '3 citations'
  },
  {
    id: 'achievement-5',
    type: 'network_growth' as const,
    title: 'Executive Network Density Optimized',
    description: 'Successfully deepened relationships with 8 C-level executives, creating strategic influence cluster',
    timestamp: '2 weeks ago',
    celebrationLevel: 'subtle' as const,
    value: '8 C-level connections'
  }
];

// Progress metrics that show momentum and strategic advancement
export const dummyProgressMetrics = [
  {
    id: 'progress-1',
    title: 'Strategic Relationships Deepened',
    description: 'High-value connections advancement',
    current: 12,
    target: 15,
    percentage: 80,
    icon: 'connection',
    trend: {
      direction: 'up' as const,
      value: '+4',
      period: 'this month'
    }
  },
  {
    id: 'progress-2',
    title: 'Value Creation Momentum',
    description: 'POGs delivered vs. received balance',
    current: 18,
    target: 20,
    percentage: 90,
    icon: 'pog',
    trend: {
      direction: 'up' as const,
      value: '+3',
      period: 'this quarter'
    }
  },
  {
    id: 'progress-3',
    title: 'Strategic Loop Completion',
    description: 'Active relationship exchanges closed',
    current: 11,
    target: 12,
    percentage: 92,
    icon: 'loop',
    trend: {
      direction: 'up' as const,
      value: '+2',
      period: 'this week'
    }
  },
  {
    id: 'progress-4',
    title: 'Network Intelligence Score',
    description: 'AI-powered relationship insights utilization',
    current: 94,
    target: 100,
    percentage: 94,
    icon: 'intelligence',
    trend: {
      direction: 'up' as const,
      value: '+8',
      period: 'this month'
    }
  }
];

// Portfolio metrics that demonstrate sophisticated relationship intelligence
export const dummyPortfolioMetrics = {
  activeRelationships: {
    value: 23,
    subtitle: 'Strategic connections',
    progress: 78,
    trend: { direction: 'up' as const, value: '+4', period: 'this month' },
    insight: 'Your network is expanding with quality connections in key growth sectors'
  },
  reciprocityBalance: {
    value: '2.1x',
    subtitle: 'Giving vs. receiving',
    progress: 85,
    trend: { direction: 'up' as const, value: '+0.3x', period: 'this quarter' },
    insight: 'Exceptional giving ratio demonstrates your value-first approach to relationship building'
  },
  connectionMomentum: {
    value: 94,
    subtitle: 'Engagement score',
    progress: 94,
    trend: { direction: 'up' as const, value: '+12', period: 'this week' },
    insight: 'Outstanding activity level across your relationship portfolio - momentum is accelerating'
  },
  strategicWins: {
    value: 8,
    subtitle: 'Goals achieved',
    progress: 89,
    trend: { direction: 'up' as const, value: '+3', period: 'this quarter' },
    insight: 'Remarkable progress on relationship-driven objectives - your strategic approach is paying dividends'
  }
};