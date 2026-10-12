import React, { useState, useEffect } from 'react';
import { X, User, Phone, Tag, Save, Palette } from 'lucide-react';
import { useShifts } from '../../context/ShiftContext';
import { Employee, EmployeeStatus } from '../../types';

interface EmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null; // null for new employee
  onClose: () => void;
}

const PRESET_COLORS = [
  '#2563eb', // Blue
  '#0d9488', // Teal
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#e11d48', // Rose
  '#059669', // Emerald
  '#0284c7', // Sky
  '#ea580c', // Orange
  '#4f46e5', // Indigo
  '#db2777', // Pink
];

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  employee,
  onClose,
}) => {
  const { addEmployee, updateEmployee, groups } = useShifts();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [groupId, setGroupId] = useState<string>('');
  const [status, setStatus] = useState<EmployeeStatus>('active');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [baseSalary, setBaseSalary] = useState<number>(2000000);
  const [hourlyRate, setHourlyRate] = useState<number>(12000);
  const [calculationType, setCalculationType] = useState<any>('monthly');

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setRole(employee.role || '');
      setColor(employee.color || PRESET_COLORS[0]);
      setGroupId(employee.groupId || '');
      setStatus(employee.status);
      setPhone(employee.phone || '');
      setNotes(employee.notes || '');
      setBaseSalary(employee.salaryConfig?.baseSalary || 2000000);
      setHourlyRate(employee.salaryConfig?.hourlyRate || 12000);
      setCalculationType(employee.salaryConfig?.calculationType || 'monthly');
    } else {
      setName('');
      setRole('Ээлжийн ажилтан');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setGroupId('');
      setStatus('active');
      setPhone('');
      setNotes('');
      setBaseSalary(2000000);
      setHourlyRate(12000);
      setCalculationType('monthly');
    }
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const salaryConfig = {
      calculationType,
      baseSalary: Number(baseSalary),
      hourlyRate: Number(hourlyRate),
      dailyRate: Math.round(Number(baseSalary) / 15),
      overtimeMultiplier: 1.5,
      standardBonus: employee?.salaryConfig?.standardBonus || 0,
      standardDeductions: employee?.salaryConfig?.standardDeductions || 0,
    };

    if (employee) {
      updateEmployee(employee.id, {
        name: name.trim(),
        role: role.trim(),
        color,
        groupId: groupId || null,
        status,
        phone: phone.trim(),
        notes: notes.trim(),
        salaryConfig,
      });
    } else {
      addEmployee({
        name: name.trim(),
        role: role.trim(),
        color,
        groupId: groupId || null,
        status,
        phone: phone.trim(),
        notes: notes.trim(),
        salaryConfig,
      });
    }
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
              style={{ backgroundColor: color }}
            >
              {name ? name.slice(0, 1) : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {employee ? 'Ажилтны мэдээлэл засах' : 'Шинэ ажилтан бүртгэх'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {employee ? employee.name : 'Ээлжийн бүрэлдэхүүнд нэмэх'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Ажилтны нэр: *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Жишээ: Гэрлээ, Батдэлгэр..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Албан тушаал / Үүрэг:
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Жишээ: Ээлжийн ахлагч, оператор..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Group and Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Хамаарах баг:
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="">Баггүй (Сул)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Төлөв:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="active">Идэвхтэй</option>
                <option value="on_leave">Чөлөөтэй</option>
                <option value="inactive">Идэвхгүй</option>
              </select>
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <span>Таних өнгө:</span>
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-115 ring-2 ring-blue-600 ring-offset-2' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Утасны дугаар:
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Жишээ: 9911-2233"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Тэмдэглэл:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Нэмэлт тайлбар, өөрчлөлтийн тэмдэглэл..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-500"
            />
          </div>

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
              <Save className="w-4 h-4" />
              <span>{employee ? 'Хадгалах' : 'Нэмэх'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
