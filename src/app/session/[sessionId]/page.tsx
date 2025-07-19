'use client';

import { useRouter } from 'next/navigation';
import { use } from 'react';
import { RelationshipSessionInterface } from '@/components/features/relationship-sessions';

interface SessionPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function SessionPage({ params }: SessionPageProps): React.JSX.Element {
  const router = useRouter();
  const { sessionId } = use(params);

  const handleCloseSession = () => {
    router.push('/dashboard');
  };

  return (
    <RelationshipSessionInterface
      sessionId={sessionId}
      onClose={handleCloseSession}
    />
  );
} 