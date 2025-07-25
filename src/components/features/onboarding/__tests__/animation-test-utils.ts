import { vi } from 'vitest';

/**
 * Utility to setup animation mocks for onboarding component tests.
 * This helps tests run quickly and reliably by bypassing animation timings.
 */
export const setupAnimationMocks = () => {
  // Mock timers
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper to advance through all animation sequences
  const advanceAnimations = async () => {
    // Run all timers to completion
    vi.runAllTimers();
  };

  // Helper to advance animations and wait for React updates
  const advanceAnimationsAndWait = async () => {
    vi.runAllTimers();
    // Give React time to process state updates
    await new Promise(resolve => setImmediate(resolve));
  };

  return {
    advanceAnimations,
    advanceAnimationsAndWait,
  };
};

/**
 * Mock animation sequence functions to resolve immediately
 */
export const mockAnimationSequence = () => {
  vi.mock('../0_Welcome_Components/utils/animationSequence', () => ({
    sleep: vi.fn(() => Promise.resolve()),
    animateIn: vi.fn(() => Promise.resolve()),
    staggeredAnimation: vi.fn(() => Promise.resolve()),
  }));
};

/**
 * Mock animation components that use Canvas or complex animations
 * Note: This should be called at the module level, not inside describe blocks
 */
export const mockAnimationComponents = () => {
  vi.mock('../0_Welcome_Components/NetworkFormationBackground', () => ({
    NetworkFormationBackground: () => 'div',
  }));

  vi.mock('../0_Welcome_Components/TypewriterText', () => ({
    TypewriterText: ({ text }: { text: string }) => text,
  }));

  vi.mock('../0_Welcome_Components/PreviewCardsContainer', () => ({
    PreviewCardsContainer: () => 'div',
  }));
};