import React, { useState } from 'react';
import {
  X,
  CalendarPlus,
  Layers,
  Users,
  User,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useShifts } from '../../context/ShiftContext';
import { ScheduleMode, ScheduleConfig } from '../../types';
import { MONGOLIAN_MONTH_SIMPLE, formatDate, getDaysInMonth } from '../../utils/dateUtils';

interface GenerateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenerateScheduleModal: React.FC<GenerateScheduleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    selectedYear,
    selectedMonth,
    groups,
    employees,
    settings,
    generateSchedule,
    shifts,
  } = useShifts();

  const [mode, setMode] = useState<ScheduleMode>(settings.shiftMode || 'group_alternating');
  const [intervalDays, setIntervalDays] = useState<number>(settings.defaultIntervalDays || 2);
  const [customInterval, setCustomInterval] = useState<number>(4);
  const [isCustomInterval, setIsCustomInterval] = useState<boolean>(false);
  const [startEntityId, setStartEntityId] = useState<string>(groups[0]?.id || employees[0]?.id || '');
  const [startDateStr, setStartDateStr] = useState<string>(
    `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
  );
  const [shiftHours, setShiftHours] = useState<number>(settings.defaultHoursPerShift || 12);
  const [repeatPattern, setRepeatPattern] = useState<boolean>(true);

  // Confirmation state
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false);

  if (!isOpen) return null;

  // Active employees and groups
  const activeEmployees = employees.filter((e) => e.status === 'active');
  const activeGroups = groups.filter((g) =>
    g.memberIds.some((id) => activeEmployees.some((e) => e.id === id))
  );

  const effectiveInterval = isCustomInterval ? customInterval : intervalDays;

  // Check if month already has shifts
  const daysInTarget = getDaysInMonth(selectedYear, selectedMonth);
  let existingShiftCount = 0;
  for (let d = 1; d <= daysInTarget; d++) {
    const ds = formatDate(selectedYear, selectedMonth, d);
    if (shifts[ds]) existingShiftCount++;
  }

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingShiftCount > 0) {
      setShowConfirmOverwrite(true);
    } else {
      executeGenerate();
    }
  };

  const executeGenerate = () => {
    const config: ScheduleConfig = {
      mode,
      intervalDays: effectiveInterval,
      startEntityId,
      targetYear: selectedYear,
      targetMonth: selectedMonth,
      startDateStr,
      defaultHours: shiftHours,
      numEmployeesPerDay: mode === 'single' ? 1 : 2,
      repeatPattern,
    };

    generateSchedule(config);
    setShowConfirmOverwrite(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Ээлжийн хуваарь үүсгэх
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {selectedYear} оны {MONGOLIAN_MONTH_SIMPLE[selectedMonth - 1]}
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

        {/* Overwrite Confirmation Step */}
        {showConfirmOverwrite ? (
          <div className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-900 text-base">
                Хуваарийг шинэчлэх үү?
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {selectedYear} оны {selectedMonth}-р сард нийт{' '}
                <span className="font-bold text-slate-900">{existingShiftCount}</span> өдрийн
                хуваарь бүртгэгдсэн байна. Шинээр үүсгэснээр өмнөх хуваарь шинэчлэгдэнэ.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmOverwrite(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                Буцах
              </button>
              <button
                type="button"
                onClick={executeGenerate}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Тийм, хуваарийг шинэчлэх
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInitiate} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Mode selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                1. Ээлжийн горим сонгох:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Mode A: Group alternating */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('group_alternating');
                    if (activeGroups[0]) setStartEntityId(activeGroups[0].id);
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                    mode === 'group_alternating'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs">Хоёр хүнтэй багууд</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Баг А ба Баг Б ээлжлэн ажиллах
                  </span>
                </button>

                {/* Mode B: Pair */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('pair');
                    if (activeEmployees[0]) setStartEntityId(activeEmployees[0].id);
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                    mode === 'pair'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs">Хосоор ээлжлэх</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Өдөрт 2 хүн ээлжлэн ажиллах
                  </span>
                </button>

                {/* Mode C: Single */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('single');
                    if (activeEmployees[0]) setStartEntityId(activeEmployees[0].id);
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                    mode === 'single'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs">Ганцаар ээлжлэх</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Өдөрт 1 ажилтан ээлжлэн ажиллах
                  </span>
                </button>

                {/* Mode D: Custom Manual */}
                <button
                  type="button"
                  onClick={() => setMode('custom')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                    mode === 'custom'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs">Гараар хуваарилах</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Хоосон хуваарь үүсгээд өдөр тус бүрийг гараар оруулах
                  </span>
                </button>
              </div>
            </div>

            {mode !== 'custom' && (
              <>
                {/* Interval Days */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    2. Ээлжийн үргэлжлэх хугацаа (хоног):
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[1, 2, 3, 7].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => {
                          setIntervalDays(num);
                          setIsCustomInterval(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          !isCustomInterval && intervalDays === num
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {num} хоног
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setIsCustomInterval(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        isCustomInterval
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Өөр тоо
                    </button>

                    {isCustomInterval && (
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={customInterval}
                        onChange={(e) => setCustomInterval(Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-center"
                      />
                    )}
                  </div>
                </div>

                {/* Starting Entity (Group or Employee) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    3. Эхний ээлжинд гарах {mode === 'group_alternating' ? 'баг' : 'ажилтан'}:
                  </label>
                  <select
                    value={startEntityId}
                    onChange={(e) => setStartEntityId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    {mode === 'group_alternating' ? (
                      activeGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} (
                          {g.memberIds
                            .map((id) => employees.find((e) => e.id === id)?.name)
                            .filter(Boolean)
                            .join(', ')}
                          )
                        </option>
                      ))
                    ) : (
                      activeEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.role || 'Ажилтан'})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Shift Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Нэг ээлжийн цаг:
                    </label>
                    <select
                      value={shiftHours}
                      onChange={(e) => setShiftHours(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                    >
                      <option value={8}>8 цаг</option>
                      <option value={12}>12 цаг</option>
                      <option value={24}>24 цаг</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Эхлэх огноо:
                    </label>
                    <input
                      type="date"
                      value={startDateStr}
                      onChange={(e) => setStartDateStr(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                    />
                  </div>
                </div>

                {/* Repeat pattern checkbox */}
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={repeatPattern}
                    onChange={(e) => setRepeatPattern(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Сар дуустал ээлжийн дарааллыг автоматаар давтах
                  </span>
                </label>
              </>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                Болих
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Хуваарь шинэчлэх</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
