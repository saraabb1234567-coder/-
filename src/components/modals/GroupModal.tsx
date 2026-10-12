import React, { useState, useEffect } from 'react';
import { X, Layers, Save, Palette, Users } from 'lucide-react';
import { useShifts } from '../../context/ShiftContext';
import { WorkingGroup } from '../../types';

interface GroupModalProps {
  isOpen: boolean;
  group: WorkingGroup | null;
  onClose: () => void;
}

const GROUP_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
];

export const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  group,
  onClose,
}) => {
  const { addGroup, updateGroup, employees } = useShifts();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(GROUP_COLORS[0]);
  const [memberIds, setMemberIds] = useState<string[]>([]);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setColor(group.color);
      setMemberIds(group.memberIds);
    } else {
      setName('');
      setDescription('');
      setColor(GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)]);
      setMemberIds([]);
    }
  }, [group, isOpen]);

  if (!isOpen) return null;

  const toggleMember = (empId: string) => {
    setMemberIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (group) {
      updateGroup(group.id, {
        name: name.trim(),
        description: description.trim(),
        color,
        memberIds,
      });
    } else {
      addGroup({
        name: name.trim(),
        description: description.trim(),
        color,
        memberIds,
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
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {group ? 'Багийн тохиргоо засах' : 'Шинэ баг үүсгэх'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {group ? group.name : 'Ээлжийн шинэ хос бүлэг'}
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
              Багийн нэр: *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Жишээ: Баг А, Баг Б, Өдрийн ээлж..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Тайлбар:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Жишээ: Үндсэн 1-р ээлжийн хос"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <span>Багийн таних өнгө:</span>
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {GROUP_COLORS.map((c) => (
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

          {/* Members Multi-select */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Багийн гишүүд ({memberIds.length})</span>
              </span>
              <span className="text-[11px] font-normal text-slate-500">
                Сонгосон ажилтнууд энэ багт орно
              </span>
            </label>

            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
              {employees.map((emp) => {
                const isMember = memberIds.includes(emp.id);
                return (
                  <label
                    key={emp.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-white transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: emp.color }}
                      />
                      <span className="font-semibold text-slate-800">{emp.name}</span>
                      <span className="text-slate-400">({emp.role || 'Ажилтан'})</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isMember}
                      onChange={() => toggleMember(emp.id)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                  </label>
                );
              })}
            </div>
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
              <span>{group ? 'Хадгалах' : 'Үүсгэх'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
