import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  ArrowLeftRight,
  CalendarPlus,
  Info,
  Clock,
  Sparkles,
  FileText,
  AlertTriangle,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  User,
  Coffee,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import {
  generateMonthCalendarGrid,
  MONGOLIAN_WEEKDAYS_SHORT,
  MONGOLIAN_WEEKDAYS_FULL,
  MONGOLIAN_MONTH_SIMPLE,
  isWeekend,
  getTodayString,
  formatDate,
  parseDateString,
  getDaysInMonth,
  getWeekdayName,
} from '../utils/dateUtils';
import { ListView } from './ListView';

interface MonthlyCalendarProps {
  onOpenEditShiftModal: (dateStr: string) => void;
  onOpenGenerateModal: () => void;
  onOpenSwapModal: () => void;
}

type CalendarViewMode = 'month' | 'week' | 'day' | 'list';

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  onOpenEditShiftModal,
  onOpenGenerateModal,
  onOpenSwapModal,
}) => {
  const {
    selectedYear,
    selectedMonth,
    shifts,
    employees,
    groups,
    settings,
  } = useShifts();

  const todayStr = getTodayString();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedDayNum, setSelectedDayNum] = useState<number>(() => {
    const p = parseDateString(todayStr);
    return p.year === selectedYear && p.month === selectedMonth ? p.day : 1;
  });

  const totalDays = getDaysInMonth(selectedYear, selectedMonth);
  const calendarGrid = generateMonthCalendarGrid(selectedYear, selectedMonth);

  // Selected date formatted
  const activeDateStr = formatDate(selectedYear, selectedMonth, selectedDayNum);
  const activeShift = shifts[activeDateStr];

  // Week days calculation around selectedDayNum
  const currentWeekDays: number[] = [];
  const startDay = Math.max(1, selectedDayNum - 3);
  for (let d = startDay; d < startDay + 7 && d <= totalDays; d++) {
    currentWeekDays.push(d);
  }

  return (
    <div className="space-y-4">
      {/* Calendar Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Сар</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Долоо хоног</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Өдөр</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Жагсаалт</span>
            </button>
          </div>

          <span className="hidden sm:inline-block text-xs text-slate-300">|</span>

          <span className="text-xs sm:text-sm font-bold text-slate-800">
            {selectedYear} оны {MONGOLIAN_MONTH_SIMPLE[selectedMonth - 1]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSwapModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Хоёр өдрийн хуваарийг хооронд нь сэлгэх"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
            <span>Өдөр сэлгэх (Swap)</span>
          </button>

          <button
            onClick={onOpenGenerateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Хуваарь шинэчлэх</span>
          </button>
        </div>
      </div>

      {/* 1. LIST VIEW */}
      {viewMode === 'list' && (
        <ListView onOpenEditShiftModal={onOpenEditShiftModal} />
      )}

      {/* 2. WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Долоо хоногийн дэлгэрэнгүй ээлж ({startDay}-аас {startDay + currentWeekDays.length - 1}-ны хооронд)
              </h3>
              <p className="text-xs text-slate-500">
                Өдрийн ээлж: 09:00-д эхэлж 20:30-д шилжинэ. Шөнийн ээлж: 20:30-д эхэлж маргааш 08:30-д дуусна.
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedDayNum((prev) => Math.max(1, prev - 7))}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600"
                title="Өмнөх долоо хоног"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDayNum((prev) => Math.min(totalDays, prev + 7))}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600"
                title="Дараах долоо хоног"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {currentWeekDays.map((d) => {
              const dateStr = formatDate(selectedYear, selectedMonth, d);
              const shift = shifts[dateStr];
              const isToday = dateStr === todayStr;
              const weekday = getWeekdayName(dateStr, false);
              const isWknd = isWeekend(dateStr);

              const grp = shift?.groupId ? groups.find((g) => g.id === shift.groupId) : null;
              const emps = (shift?.employeeIds || [])
                .map((id) => employees.find((e) => e.id === id))
                .filter(Boolean);

              return (
                <div
                  key={d}
                  onClick={() => onOpenEditShiftModal(dateStr)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isToday
                      ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-400'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="font-bold text-slate-900 text-sm font-mono">{d}-ны өдөр</span>
                      <span className={`text-[10px] font-bold ${isWknd ? 'text-rose-600' : 'text-slate-500'}`}>
                        {weekday}
                      </span>
                    </div>

                    <div className="pt-2 space-y-2">
                      {shift?.isDayOff ? (
                        <div className="p-2 rounded bg-amber-50 text-amber-800 text-[11px] font-bold text-center">
                          Амралтын өдөр
                        </div>
                      ) : (
                        <>
                          {grp && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-white border border-slate-200 text-slate-900">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: grp.color }} />
                              <span>{grp.name}</span>
                            </div>
                          )}

                          <div className="space-y-1">
                            {emps.map((e) => e && (
                              <div
                                key={e.id}
                                className="flex items-center gap-1.5 p-1 rounded bg-white border border-slate-100 text-xs text-slate-800 font-semibold"
                              >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                                <span>{e.name}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{shift?.hours || 12} цаг</span>
                    <span className="text-blue-600 font-bold hover:underline">Засах</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedYear} оны {selectedMonth}-р сарын {selectedDayNum}-ны өдрийн хуваарь
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {getWeekdayName(activeDateStr, true)}
                </span>
                {activeDateStr === todayStr && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Өнөөдөр
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Өдрийн ээлж (09:00 - 20:30) болон Шөнийн ээлж (20:30 - маргааш 08:30)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDayNum((prev) => Math.max(1, prev - 1))}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-semibold flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Өмнөх өдөр</span>
              </button>
              <button
                onClick={() => setSelectedDayNum((prev) => Math.min(totalDays, prev + 1))}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-semibold flex items-center gap-1"
              >
                <span>Дараах өдөр</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenEditShiftModal(activeDateStr)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Энэ өдрийг засах
              </button>
            </div>
          </div>

          {/* Shifts Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Day Shift */}
            <div className="p-5 rounded-xl border border-slate-200 bg-amber-50/40 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-600" />
                  <span className="font-bold text-slate-900 text-sm">Өдрийн ээлж (09:00 - 20:30)</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-800">11.5 цаг</span>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-slate-600">
                  Хүлээлцэх цаг: <strong>{settings.dayShiftHandoverTime || '09:00'}</strong>
                </p>
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Томилогдсон ажилтнууд:</span>
                  <div className="space-y-1.5">
                    {(activeShift?.employeeIds || []).map((id) => {
                      const emp = employees.find((e) => e.id === id);
                      return emp ? (
                        <div key={emp.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 font-semibold text-slate-900">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: emp.color }} />
                          <span>{emp.name}</span>
                          <span className="text-[11px] text-slate-400 font-normal">({emp.role || 'Түгээгч'})</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Night Shift */}
            <div className="p-5 rounded-xl border border-slate-200 bg-indigo-50/40 space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-slate-900 text-sm">Шөнийн ээлж (20:30 - 08:30)</span>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-800">12 цаг (Дамнасан)</span>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-slate-600">
                  Хүлээлцэх цаг: <strong>{settings.nightShiftHandoverTime || '20:30'}</strong> (Шөнө дамнан маргааш өглөө дуусна)
                </p>
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Хос баг / Хариуцагч:</span>
                  {activeShift?.groupId ? (
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-900">{groups.find((g) => g.id === activeShift.groupId)?.name}</span>
                      <span className="text-slate-500 text-[11px]">Шөнийн жижүүр оператор</span>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Тусдаа баг оноогоогүй</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MONTH VIEW (CALENDAR GRID) */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center">
            {MONGOLIAN_WEEKDAYS_SHORT.map((day, idx) => {
              const isWeekendDay = idx >= 5;
              return (
                <div
                  key={day}
                  className={`py-2.5 text-xs font-bold uppercase tracking-wider ${
                    isWeekendDay ? 'text-rose-600' : 'text-slate-700'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-50">
            {calendarGrid.map((cell) => {
              const { dateStr, day, isToday, isCurrentMonth, isWeekend: isWeekendDay } = cell;
              const shift = shifts[dateStr];
              const isSelectedDay = day === selectedDayNum;

              const group = shift?.groupId
                ? groups.find((g) => g.id === shift.groupId)
                : null;

              const assignedEmployees = (shift?.employeeIds || [])
                .map((id) => employees.find((e) => e.id === id))
                .filter(Boolean);

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setSelectedDayNum(day);
                    onOpenEditShiftModal(dateStr);
                  }}
                  className={`group relative min-h-[110px] sm:min-h-[125px] p-2 transition-all cursor-pointer flex flex-col justify-between ${
                    !isCurrentMonth
                      ? 'bg-slate-100/50 opacity-40'
                      : isToday
                      ? 'bg-blue-50/70 ring-2 ring-blue-500 z-10'
                      : isWeekendDay
                      ? 'bg-slate-50/70 hover:bg-white'
                      : 'bg-white hover:bg-slate-50/80'
                  }`}
                >
                  {/* Cell Top Header */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center font-mono ${
                          isToday
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : isWeekendDay
                            ? 'text-rose-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {day}
                      </span>

                      {shift?.isDayOff && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                          Амралт
                        </span>
                      )}
                    </div>

                    {/* Assigned Group / Employees */}
                    {!shift?.isDayOff && (
                      <div className="space-y-1">
                        {group && (
                          <div
                            className="px-1.5 py-0.5 rounded text-[11px] font-bold truncate text-white shadow-2xs"
                            style={{ backgroundColor: group.color }}
                          >
                            {group.name}
                          </div>
                        )}

                        <div className="space-y-0.5">
                          {assignedEmployees.map((emp) =>
                            emp ? (
                              <div
                                key={emp.id}
                                className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-medium truncate"
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: emp.color }}
                                />
                                <span className="truncate">{emp.name}</span>
                              </div>
                            ) : null
                          )}
                          {assignedEmployees.length === 0 && !group && (
                            <div className="text-[11px] text-slate-300 italic">
                              Хуваарилаагүй
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cell Bottom Footer */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-100">
                    <span>
                      {shift && !shift.isDayOff ? `${shift.hours || 12}ц` : ''}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 text-blue-600 font-semibold transition-opacity">
                      Засах
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Legend Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Info className="w-4 h-4 text-blue-600" />
          <span>ТАЙЛБАР / ӨНГӨНИЙ КОД</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Groups Legend */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Ажиллах хос багууд
            </span>
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => {
                const members = group.memberIds
                  .map((id) => employees.find((e) => e.id === id)?.name)
                  .filter(Boolean)
                  .join(' + ');

                return (
                  <div
                    key={group.id}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="font-bold text-slate-900">{group.name}:</span>
                    <span className="text-slate-600">{members || 'Гишүүнгүй'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Employees Legend */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Ажилтнууд
            </span>
            <div className="flex flex-wrap gap-2">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs shadow-2xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: emp.color }}
                  />
                  <span className="font-semibold text-slate-900">{emp.name}</span>
                  {emp.status === 'on_leave' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                      Чөлөөтэй
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
