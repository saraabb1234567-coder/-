import React, { useState } from 'react';
import { X, ArrowLeftRight, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { useShifts } from '../../context/ShiftContext';
import {
  formatDate,
  getDaysInMonth,
  formatMongolianDate,
  getWeekdayName,
} from '../../utils/dateUtils';

interface SwapDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwapDatesModal: React.FC<SwapDatesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedYear, selectedMonth, shifts, employees, groups, swapDates } =
    useShifts();

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const allDates = Array.from({ length: daysInMonth }, (_, i) =>
    formatDate(selectedYear, selectedMonth, i + 1)
  );

  const [dateA, setDateA] = useState<string>(allDates[0] || '');
  const [dateB, setDateB] = useState<string>(allDates[1] || '');

  if (!isOpen) return null;

  const shiftA = shifts[dateA];
  const shiftB = shifts[dateB];

  const empsA = (shiftA?.employeeIds || [])
    .map((id) => employees.find((e) => e.id === id))
    .filter(Boolean);
  const empsB = (shiftB?.employeeIds || [])
    .map((id) => employees.find((e) => e.id === id))
    .filter(Boolean);

  const groupA = shiftA?.groupId ? groups.find((g) => g.id === shiftA.groupId) : null;
  const groupB = shiftB?.groupId ? groups.find((g) => g.id === shiftB.groupId) : null;

  const handleSwap = () => {
    if (dateA && dateB && dateA !== dateB) {
      swapDates(dateA, dateB);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Хоёр өдрийн хуваарийг сэлгэх
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Бусад өдрүүдийн хуваарьт нөлөөлөхгүйгээр сонгосон хоёр өдрийг солих
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date A */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                1-р өдөр:
              </label>
              <select
                value={dateA}
                onChange={(e) => setDateA(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer focus:outline-hidden"
              >
                {allDates.map((d) => (
                  <option key={d} value={d}>
                    {d} ({getWeekdayName(d, false)})
                  </option>
                ))}
              </select>

              {/* Preview Date A */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs space-y-1.5">
                <span className="font-semibold text-slate-500 text-[10px] uppercase block">
                  Одоогийн ээлж:
                </span>
                {shiftA?.isDayOff ? (
                  <span className="text-amber-700 font-bold">Амралтын өдөр</span>
                ) : (
                  <>
                    {groupA && (
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-[10px] text-white font-bold"
                        style={{ backgroundColor: groupA.color }}
                      >
                        {groupA.name}
                      </span>
                    )}
                    <div className="font-bold text-slate-800">
                      {empsA.length > 0
                        ? empsA.map((e) => e?.name).join(', ')
                        : 'Хуваарилагдаагүй'}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Date B */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                2-р өдөр:
              </label>
              <select
                value={dateB}
                onChange={(e) => setDateB(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer focus:outline-hidden"
              >
                {allDates.map((d) => (
                  <option key={d} value={d}>
                    {d} ({getWeekdayName(d, false)})
                  </option>
                ))}
              </select>

              {/* Preview Date B */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs space-y-1.5">
                <span className="font-semibold text-slate-500 text-[10px] uppercase block">
                  Одоогийн ээлж:
                </span>
                {shiftB?.isDayOff ? (
                  <span className="text-amber-700 font-bold">Амралтын өдөр</span>
                ) : (
                  <>
                    {groupB && (
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-[10px] text-white font-bold"
                        style={{ backgroundColor: groupB.color }}
                      >
                        {groupB.name}
                      </span>
                    )}
                    <div className="font-bold text-slate-800">
                      {empsB.length > 0
                        ? empsB.map((e) => e?.name).join(', ')
                        : 'Хуваарилагдаагүй'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {dateA === dateB && (
            <p className="text-xs text-rose-600 font-medium text-center">
              Хоёр өөр өдөр сонгоно уу.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
          >
            Болих
          </button>
          <button
            type="button"
            disabled={dateA === dateB}
            onClick={handleSwap}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Хуваарийг сэлгэх</span>
          </button>
        </div>
      </div>
    </div>
  );
};
