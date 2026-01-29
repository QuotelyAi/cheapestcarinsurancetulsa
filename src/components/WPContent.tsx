'use client';

import { useSyncExternalStore } from 'react';

interface WPContentProps {
  html: string;
  className?: string;
}

// Use useSyncExternalStore for hydration-safe client detection
const emptySubscribe = () => () => {};
const getServerSnapshot = () => false;
const getClientSnapshot = () => true;

export default function WPContent({ html, className = '' }: WPContentProps) {
  const isClient = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  return (
    <div
      className={className}
      suppressHydrationWarning={!isClient}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
