import React, { useState } from 'react';
import BottomNav from './components/Navigation/BottomNav';
import DashboardView from './components/Dashboard/DashboardView';
import HabitsView from './components/Habits/HabitsView';
import NotesView from './components/Notes/NotesView';
import VaultView from './components/Vault/VaultView';
import PlannerView from './components/Planner/PlannerView';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState('today');

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-title)] flex flex-col font-sans select-none">
      {/* iPhone 13 Safe Area Inset Top Spacer */}
      <div className="pt-safe bg-[var(--bg-main)]" />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-2">
        {(activeTab === 'today' || activeTab === 'dashboard') && (
          <DashboardView onNavigate={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === 'habits' && <HabitsView />}
        {activeTab === 'notes' && <NotesView />}
        {activeTab === 'vault' && <VaultView />}
        {activeTab === 'planner' && <PlannerView />}
      </main>

      {/* iPhone 13 Safe Area Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
