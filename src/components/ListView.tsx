import React from 'react';
import { Edit2, FileText, CheckCircle2 } from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import {
  getDaysInMonth,
  formatDate,
  getWeekdayName,
  isWeekend,
  getTodayString,
} from '../utils/dateUtils';

interface ListViewProps {
  onOpenEditShiftModal: (dateStr: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({ onOpenEditShiftModal }) => {
  const {
    selectedYear,
    selectedMonth,
    shifts,
    employees,
    groups,
  } = useShifts();

  const daysCount = getDaysInMonth(selectedYear, selectedMonth);
  const todayStr = getTodayString();

  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Огноо</th>
              <th className="py-3 px-4">Гараг</th>
              <th className="py-3 px-4">Төлөв</th>
              <th className="py-3 px-4">Ажиллах баг</th>
              <th className="py-3 px-4">Ажилтнууд</th>
              <th className="py-3 px-4 text-center">Цаг</th>
              <th className="py-3 px-4">Тэмдэглэл</th>
              <th className="py-3 px-4 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {daysArray.map((day) => {
              const dateStr = formatDate(selectedYear, selectedMonth, day);
              const weekday = getWeekdayName(dateStr, true);
              const isToday = dateStr === todayStr;
              const weekend = isWeekend(dateStr);
              const shift = shifts[dateStr];

              const group = shift?.groupId
                ? groups.find((g) => g.id === shift.groupId)
                : null;
              const assignedEmployees = (shift?.employeeIds || [])
                .map((id) => employees.find((e) => e.id === id))
                .filter(Boolean);

              return (
                <tr
                  key={dateStr}
                  className={`hover:bg-slate-50 transition-colors ${
                    isToday ? 'bg-blue-50/50' : weekend ? 'bg-rose-50/20' : ''
                  }`}
                >
                  {/* Date */}
                  <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{dateStr}</span>
                      {isToday && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                          Өнөөдөр
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Weekday */}
                  <td className="py-3 px-4">
                    <span
                      className={`font-medium ${
                        weekend ? 'text-rose-600 font-semibold' : 'text-slate-600'
                      }`}
                    >
                      {weekday}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {shift?.isDayOff ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        Амралтын өдөр
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Ажлын ээлж
                      </span>
                    )}
                  </td>

                  {/* Group */}
                  <td className="py-3 px-4">
                    {group ? (
                      <span
                        className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded text-white shadow-2xs"
                        style={{ backgroundColor: group.color }}
                      >
                        {group.name}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Employees */}
                  <td className="py-3 px-4">
                    {shift?.isDayOff ? (
                      <span className="text-slate-400 italic">Бүх нийтийн амралт</span>
                    ) : assignedEmployees.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {assignedEmployees.map((emp) =>
                          emp ? (
                            <span
                              key={emp.id}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 text-[11px] font-medium shadow-2xs"
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
                      <span className="text-amber-600 font-medium">Хуваарилаагүй</span>
                    )}
                  </td>

                  {/* Hours */}
                  <td className="py-3 px-4 text-center font-medium text-slate-700">
                    {shift && !shift.isDayOff ? `${shift.hours || 12}ц` : '0ц'}
                  </td>

                  {/* Notes */}
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                    {shift?.note ? (
                      <div className="flex items-center gap-1" title={shift.note}>
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{shift.note}</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onOpenEditShiftModal(dateStr)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Засах</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
