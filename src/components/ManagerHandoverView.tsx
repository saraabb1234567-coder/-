import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  DollarSign,
  CreditCard,
  Lock,
  FileText,
  Search,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { ManagerHandoverRecord, HandoverShiftType } from '../types';
import { formatMNT } from '../utils/calculations';
import { getTodayString } from '../utils/dateUtils';

export const ManagerHandoverView: React.FC = () => {
  const {
    managerHandovers,
    addManagerHandover,
    confirmManagerHandover,
    deleteManagerHandover,
    employees,
    settings,
    cashDrawerRecords,
    posRecords,
  } = useShifts();

  const todayStr = getTodayString();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<ManagerHandoverRecord | null>(null);

  // Form State
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('21:00');
  const [shiftType, setShiftType] = useState<HandoverShiftType>('day');
  const [operatorEmployeeId, setOperatorEmployeeId] = useState(employees[0]?.id || '');
  const [managerName, setManagerName] = useState(settings.adminUsername || 'Батбаяр (ШТС Эрхлэгч)');
  const [cashAmount, setCashAmount] = useState<number>(3500000);
  const [posSlipsAmount, setPosSlipsAmount] = useState<number>(2800000);
  const [couponsAmount, setCouponsAmount] = useState<number>(0);
  const [safeDepositNumber, setSafeDepositNumber] = useState('Сейф №1 / Дугтуй #05');
  const [notes, setNotes] = useState('');

  // Total Handed
  const totalHandedOverall = managerHandovers.reduce((sum, h) => sum + h.totalHandedAmount, 0);
  const totalCashHanded = managerHandovers.reduce((sum, h) => sum + h.cashAmount, 0);
  const totalPosHanded = managerHandovers.reduce((sum, h) => sum + h.posSlipsAmount, 0);
  const confirmedCount = managerHandovers.filter((h) => h.isConfirmedByManager).length;

  const filteredHandovers = managerHandovers.filter((h) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const emp = employees.find((e) => e.id === h.operatorEmployeeId)?.name.toLowerCase() || '';
      return (
        h.receiptNumber.toLowerCase().includes(q) ||
        h.managerName.toLowerCase().includes(q) ||
        h.safeDepositNumber?.toLowerCase().includes(q) ||
        h.notes?.toLowerCase().includes(q) ||
        emp.includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setDate(todayStr);
    setTime(new Date().toTimeString().slice(0, 5));
    setShiftType('day');
    setOperatorEmployeeId(employees[0]?.id || '');
    setManagerName(settings.adminUsername || 'Батбаяр (ШТС Эрхлэгч)');

    // Pre-fill with today's latest drawer cash and pos if available
    const latestDrawer = cashDrawerRecords[0];
    const latestPosSum = posRecords.reduce((s, p) => s + p.totalAmount, 0);
    setCashAmount(latestDrawer ? latestDrawer.handedToManager : 3500000);
    setPosSlipsAmount(latestPosSum > 0 ? latestPosSum : 2800000);
    setCouponsAmount(0);
    setSafeDepositNumber(`Сейф №1 / Дугтуй #${managerHandovers.length + 1}`);
    setNotes('');
    setShowAddModal(true);
  };

  const handleSaveHandover = (e: React.FormEvent) => {
    e.preventDefault();
    const totalHandedAmount = Number(cashAmount) + Number(posSlipsAmount) + Number(couponsAmount);
    if (totalHandedAmount <= 0) {
      alert('Нийт тушаах дүн 0-ээс их байх ёстой!');
      return;
    }

    const receiptNumber = `АКТ-${date.replace(/-/g, '')}-${String(managerHandovers.length + 1).padStart(2, '0')}`;

    addManagerHandover({
      receiptNumber,
      date,
      time,
      shiftType,
      operatorEmployeeId,
      managerName: managerName.trim(),
      cashAmount: Number(cashAmount),
      posSlipsAmount: Number(posSlipsAmount),
      couponsAmount: Number(couponsAmount),
      totalHandedAmount,
      isConfirmedByManager: true,
      confirmedAt: new Date().toISOString(),
      safeDepositNumber: safeDepositNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setShowAddModal(false);
  };

  const handlePrint = (rec: ManagerHandoverRecord) => {
    setSelectedReceiptForPrint(rec);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Эрхлэгчид мөнгө хүлээлгэн өгөх (Safe Deposit)
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Сейфийн тушаалт
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Түгээгч ээлжийн дараа бэлэн мөнгө, POS баримт, талоныг станцын эрхлэгчид албан ёсоор акт үйлдэн тушаах
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Мөнгө тушаах акт үүсгэх</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>НИЙТ ТУШААСАН ДҮН (₮)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {formatMNT(totalHandedOverall)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {managerHandovers.length} удаагийн хүлээлцэх акт
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>БЭЛЭН МӨНГӨ ТУШААСАН</span>
            <Lock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-800">
            {formatMNT(totalCashHanded)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Сейфэнд хадгалагдсан бэлэн мөнгө
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ПОС БАРИМТЫН ДҮН</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-800">
            {formatMNT(totalPosHanded)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Эрхлэгчид хураалгасан слипүүд
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>БАТАЛГААЖСАН АКТУУД</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {confirmedCount} / {managerHandovers.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Эрхлэгчийн гарын үсэгтэй актууд
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Актын дугаар, ажилтан, сейфээр хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Нийт <strong>{filteredHandovers.length}</strong> тушаалтын акт
        </div>
      </div>

      {/* Handover Acts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Актын № / Огноо</th>
                <th className="py-3 px-4">Ээлж</th>
                <th className="py-3 px-4">Хүлээлгэн өгсөн түгээгч</th>
                <th className="py-3 px-4">Хүлээж авсан эрхлэгч</th>
                <th className="py-3 px-4 text-right">Бэлэн мөнгө (₮)</th>
                <th className="py-3 px-4 text-right">ПОС баримт (₮)</th>
                <th className="py-3 px-4 text-right font-bold">Нийт тушаасан (₮)</th>
                <th className="py-3 px-4">Сейф / Дугтуй</th>
                <th className="py-3 px-4 text-center">Баталгаажсан?</th>
                <th className="py-3 px-4 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHandovers.map((h) => {
                const emp = employees.find((e) => e.id === h.operatorEmployeeId);
                return (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 font-mono">{h.receiptNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{h.date} {h.time}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.shiftType === 'day'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-indigo-50 text-indigo-800'
                        }`}
                      >
                        {h.shiftType === 'day' ? 'Өдөр' : 'Орой'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {emp ? emp.name : 'Түгээгч'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {h.managerName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                      {formatMNT(h.cashAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-indigo-700">
                      {formatMNT(h.posSlipsAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                      {formatMNT(h.totalHandedAmount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {h.safeDepositNumber || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {h.isConfirmedByManager ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Баталсан
                        </span>
                      ) : (
                        <button
                          onClick={() => confirmManagerHandover(h.id)}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold hover:bg-blue-100 cursor-pointer"
                        >
                          Батлах
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePrint(h)}
                          className="p-1 text-slate-500 hover:text-slate-800 rounded cursor-pointer"
                          title="Акт хэвлэх"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Энэ актыг устгах уу?')) {
                              deleteManagerHandover(h.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Устгах"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add Handover Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Эрхлэгчид мөнгө тушаах акт үйлдэх
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ээлж дууссаны дараа бэлэн мөнгө ба ПОС баримтыг эрхлэгчид хүлээлгэн өгөх
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

            <form onSubmit={handleSaveHandover} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Огноо:</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Ээлж:</label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value as HandoverShiftType)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="day">Өдрийн ээлж</option>
                    <option value="night">Шөнийн ээлж</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Хүлээлгэн өгсөн түгээгч:</label>
                  <select
                    value={operatorEmployeeId}
                    onChange={(e) => setOperatorEmployeeId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role || 'Түгээгч'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Хүлээж авсан эрхлэгч:</label>
                  <input
                    type="text"
                    required
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                <h4 className="font-bold text-slate-900 text-xs">Тушаах төлбөрийн хэрэгслийн дүн</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-blue-800">Бэлэн мөнгө (₮):</label>
                    <input
                      type="number"
                      min="0"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(Number(e.target.value))}
                      className="w-36 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-800 text-right"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-indigo-800">ПОС баримтын дүн (₮):</label>
                    <input
                      type="number"
                      min="0"
                      value={posSlipsAmount}
                      onChange={(e) => setPosSlipsAmount(Number(e.target.value))}
                      className="w-36 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-indigo-800 text-right"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700">Талон / Ваучер (₮):</label>
                    <input
                      type="number"
                      min="0"
                      value={couponsAmount}
                      onChange={(e) => setCouponsAmount(Number(e.target.value))}
                      className="w-36 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 text-right"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm">
                    <span className="text-slate-900">Нийт тушаах дүн:</span>
                    <span className="font-mono text-emerald-700 text-base">
                      {formatMNT(Number(cashAmount) + Number(posSlipsAmount) + Number(couponsAmount))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Сейфийн дугтуй / дугаар:</label>
                <input
                  type="text"
                  value={safeDepositNumber}
                  onChange={(e) => setSafeDepositNumber(e.target.value)}
                  placeholder="Сейф №1 / Дугтуй #05..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Тайлбар / Тэмдэглэл:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Нэмэлт тайлбар..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Акт баталж хадгалах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal / Layout */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:static print:p-0 print:bg-white">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4 print:border-none print:shadow-none print:w-full">
            <div className="text-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {settings.workplaceName || 'ШТС ТӨВ ЦОГЦОЛБОР'}
              </h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                ЭЭЛЖИЙН ОРЛОГО ХҮЛЭЭЛЦЭХ АКТ
              </p>
              <p className="text-[11px] font-mono text-blue-700 mt-1 font-bold">
                {selectedReceiptForPrint.receiptNumber}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Огноо, цаг:</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {selectedReceiptForPrint.date} {selectedReceiptForPrint.time}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ээлж:</span>
                <span className="font-semibold text-slate-900">
                  {selectedReceiptForPrint.shiftType === 'day' ? 'Өдрийн ээлж (09:00)' : 'Шөнийн ээлж (20:30)'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Хүлээлгэн өгсөн:</span>
                <span className="font-semibold text-slate-900">
                  {employees.find((e) => e.id === selectedReceiptForPrint.operatorEmployeeId)?.name || 'Түгээгч'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Хүлээж авсан:</span>
                <span className="font-semibold text-slate-900">
                  {selectedReceiptForPrint.managerName}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Сейф / Дугтуй:</span>
                <span className="font-semibold font-mono text-slate-900">
                  {selectedReceiptForPrint.safeDepositNumber || '-'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-700">
                  <span>Бэлэн мөнгө:</span>
                  <span className="font-mono font-bold">{formatMNT(selectedReceiptForPrint.cashAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>ПОС баримт:</span>
                  <span className="font-mono font-bold">{formatMNT(selectedReceiptForPrint.posSlipsAmount)}</span>
                </div>
                {selectedReceiptForPrint.couponsAmount > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Талон / Ваучер:</span>
                    <span className="font-mono font-bold">{formatMNT(selectedReceiptForPrint.couponsAmount)}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>НИЙТ ТУШААСАН:</span>
                  <span className="font-mono text-emerald-700">{formatMNT(selectedReceiptForPrint.totalHandedAmount)}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-center text-[11px] text-slate-600">
              <div>
                <p className="font-semibold">Хүлээлгэн өгсөн:</p>
                <div className="h-10 border-b border-dashed border-slate-300 mt-2"></div>
                <p className="text-[10px] text-slate-400 mt-1">(Гарын үсэг)</p>
              </div>
              <div>
                <p className="font-semibold">Хүлээж авсан:</p>
                <div className="h-10 border-b border-dashed border-slate-300 mt-2"></div>
                <p className="text-[10px] text-slate-400 mt-1">(Гарын үсэг)</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 print:hidden">
              <button
                onClick={() => setSelectedReceiptForPrint(null)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white cursor-pointer"
              >
                Хаах
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Хэвлэх</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
