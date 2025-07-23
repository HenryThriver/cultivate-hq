import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../webhook/route';

// Mock dependencies
vi.mock('@/lib/stripe-server', () => ({
  getServerStripe: vi.fn(() => ({
    webhooks: {
      constructEvent: vi.fn(),
    },
  })),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    randomUUID: vi.fn(() => 'test-uuid-123'),
  };
});

const mockEnv = {
  STRIPE_WEBHOOK_SECRET: 'whsec_test123',
};

describe('/api/stripe/webhook', () => {
  let mockSupabaseClient: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    Object.assign(process.env, mockEnv);
    
    // Setup default Supabase mock
    mockSupabaseClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
            neq: vi.fn(() => ({
              single: vi.fn(),
            })),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
    };
    
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient);
  });

  describe('Security & Validation', () => {
    it('should return 400 when webhook signature verification fails', async () => {
      const { getServerStripe } = await import('@/lib/stripe-server');
      const mockStripe = {
        webhooks: {
          constructEvent: vi.fn().mockImplementation(() => {
            throw new Error('Invalid signature');
          }),
        },
      };
      vi.mocked(getServerStripe).mockReturnValue(mockStripe as any);

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: 'test-body',
        headers: {
          'stripe-signature': 'invalid-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid signature');
    });

    it('should validate required session data for checkout.session.completed', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test123',
            customer: 'cus_test123',
            // Missing customer_email and subscription
          },
        },
      };

      const { getServerStripe } = await import('@/lib/stripe-server');
      const mockStripe = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockEvent),
        },
      };
      vi.mocked(getServerStripe).mockReturnValue(mockStripe as any);

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'valid-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid session data');
    });
  });

  describe('Payment-Before-Auth Workflow', () => {
    it('should create new user when no existing user found (unauthenticated checkout)', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test123',
            customer: 'cus_test123',
            customer_email: 'new-user@example.com',
            customer_details: {
              name: 'New User',
            },
            subscription: 'sub_test123',
            metadata: {
              priceType: 'monthly',
            },
          },
        },
      };

      const { getServerStripe } = await import('@/lib/stripe-server');
      const mockStripe = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockEvent),
        },
      };
      vi.mocked(getServerStripe).mockReturnValue(mockStripe as any);

      // Mock no existing user found
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ 
              data: { id: 'test-uuid-123' }, 
              error: null 
            }),
          })),
        })),
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'valid-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      // Verify user creation was attempted
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    });

    it('should use existing user when found by email', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test123',
            customer: 'cus_test123',
            customer_email: 'existing-user@example.com',
            subscription: 'sub_test123',
            metadata: {
              priceType: 'yearly',
            },
          },
        },
      };

      const { getServerStripe } = await import('@/lib/stripe-server');
      const mockStripe = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockEvent),
        },
      };
      vi.mocked(getServerStripe).mockReturnValue(mockStripe as any);

      // Mock existing user found
      const mockUsersQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ 
              data: { id: 'existing-user-123' }, 
              error: null 
            }),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      };
      
      const mockSubscriptionsQuery = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'users') return mockUsersQuery;
        if (table === 'subscriptions') return mockSubscriptionsQuery;
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'valid-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      // Verify subscription creation was attempted with existing user ID
      expect(mockSubscriptionsQuery.insert).toHaveBeenCalledWith({
        user_id: 'existing-user-123',
        stripe_subscription_id: 'sub_test123',
        stripe_customer_id: 'cus_test123',
        status: 'active',
        plan_type: 'yearly',
      });
    });

    it('should handle authenticated checkout with userId in metadata', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test123',
            customer: 'cus_test123',
            customer_email: 'authenticated-user@example.com',
            subscription: 'sub_test123',
            metadata: {
              userId: 'auth-user-456',
              priceType: 'monthly',
            },
          },
        },
      };

      const { getServerStripe } = await import('@/lib/stripe-server');
      const mockStripe = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockEvent),
        },
      };
      vi.mocked(getServerStripe).mockReturnValue(mockStripe as any);

      const mockSubscriptionsQuery = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'subscriptions') return mockSubscriptionsQuery;
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'valid-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      // Should skip user lookup/creation and go straight to subscription creation
      expect(mockSubscriptionsQuery.insert).toHaveBeenCalledWith({
        user_id: 'auth-user-456',
        stripe_subscription_id: 'sub_test123',
        stripe_customer_id: 'cus_test123',
        status: 'active',
        plan_type: 'monthly',
      });
    });
  });

  describe('Subscription Lifecycle Events', () => {
    it('should handle customer.subscription.updated', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            status: 'past_due',
          },
        },
      };

      const { getServerStripe } = await import('@/lib/stripe-server');
      const mockStripe = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockEvent),
        },
      };
      vi.mocked(getServerStripe).mockReturnValue(mockStripe as any);

      const mockSubscriptionsQuery = {
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'subscriptions') return mockSubscriptionsQuery;
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'valid-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      expect(mockSubscriptionsQuery.update).toHaveBeenCalledWith({
        status: 'past_due',
        updated_at: expect.any(String),
      });
    });

    it('should handle customer.subscription.deleted', async () => {
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test123',
          },
        },
      };

      const { getServerStripe } = await import('@/lib/stripe-server');
      const mockStripe = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockEvent),
        },
      };
      vi.mocked(getServerStripe).mockReturnValue(mockStripe as any);

      const mockSubscriptionsQuery = {
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'subscriptions') return mockSubscriptionsQuery;
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'valid-signature',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSubscriptionsQuery.update).toHaveBeenCalledWith({
        status: 'canceled',
        updated_at: expect.any(String),
      });
    });

    it('should handle invoice.payment_succeeded', async () => {
      const mockEvent = {
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            subscription: 'sub_test123',
          },
        },
      };

      const { getServerStripe } = await import('@/lib/stripe-server');
      const mockStripe = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockEvent),
        },
      };
      vi.mocked(getServerStripe).mockReturnValue(mockStripe as any);

      const mockSubscriptionsQuery = {
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'subscriptions') return mockSubscriptionsQuery;
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'valid-signature',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSubscriptionsQuery.update).toHaveBeenCalledWith({
        last_payment_date: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it('should handle invoice.payment_failed', async () => {
      const mockEvent = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            subscription: 'sub_test123',
          },
        },
      };

      const { getServerStripe } = await import('@/lib/stripe-server');
      const mockStripe = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockEvent),
        },
      };
      vi.mocked(getServerStripe).mockReturnValue(mockStripe as any);

      const mockSubscriptionsQuery = {
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'subscriptions') return mockSubscriptionsQuery;
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'valid-signature',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSubscriptionsQuery.update).toHaveBeenCalledWith({
        status: 'past_due',
        updated_at: expect.any(String),
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test123',
            customer: 'cus_test123',
            customer_email: 'test@example.com',
            subscription: 'sub_test123',
            metadata: {
              userId: 'user_test123',
            },
          },
        },
      };

      const { getServerStripe } = await import('@/lib/stripe-server');
      const mockStripe = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockEvent),
        },
      };
      vi.mocked(getServerStripe).mockReturnValue(mockStripe as any);

      // Simulate database error
      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockResolvedValue({ 
          error: new Error('Database connection failed') 
        }),
      }));

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'valid-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create subscription');
    });

    it('should handle unhandled event types gracefully', async () => {
      const mockEvent = {
        type: 'customer.created', // Unhandled event type
        data: {
          object: {},
        },
      };

      const { getServerStripe } = await import('@/lib/stripe-server');
      const mockStripe = {
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockEvent),
        },
      };
      vi.mocked(getServerStripe).mockReturnValue(mockStripe as any);

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'valid-signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });
});