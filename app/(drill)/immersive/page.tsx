import React from 'react';
import { isFeatureEnabled } from '@/frontend/lib/featureFlags';
import ImmersiveClient from '@/components/immersive/ImmersiveClient';

export default async function ImmersivePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const enabled = isFeatureEnabled('immersive_snake', { searchParams: sp });

  if (!enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white border rounded-lg p-6 text-center">
          <h1 className="text-2xl font-semibold mb-3">Immersive Snake Mode</h1>
          <p className="text-gray-600 mb-4">此功能目前在實驗階段，尚未對所有使用者開放。</p>
          <p className="text-sm text-gray-500 mb-6">要試用，請加上網址參數 <code>?immersive_snake=1</code> 或設定環境變數 <code>NEXT_PUBLIC_FEATURE_IMMERSIVE_SNAKE=1</code>。</p>
          <a href="/" className="inline-block px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">返回首頁</a>
        </div>
      </div>
    );
  }

  return <ImmersiveClient />;
}
