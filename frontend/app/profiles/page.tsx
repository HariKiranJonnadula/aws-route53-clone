'use client';

import { ComingSoonPage } from '@/components/ui/ComingSoonPage';
import { ShieldCheck } from 'lucide-react';

export default function ProfilesPage() {
  return (
    <ComingSoonPage
      title="Profiles"
      description="Manage DNS configurations and rules across multiple VPCs and AWS accounts."
      icon={ShieldCheck}
    />
  );
}
