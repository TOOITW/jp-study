"use client";

import React from 'react';

interface GameShellProps {
  children: React.ReactNode[] | React.ReactNode;
}

/**
 * 30/70 split layout for Immersive Mode (top language, bottom game).
 */
export default function GameShell({ children }: GameShellProps) {
  // Normalize children using React.Children.toArray to avoid SSR/CSR divergence
  const arr = React.Children.toArray(children);
  const top = arr[0] ?? null;
  const bottom = arr[1] ?? null;
  return (
    <div data-testid="immersive-shell" className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="flex-1 basis-2/10 p-4 border-b border-gray-800">
        <div className="max-w-5xl mx-auto h-full">{top}</div>
      </div>
      <div className="flex-[0_0_80%] grow p-0">
        <div className="w-full h-full flex items-center justify-center">{bottom}</div>
      </div>
    </div>
  );
}
