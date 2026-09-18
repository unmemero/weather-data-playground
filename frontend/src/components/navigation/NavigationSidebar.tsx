import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Layers,
  Activity,
  Compass,
  BookOpen,
  Table as TableIcon,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Command,
} from 'lucide-react';

export type ActiveTab = 'timeseries' | 'correlation' | 'wind' | 'education' | 'data';

export interface NavItem {
  id: ActiveTab;
  title: string;
  subtitle: string;
  category: 'Observational Telemetry' | 'Physical & Statistical Models' | 'Reference & Archives';
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  keywords: string[];
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'timeseries',
    title: 'Timeseries Explorer',
    subtitle: 'Dual-Y Scaling & SMA Smoothing',
    category: 'Observational Telemetry',
    icon: Layers,
    accentColor: '#48dbfb',
    keywords: [
      'timeseries',
      'dual-y',
      'sma',
      'line',
      'trend',
      'chart',
      'history',
      'temperature',
      'dewpoint',
      'humidity',
      'pressure',
      'smoothing',
    ],
    badge: 'Live',
  },
  {
    id: 'correlation',
    title: 'Pearson Correlation',
    subtitle: 'Bivariate Scatter & Regression',
    category: 'Physical & Statistical Models',
    icon: Activity,
    accentColor: '#ff6b6b',
    keywords: [
      'pearson',
      'correlation',
      'scatter',
      'regression',
      'latex',
      'deviation',
      'statistics',
      'residuals',
      'bivariate',
      'math',
    ],
    badge: 'Math',
  },
  {
    id: 'wind',
    title: 'Polar Wind Rose',
    subtitle: 'Sector Binning & Vector Math',
    category: 'Physical & Statistical Models',
    icon: Compass,
    accentColor: '#1dd1a1',
    keywords: [
      'wind',
      'polar',
      'rose',
      'compass',
      'vector',
      'u/v',
      'cartesian',
      'velocity',
      'direction',
      'trigonometry',
      'azimuth',
    ],
    badge: 'Vector',
  },
  {
    id: 'education',
    title: 'Atmospheric Physics',
    subtitle: 'Equations & Meteorological Science',
    category: 'Reference & Archives',
    icon: BookOpen,
    accentColor: '#feca57',
    keywords: [
      'education',
      'physics',
      'kinematics',
      'vector',
      'wind',
      'equations',
      'clausius-clapeyron',
      'hypsometric',
      'radiation',
      'thermodynamics',
      'theory',
      'reference',
    ],
    badge: 'Guide',
  },
  {
    id: 'data',
    title: 'Raw Data & Telemetry',
    subtitle: 'Observation Records & Filtering',
    category: 'Reference & Archives',
    icon: TableIcon,
    accentColor: '#a29bfe',
    keywords: [
      'data',
      'raw',
      'table',
      'records',
      'telemetry',
      'csv',
      'filter',
      'sort',
      'database',
      'sqlite',
      'export',
    ],
    badge: 'Table',
  },
];

