"use client";
import React from "react";

interface GameShellProps { children: React.ReactNode[] | React.ReactNode; }

export default function GameShell({ children }: GameShellProps) {
  const [top, bottom] = React.Children.toArray(children);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#0a0f1a',
      color: 'white',
      overflow: 'hidden'
    }}>
      {/* Header - 固定在頂部 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '24px',
        borderBottom: '1px solid #1f2937',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          {top}
        </div>
      </div>
      
      {/* Game Canvas - 絕對置中 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1
      }}>
        {bottom}
      </div>
    </div>
  );
}
