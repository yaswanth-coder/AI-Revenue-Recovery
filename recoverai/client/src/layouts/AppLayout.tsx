import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { DemoBanner } from '../components/DemoBanner';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      {/* Top Demo Banner */}
      <DemoBanner />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isCollapsed ? 'ml-16' : 'ml-0 lg:ml-64'
          }`}
        >
          <TopBar onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />

          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
