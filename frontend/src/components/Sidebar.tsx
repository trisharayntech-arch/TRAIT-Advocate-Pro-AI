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
  Scale,
  X,
  CreditCard,
} from 'lucide-react';

interface SidebarProps {
  unreadCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  unreadCount = 0,
  isOpen = false,
  onClose,
}) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Cases', path: '/cases', icon: Briefcase },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'AI Assistant', path: '/assistant', icon: Bot, badge: 'PRO' },
    { name: 'Legal Drafting', path: '/drafting', icon: PenTool },
    { name: 'Legal Research', path: '/research', icon: BookOpen },
    { name: 'Global Search', path: '/search', icon: Search },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      count: unreadCount,
    },
    { name: 'Pricing & Plans', path: '/pricing', icon: CreditCard, badge: 'NEW' },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-72 max-w-[85vw] select-none flex-col overflow-hidden border-r border-[#53602F] bg-[#34452F] text-[#FFF8EC] shadow-2xl transition-transform duration-300 ease-in-out md:w-64 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex h-16 min-h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAA34B] text-[#34452F] shadow-md">
              <Scale className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-[#FFF8EC]">
                TRAIT
                <span className="rounded bg-[#EAA34B] px-1.5 py-0.5 text-xs font-bold text-[#34452F]">
                  PRO
                </span>
              </div>

              <div className="text-[10px] font-medium tracking-tight text-[#D7DCCB]">
                ADVOCATE LEGAL AI
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#FFF8EC] transition-colors hover:bg-white/10 md:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-5">
          <div className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#D7DCCB]/70">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex min-h-11 items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#EAA34B] font-bold text-[#34452F] shadow-md'
                      : 'text-[#F4EEDF] hover:bg-[#476B3F] hover:text-white'
                  }`
                }
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge && (
                  <span className="ml-2 rounded border border-[#EAA34B]/40 bg-[#E9824A]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#FFD69B]">
                    {item.badge}
                  </span>
                )}

                {Boolean(item.count && item.count > 0) && (
                  <span className="ml-2 min-w-5 rounded-full bg-[#D94F1E] px-1.5 py-0.5 text-center text-[11px] font-bold text-white">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl border border-[#53602F] bg-[#263A2B] p-3 text-[11px] text-[#D7DCCB]">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-[#EAA34B]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#EAA34B]" />
              Jurisprudence Engine
            </div>

            Compliant with Indian Statutes & Court Rules. Review drafts prior to filing.
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;