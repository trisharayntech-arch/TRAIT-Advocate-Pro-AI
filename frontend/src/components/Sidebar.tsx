import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Bot,
  PenTool,
  BookOpen,
  Search,
  Bell,
  Settings,
  Scale
} from 'lucide-react';

interface SidebarProps {
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ unreadCount = 0 }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Cases', path: '/cases', icon: Briefcase },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'AI Assistant', path: '/assistant', icon: Bot, badge: 'PRO' },
    { name: 'Legal Drafting', path: '/drafting', icon: PenTool },
    { name: 'Legal Research', path: '/research', icon: BookOpen },
    { name: 'Global Search', path: '/search', icon: Search },
    { name: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#101A2C] text-white flex flex-col h-screen fixed left-0 top-0 z-30 select-none shadow-xl border-r border-[#1E2E4A]">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-[#1E2E4A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-black tracking-wider uppercase flex items-center gap-1.5 text-white">
              TRAIT <span className="text-[#2563EB] text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-900/40 border border-blue-700/50">PRO</span>
            </div>
            <div className="text-[10px] text-[#8290A5] tracking-tight font-medium">ADVOCATE LEGAL AI</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[#8290A5] uppercase">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-[#CBD5E1] hover:bg-[#18263E] hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {item.badge}
                </span>
              )}
              {Boolean(item.count && item.count > 0) && (
                <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-red-500 text-white min-w-5 text-center">
                  {item.count}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Legal Disclaimer Pill */}
      <div className="p-4 border-t border-[#1E2E4A]">
        <div className="bg-[#18263E] rounded-lg p-3 text-[11px] text-[#8290A5] border border-[#233554]">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            Jurisprudence Engine
          </div>
          Compliant with Indian Statutes & Court Rules. Review drafts prior to filing.
        </div>
      </div>
    </aside>
  );
};
