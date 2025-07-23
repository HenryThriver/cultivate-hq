import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../webhook/route';

// Mock dependencies
vi.mock('@/lib/stripe-server', () => ({
  stripeServer: {
    webhooks: {
      constructEvent: vi.fn(),
    },
    checkout: {
      sessions: {
        retrieve: vi.fn(),
      },
    },
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
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
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(process.env, mockEnv);
  });

  it('should return 400 when webhook secret is not configured', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({ type: 'checkout.session.completed' }),
      headers: {
        'stripe-signature': 'test-signature',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Webhook secret not configured');
  });

  it('should return 400 when stripe signature is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({ type: 'checkout.session.completed' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No signature provided');
  });

  it('should return 400 when webhook signature verification fails', async () => {
    const { stripeServer } = await import('@/lib/stripe-server');
    vi.mocked(stripeServer.webhooks.constructEvent).mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({ type: 'checkout.session.completed' }),
      headers: {
        'stripe-signature': 'invalid-signature',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid signature');
  });

  it('should process checkout.session.completed event successfully', async () => {
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test123',
          customer: 'cus_test123',
          customer_email: 'test@example.com',
          customer_details: {
            name: 'Test User',
          },
          subscription: 'sub_test123',
          metadata: {
            userId: 'user_test123',
          },
        },
      },
    };

    const { stripeServer } = await import('@/lib/stripe-server');
    vi.mocked(stripeServer.webhooks.constructEvent).mockReturnValue(mockEvent);
    vi.mocked(stripeServer.checkout.sessions.retrieve).mockResolvedValue(mockEvent.data.object);

    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabase = {
      from: vi.fn(() => ({
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
      })),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

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

  it('should return 400 when session metadata is missing userId', async () => {
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test123',
          customer: 'cus_test123',
          customer_email: 'test@example.com',
          subscription: 'sub_test123',
          metadata: {}, // Missing userId
        },
      },
    };

    const { stripeServer } = await import('@/lib/stripe-server');
    vi.mocked(stripeServer.webhooks.constructEvent).mockReturnValue(mockEvent);
    vi.mocked(stripeServer.checkout.sessions.retrieve).mockResolvedValue(mockEvent.data.object);

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
    expect(data.error).toBe('Invalid session metadata');
  });

  it('should ignore unhandled event types', async () => {
    const mockEvent = {
      type: 'invoice.payment_succeeded', // Unhandled event type
      data: {
        object: {},
      },
    };

    const { stripeServer } = await import('@/lib/stripe-server');
    vi.mocked(stripeServer.webhooks.constructEvent).mockReturnValue(mockEvent);

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