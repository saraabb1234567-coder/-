import React, { useState } from 'react';
import {
  Banknote,
  Coins,
  Calculator,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  RotateCcw,
  DollarSign,
  User,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { CashDrawerRecord, CashDenominationCount, HandoverShiftType } from '../types';
import { formatMNT } from '../utils/calculations';
import { getTodayString } from '../utils/dateUtils';

const DENOMINATION_VALUES = [
  { key: 'c20000', value: 20000, label: '20,000 ₮ (Сүхбаатар)', color: 'text-emerald-700 bg-emerald-50' },
  { key: 'c10000', value: 10000, label: '10,000 ₮ (Чингис)', color: 'text-blue-700 bg-blue-50' },
  { key: 'c5000', value: 5000, label: '5,000 ₮ (Чингис)', color: 'text-indigo-700 bg-indigo-50' },
  { key: 'c1000', value: 1000, label: '1,000 ₮ (Чингис)', color: 'text-cyan-700 bg-cyan-50' },
  { key: 'c500', value: 500, label: '500 ₮ (Чингис)', color: 'text-amber-700 bg-amber-50' },
  { key: 'c100', value: 100, label: '100 ₮ (Сүхбаатар)', color: 'text-rose-700 bg-rose-50' },
  { key: 'c50', value: 50, label: '50 ₮', color: 'text-slate-700 bg-slate-50' },
  { key: 'c20', value: 20, label: '20 ₮', color: 'text-slate-700 bg-slate-50' },
] as const;

export const CashSettlementView: React.FC = () => {
  const {
    cashDrawerRecords,
    saveCashDrawerRecord,
    fuelShiftSales,
    oilSales,
    employees,
  } = useShifts();

  const todayStr = getTodayString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedShift, setSelectedShift] = useState<HandoverShiftType>('day');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || '');

  // Denominations count state
  const [counts, setCounts] = useState<CashDenominationCount>({
    c20000: 160,
    c10000: 55,
    c5000: 40,
    c1000: 30,
    c500: 10,
    c100: 0,
    c50: 0,
    c20: 0,
  });

  const [openingBalance, setOpeningBalance] = useState<number>(300000); // 300k starting float
  const [handedToManager, setHandedToManager] = useState<number>(3500000);
  const [note, setNote] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Compute calculated cash sales from Fuel + Oil on this date/shift
  const fuelCashSales = fuelShiftSales
    .filter((s) => s.date === selectedDate && s.shiftType === selectedShift)
    .reduce((sum, s) => sum + (s.paymentBreakdown.cash || 0), 0);

  const oilCashSales = oilSales
    .filter((s) => s.date === selectedDate && s.shiftType === selectedShift && s.paymentMethod === 'cash')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const expectedCashRevenue = fuelCashSales + oilCashSales;

  // Total counted from denominations
  const totalCounted = DENOMINATION_VALUES.reduce((sum, item) => {
    const qty = counts[item.key as keyof CashDenominationCount] || 0;
    return sum + qty * item.value;
  }, 0);

  // Total expected in drawer = opening + revenue
  const totalExpectedInDrawer = openingBalance + expectedCashRevenue;

  // Discrepancy = counted - expected
  const cashDiscrepancy = totalCounted - totalExpectedInDrawer;

  // Remaining in drawer after handing to manager
  const calculatedClosing = Math.max(0, totalCounted - handedToManager);

  const handleCountChange = (key: keyof CashDenominationCount, value: number) => {
    setCounts((prev) => ({
      ...prev,
      [key]: Math.max(0, value || 0),
    }));
  };

  const handleResetCounts = () => {
    setCounts({
      c20000: 0,
      c10000: 0,
      c5000: 0,
      c1000: 0,
      c500: 0,
      c100: 0,
      c50: 0,
      c20: 0,
    });
  };

  const handleSaveDrawer = () => {
    saveCashDrawerRecord({
      date: selectedDate,
      shiftType: selectedShift,
      openingBalance,
      cashSalesRevenue: expectedCashRevenue,
      denominations: counts,
      countedCashTotal: totalCounted,
      handedToManager,
      closingBalance: calculatedClosing,
      discrepancy: cashDiscrepancy,
      employeeId: selectedEmployeeId,
      isVerified: true,
      note: note.trim() || undefined,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Бэлэн мөнгөний тооцоо & Дэвсгэрт тоололт
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Кассын шүүгээ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Кассын эхний хариулт, борлуулалтын бэлэн мөнгө, мөнгөн дэвсгэртээр тоолох тооцоолуур ба илүүдэл/дутагдлын шалгалт
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCounts}
            className="inline-flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Дэвсгэрт тэглэх</span>
          </button>
          <button
            onClick={handleSaveDrawer}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Кассын тооцоо хадгалах</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Кассын бэлэн мөнгөний тооцоо амжилттай хадгалагдлаа!
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>НИЙТ ТООЛСОН МӨНГӨ (₮)</span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {formatMNT(totalCounted)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Бүх дэвсгэртийн нийлбэр дүн
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>БОРЛУУЛАЛТЫН БЭЛЭН МӨНГӨ</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-800">
            {formatMNT(expectedCashRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Шатахуун ({formatMNT(fuelCashSales)}) + Тос ({formatMNT(oilCashSales)})
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ЭРХЛЭГЧИД ТУШААХ</span>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-700">
            {formatMNT(handedToManager)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Сейфэнд тушаах борлуулалтын дүн
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>КАССЫН ЗӨРҮҮ</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div
            className={`mt-2 text-2xl font-bold font-mono ${
              cashDiscrepancy === 0
                ? 'text-emerald-700'
                : cashDiscrepancy > 0
                ? 'text-blue-700'
                : 'text-rose-600'
            }`}
          >
            {cashDiscrepancy === 0 ? '0 ₮ (Таарсан)' : formatMNT(cashDiscrepancy)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {cashDiscrepancy === 0 ? 'Бэлэн мөнгө бүрэн таарсан' : cashDiscrepancy > 0 ? 'Илүүдэл гарсан' : 'Дутагдал гарсан'}
          </p>
        </div>
      </div>

      {/* Main Grid: Denominations Counter & Drawer Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Denominations Matrix */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Мөнгөн дэвсгэртээр тоолох
                </h3>
                <p className="text-[11px] text-slate-500">
                  Дэвсгэрт бүрийн ширхэгийг оруулахад систем дүнг автоматаар бодно
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Тоолсон нийлбэр:</span>
              <span className="font-bold font-mono text-base text-emerald-700">
                {formatMNT(totalCounted)}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {DENOMINATION_VALUES.map((item) => {
              const qty = counts[item.key as keyof CashDenominationCount] || 0;
              const subtotal = qty * item.value;
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors bg-slate-50/50"
                >
                  <div className="flex items-center gap-2.5 min-w-[170px]">
                    <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${item.color}`}>
                      {item.value.toLocaleString()} ₮
                    </span>
                    <span className="text-xs text-slate-600 font-medium hidden sm:inline">
                      дэвсгэрт
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCountChange(item.key as keyof CashDenominationCount, Math.max(0, qty - 1))}
                      className="w-7 h-7 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-sm font-bold flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={qty || ''}
                      placeholder="0"
                      onChange={(e) =>
                        handleCountChange(item.key as keyof CashDenominationCount, Number(e.target.value))
                      }
                      className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-center text-slate-900"
                    />

                    <button
                      type="button"
                      onClick={() => handleCountChange(item.key as keyof CashDenominationCount, qty + 1)}
                      className="w-7 h-7 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-sm font-bold flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="w-28 text-right font-mono font-bold text-xs text-slate-800">
                    {formatMNT(subtotal)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Drawer Reconciliation Settings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Ээлж & Кассын харьцуулалт</span>
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block">Огноо:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block">Ээлж:</label>
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value as HandoverShiftType)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs cursor-pointer"
                  >
                    <option value="day">Өдрийн ээлж</option>
                    <option value="night">Шөнийн ээлж</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block">Хариуцсан түгээгч:</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role || 'Түгээгч'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-xs border border-slate-200">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Эхний хариултын мөнгө:</span>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(Number(e.target.value))}
                    className="w-28 px-2 py-0.5 bg-white border border-slate-200 rounded text-right font-mono font-bold"
                  />
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>+ Борлуулалтын бэлэн мөнгө:</span>
                  <span className="font-mono font-bold text-blue-700">
                    +{formatMNT(expectedCashRevenue)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                  <span>= Кассанд байх ёстой дүн:</span>
                  <span className="font-mono text-indigo-700">
                    {formatMNT(totalExpectedInDrawer)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600">
                  <span>- Эрхлэгчид тушаах дүн:</span>
                  <input
                    type="number"
                    value={handedToManager}
                    onChange={(e) => setHandedToManager(Number(e.target.value))}
                    className="w-28 px-2 py-0.5 bg-white border border-slate-200 rounded text-right font-mono font-bold text-emerald-700"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                  <span>Кассанд үлдэх мөнгө:</span>
                  <span className="font-mono text-slate-800">
                    {formatMNT(calculatedClosing)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block">Тэмдэглэл / Тайлбар:</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Бэлэн мөнгөний тооллогын тэмдэглэл..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveDrawer}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Бэлэн мөнгөний тооцоо хадгалах
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Drawer Records */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Кассын бэлэн мөнгө тоолсон түүх
            </h3>
            <p className="text-xs text-slate-500">
              Өмнөх ээлжүүдийн тоолсон нийлбэр дүн, сейфэнд тушаасан болон кассын зөрүүний журнал
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Огноо / Ээлж</th>
                <th className="py-3 px-4 text-right">Эхний үлдэгдэл</th>
                <th className="py-3 px-4 text-right">Борлуулалтын бэлэн</th>
                <th className="py-3 px-4 text-right font-bold">Нийт тоолсон дүн</th>
                <th className="py-3 px-4 text-right">Эрхлэгчид тушаасан</th>
                <th className="py-3 px-4 text-right">Кассанд үлдсэн</th>
                <th className="py-3 px-4 text-center font-bold">Зөрүү</th>
                <th className="py-3 px-4">Тоолсон ажилтан</th>
                <th className="py-3 px-4">Тэмдэглэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashDrawerRecords.map((rec) => {
                const emp = employees.find((e) => e.id === rec.employeeId);
                return (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {rec.date} ({rec.shiftType === 'day' ? 'Өдөр' : 'Орой'})
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      {formatMNT(rec.openingBalance)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-blue-700">
                      {formatMNT(rec.cashSalesRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                      {formatMNT(rec.countedCashTotal)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-indigo-700">
                      {formatMNT(rec.handedToManager)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-800">
                      {formatMNT(rec.closingBalance)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {rec.discrepancy === 0 ? (
                        <span className="text-emerald-700">0 ₮ (Таарсан)</span>
                      ) : rec.discrepancy > 0 ? (
                        <span className="text-blue-700">+{formatMNT(rec.discrepancy)}</span>
                      ) : (
                        <span className="text-rose-600">{formatMNT(rec.discrepancy)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {emp ? emp.name : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {rec.note || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
