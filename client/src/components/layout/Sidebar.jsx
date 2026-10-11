import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Map,
  MessagesSquare,
  UserRound,
  X,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resumes", label: "Resumes", icon: FileText },
  { to: "/analysis", label: "Analysis History", icon: Sparkles },
  { to: "/roadmaps", label: "Career Roadmaps", icon: Map },
  { to: "/interviews", label: "Mock Interviews", icon: MessagesSquare },
  { to: "/profile", label: "Profile", icon: UserRound },
];

const NavList = ({ onNavigate }) => (
  <nav className="flex flex-1 flex-col gap-1">
    {navItems.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-brand-50 text-brand-700"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )
        }
      >
        <Icon size={18} />
        {label}
      </NavLink>
    ))}
  </nav>
);

const Sidebar = ({ mobileOpen = false, onClose }) => (
  <>
    {/* Desktop sidebar */}
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
      <NavList />
    </aside>

    {/* Mobile drawer */}
    {mobileOpen && (
      <div className="fixed inset-0 z-40 md:hidden">
        <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />
        <aside className="relative z-10 flex h-full w-64 flex-col bg-white px-4 py-6 shadow-xl animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Menu</span>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          <NavList onNavigate={onClose} />
        </aside>
      </div>
    )}
  </>
);

export default Sidebar;
