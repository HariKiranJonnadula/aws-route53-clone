'use client';

import { ComingSoonPage } from '@/components/ui/ComingSoonPage';
import { Activity } from 'lucide-react';

export default function HealthChecksPage() {
  return (
    <ComingSoonPage
      title="Health checks"
      description="Monitor the health and performance of your applications and endpoints."
      icon={Activity}
    />
  );
}
