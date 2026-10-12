import React from 'react';
import {
  Users,
  CalendarCheck2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CalendarPlus,
  UserPlus,
  Settings as SettingsIcon,
  Layers,
  CheckCircle2,
  Calendar,
  Sun,
  Moon,
  Wallet,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowLeftRight,
  Receipt,
  Fuel,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import {
  MONGOLIAN_MONTH_SIMPLE,
  getDaysInMonth,
  formatDate,
  getWeekdayName,
  getTodayString,
  isWeekend,
  parseDateString,
} from '../utils/dateUtils';
import { formatMNT } from '../utils/calculations';
import { TabType } from './Sidebar';

interface DashboardProps {
  setCurrentTab: (tab: TabType) => void;
  onOpenGenerateModal: () => void;
  onOpenAddEmployeeModal: () => void;
  onOpenEditShiftModal: (dateStr: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setCurrentTab,
  onOpenGenerateModal,
  onOpenAddEmployeeModal,
  onOpenEditShiftModal,
}) => {
  const {
    employees,
    groups,
    shifts,
    selectedYear,
    selectedMonth,
    monthlyStats,
    settings,
    handovers,
    attendance,
    payrollPeriod,
    payrollCalculations,
    payrollPayments,
  } = useShifts();

  const totalDaysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const todayStr = getTodayString();
  const parsedToday = parseDateString(todayStr);

  // Today shift details
  const todayShift = shifts[todayStr];
  const todayGroup = todayShift?.groupId
    ? groups.find((g) => g.id === todayShift.groupId)
    : null;
  const todayEmps = (todayShift?.employeeIds || [])
    .map((id) => employees.find((e) => e.id === id))
    .filter(Boolean);

  // Today Handovers (Day 09:00 vs Night 20:30)
  const todayDayHandover = handovers.find(
    (h) => h.date === todayStr && h.shiftType === 'day'
  );
  const todayNightHandover = handovers.find(
    (h) => h.date === todayStr && h.shiftType === 'night'
  );

  // Lateness today and this month
  const todayLateRecords = handovers.filter(
    (h) => h.date === todayStr && h.latenessMinutes > 0
  );
  const monthLateCount = handovers.filter((h) => h.latenessMinutes > 0).length;

  // Total worked hours this month
  const totalApprovedHours = attendance
    .filter((a) => a.isApproved)
    .reduce((s, a) => s + (a.approvedHours || 0), 0);

  // Total calculated salary & total paid
  const totalCalculatedSalary = payrollCalculations.reduce(
    (s, c) => s + c.totalCalculated,
    0
  );
  const totalPaidSalary = payrollCalculations.reduce(
    (s, c) => s + c.actuallyPaid,
    0
  );
  const totalRemainingSalary = payrollCalculations.reduce(
    (s, c) => s + c.remainingBalance,
    0
  );

  // 25th & 10th disbursements count
  const primaryPaidCount = payrollPayments.filter(
    (p) => p.paymentType === 'primary_25' && p.status === 'completed'
  ).length;
  const secondaryPaidCount = payrollPayments.filter(
    (p) => p.paymentType === 'secondary_10' && p.status === 'completed'
  ).length;

  // Upcoming 7 days shifts from today
  const upcomingDates: string[] = [];
  const startRef =
    selectedYear === parsedToday.year && selectedMonth === parsedToday.month
      ? parsedToday.day
      : 1;

  for (let i = 0; i < 7; i++) {
    const targetDay = startRef + i;
    if (targetDay <= totalDaysInMonth) {
      upcomingDates.push(formatDate(selectedYear, selectedMonth, targetDay));
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {selectedYear} оны {MONGOLIAN_MONTH_SIMPLE[selectedMonth - 1]}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Цагийн бүс: {settings.timezone || 'Asia/Ulaanbaatar'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ээлжийн хуваарь, 09:00 ба 20:30 цагийн хүлээлцэлт, 18-ны таслалт ба 25, 10-ны цалингийн удирдлага
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenGenerateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Хуваарь гаргах</span>
          </button>
          <button
            onClick={() => setCurrentTab('handover')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
            <span>Ээлж хүлээлцэх</span>
          </button>
          <button
            onClick={() => setCurrentTab('payroll')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>Цалин харах</span>
          </button>
          <button
            onClick={() => setCurrentTab('fuel_sales')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Fuel className="w-4 h-4 text-blue-600" />
            <span>Шатахуун борлуулалт</span>
          </button>
        </div>
      </div>

      {/* Row 1: Real-time Shift & Handover Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Working Staff & Group */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ӨНӨӨДӨР АЖИЛЛАХ ХҮН</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 text-base font-bold text-slate-900 truncate">
            {todayGroup ? todayGroup.name : todayEmps.length > 0 ? todayEmps.map((e) => e?.name).join(', ') : 'Хуваарилагдаагүй'}
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {todayEmps.length > 0 ? todayEmps.map((e) => e?.name).join(' + ') : 'Ээлж гараагүй'}
          </p>
        </div>

        {/* Day Shift Status (09:00) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ӨДРИЙН ЭЭЛЖ ({settings.dayShiftHandoverTime})</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-base font-bold text-slate-900">
            {todayDayHandover ? (
              todayDayHandover.latenessMinutes > 0 ? (
                <span className="text-rose-600">Ирсэн (+{todayDayHandover.latenessMinutes}м)</span>
              ) : (
                <span className="text-emerald-700">Цагтаа ирсэн ({todayDayHandover.actualTime})</span>
              )
            ) : (
              <span className="text-slate-500">Бүртгэгдээгүй</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {todayDayHandover?.isHandedOver ? 'Ээлж хэвийн хүлээлцсэн' : 'Хүлээлцэх цаг: 09:00'}
          </p>
        </div>

        {/* Evening Shift Status (20:30) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ОРОЙН ЭЭЛЖ ({settings.nightShiftHandoverTime})</span>
            <Moon className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-base font-bold text-slate-900">
            {todayNightHandover ? (
              todayNightHandover.latenessMinutes > 0 ? (
                <span className="text-rose-600">Ирсэн (+{todayNightHandover.latenessMinutes}м)</span>
              ) : (
                <span className="text-emerald-700">Цагтаа ирсэн ({todayNightHandover.actualTime})</span>
              )
            ) : (
              <span className="text-slate-500">Бүртгэгдээгүй</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {todayNightHandover?.isHandedOver ? 'Ээлж хэвийн хүлээлцсэн' : 'Хүлээлцэх цаг: 20:30'}
          </p>
        </div>

        {/* Lateness Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ХОЦРОЛТЫН ТӨЛӨВ</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {todayLateRecords.length > 0 ? (
              <span className="text-rose-600">Өнөөдөр {todayLateRecords.length} хүн</span>
            ) : (
              <span className="text-emerald-700">Өнөөдөр хоцролтгүй</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">Сард нийт {monthLateCount} удаа хоцорсон</p>
        </div>
      </div>

      {/* Row 2: Payroll Cycle & Disbursement KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 18th Cutoff Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ЦАЛИНГИЙН 18-НЫ ТАСЛАЛТ</span>
            {payrollPeriod.isClosed ? <Lock className="w-4 h-4 text-emerald-600" /> : <Unlock className="w-4 h-4 text-blue-600" />}
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900">
            {payrollPeriod.isClosed ? (
              <span className="text-emerald-700">Хаагдсан (18-ны {payrollPeriod.cutoffTime})</span>
            ) : (
              <span className="text-blue-700">Идэвхтэй (Нээлттэй)</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">Баталгаажсан цаг: {totalApprovedHours}ц</p>
        </div>

        {/* 25th Primary Disbursement */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>25-НЫ ОЛГОЛТЫН ТӨЛӨВ</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900">
            {primaryPaidCount > 0 ? `${primaryPaidCount} ажилтанд олгосон` : 'Олгоогүй'}
          </div>
          <p className="text-xs text-slate-500 mt-1">Үндсэн цалингийн шилжүүлэг</p>
        </div>

        {/* 10th Secondary Disbursement */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>10-НЫ ОЛГОЛТЫН ТӨЛӨВ</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900">
            {secondaryPaidCount > 0 ? `${secondaryPaidCount} ажилтанд олгосон` : 'Хүлээгдэж буй'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Төрөл: {payrollPeriod.secondaryPayoutType === 'balance' ? 'Үлдэгдэл цалин' : 'Урьдчилгаа'}
          </p>
        </div>

        {/* Remaining Unpaid Balance */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ҮЛДСЭН ЦАЛИНГИЙН ДҮН</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-rose-600">
            {formatMNT(totalRemainingSalary)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Олгосон: {formatMNT(totalPaidSalary)}</p>
        </div>
      </div>

      {/* Main Grid: Upcoming Shifts & Employee Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming 7 Days Shifts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Ойрын 7 хоногийн ээлжийн хуваарь
              </h3>
              <p className="text-xs text-slate-500">
                Өдөр дээр даран ээлжийн томилгоог шууд засах боломжтой
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('calendar')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <span>Бүх хуанли харах</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingDates.map((dateStr) => {
              const shift = shifts[dateStr];
              const isToday = dateStr === todayStr;
              const weekend = isWeekend(dateStr);
              const group = shift?.groupId ? groups.find((g) => g.id === shift.groupId) : null;
              const assignedEmployees = (shift?.employeeIds || [])
                .map((id) => employees.find((e) => e.id === id))
                .filter(Boolean);

              return (
                <div
                  key={dateStr}
                  onClick={() => onOpenEditShiftModal(dateStr)}
                  className={`py-2.5 px-3 -mx-3 rounded-lg flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
                    isToday ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center text-xs font-semibold border ${
                        isToday
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : weekend
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-[9px] leading-tight font-medium">
                        {getWeekdayName(dateStr, false)}
                      </span>
                      <span className="text-xs font-bold leading-tight">
                        {dateStr.split('-')[2]}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{dateStr}</span>
                        {isToday && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                            Өнөөдөр
                          </span>
                        )}
                        {shift?.isDayOff && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            Амралт
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {group && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded text-white"
                            style={{ backgroundColor: group.color }}
                          >
                            {group.name}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">
                          {shift?.hours || 12} цагийн ээлж
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {shift?.isDayOff ? (
                      <span className="text-xs text-slate-400 italic">Амралт</span>
                    ) : assignedEmployees.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {assignedEmployees.map((emp) =>
                          emp ? (
                            <span
                              key={emp.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-slate-200 shadow-2xs"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: emp.color }}
                              />
                              {emp.name}
                            </span>
                          ) : null
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600">Хуваарилаагүй</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Employee Shift & Salary Progress List */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Ажилтнуудын ээлж ба үлдэгдэл
                </h3>
                <p className="text-xs text-slate-500">
                  Сарын нийт гарсан ээлж ба үлдсэн цалин
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('payroll')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Цалин
              </button>
            </div>

            <div className="space-y-3.5">
              {employees.map((emp) => {
                const stat = monthlyStats.find((s) => s.employee.id === emp.id);
                const calc = payrollCalculations.find((c) => c.employeeId === emp.id);
                const percent = Math.min(
                  100,
                  Math.round(((stat?.totalShifts || 0) / totalDaysInMonth) * 100)
                );

                return (
                  <div key={emp.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: emp.color }}
                        />
                        <span className="font-bold text-slate-800">{emp.name}</span>
                        {emp.status === 'on_leave' && (
                          <span className="text-[9px] px-1 bg-amber-100 text-amber-800 rounded">
                            Чөлөөтэй
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-slate-900">
                        {stat?.totalShifts || 0} ээлж{' '}
                        <span className="text-[11px] font-normal text-slate-400">
                          (Үлдэгдэл: {formatMNT(calc?.remainingBalance || 0)})
                        </span>
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: emp.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">18-ны таслалт хийгдэхэд бэлэн</span>
            <button
              onClick={() => setCurrentTab('payroll')}
              className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Тооцоо харах →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