interface NavigationSidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  recordCount?: number;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  recordCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (/ to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter navigation items
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchSubtitle = item.subtitle.toLowerCase().includes(query);
      const matchCategory = item.category.toLowerCase().includes(query);
      const matchKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(query));
      return matchTitle || matchSubtitle || matchCategory || matchKeywords;
    });
  }, [searchQuery]);

  // Group filtered items by category
  const categories = useMemo(() => {
    const groups: { [key: string]: NavItem[] } = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const handleItemClick = (tabId: ActiveTab) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Sidebar Header / View Controls */}
      <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between gap-2">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0abde3]" />
              <span>Lab Workbenches</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.06] text-slate-400 font-semibold">
              {filteredItems.length}/{NAV_ITEMS.length}
            </span>
          </div>
        ) : (
          <div className="mx-auto text-slate-400">
            <Sparkles className="w-4 h-4 text-[#0abde3]" />
          </div>
        )}

        {/* Collapse Toggle Button (Desktop only) */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
          title="Close Menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      {!isCollapsed ? (
        <div id="tour-sidebar-search" className="p-3 border-b border-white/[0.06]">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search views (e.g. wind, scatter)..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-12 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0abde3] transition-all font-mono"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-400 hover:text-slate-200 p-0.5"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute right-2 flex items-center gap-0.5 text-[10px] font-mono text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.05] pointer-events-none">
                <Command className="w-2.5 h-2.5" />
                <span>/</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Collapsed Search Hint Icon */
        <div id="tour-sidebar-search" className="p-2 border-b border-white/[0.06] flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-xl text-slate-400 hover:text-[#48dbfb] hover:bg-white/[0.06] transition-colors"
            title="Search Views (Expand Sidebar)"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Items List */}
      <div className="flex-1 overflow-y-auto py-2.5 px-2 flex flex-col gap-4">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center flex flex-col items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">No matching views</span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] font-mono text-[#48dbfb] hover:underline"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          Object.entries(categories).map(([category, items]) => (
            <div key={category} className="flex flex-col gap-1">
              {!isCollapsed && (
                <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  {category}
                </span>
              )}
              <div className="flex flex-col gap-1">
                {items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      data-testid={`nav-tab-${item.id}`}
                      title={isCollapsed ? `${item.title} — ${item.subtitle}` : undefined}
                      className={`group relative flex items-center rounded-xl text-left transition-all duration-150 ${
                        isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-[#0abde3]/15 via-[#0abde3]/5 to-transparent text-white border-l-2 border-[#0abde3] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_12px_rgba(10,189,227,0.15)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border-l-2 border-transparent'
                      }`}
                    >
                      {/* Icon with domain color glow */}
                      <div
                        className={`relative p-1.5 rounded-lg transition-transform group-hover:scale-105 flex-shrink-0 ${
                          isActive ? 'bg-white/[0.08]' : 'bg-transparent'
                        }`}
                        style={{ color: item.accentColor }}
                      >
                        <Icon className="w-4 h-4" />
                        {isActive && (
                          <span
                            className="absolute inset-0 rounded-lg blur-sm opacity-40 -z-10"
                            style={{ backgroundColor: item.accentColor }}
                          />
                        )}
                      </div>

                      {/* Title & Subtitle in Expanded Mode */}
                      {!isCollapsed && (
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={`text-xs font-semibold truncate ${
                                isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                              }`}
                            >
                              {item.title}
                            </span>
                            {item.id === 'data' && recordCount !== undefined && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-[#a29bfe] font-semibold">
                                {recordCount}
                              </span>
                            )}
                            {item.badge && item.id !== 'data' && (
                              <span
                                className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold border"
                                style={{
                                  backgroundColor: `${item.accentColor}15`,
                                  borderColor: `${item.accentColor}30`,
                                  color: item.accentColor,
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                            {item.subtitle}
                          </span>
                        </div>
                      )}

                      {/* Active Indicator Pulse Dot in Expanded Mode */}
                      {!isCollapsed && isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#48dbfb] shadow-[0_0_8px_#48dbfb] animate-pulse flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sidebar Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-white/[0.08] bg-slate-950/40 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <span>Active View:</span>
          <span className="text-[#48dbfb] font-semibold">
            {NAV_ITEMS.find((n) => n.id === activeTab)?.title}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Docked Sidebar */}
      <aside
        id="tour-sidebar-nav"
        className={`hidden lg:flex flex-col border-r border-white/[0.08] glass-panel-subtle transition-all duration-300 flex-shrink-0 sticky top-[61px] h-[calc(100vh-61px)] z-20 ${
          isCollapsed ? 'w-[68px]' : 'w-64 xl:w-72'
        }`}
        data-testid="desktop-nav-sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 lg:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Off-Canvas Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900/95 border-r border-white/[0.1] shadow-2xl z-50 lg:hidden flex flex-col transition-transform duration-300 backdrop-blur-xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="mobile-nav-drawer"
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default NavigationSidebar;
