import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Trash2,
  Calendar,
  Layers,
  Search,
  Receipt,
  DollarSign,
  TrendingUp,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  X,
  FileText,
  Printer,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { PosTerminalRecord, HandoverShiftType } from '../types';
import { formatMNT } from '../utils/calculations';
import { getTodayString } from '../utils/dateUtils';

export const PosSettlementView: React.FC = () => {
  const {
    posRecords,
    addPosRecord,
    settlePosRecord,
    deletePosRecord,
    employees,
    fuelShiftSales,
    oilSales,
  } = useShifts();

  const todayStr = getTodayString();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [terminalName, setTerminalName] = useState('Хаан банк Терминал №1');
  const [bankName, setBankName] = useState('Хаан банк');
  const [terminalId, setTerminalId] = useState('KB-88201');
  const [date, setDate] = useState(todayStr);
  const [shiftType, setShiftType] = useState<HandoverShiftType>('day');
  const [batchNumber, setBatchNumber] = useState('Batch 0050');
  const [slipCount, setSlipCount] = useState<number>(18);
  const [totalAmount, setTotalAmount] = useState<number>(1250000);
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [note, setNote] = useState('');

  // Expected POS total from Shift Sales
  const expectedPosFromFuel = fuelShiftSales.reduce(
    (sum, s) => sum + (s.paymentBreakdown.pos || 0),
    0
  );
  const expectedPosFromOil = oilSales
    .filter((s) => s.paymentMethod === 'pos')
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpectedPos = expectedPosFromFuel + expectedPosFromOil;

  // Actual POS from Terminals
  const totalPosTerminalAmount = posRecords.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalSlipsCount = posRecords.reduce((sum, p) => sum + p.slipCount, 0);
  const settledCount = posRecords.filter((p) => p.isSettled).length;

  const discrepancy = totalPosTerminalAmount - totalExpectedPos;

  const filteredRecords = posRecords.filter((rec) => {
    if (selectedBank !== 'all' && rec.bankName !== selectedBank) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const emp = employees.find((e) => e.id === rec.employeeId)?.name.toLowerCase() || '';
      return (
        rec.terminalName.toLowerCase().includes(q) ||
        rec.terminalId.toLowerCase().includes(q) ||
        rec.batchNumber.toLowerCase().includes(q) ||
        emp.includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setDate(todayStr);
    setShiftType('day');
    setBatchNumber(`Batch ${String(posRecords.length + 50).padStart(4, '0')}`);
    setSlipCount(15);
    setTotalAmount(850000);
    setEmployeeId(employees[0]?.id || '');
    setNote('');
    setShowAddModal(true);
  };

  const handleSavePos = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAmount <= 0) {
      alert('Гүйлгээний нийт дүн 0-ээс их байна!');
      return;
    }

    addPosRecord({
      terminalName,
      bankName,
      terminalId,
      date,
      shiftType,
      batchNumber,
      slipCount: Number(slipCount),
      totalAmount: Number(totalAmount),
      employeeId,
      isSettled: false,
      note: note.trim(),
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              POS төхөөрөмжийн тооцоо & Z-Тайлан
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Банкны картын тооцоо
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Банкны ПОС терминалуудын багц дугаар (Batch), баримтын тоо, нийт гүйлгээний дүн ба Z-тайлан хаалт
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>POS тооцоо бүртгэх</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>НИЙТ ПОС ГҮЙЛГЭЭ (₮)</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-800">
            {formatMNT(totalPosTerminalAmount)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Нийт {posRecords.length} терминалын багц
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>УНШУУЛСАН КАРТЫН БАРИМТ</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {totalSlipsCount} ширхэг
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Нийт хэвлэсэн слип баримт
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Z-ТАЙЛАН ХААЛТ</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-800">
            {settledCount} / {posRecords.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {posRecords.length - settledCount === 0
              ? 'Бүх терминал хаагдсан'
              : `${posRecords.length - settledCount} терминал хаагдаагүй`}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>СИСТЕМИЙН ЗӨРҮҮ</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div
            className={`mt-2 text-2xl font-bold font-mono ${
              discrepancy === 0
                ? 'text-emerald-700'
                : discrepancy > 0
                ? 'text-blue-700'
                : 'text-rose-600'
            }`}
          >
            {discrepancy === 0 ? '0 ₮ (Таарсан)' : formatMNT(discrepancy)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Борлуулалтын ПОС: {formatMNT(totalExpectedPos)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Терминал, багц, ажилтнаар хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
          >
            <option value="all">Бүх банкууд</option>
            <option value="Хаан банк">Хаан банк</option>
            <option value="Голомт банк">Голомт банк</option>
            <option value="Төрийн банк">Төрийн банк</option>
          </select>

          {(searchQuery || selectedBank !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBank('all');
              }}
              className="text-xs text-rose-600 font-bold hover:underline px-2 cursor-pointer"
            >
              Шүүлт цэвэрлэх
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Нийт <strong>{filteredRecords.length}</strong> ПОС багц
        </div>
      </div>

      {/* POS Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Огноо / Ээлж</th>
                <th className="py-3 px-4">Терминалын нэр</th>
                <th className="py-3 px-4">Банк / Дугаар</th>
                <th className="py-3 px-4">Багцын дугаар (Batch)</th>
                <th className="py-3 px-4 text-center">Баримтын тоо</th>
                <th className="py-3 px-4 text-right font-bold">Нийт дүн (₮)</th>
                <th className="py-3 px-4">Хариуцсан түгээгч</th>
                <th className="py-3 px-4 text-center">Z-Тайлан төлөв</th>
                <th className="py-3 px-4">Тайлбар</th>
                <th className="py-3 px-4 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => {
                const emp = employees.find((e) => e.id === rec.employeeId);
                return (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{rec.date}</div>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          rec.shiftType === 'day'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-indigo-50 text-indigo-800'
                        }`}
                      >
                        {rec.shiftType === 'day' ? 'Өдөр' : 'Орой'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {rec.terminalName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{rec.bankName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{rec.terminalId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {rec.batchNumber}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-slate-900">
                      {rec.slipCount} ш
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-800 text-sm">
                      {formatMNT(rec.totalAmount)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {emp ? emp.name : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {rec.isSettled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Хаагдсан (Z-Тайлан)
                        </span>
                      ) : (
                        <button
                          onClick={() => settlePosRecord(rec.id)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
                        >
                          Z-Тайлан хаах
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {rec.note || '-'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (confirm('Энэ ПОС бүртгэлийг устгах уу?')) {
                            deletePosRecord(rec.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Устгах"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add POS Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    POS төхөөрөмжийн тооцоо бүртгэх
                  </h3>
                  <p className="text-xs text-slate-500">
                    Банкны терминалын багцын дүн ба баримтын тоо оруулах
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

            <form onSubmit={handleSavePos} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Банк сонгох:</label>
                  <select
                    value={bankName}
                    onChange={(e) => {
                      const b = e.target.value;
                      setBankName(b);
                      if (b === 'Хаан банк') {
                        setTerminalName('Хаан банк Терминал №1');
                        setTerminalId('KB-88201');
                      } else if (b === 'Голомт банк') {
                        setTerminalName('Голомт банк Терминал №2');
                        setTerminalId('GB-10492');
                      } else {
                        setTerminalName('Төрийн банк Терминал №3');
                        setTerminalId('TB-55109');
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="Хаан банк">Хаан банк</option>
                    <option value="Голомт банк">Голомт банк</option>
                    <option value="Төрийн банк">Төрийн банк</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Терминал ID:</label>
                  <input
                    type="text"
                    value={terminalId}
                    onChange={(e) => setTerminalId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

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
                  <label className="text-xs font-bold text-slate-700 block">Багцын дугаар (Batch):</label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="Batch 0050..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Баримтын тоо (Slip):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={slipCount}
                    onChange={(e) => setSlipCount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-700 block">
                  ПОС-оор орсон нийт дүн (₮): *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-blue-900 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Хариуцсан түгээгч:</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
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
                <label className="text-xs font-bold text-slate-700 block">Тайлбар:</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
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
                  Бүртгэх
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
