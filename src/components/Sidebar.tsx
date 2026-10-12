import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Calculator,
  Fuel,
  Droplets,
  CreditCard,
  Building2,
  Banknote,
  ArrowLeftRight,
  ShieldCheck,
  BarChart3,
  Users,
  Settings,
  Layers,
  BookOpen,
  CalendarPlus,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { getTodayString } from '../utils/dateUtils';

export type TabType =
  | 'dashboard'
  | 'calendar'
  | 'attendance'
  | 'payroll'
  | 'fuel_sales'
  | 'oil_products'
  | 'tanks'
  | 'pos_settlement'
  | 'bank_settlement'
  | 'cash_settlement'
  | 'handover'
  | 'manager_handover'
  | 'reports'
  | 'employees'
  | 'settings'
  | 'guide';

interface SidebarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenGenerateModal: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  onClose,
  onOpenGenerateModal,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const {
    employees,
    groups,
    shifts,
    settings,
    handovers,
    oilProducts,
    fuelPrices,
    posRecords,
    bankTransactions,
    tanks,
    nozzles,
  } = useShifts();

  const todayStr = getTodayString();
  const todayShift = shifts[todayStr];

  let todaySummary = 'Хуваарилагдаагүй';
  if (todayShift) {
    if (todayShift.isDayOff) {
      todaySummary = 'Бүх нийтийн амралт';
    } else if (todayShift.groupId) {
      const g = groups.find((grp) => grp.id === todayShift.groupId);
      todaySummary = g ? g.name : 'Ажлын өдөр';
    } else if (todayShift.employeeIds.length > 0) {
      const names = todayShift.employeeIds
        .map((id) => employees.find((e) => e.id === id)?.name || '')
        .filter(Boolean)
        .join(', ');
      todaySummary = names || 'Ажлын өдөр';
    }
  }

  const activeCount = employees.filter((e) => e.status === 'active').length;
  const todayHandovers = handovers.filter((h) => h.date === todayStr);

  // 16 distinct menus exactly as requested
  const navSections = [
    {
      title: 'ҮНДСЭН МОДУЛЬ',
      items: [
        {
          id: 'dashboard' as TabType,
          label: '1. Хянах самбар',
          shortLabel: 'Самбар',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'calendar' as TabType,
          label: '2. Ээлжийн хуваарь',
          shortLabel: 'Хуваарь',
          icon: CalendarDays,
          badge: null,
        },
        {
          id: 'attendance' as TabType,
          label: '3. Цагийн бүртгэл',
          shortLabel: 'Цаг',
          icon: Clock,
          badge: null,
        },
        {
          id: 'payroll' as TabType,
          label: '4. Цалингийн бүртгэл',
          shortLabel: 'Цалин',
          icon: Calculator,
          badge: '18, 25, 10',
        },
      ],
    },
    {
      title: 'БОРЛУУЛАЛТ & ШАТАХУУН',
      items: [
        {
          id: 'fuel_sales' as TabType,
          label: '5. Шатахууны борлуулалт',
          shortLabel: 'Шатахуун',
          icon: Fuel,
          badge: `${fuelPrices.length} төрөл`,
        },
        {
          id: 'oil_products' as TabType,
          label: '6. Тос, нэмэлт бүтээгдэхүүн',
          shortLabel: 'Тос',
          icon: Droplets,
          badge: `${oilProducts.length} бараа`,
        },
        {
          id: 'tanks' as TabType,
          label: '7. Сав, хошуу & мастшап',
          shortLabel: 'Сав, хошуу',
          icon: Layers,
          badge: `${tanks.length} сав`,
        },
      ],
    },
    {
      title: 'КАСС, БАНК & ТООЦОО',
      items: [
        {
          id: 'pos_settlement' as TabType,
          label: '8. POS төхөөрөмжийн тооцоо',
          shortLabel: 'POS',
          icon: CreditCard,
          badge: `${posRecords.length} терминал`,
        },
        {
          id: 'bank_settlement' as TabType,
          label: '9. Банкны дансны тооцоо',
          shortLabel: 'Данс',
          icon: Building2,
          badge: `${bankTransactions.length} гүйлгээ`,
        },
        {
          id: 'cash_settlement' as TabType,
          label: '10. Бэлэн мөнгөний тооцоо',
          shortLabel: 'Бэлэн',
          icon: Banknote,
          badge: 'Дэвсгэрт',
        },
      ],
    },
    {
      title: 'ХҮЛЭЭЛЦЭЛТ & ТАЙЛАН',
      items: [
        {
          id: 'handover' as TabType,
          label: '11. Ээлж хүлээлцэх',
          shortLabel: 'Хүлээлцэх',
          icon: ArrowLeftRight,
          badge: todayHandovers.length > 0 ? `${todayHandovers.length}` : null,
        },
        {
          id: 'manager_handover' as TabType,
          label: '12. Эрхлэгчид мөнгө хүлээлгэх',
          shortLabel: 'Эрхлэгч',
          icon: ShieldCheck,
          badge: 'Акт',
        },
        {
          id: 'reports' as TabType,
          label: '13. Тайлан',
          shortLabel: 'Тайлан',
          icon: BarChart3,
          badge: null,
        },
      ],
    },
    {
      title: 'СИСТЕМ & ЗААВАР',
      items: [
        {
          id: 'employees' as TabType,
          label: '14. Ажилтнууд',
          shortLabel: 'Ажилтнууд',
          icon: Users,
          badge: `${activeCount}/${employees.length}`,
        },
        {
          id: 'settings' as TabType,
          label: '15. Тохиргоо',
          shortLabel: 'Тохиргоо',
          icon: Settings,
          badge: null,
        },
        {
          id: 'guide' as TabType,
          label: '16. Заавар (Гарын авлага)',
          shortLabel: 'Заавар',
          icon: BookOpen,
          badge: '17 бүлэг',
        },
      ],
    },
  ];

  const handleNavClick = (tab: TabType) => {
    setCurrentTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ease-in-out ${
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand header */}
        <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Fuel className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-slate-900 text-sm tracking-tight leading-tight truncate">
                  ШТС Удирдлага
                </h1>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {settings.workplaceName || 'Петростар-101'}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                title={isCollapsed ? 'Дэлгэх' : 'Эвхэх'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              aria-label="Хаах"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Action Button */}
        {!isCollapsed && (
          <div className="p-3 border-b border-slate-100">
            <button
              onClick={() => {
                onOpenGenerateModal();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Хуваарь шинэчлэх</span>
            </button>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={item.label}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate text-left">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                          isActive
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Today Info Widget (Hidden when collapsed) */}
        {!isCollapsed && (
          <div className="p-3 mx-3 mb-2 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-500 text-[10px]">
              <span>ӨНӨӨДӨР АЖИЛЛАХ</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="font-bold text-slate-900 truncate text-[11px]">{todaySummary}</p>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-500">
              <span>Өдөр: {settings.dayShiftHandoverTime}</span>
              <span>Орой: {settings.nightShiftHandoverTime}</span>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-2 border-t border-slate-200 text-[10px] text-slate-400 text-center">
          {!isCollapsed ? 'ШТС Систем v3.0 | Улаанбаатар' : 'v3.0'}
        </div>
      </aside>
    </>
  );
};
