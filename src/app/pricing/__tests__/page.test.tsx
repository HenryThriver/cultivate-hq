import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PricingPage from '../page';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/lib/contexts/AuthContext';

// Mock dependencies
vi.mock('@/hooks/useStripeCheckout');
vi.mock('@/lib/contexts/AuthContext');
vi.mock('@/components/layout/MarketingLayout', () => ({
  MarketingLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Create a basic theme
const theme = createTheme();

// Wrapper component for theme
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe.skip('Pricing Page', () => {
  const mockCreateCheckoutSession = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn()
    });
    
    vi.mocked(useStripeCheckout).mockReturnValue({
      createCheckoutSession: mockCreateCheckoutSession,
      loading: false,
      error: null
    });
  });

  it('should display all three pricing tiers correctly', () => {
    render(<PricingPage />, { wrapper: ThemeWrapper });

    // Check for tier names
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Annual')).toBeInTheDocument();
    expect(screen.getByText('Supporter')).toBeInTheDocument();

    // Check for prices
    expect(screen.getByText('$30')).toBeInTheDocument();
    expect(screen.getByText('$300')).toBeInTheDocument();
    expect(screen.getByText('$3000')).toBeInTheDocument();

    // Check for periods
    expect(screen.getByText('/month')).toBeInTheDocument();
    expect(screen.getByText('/year')).toBeInTheDocument();
    expect(screen.getByText('/5 years')).toBeInTheDocument();
  });

  it('should highlight annual tier as most popular', () => {
    render(<PricingPage />, { wrapper: ThemeWrapper });

    // Check for "Most Popular" badge
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
    
    // The annual tier card should have special styling (larger scale)
    const annualCard = screen.getByText('Annual').closest('[class*="MuiCard"]');
    expect(annualCard).toBeInTheDocument();
  });

  it('should handle checkout flow for monthly tier', async () => {
    render(<PricingPage />, { wrapper: ThemeWrapper });

    const monthlyButton = screen.getByText('Begin transformation');
    fireEvent.click(monthlyButton);

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith('monthly');
    });
  });

  it('should handle checkout flow for annual tier', async () => {
    render(<PricingPage />, { wrapper: ThemeWrapper });

    const annualButton = screen.getByText('Unlock strategic advantage');
    fireEvent.click(annualButton);

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith('annual');
    });
  });

  it('should handle checkout flow for supporter tier', async () => {
    render(<PricingPage />, { wrapper: ThemeWrapper });

    const supporterButton = screen.getByText('Join elite partnership');
    fireEvent.click(supporterButton);

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith('supporter');
    });
  });

  it('should handle checkout flow errors with user-friendly messages', async () => {
    vi.mocked(useStripeCheckout).mockReturnValue({
      createCheckoutSession: mockCreateCheckoutSession,
      loading: false,
      error: 'Payment processing failed. Please try again.'
    });

    render(<PricingPage />, { wrapper: ThemeWrapper });

    // Error alert should be displayed
    expect(screen.getByText('Payment processing failed. Please try again.')).toBeInTheDocument();
  });

  it('should disable buttons and show loading state during checkout', () => {
    vi.mocked(useStripeCheckout).mockReturnValue({
      createCheckoutSession: mockCreateCheckoutSession,
      loading: true,
      error: null
    });

    render(<PricingPage />, { wrapper: ThemeWrapper });

    // All buttons should be disabled and show "Processing..."
    const buttons = screen.getAllByText('Processing...');
    expect(buttons).toHaveLength(4); // 3 tier buttons + 1 CTA button
    
    buttons.forEach(button => {
      expect(button.closest('button')).toBeDisabled();
    });
  });

  it('should display loading spinner while auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn()
    });

    render(<PricingPage />, { wrapper: ThemeWrapper });

    expect(screen.getByText('Loading Cultivate HQ...')).toBeInTheDocument();
  });

  it('should display feature lists for each tier', () => {
    render(<PricingPage />, { wrapper: ThemeWrapper });

    // Check for some key features from monthly tier
    expect(screen.getByText('AI-powered contact intelligence')).toBeInTheDocument();
    expect(screen.getByText('Smart follow-up automation')).toBeInTheDocument();

    // Check for annual tier features
    expect(screen.getByText('Priority AI processing')).toBeInTheDocument();
    expect(screen.getByText('Premium support')).toBeInTheDocument();

    // Check for supporter tier features
    expect(screen.getByText('Direct access to creator')).toBeInTheDocument();
    expect(screen.getByText('VIP concierge support')).toBeInTheDocument();
  });

  it('should handle CTA button click for annual tier', async () => {
    render(<PricingPage />, { wrapper: ThemeWrapper });

    // Scroll to the bottom CTA
    const ctaButton = screen.getByText('Begin strategic transformation');
    fireEvent.click(ctaButton);

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith('annual');
    });
  });
});