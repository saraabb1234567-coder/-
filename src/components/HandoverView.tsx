import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { HandoverRecord, HandoverShiftType } from '../types';
import { getTodayString, formatMongolianDate } from '../utils/dateUtils';
import { calculateLateness } from '../utils/calculations';

export const HandoverView: React.FC = () => {
  const {
    handovers,
    addHandover,
    updateHandover,
    verifyHandover,
    employees,
    settings,
  } = useShifts();

  const todayStr = getTodayString();
  const [filterShift, setFilterShift] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Handover form state
  const [formDate, setFormDate] = useState(todayStr);
  const [formShiftType, setFormShiftType] = useState<HandoverShiftType>('day');
  const [formScheduledTime, setFormScheduledTime] = useState(settings.dayShiftHandoverTime || '09:00');
  const [formActualTime, setFormActualTime] = useState('09:00');
  const [formIncomingEmpId, setFormIncomingEmpId] = useState(employees[0]?.id || '');
  const [formOutgoingEmpId, setFormOutgoingEmpId] = useState(employees[1]?.id || '');
  const [formIsHandedOver, setFormIsHandedOver] = useState(true);
  const [formIsAbsent, setFormIsAbsent] = useState(false);
  const [formNote, setFormNote] = useState('');

  const activeEmployees = employees.filter((e) => e.status !== 'inactive');

  const handleShiftTypeChange = (type: HandoverShiftType) => {
    setFormShiftType(type);
    const defaultTime = type === 'day' ? settings.dayShiftHandoverTime : settings.nightShiftHandoverTime;
    setFormScheduledTime(defaultTime);
    setFormActualTime(defaultTime);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addHandover({
      date: formDate,
      shiftType: formShiftType,
      scheduledTime: formScheduledTime,
      actualTime: formActualTime,
      incomingEmployeeId: formIncomingEmpId,
      outgoingEmployeeId: formOutgoingEmpId,
      isHandedOver: formIsHandedOver,
      latenessMinutes: calculateLateness(formScheduledTime, formActualTime),
      isAbsent: formIsAbsent,
      note: formNote.trim(),
      verifiedByAdmin: false,
    });
    setShowAddModal(false);
    setFormNote('');
  };

  // Filtered handovers
  const filteredHandovers = handovers.filter((h) => {
    const matchesShift = filterShift === 'all' || h.shiftType === filterShift;
    const matchesDate = !filterDate || h.date === filterDate;

    const inEmp = employees.find((e) => e.id === h.incomingEmployeeId)?.name || '';
    const outEmp = employees.find((e) => e.id === h.outgoingEmployeeId)?.name || '';
    const matchesQuery =
      inEmp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outEmp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.note && h.note.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesShift && matchesDate && matchesQuery;
  });

  // KPI summaries
  const dayHandoversCount = handovers.filter((h) => h.shiftType === 'day').length;
  const nightHandoversCount = handovers.filter((h) => h.shiftType === 'night').length;
  const lateHandoversCount = handovers.filter((h) => h.latenessMinutes > 0).length;
  const verifiedCount = handovers.filter((h) => h.verifiedByAdmin).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Ээлж хүлээлцэх цагийн бүртгэл
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              Өдөр: {settings.dayShiftHandoverTime} • Орой: {settings.nightShiftHandoverTime}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Өдрийн болон оройн ээлжийн ирсэн цаг, хүлээлцэлт, хоцролтыг тус бүртгэн админ баталгаажуулна
          </p>
        </div>

        <button
          onClick={() => {
            handleShiftTypeChange('day');
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Шинэ хүлээлцэлт бүртгэх</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ӨДРИЙН ЭЭЛЖ (09:00)</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{dayHandoversCount}</div>
          <p className="text-xs text-slate-500 mt-1">Хүлээлцсэн өдрийн ээлж</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ОРОЙН ЭЭЛЖ (20:30)</span>
            <Moon className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{nightHandoversCount}</div>
          <p className="text-xs text-slate-500 mt-1">Хүлээлцсэн оройн ээлж</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ХОЦРОЛТТОЙ ИРСЭН</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{lateHandoversCount}</div>
          <p className="text-xs text-slate-500 mt-1">Хуваарьт цагаас хоцорсон тохиолдол</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>БААТАЛГААЖСАН БҮРТГЭЛ</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{verifiedCount}</div>
          <p className="text-xs text-slate-500 mt-1">Админ шалгасан хүлээлцэлт</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ажилтны нэрээр хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Shift Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterShift('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterShift === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Бүгд
            </button>
            <button
              onClick={() => setFilterShift('day')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                filterShift === 'day'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-500" />
              <span>Өдөр (09:00)</span>
            </button>
            <button
              onClick={() => setFilterShift('night')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                filterShift === 'night'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3 h-3 text-indigo-500" />
              <span>Орой (20:30)</span>
            </button>
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
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

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Огноо</th>
                <th className="py-3 px-4">Ээлж</th>
                <th className="py-3 px-4">Төлөвлөсөн</th>
                <th className="py-3 px-4">Бодит цаг</th>
                <th className="py-3 px-4">Хүлээн авсан</th>
                <th className="py-3 px-4">Хүлээлгэн өгсөн</th>
                <th className="py-3 px-4 text-center">Хүлээлцсэн?</th>
                <th className="py-3 px-4 text-center">Хоцролт</th>
                <th className="py-3 px-4">Тайлбар</th>
                <th className="py-3 px-4 text-right">Баталгаажуулалт</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHandovers.map((h) => {
                const inEmp = employees.find((e) => e.id === h.incomingEmployeeId);
                const outEmp = employees.find((e) => e.id === h.outgoingEmployeeId);
                const isLate = h.latenessMinutes > 0;

                return (
                  <tr
                    key={h.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isLate ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {/* Date */}
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {h.date}
                    </td>

                    {/* Shift */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {h.shiftType === 'day' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <Sun className="w-3 h-3 text-amber-600" />
                          Өдөр (09:00)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          <Moon className="w-3 h-3 text-indigo-600" />
                          Орой (20:30)
                        </span>
                      )}
                    </td>

                    {/* Scheduled Time */}
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {h.scheduledTime}
                    </td>

                    {/* Actual Time */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {h.actualTime}
                    </td>

                    {/* Incoming Employee */}
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {inEmp ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: inEmp.color }}
                          />
                          <span>{inEmp.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Outgoing Employee */}
                    <td className="py-3 px-4 text-slate-600">
                      {outEmp ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: outEmp.color }}
                          />
                          <span>{outEmp.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Handed over checkbox */}
                    <td className="py-3 px-4 text-center">
                      {h.isHandedOver ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Хүлээлцсэн
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                          <X className="w-3.5 h-3.5 text-slate-400" />
                          Үгүй
                        </span>
                      )}
                    </td>

                    {/* Lateness */}
                    <td className="py-3 px-4 text-center">
                      {isLate ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                          +{h.latenessMinutes} мин
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Яг цагтаа</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {h.note || '-'}
                    </td>

                    {/* Admin Verification action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {h.verifiedByAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Баталгаажсан
                        </span>
                      ) : (
                        <button
                          onClick={() => verifyHandover(h.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Баталгаажуулах</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Handover Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Ээлж хүлээлцэх бүртгэл нэмэх
                  </h3>
                  <p className="text-xs text-slate-500">
                    Өдөр (09:00) эсвэл Орой (20:30) ээлж
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Date & Shift Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Огноо:</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Ээлжийн төрөл:</label>
                  <select
                    value={formShiftType}
                    onChange={(e) => handleShiftTypeChange(e.target.value as HandoverShiftType)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="day">Өдрийн ээлж (09:00)</option>
                    <option value="night">Оройн ээлж (20:30)</option>
                  </select>
                </div>
              </div>

              {/* Scheduled Time & Actual Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Төлөвлөсөн цаг:</label>
                  <input
                    type="time"
                    required
                    value={formScheduledTime}
                    onChange={(e) => setFormScheduledTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Бодитоор ирсэн цаг:</label>
                  <input
                    type="time"
                    required
                    value={formActualTime}
                    onChange={(e) => setFormActualTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Lateness notice */}
              {calculateLateness(formScheduledTime, formActualTime) > 0 && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Хоцролт: {calculateLateness(formScheduledTime, formActualTime)} минут автоматаар тооцогдоно
                  </span>
                </div>
              )}

              {/* Incoming Employee & Outgoing Employee */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Хүлээн авсан (Ирсэн):</label>
                  <select
                    value={formIncomingEmpId}
                    onChange={(e) => setFormIncomingEmpId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    {activeEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Хүлээлгэн өгсөн:</label>
                  <select
                    value={formOutgoingEmpId}
                    onChange={(e) => setFormOutgoingEmpId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    {activeEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsHandedOver}
                    onChange={(e) => setFormIsHandedOver(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span>Ээлжийг хэвийн хүлээлцсэн эсэх</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-rose-700">
                  <input
                    type="checkbox"
                    checked={formIsAbsent}
                    onChange={(e) => setFormIsAbsent(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded border-slate-300"
                  />
                  <span>Ээлж тасалсан эсэх</span>
                </label>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Тайлбар / Журнал:</label>
                <textarea
                  rows={2}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Ээлжийн явц, онцлох үйл явдлын тэмдэглэл..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
