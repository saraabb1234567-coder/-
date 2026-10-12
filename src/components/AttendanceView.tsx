import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  Plus,
  Moon,
  Sun,
  Edit2,
  X,
  Search,
  Filter,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { AttendanceRecord } from '../types';
import { calculateWorkedHours } from '../utils/calculations';
import { getTodayString } from '../utils/dateUtils';

export const AttendanceView: React.FC = () => {
  const {
    attendance,
    employees,
    addAttendance,
    updateAttendance,
    toggleApproveAttendance,
  } = useShifts();

  const todayStr = getTodayString();
  const [searchEmp, setSearchEmp] = useState('');
  const [filterApproved, setFilterApproved] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [empId, setEmpId] = useState(employees[0]?.id || '');
  const [recordDate, setRecordDate] = useState(todayStr);
  const [shiftType, setShiftType] = useState<'day' | 'night' | 'custom'>('day');
  const [startDateTime, setStartDateTime] = useState(`${todayStr}T09:00`);
  const [endDateTime, setEndDateTime] = useState(`${todayStr}T20:30`);
  const [plannedHours, setPlannedHours] = useState(12);
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [latenessMinutes, setLatenessMinutes] = useState(0);
  const [isAbsent, setIsAbsent] = useState(false);
  const [note, setNote] = useState('');

  const activeEmployees = employees.filter((e) => e.status !== 'inactive');

  const openAdd = () => {
    setEmpId(employees[0]?.id || '');
    setRecordDate(todayStr);
    setShiftType('day');
    setStartDateTime(`${todayStr}T09:00`);
    setEndDateTime(`${todayStr}T20:30`);
    setPlannedHours(12);
    setBreakMinutes(30);
    setOvertimeHours(0);
    setLatenessMinutes(0);
    setIsAbsent(false);
    setNote('');
    setShowAddModal(true);
  };

  const openEdit = (rec: AttendanceRecord) => {
    setEditRecord(rec);
    setEmpId(rec.employeeId);
    setRecordDate(rec.date);
    setShiftType(rec.shiftType);
    setStartDateTime(rec.startDateTime);
    setEndDateTime(rec.endDateTime);
    setPlannedHours(rec.plannedHours);
    setBreakMinutes(rec.breakMinutes);
    setOvertimeHours(rec.overtimeHours);
    setLatenessMinutes(rec.latenessMinutes);
    setIsAbsent(rec.isAbsent);
    setNote(rec.note || '');
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const { actualHours } = calculateWorkedHours(startDateTime, endDateTime, breakMinutes);

    if (editRecord) {
      updateAttendance(editRecord.id, {
        employeeId: empId,
        date: recordDate,
        shiftType,
        startDateTime,
        endDateTime,
        plannedHours: Number(plannedHours),
        breakMinutes: Number(breakMinutes),
        overtimeHours: Number(overtimeHours),
        latenessMinutes: Number(latenessMinutes),
        isAbsent,
        note: note.trim(),
        approvedHours: editRecord.isApproved ? editRecord.approvedHours : actualHours,
      });
    } else {
      addAttendance({
        employeeId: empId,
        date: recordDate,
        shiftType,
        startDateTime,
        endDateTime,
        plannedHours: Number(plannedHours),
        actualHours,
        breakMinutes: Number(breakMinutes),
        approvedHours: actualHours,
        overtimeHours: Number(overtimeHours),
        latenessMinutes: Number(latenessMinutes),
        isAbsent,
        isApproved: false,
        note: note.trim(),
      });
    }

    setShowAddModal(false);
    setEditRecord(null);
  };

  // Filtered list
  const filteredList = attendance.filter((a) => {
    const emp = employees.find((e) => e.id === a.employeeId);
    const matchesEmp =
      !searchEmp || (emp && emp.name.toLowerCase().includes(searchEmp.toLowerCase()));
    const matchesDate = !filterDate || a.date === filterDate;
    const matchesApproved =
      filterApproved === 'all'
        ? true
        : filterApproved === 'approved'
        ? a.isApproved
        : !a.isApproved;

    return matchesEmp && matchesDate && matchesApproved;
  });

  // KPI calculations
  const totalApprovedHours = attendance
    .filter((a) => a.isApproved)
    .reduce((s, a) => s + (a.approvedHours || 0), 0);
  const totalActualHours = attendance.reduce((s, a) => s + (a.actualHours || 0), 0);
  const totalOvertime = attendance.reduce((s, a) => s + (a.overtimeHours || 0), 0);
  const overnightCount = attendance.filter((a) => {
    const { isOvernight } = calculateWorkedHours(a.startDateTime, a.endDateTime);
    return isOvernight;
  }).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Ажилласан цаг ба ирцийн бүртгэл
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Бодит эхэлсэн, дууссан цаг, шөнө дамжсан ээлжүүд болон баталгаажсан цагийн нэгтгэл
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Цагийн бүртгэл нэмэх</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            БААТАЛГААЖСАН ЦАГ
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalApprovedHours}</span>
            <span className="text-xs text-slate-500">цаг</span>
          </div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Цалин бодолтод шууд орно</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            БОДИТ АЖИЛЛАСАН ЦАГ
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{Math.round(totalActualHours * 10) / 10}</span>
            <span className="text-xs text-slate-500">цаг</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Нийт бүртгэгдсэн бодит цаг</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            НИЙТ ИЛҮҮ ЦАГ
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">+{totalOvertime}</span>
            <span className="text-xs text-slate-500">цаг</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">1.5x үржүүлэгчээр тооцогдоно</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            ШӨНӨ ДАМЖСАН ЭЭЛЖ
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">{overnightCount}</span>
            <span className="text-xs text-slate-500">ээлж</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">20:30-аас дараа өдрийн 09:00 хүртэл</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ажилтны нэрээр хайх..."
            value={searchEmp}
            onChange={(e) => setSearchEmp(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterApproved}
            onChange={(e) => setFilterApproved(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="all">Бүх төлөв ({attendance.length})</option>
            <option value="approved">Баталгаажсан ({attendance.filter((a) => a.isApproved).length})</option>
            <option value="unapproved">Баталгаажаагүй ({attendance.filter((a) => !a.isApproved).length})</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium cursor-pointer"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Цэвэрлэх
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Огноо</th>
                <th className="py-3 px-4">Ажилтан</th>
                <th className="py-3 px-4">Ээлж</th>
                <th className="py-3 px-4">Эхэлсэн / Дууссан цаг</th>
                <th className="py-3 px-4 text-center">Бодит цаг</th>
                <th className="py-3 px-4 text-center">Завсарлага</th>
                <th className="py-3 px-4 text-center">Илүү цаг</th>
                <th className="py-3 px-4 text-center">Баталгаажсан</th>
                <th className="py-3 px-4">Төлөв</th>
                <th className="py-3 px-4 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((rec) => {
                const emp = employees.find((e) => e.id === rec.employeeId);
                const { isOvernight } = calculateWorkedHours(rec.startDateTime, rec.endDateTime);

                const startTimeFormatted = rec.startDateTime.replace('T', ' ');
                const endTimeFormatted = rec.endDateTime.replace('T', ' ');

                return (
                  <tr
                    key={rec.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      rec.isApproved ? '' : 'bg-amber-50/15'
                    }`}
                  >
                    {/* Date */}
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {rec.date}
                    </td>

                    {/* Employee */}
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {emp ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: emp.color }}
                          />
                          <span>{emp.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Shift type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isOvernight ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Moon className="w-3 h-3 text-indigo-600" />
                          Шөнө дамжсан
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                          <Sun className="w-3 h-3 text-amber-500" />
                          Өдрийн ээлж
                        </span>
                      )}
                    </td>

                    {/* Start / End Datetime */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      <div>{startTimeFormatted}</div>
                      <div className="text-slate-400">→ {endTimeFormatted}</div>
                    </td>

                    {/* Actual Hours */}
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {rec.actualHours}ц
                    </td>

                    {/* Break */}
                    <td className="py-3 px-4 text-center text-slate-500">
                      {rec.breakMinutes} мин
                    </td>

                    {/* Overtime */}
                    <td className="py-3 px-4 text-center">
                      {rec.overtimeHours > 0 ? (
                        <span className="font-bold text-amber-600">+{rec.overtimeHours}ц</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Approved Hours */}
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">
                      {rec.isApproved ? `${rec.approvedHours}ц` : '-'}
                    </td>

                    {/* Approval Lock Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {rec.isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Lock className="w-3 h-3" />
                          Баталгаажсан
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800">
                          <Unlock className="w-3 h-3" />
                          Хүлээгдэж буй
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleApproveAttendance(rec.id)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            rec.isApproved
                              ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={rec.isApproved ? 'Баталгаажуулалтыг цуцлах' : 'Баталгаажуулах'}
                        >
                          {rec.isApproved ? <Unlock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => openEdit(rec)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Засах"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editRecord ? 'Ажилласан цаг засах' : 'Цагийн бүртгэл нэмэх'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Эхлэх болон дуусах огноо, цагийг тохируулах (Шөнө дамнах боломжтой)
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditRecord(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Employee and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Ажилтан:</label>
                  <select
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    {activeEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Огноо:</label>
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Start Datetime & End Datetime */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Эхэлсэн (Огноо ба цаг):
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Дууссан (Огноо ба цаг):
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Hours calculation preview */}
              {startDateTime && endDateTime && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
                  <span>
                    Бодит ажилласан хугацаа: <strong>{calculateWorkedHours(startDateTime, endDateTime, breakMinutes).actualHours} цаг</strong>
                  </span>
                  {calculateWorkedHours(startDateTime, endDateTime, breakMinutes).isOvernight && (
                    <span className="font-bold text-indigo-700 flex items-center gap-1">
                      <Moon className="w-3 h-3" /> Шөнө дамжсан
                    </span>
                  )}
                </div>
              )}

              {/* Break minutes & Overtime */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Завсарлага (минут):</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Илүү цаг (цагаар):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Тэмдэглэл:</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Жишээ: Ээлжийн солилцоо, орлон ажилласан..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditRecord(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Хадгалах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
