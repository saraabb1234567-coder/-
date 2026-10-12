import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ArrowLeftRight,
  Users,
  ShieldCheck,
  UserCheck,
  Info,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { WorkingGroup } from '../types';

interface GroupManagementProps {
  onOpenAddGroupModal: () => void;
  onOpenEditGroupModal: (group: WorkingGroup) => void;
}

export const GroupManagement: React.FC<GroupManagementProps> = ({
  onOpenAddGroupModal,
  onOpenEditGroupModal,
}) => {
  const {
    groups,
    employees,
    deleteGroup,
    swapTwoGroups,
    assignEmployeeToGroup,
  } = useShifts();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Employees without any group
  const unassignedEmployees = employees.filter((e) => !e.groupId);

  const handleSwap = () => {
    if (groups.length >= 2) {
      swapTwoGroups(groups[0].id, groups[1].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Ээлжийн багийн тохиргоо
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Хосоор ээлжлэн ажиллах багуудыг үүсгэх, гишүүдийг хуваарилах болон багуудын дарааллыг солих
          </p>
        </div>

        <div className="flex items-center gap-2">
          {groups.length >= 2 && (
            <button
              onClick={handleSwap}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Баг А ба Баг Б-ийн гишүүдийг хооронд нь солих"
            >
              <ArrowLeftRight className="w-4 h-4 text-blue-600" />
              <span>Багуудын хосыг сэлгэх</span>
            </button>
          )}

          <button
            onClick={onOpenAddGroupModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Шинэ баг нэмэх</span>
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {groups.map((group, index) => {
          const memberEmployees = group.memberIds
            .map((id) => employees.find((e) => e.id === id))
            .filter(Boolean);

          return (
            <div
              key={group.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: group.color }}
                    >
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">
                          {group.name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                          {memberEmployees.length} гишүүнтэй
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {group.description || 'Ээлжийн ажилтны хос баг'}
                      </p>
                    </div>
                  </div>

                  {/* Top Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditGroupModal(group)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                      title="Багийн нэр, өнгө засах"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {confirmDeleteId === group.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-md border border-rose-200">
                        <span className="text-[10px] text-rose-700 font-bold px-1">
                          Устгах уу?
                        </span>
                        <button
                          onClick={() => {
                            deleteGroup(group.id);
                            setConfirmDeleteId(null);
                          }}
                          className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold hover:bg-rose-700"
                        >
                          Тийм
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[10px] text-slate-600 hover:bg-slate-200 px-1 py-0.5 rounded"
                        >
                          Үгүй
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(group.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Багийг устгах"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Members list */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-600 block mb-2.5">
                    Багийн бүрэлдэхүүн:
                  </span>

                  <div className="space-y-2">
                    {memberEmployees.map((member) =>
                      member ? (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: member.color }}
                            />
                            <span className="font-bold text-slate-800">
                              {member.name}
                            </span>
                            <span className="text-slate-500 font-medium">
                              ({member.role || 'Ажилтан'})
                            </span>
                            {member.status === 'on_leave' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                Чөлөөтэй
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => assignEmployeeToGroup(member.id, null)}
                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                          >
                            Багаас хасах
                          </button>
                        </div>
                      ) : null
                    )}

                    {memberEmployees.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-400 italic bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                        Одоогоор энэ багт гишүүн хуваарилагдаагүй байна.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Add unassigned member directly to this group */}
              {unassignedEmployees.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Чөлөөт ажилтан нэмэх:</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        assignEmployeeToGroup(e.target.value, group.id);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md font-semibold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
                  >
                    <option value="" disabled>
                      + Ажилтан сонгох
                    </option>
                    {unassignedEmployees.map((ue) => (
                      <option key={ue.id} value={ue.id}>
                        {ue.name} ({ue.status === 'on_leave' ? 'Чөлөөтэй' : 'Идэвхтэй'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unassigned / On Leave Employees Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-slate-900 text-sm">
            Багт хамаараагүй болон чөлөөтэй ажилтнууд
          </h3>
        </div>

        {unassignedEmployees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {unassignedEmployees.map((emp) => (
              <div
                key={emp.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: emp.color }}
                  />
                  <div>
                    <span className="font-bold text-slate-800">{emp.name}</span>
                    <span className="text-slate-400 block text-[10px]">
                      {emp.status === 'on_leave' ? 'Одоогоор чөлөөтэй' : 'Сул ажилтан'}
                    </span>
                  </div>
                </div>

                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      assignEmployeeToGroup(emp.id, e.target.value);
                    }
                  }}
                  defaultValue=""
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-semibold text-blue-700 cursor-pointer"
                >
                  <option value="" disabled>
                    Багт оруулах
                  </option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Бүх ажилтан багт хуваарилагдсан байна.
          </p>
        )}
      </div>
    </div>
  );
};
