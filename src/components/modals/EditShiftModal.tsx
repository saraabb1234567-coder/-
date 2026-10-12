import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Users,
  Layers,
  Clock,
  FileText,
  Coffee,
  Check,
  ArrowLeftRight,
  Save,
  AlertCircle,
} from 'lucide-react';
import { useShifts } from '../../context/ShiftContext';
import { formatMongolianDate, getDaysInMonth, formatDate } from '../../utils/dateUtils';
import { ShiftAssignment } from '../../types';

interface EditShiftModalProps {
  isOpen: boolean;
  dateStr: string | null;
  onClose: () => void;
}

export const EditShiftModal: React.FC<EditShiftModalProps> = ({
  isOpen,
  dateStr,
  onClose,
}) => {
  const {
    shifts,
    employees,
    groups,
    updateShift,
    swapDates,
    settings,
    selectedYear,
    selectedMonth,
  } = useShifts();

  const [isDayOff, setIsDayOff] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [hours, setHours] = useState(12);
  const [note, setNote] = useState('');

  // Date swap sub-mode
  const [showSwapPicker, setShowSwapPicker] = useState(false);
  const [swapTargetDate, setSwapTargetDate] = useState<string>('');

  useEffect(() => {
    if (!dateStr) return;
    const currentShift = shifts[dateStr];
    if (currentShift) {
      setIsDayOff(!!currentShift.isDayOff);
      setSelectedGroupId(currentShift.groupId || null);
      setSelectedEmpIds(currentShift.employeeIds || []);
      setHours(currentShift.hours || settings.defaultHoursPerShift);
      setNote(currentShift.note || '');
    } else {
      setIsDayOff(false);
      setSelectedGroupId(null);
      setSelectedEmpIds([]);
      setHours(settings.defaultHoursPerShift);
      setNote('');
    }
    setShowSwapPicker(false);
    setSwapTargetDate('');
  }, [dateStr, shifts, settings]);

  if (!isOpen || !dateStr) return null;

  // Days in month for date swapping
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const monthDates = Array.from({ length: daysInMonth }, (_, i) =>
    formatDate(selectedYear, selectedMonth, i + 1)
  ).filter((d) => d !== dateStr);

  const handleGroupSelect = (groupId: string | null) => {
    setSelectedGroupId(groupId);
    if (groupId) {
      const grp = groups.find((g) => g.id === groupId);
      if (grp) {
        // Auto-select members of the group
        setSelectedEmpIds(grp.memberIds);
      }
    }
  };

  const toggleEmployee = (empId: string) => {
    setSelectedEmpIds((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId]
    );
  };

  const handleSave = () => {
    const updated: Partial<ShiftAssignment> = {
      isDayOff,
      groupId: isDayOff ? null : selectedGroupId,
      employeeIds: isDayOff ? [] : selectedEmpIds,
      hours: isDayOff ? 0 : Number(hours),
      note: note.trim(),
    };
    updateShift(dateStr, updated);
    onClose();
  };

  const handleExecuteSwap = () => {
    if (swapTargetDate) {
      swapDates(dateStr, swapTargetDate);
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
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Ээлжийн хуваарь засах
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {formatMongolianDate(dateStr)}
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

        {/* Content Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Day off toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Coffee className={`w-5 h-5 ${isDayOff ? 'text-amber-600' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Бүх нийтийн / Ажлын байрны амралтын өдөр
                </span>
                <span className="text-[11px] text-slate-500">
                  Энэ өдөр ээлж гарахгүй, амралт болгох
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDayOff}
                onChange={(e) => setIsDayOff(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {!isDayOff && (
            <>
              {/* Group Quick Select */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Ажиллах баг сонгох</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGroupSelect(null)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer text-left ${
                      selectedGroupId === null
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Сонгоогүй (Гараар сонгох)</span>
                  </button>

                  {groups.map((group) => {
                    const isSelected = selectedGroupId === group.id;
                    return (
                      <button
                        type="button"
                        key={group.id}
                        onClick={() => handleGroupSelect(group.id)}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                          <span>{group.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Employee Selection Chips */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Ажиллах ажилтнууд ({selectedEmpIds.length} сонгогдсон)</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Олон хүн зэрэг сонгож болно
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {employees.map((emp) => {
                    const isSelected = selectedEmpIds.includes(emp.id);
                    return (
                      <div
                        key={emp.id}
                        onClick={() => toggleEmployee(emp.id)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs font-medium cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-500 shadow-2xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: emp.color }}
                          />
                          <span className="font-semibold text-slate-800">
                            {emp.name}
                          </span>
                          {emp.status === 'on_leave' && (
                            <span className="text-[10px] text-amber-700 font-semibold">
                              (Чөлөөтэй)
                            </span>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shift Hours */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Ээлжийн үргэлжлэх хугацаа (цаг)</span>
                </label>
                <div className="flex items-center gap-2">
                  {[8, 12, 24].map((h) => (
                    <button
                      type="button"
                      key={h}
                      onClick={() => setHours(h)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        hours === h
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {h} цаг
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-center"
                    placeholder="Дурын"
                  />
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Тэмдэглэл / Шалтгаан</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Жишээ: Орлон ажилласан, цагийн солилцоо, амралт..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Date Swapping section */}
          <div className="pt-3 border-t border-slate-100">
            {!showSwapPicker ? (
              <button
                type="button"
                onClick={() => setShowSwapPicker(true)}
                className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-blue-400 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                <span>Өөр өдрийн хуваарьтай сэлгэх (Swap)</span>
              </button>
            ) : (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Сэлгэх өдрийг сонгох:</span>
                  <button
                    type="button"
                    onClick={() => setShowSwapPicker(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
                  >
                    Буцах
                  </button>
                </div>

                <select
                  value={swapTargetDate}
                  onChange={(e) => setSwapTargetDate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="" disabled>
                    -- Сэлгэх өдрийг сонгоно уу --
                  </option>
                  {monthDates.map((d) => {
                    const shift = shifts[d];
                    const names = (shift?.employeeIds || [])
                      .map((id) => employees.find((e) => e.id === id)?.name)
                      .filter(Boolean)
                      .join(', ');
                    return (
                      <option key={d} value={d}>
                        {d} ({shift?.isDayOff ? 'Амралт' : names || 'Хуваарилагдаагүй'})
                      </option>
                    );
                  })}
                </select>

                {swapTargetDate && (
                  <button
                    type="button"
                    onClick={handleExecuteSwap}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Энэ 2 өдрийн хуваарийг шууд сэлгэх
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Болих
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Өөрчлөлтийг хадгалах</span>
          </button>
        </div>
      </div>
    </div>
  );
};
