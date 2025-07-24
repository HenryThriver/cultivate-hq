import { vi } from 'vitest';

interface OnboardingStateData {
  id: string;
  user_id: string;
  current_screen: number;
  completed_screens: number[];
  state?: Record<string, any>;
  is_complete?: boolean;
  completion_rate?: number;
  started_at?: string;
  completed_at?: string | null;
  last_activity_at?: string;
  challenge_voice_memo_id?: string | null;
  goal_voice_memo_id?: string | null;
  profile_enhancement_voice_memo_id?: string | null;
  goal_contact_urls?: string[];
  imported_goal_contacts?: any | null;
  linkedin_contacts_added?: number | null;
  linkedin_connected?: boolean;
  gmail_connected?: boolean;
  calendar_connected?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const createSupabaseMock = (initialData?: Partial<OnboardingStateData>) => {
  const defaultData: OnboardingStateData = {
    id: 'test-state-id',
    user_id: 'test-user-id',
    current_screen: 1,
    completed_screens: [],
    state: {},
    is_complete: false,
    completion_rate: 0,
    started_at: new Date().toISOString(),
    completed_at: null,
    last_activity_at: new Date().toISOString(),
    challenge_voice_memo_id: null,
    goal_voice_memo_id: null,
    profile_enhancement_voice_memo_id: null,
    goal_contact_urls: [],
    imported_goal_contacts: null,
    linkedin_contacts_added: null,
    linkedin_connected: false,
    gmail_connected: false,
    calendar_connected: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...initialData
  };

  let currentData = { ...defaultData };

  const createChainableMethods = (data: OnboardingStateData) => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data,
            error: null 
          }))
        }))
      }))
    })),
    select: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ 
        data,
        error: null 
      }))
    })),
    single: vi.fn(() => Promise.resolve({ 
      data,
      error: null 
    }))
  });

  return {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { 
          user: { 
            id: 'test-user-id',
            email: 'test@example.com'
          } 
        }, 
        error: null 
      }))
    },
    from: vi.fn((table: string) => {
      if (table === 'onboarding_state') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ 
                data: currentData, 
                error: null 
              }))
            }))
          })),
          insert: vi.fn((data: any) => {
            currentData = { ...currentData, ...data };
            return createChainableMethods(currentData);
          }),
          update: vi.fn((updates: any) => {
            currentData = { ...currentData, ...updates };
            return createChainableMethods(currentData);
          }),
          upsert: vi.fn((data: any) => {
            currentData = { ...currentData, ...data };
            return {
              eq: vi.fn(() => Promise.resolve({ 
                data: currentData, 
                error: null 
              }))
            };
          }),
          delete: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
            })),
            in: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        };
      }
      if (table === 'artifacts') {
        return {
          delete: vi.fn(() => ({
            in: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        };
      }
      return {};
    })
  };
};