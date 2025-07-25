'use client';

import { useState, useEffect } from 'react';
import { useFeatureFlag } from './useFeatureFlag';
import { useSearchParams } from 'next/navigation';

export function useTestBanner() {
  const { enabled: flagEnabled } = useFeatureFlag('banner');
  const searchParams = useSearchParams();
  const bannerQueryParam = searchParams?.get('banner') === '1';
  
  // Track if user has manually dismissed the banner this session
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Show banner if either condition is met AND user hasn't dismissed it
  const shouldShowBanner = (flagEnabled || bannerQueryParam) && !isDismissed;
  
  const dismissBanner = () => {
    setIsDismissed(true);
  };
  
  // Reset dismissal state when flag or query param changes
  useEffect(() => {
    setIsDismissed(false);
  }, [flagEnabled, bannerQueryParam]);
  
  return {
    shouldShowBanner,
    dismissBanner,
    isEnabledByFlag: flagEnabled,
    isEnabledByQuery: bannerQueryParam
  };
}