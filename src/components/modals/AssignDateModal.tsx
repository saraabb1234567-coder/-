import React, { useState } from 'react';
import { X, Calendar, Check, Save } from 'lucide-react';
import { useShifts } from '../../context/ShiftContext';
import { Employee } from '../../types';
import {
  getDaysInMonth,
  formatDate,
  getWeekdayName,
  isWeekend,
} from '../../utils/dateUtils';

interface AssignDateModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
}

export const AssignDateModal: React.FC<AssignDateModalProps> = ({
  isOpen,
  employee,
  onClose,
}) => {
  const {
    selectedYear,
    selectedMonth,
    shifts,
    assignEmployeeToDate,
    updateShift,
  } = useShifts();

  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  if (!isOpen || !employee) return null;

  const daysCount = getDaysInMonth(selectedYear, selectedMonth);
  const allDays = Array.from({ length: daysCount }, (_, i) => i + 1);

  const toggleDate = (dateStr: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const handleApply = () => {
    selectedDates.forEach((d) => {
      assignEmployeeToDate(employee.id, d);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg text-white font-bold flex items-center justify-center shadow-xs"
              style={{ backgroundColor: employee.color }}
            >
              {employee.name.slice(0, 1)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Ээлжинд томилох
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {employee.name} ажилтныг сонгосон өдрүүдэд томилох
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
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-slate-600 font-medium">
            {selectedYear} оны {selectedMonth}-р сарын хуваарьт нэмэх өдрүүдийг сонгоно уу:
          </p>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {allDays.map((day) => {
              const dateStr = formatDate(selectedYear, selectedMonth, day);
              const isAssignedAlready =
                shifts[dateStr]?.employeeIds?.includes(employee.id);
              const isSelected = selectedDates.includes(dateStr);
              const weekend = isWeekend(dateStr);

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDate(dateStr)}
                  className={`p-2 rounded-lg border text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : isAssignedAlready
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                      : weekend
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] opacity-75">
                    {getWeekdayName(dateStr, false)}
                  </span>
                  <span className="font-bold text-xs">{day}</span>
                  {isAssignedAlready && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Одоо ээлжтэй
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Шинээр сонгосон ({selectedDates.length})
            </span>
          </div>
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
            disabled={selectedDates.length === 0}
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Томилох ({selectedDates.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
