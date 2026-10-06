'use client';

import { ComingSoonPage } from '@/components/ui/ComingSoonPage';
import { Layers } from 'lucide-react';

export default function ResolverPage() {
  return (
    <ComingSoonPage
      title="Resolver"
      description="Route DNS queries between your VPCs and your on-premises network."
      icon={Layers}
    />
  );
}
