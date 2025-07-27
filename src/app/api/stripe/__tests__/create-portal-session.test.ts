import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../create-portal-session/route';

// Mock Stripe
const mockStripeBillingPortalSessionCreate = vi.fn();
vi.mock('@/lib/stripe-server', () => ({
  getServerStripe: () => ({
    billingPortal: {
      sessions: {
        create: mockStripeBillingPortalSessionCreate
      }
    }
  })
}));

// Mock Supabase
const mockSupabaseAuth = {
  getUser: vi.fn()
};
const mockSupabaseFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: mockSupabaseAuth,
    from: mockSupabaseFrom
  })
}));

describe('POST /api/stripe/create-portal-session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockStripeBillingPortalSessionCreate.mockResolvedValue({
      id: 'portal_session_test_id',
      url: 'https://billing.stripe.com/test-portal-url'
    });
    
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: { id: 'test_user_id', email: 'test@example.com' } },
      error: null
    });
    
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              stripe_customer_id: 'cus_test_customer_id',
              status: 'active'
            },
            error: null
          })
        }))
      }))
    });
  });

  it('should create portal session for authenticated user with subscription', async () => {
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ url: 'https://billing.stripe.com/test-portal-url' });
    
    expect(mockStripeBillingPortalSessionCreate).toHaveBeenCalledWith({
      customer: 'cus_test_customer_id',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    });
  });

  it('should return 401 for unauthenticated user', async () => {
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Authentication required' });
    expect(mockStripeBillingPortalSessionCreate).not.toHaveBeenCalled();
  });

  it('should return 404 for user without subscription', async () => {
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        }))
      }))
    });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'No active subscription found' });
    expect(mockStripeBillingPortalSessionCreate).not.toHaveBeenCalled();
  });

  it('should return 404 for subscription without Stripe customer ID', async () => {
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              stripe_customer_id: null,
              status: 'active'
            },
            error: null
          })
        }))
      }))
    });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'No active subscription found' });
    expect(mockStripeBillingPortalSessionCreate).not.toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
          })
        }))
      }))
    });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch subscription information' });
    expect(mockStripeBillingPortalSessionCreate).not.toHaveBeenCalled();
  });

  it('should handle Stripe API errors gracefully', async () => {
    mockStripeBillingPortalSessionCreate.mockRejectedValue(
      new Error('Stripe API temporarily unavailable')
    );

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to create billing portal session' });
  });

  it('should verify correct subscription query for authenticated user', async () => {
    await POST();

    expect(mockSupabaseAuth.getUser).toHaveBeenCalled();
    expect(mockSupabaseFrom).toHaveBeenCalledWith('subscriptions');
    
    // Verify the query structure
    const fromReturn = mockSupabaseFrom.mock.results[0].value;
    expect(fromReturn.select).toHaveBeenCalledWith('stripe_customer_id, status');
  });
});