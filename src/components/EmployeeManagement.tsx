import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Coffee,
  Power,
  Trash2,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { Employee, EmployeeStatus } from '../types';

interface EmployeeManagementProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (emp: Employee) => void;
  onOpenAssignDateModal: (emp: Employee) => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  onOpenAddModal,
  onOpenEditModal,
  onOpenAssignDateModal,
}) => {
  const {
    employees,
    groups,
    toggleEmployeeStatus,
    assignEmployeeToGroup,
    hasShiftHistory,
    monthlyStats,
  } = useShifts();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deactivateNotice, setDeactivateNotice] = useState<string | null>(null);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.role && emp.role.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      filterStatus === 'all' ? true : emp.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleLeaveToggle = (emp: Employee) => {
    if (emp.status === 'on_leave') {
      // Restore to active
      toggleEmployeeStatus(emp.id, 'active');
    } else {
      // Set to on_leave
      toggleEmployeeStatus(emp.id, 'on_leave');
    }
  };

  const handleActiveToggle = (emp: Employee) => {
    if (emp.status === 'inactive') {
      toggleEmployeeStatus(emp.id, 'active');
    } else {
      // If user tries to deactivate, check history and notify
      if (hasShiftHistory(emp.id)) {
        setDeactivateNotice(
          `"${emp.name}" ажилтанд ээлжийн хуваарийн бүртгэл байгаа тул түүхийг хадгалах үүднээс "Идэвхгүй" төлөвт шилжүүллээ.`
        );
      }
      toggleEmployeeStatus(emp.id, 'inactive');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Ажилтнуудын удирдлага
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ажилтны мэдээлэл засах, ээлжийн багт хуваарилах, чөлөө олгох болон ээлж томилох
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Шинэ ажилтан нэмэх</span>
        </button>
      </div>

      {/* History Deactivation Notice banner if triggered */}
      {deactivateNotice && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-amber-800 text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{deactivateNotice}</span>
          </div>
          <button
            onClick={() => setDeactivateNotice(null)}
            className="font-bold text-amber-900 hover:underline cursor-pointer ml-4"
          >
            Хаах
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Нэрээр хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Төлөв:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
          >
            <option value="all">Бүх ажилтан ({employees.length})</option>
            <option value="active">
              Идэвхтэй ({employees.filter((e) => e.status === 'active').length})
            </option>
            <option value="on_leave">
              Чөлөөтэй ({employees.filter((e) => e.status === 'on_leave').length})
            </option>
            <option value="inactive">
              Идэвхгүй ({employees.filter((e) => e.status === 'inactive').length})
            </option>
          </select>
        </div>
      </div>

      {/* Employee List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const group = groups.find((g) => g.id === emp.groupId);
          const stat = monthlyStats.find((s) => s.employee.id === emp.id);
          const hasHistory = hasShiftHistory(emp.id);

          return (
            <div
              key={emp.id}
              className={`bg-white rounded-xl border p-5 shadow-2xs flex flex-col justify-between transition-all ${
                emp.status === 'inactive'
                  ? 'border-slate-200 bg-slate-50/70 opacity-75'
                  : emp.status === 'on_leave'
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-slate-200 hover:border-blue-200'
              }`}
            >
              <div>
                {/* Card Header: Avatar, Name, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl text-white font-bold text-base flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: emp.color }}
                    >
                      {emp.name.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {emp.role || 'Ээлжийн ажилтан'}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {emp.status === 'active' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Идэвхтэй
                      </span>
                    )}
                    {emp.status === 'on_leave' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Coffee className="w-3 h-3" />
                        Чөлөөтэй
                      </span>
                    )}
                    {emp.status === 'inactive' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Идэвхгүй
                      </span>
                    )}
                  </div>
                </div>

                {/* Group Selector Dropdown */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Хамаарах баг:</span>
                  <select
                    value={emp.groupId || ''}
                    onChange={(e) =>
                      assignEmployeeToGroup(emp.id, e.target.value || null)
                    }
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md font-semibold text-slate-800 text-xs focus:outline-hidden cursor-pointer"
                  >
                    <option value="">Багт хуваарилагдаагүй</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stats quick overview */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                      Сарын ээлж
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {stat?.totalShifts || 0} удаа
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                      Ажилласан цаг
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {stat?.totalHours || 0} цаг
                    </span>
                  </div>
                </div>

                {/* Notes or phone */}
                {emp.notes && (
                  <p className="mt-2 text-xs text-slate-500 italic line-clamp-1">
                    "{emp.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  {/* Edit Info */}
                  <button
                    onClick={() => onOpenEditModal(emp)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                    title="Мэдээлэл засах"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Assign to Date */}
                  <button
                    onClick={() => onOpenAssignDateModal(emp)}
                    className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                    title="Тодорхой өдөрт ээлж томилох"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Leave / Restore toggle */}
                  <button
                    onClick={() => handleLeaveToggle(emp)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      emp.status === 'on_leave'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    {emp.status === 'on_leave' ? 'Ээлжинд оруулах' : 'Чөлөө олгох'}
                  </button>

                  {/* Active / Inactive toggle (Soft delete) */}
                  <button
                    onClick={() => handleActiveToggle(emp)}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      emp.status === 'inactive'
                        ? 'text-emerald-600 hover:bg-emerald-50'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title={
                      emp.status === 'inactive'
                        ? 'Идэвхжүүлэх'
                        : hasHistory
                        ? 'Идэвхгүй болгох (Түүх хадгалагдана)'
                        : 'Идэвхгүй болгох'
                    }
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
