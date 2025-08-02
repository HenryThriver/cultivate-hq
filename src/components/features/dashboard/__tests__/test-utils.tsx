import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { vi } from 'vitest';

// Create theme with dashboard-specific colors
const testTheme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#F44336',
    },
    warning: {
      main: '#FF9800',
    },
    info: {
      main: '#2196F3',
    },
  },
});

// Mock hooks data
export const mockPortfolioKPIs = {
  data: {
    relationshipMomentum: {
      actionsCompleted: 15,
      currentStreak: 5,
      weeklyTrend: [7.2, 7.5, 7.8, 8.0, 8.2, 8.5],
    },
    portfolioActivation: {
      responseRate: 75,
      connectedContacts: 42,
      reachedOutTo: 18,
      weeklyTrend: [65, 68, 70, 72, 74, 75],
    },
    relationshipDepth: {
      qualityIndex: 7.8,
      strategicContacts: 24,
      weeklyTrend: [7.0, 7.2, 7.3, 7.5, 7.6, 7.8],
    },
    strategicWins: {
      asksCompleted: 15,
      milestonesAchieved: 5,
      goalProgress: 65,
      weeklyTrend: [12, 13, 14, 14, 15, 16],
    },
    sustainableGrowth: {
      reciprocityRatio: 1.8,
      loopsPerContact: 3.2,
      strongRelationships: 18,
      weeklyTrend: [1.5, 1.6, 1.7, 1.7, 1.8, 1.8],
    },
  },
  isLoading: false,
  error: null,
};

export const mockRecentAchievements = {
  data: [
    {
      id: 'goal-1',
      type: 'goal_completed' as const,
      title: 'Goal Achieved!',
      description: 'Secure VP Product role at tech startup',
      timestamp: '2 days ago',
      value: '100%',
      celebrationLevel: 'significant' as const,
    },
    {
      id: 'action-1',
      type: 'network_growth' as const,
      title: 'Strategic Introduction Made',
      description: 'Connected Sarah with potential investor',
      timestamp: '1 week ago',
      contact: { id: 'contact-1', name: 'Sarah Chen' },
      celebrationLevel: 'moderate' as const,
    },
    {
      id: 'loop-1',
      type: 'loop_completed' as const,
      title: 'Loop Successfully Completed',
      description: 'POG delivered with excellent results',
      timestamp: '3 days ago',
      value: '4.8★',
      contact: { id: 'contact-2', name: 'Michael Rodriguez' },
      celebrationLevel: 'moderate' as const,
    },
  ],
  isLoading: false,
  error: null,
};

export const mockPendingActions = {
  data: [
    {
      id: 'action-1',
      contact_id: 'contact-1',
      title: 'Review pitch deck',
      description: 'Review and provide feedback on Series A pitch deck',
      action_type: 'deliver_pog',
      priority: 'urgent' as const,
      status: 'pending' as const,
      scheduled_for: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      contact: {
        id: 'contact-1',
        name: 'Sarah Chen',
        company: 'TechStartup Inc',
        title: 'CEO',
      },
    },
    {
      id: 'action-2',
      contact_id: 'contact-2',
      title: 'Send introduction',
      description: 'Introduce to potential CTO candidate',
      action_type: 'make_introduction',
      priority: 'high' as const,
      status: 'pending' as const,
      scheduled_for: new Date(Date.now() + 172800000).toISOString(), // 2 days
      contact: {
        id: 'contact-2',
        name: 'Michael Rodriguez',
        company: 'Growth Ventures',
        title: 'Partner',
      },
    },
  ],
  isLoading: false,
  error: null,
};

export const mockRecentSessions = {
  data: [
    {
      id: 'session-1',
      contact_id: 'contact-1',
      session_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      interaction_type: 'meeting',
      confidence_score: 0.85,
      summary: 'Discussed Series A fundraising strategy and timeline',
      contact: {
        id: 'contact-1',
        name: 'Sarah Chen',
        company: 'TechStartup Inc',
        title: 'CEO',
      },
      action_items: [
        {
          id: 'item-1',
          title: 'Review pitch deck',
          status: 'pending',
        },
      ],
    },
  ],
  isLoading: false,
  error: null,
};

// Mock auth context
export const mockAuthContext = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
    },
  },
  session: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  loading: false,
};

// Mock user profile
export const mockUserProfile = {
  profile: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    company: 'Test Company',
    title: 'Senior Product Manager',
    primary_goal: 'Land VP Product role',
    goal_description: 'Target Series B/C startups',
    relationship_score: 8.5,
    profile_completion_score: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  isLoading: false,
  isError: false,
  error: null,
};

// Create wrapper with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={testTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      Line Chart
    </div>
  ),
  Doughnut: ({ data, options }: any) => (
    <div data-testid="doughnut-chart" data-chart-data={JSON.stringify(data)}>
      Doughnut Chart
    </div>
  ),
}));

// Mock hooks
vi.mock('@/lib/hooks/usePortfolioKPIs', () => ({
  usePortfolioKPIs: () => mockPortfolioKPIs,
}));

vi.mock('@/lib/hooks/useRecentAchievements', () => ({
  useRecentAchievements: () => mockRecentAchievements,
}));

vi.mock('@/lib/hooks/useRelationshipSessions', () => ({
  usePendingActions: () => mockPendingActions,
  useRecentSessions: () => mockRecentSessions,
}));

vi.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

vi.mock('@/lib/hooks/useUserProfile', () => ({
  useUserProfile: () => mockUserProfile,
}));

export * from '@testing-library/react';
export { customRender as render };