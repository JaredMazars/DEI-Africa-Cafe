import React from 'react';

const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#1A1F5E] border-t-[#E83E2D] rounded-full animate-spin" />
      <p className="text-[#8C8C8C] text-sm font-medium">Loading…</p>
    </div>
  </div>
);

export default PageSkeleton;
