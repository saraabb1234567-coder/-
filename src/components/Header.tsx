import React from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CalendarPlus,
  Settings as SettingsIcon,
  Download,
  Printer,
  Calendar,
  Fuel,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import {
  MONGOLIAN_MONTH_SIMPLE,
  getTodayString,
  parseDateString,
} from '../utils/dateUtils';
import { exportMonthScheduleToCSV, downloadFile } from '../utils/scheduler';
import { TabType } from './Sidebar';

const TAB_TITLES: Record<TabType, { title: string; subtitle: string }> = {
  dashboard: { title: 'Хянах самбар', subtitle: 'ШТС ерөнхий тойм' },
  calendar: { title: 'Ээлжийн хуваарь', subtitle: 'Хуанли ба өдөр тутмын төлөвлөлт' },
  attendance: { title: 'Цагийн бүртгэл', subtitle: '09:00 & 20:30 ирц, ажилласан цаг' },
  payroll: { title: 'Цалингийн бүртгэл', subtitle: '18-ны таслалт & 25, 10-ны олголт' },
  fuel_sales: { title: 'Шатахууны борлуулалт', subtitle: 'Лангууны заалт, олон шатлалт тариф' },
  oil_products: { title: 'Тос, нэмэлт бүтээгдэхүүн', subtitle: 'Барааны үнэ, үлдэгдэл ба борлуулалт' },
  pos_settlement: { title: 'POS төхөөрөмжийн тооцоо', subtitle: 'Банкны ПОС картын Z-тайлан' },
  bank_settlement: { title: 'Банкны дансны тооцоо', subtitle: 'QPay ба дансны шилжүүлэг тулгалт' },
  cash_settlement: { title: 'Бэлэн мөнгөний тооцоо', subtitle: 'Мөнгөн дэвсгэртээр тоолох ба кассын үлдэгдэл' },
  handover: { title: 'Ээлж хүлээлцэх', subtitle: '09:00 & 20:30 ээлж шилжүүлэх чек' },
  manager_handover: { title: 'Эрхлэгчид мөнгө хүлээлгэн өгөх', subtitle: 'Сейфийн тушаалт, хүлээлцэх акт' },
  reports: { title: 'Тайлан & Шинжилгээ', subtitle: 'Борлуулалт, касс ба ачааллын тайлан' },
  employees: { title: 'Ажилтнуудын бүртгэл', subtitle: 'Ажилтнууд, хос багууд ба төлөв' },
  settings: { title: 'Системийн тохиргоо', subtitle: 'Шатахууны үнэ, тохиргоо ба нөөцлөлт' },
};

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenGenerateModal: () => void;
  onOpenAddEmployeeModal: () => void;
  onOpenSettings: () => void;
  onPrintCalendar: () => void;
  currentTab: TabType;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenGenerateModal,
  onOpenAddEmployeeModal,
  onOpenSettings,
  onPrintCalendar,
  currentTab,
}) => {
  const {
    selectedYear,
    selectedMonth,
    setSelectedYearMonth,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    shifts,
    employees,
    groups,
    settings,
  } = useShifts();

  const today = parseDateString(getTodayString());
  const isCurrentMonthSelected =
    today.year === selectedYear && today.month === selectedMonth;

  const currentMeta = TAB_TITLES[currentTab] || { title: 'ШТС Удирдлага', subtitle: '' };

  const handleExportCSV = () => {
    const csvContent = exportMonthScheduleToCSV(
      selectedYear,
      selectedMonth,
      shifts,
      employees,
      groups
    );
    const fileName = `Eeljiin_Huvaari_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.csv`;
    downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
          aria-label="Цэс нээх"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Page Title */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
              {currentMeta.title}
            </h2>
            <span className="hidden xl:inline-block text-[11px] font-medium text-slate-400">
              — {currentMeta.subtitle}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {/* Month Navigator */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 shadow-2xs">
          <button
            onClick={goToPrevMonth}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
            title="Өмнөх сар"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600 hidden sm:block" />
            <select
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map(Number);
                setSelectedYearMonth(y, m);
              }}
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {[today.year - 1, today.year, today.year + 1].map((year) =>
                Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={`${year}-${m}`} value={`${year}-${m}`}>
                    {year} оны {MONGOLIAN_MONTH_SIMPLE[m - 1]}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
            title="Дараах сар"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* User / Station badge */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            Э
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-900 leading-tight">
              {settings.adminUsername || 'Эрхлэгч'}
            </p>
            <p className="text-[10px] text-slate-400">
              {settings.timezone || 'Asia/Ulaanbaatar'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
