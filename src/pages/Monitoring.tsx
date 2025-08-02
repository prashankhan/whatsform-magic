import React from 'react';
import { ErrorMonitoringDashboard } from '@/components/ErrorMonitoringDashboard';
import NavBar from '@/components/NavBar'; // Force refresh

export default function Monitoring() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        <ErrorMonitoringDashboard />
      </main>
    </div>
  );
}