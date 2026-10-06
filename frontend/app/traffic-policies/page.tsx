'use client';

import { ComingSoonPage } from '@/components/ui/ComingSoonPage';
import { GitFork } from 'lucide-react';

export default function TrafficPoliciesPage() {
  return (
    <ComingSoonPage
      title="Traffic policies"
      description="Create visual DNS traffic flow routing configurations across multiple endpoints."
      icon={GitFork}
    />
  );
}
