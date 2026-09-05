import React from 'react';
import { LayoutDashboard, CheckSquare, FileText, ShieldCheck, Calendar } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'today', label: 'Today', icon: LayoutDashboard },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'vault', label: 'Vault', icon: ShieldCheck },
    { id: 'planner', label: 'Planner', icon: Calendar },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-t border-[#27272a] pb-[max(12px,env(safe-area-inset-bottom))] pt-2.5 px-4">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (activeTab === 'dashboard' && item.id === 'today');
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-colors duration-150 ${
                isActive ? 'text-[#f4f4f5]' : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.25px]' : 'stroke-[1.5px]'}`} />
              <span className={`text-[10px] mt-1 tracking-wider uppercase ${isActive ? 'font-medium text-[#f4f4f5]' : 'font-normal text-[#71717a]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
