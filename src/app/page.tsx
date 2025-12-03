'use client';

import dynamic from 'next/dynamic';

const CallCenter = dynamic(() => import('../components/CallCenter'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-8 bg-gray-200 rounded-full animate-pulse"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  )
});

export default function Home() {
  return <CallCenter />;
}
