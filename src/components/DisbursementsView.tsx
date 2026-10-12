import React, { useState } from 'react';
import {
  Wallet,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingDown,
  DollarSign,
  AlertCircle,
  X,
  CreditCard,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { formatMNT } from '../utils/calculations';
import { PayrollPayment, PaymentType, Employee } from '../types';

export const DisbursementsView: React.FC = () => {
  const {
    payrollPayments,
    payrollCalculations,
    employees,
    recordPayment,
    updatePayment,
    deletePayment,
    payrollPeriod,
  } = useShifts();

  const [activeTab, setActiveTab] = useState<'all' | 'primary_25' | 'secondary_10'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [empId, setEmpId] = useState(employees[0]?.id || '');
  const [paymentDate, setPaymentDate] = useState('2026-10-25');
  const [paymentType, setPaymentType] = useState<PaymentType>('primary_25');
  const [calculatedAmount, setCalculatedAmount] = useState<number>(1800000);
  const [paidAmount, setPaidAmount] = useState<number>(1800000);
  const [status, setStatus] = useState<'completed' | 'pending' | 'cancelled'>('completed');
  const [note, setNote] = useState('25-ны үндсэн олголт');

  const openAddForEmployee = (emp: Employee, type: PaymentType) => {
    const calc = payrollCalculations.find((c) => c.employeeId === emp.id);
    setEmpId(emp.id);
    setPaymentType(type);

    if (type === 'primary_25') {
      setPaymentDate('2026-10-25');
      const target = Math.round((calc?.totalCalculated || 2000000) * 0.7);
      setCalculatedAmount(target);
      setPaidAmount(target);
      setNote('25-ны үндсэн цалингийн олголт');
    } else {
      setPaymentDate('2026-11-10');
      const bal = calc?.remainingBalance || 0;
      setCalculatedAmount(bal);
      setPaidAmount(bal);
      setNote(
        payrollPeriod.secondaryPayoutType === 'balance'
          ? '10-ны үлдэгдэл цалингийн олголт'
          : '10-ны урьдчилгаа олголт'
      );
    }

    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    recordPayment({
      periodId: payrollPeriod.id,
      employeeId: empId,
      paymentDate,
      paymentType,
      calculatedAmount: Number(calculatedAmount),
      paidAmount: Number(paidAmount),
      status,
      note: note.trim(),
    });
    setShowAddModal(false);
  };

  // Summaries
  const primaryPayments = payrollPayments.filter((p) => p.paymentType === 'primary_25');
  const secondaryPayments = payrollPayments.filter((p) => p.paymentType === 'secondary_10');

  const totalPrimaryPaid = primaryPayments
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + p.paidAmount, 0);

  const totalSecondaryPaid = secondaryPayments
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + p.paidAmount, 0);

  const totalPaid = payrollPayments
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + p.paidAmount, 0);

  const totalRemainingBalance = payrollCalculations.reduce(
    (s, c) => s + c.remainingBalance,
    0
  );

  const filteredPayments = payrollPayments.filter((p) => {
    if (activeTab === 'all') return true;
    return p.paymentType === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              25 болон 10-ны цалингийн олголт
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700">
              {payrollPeriod.payoutDayPrimary}-ны үндсэн • {payrollPeriod.payoutDaySecondary}-ны үлдэгдэл
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            25-ны үндсэн цалин ба 10-ны үлдэгдэл олголтын бүртгэл. Давхар тооцохоос сэргийлсэн үлдэгдлийн хяналт.
          </p>
        </div>

        <button
          onClick={() => {
            setEmpId(employees[0]?.id || '');
            setPaymentType('primary_25');
            setPaymentDate('2026-10-25');
            setCalculatedAmount(1500000);
            setPaidAmount(1500000);
            setNote('Цалингийн олголт');
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Шинэ олголт бүртгэх</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            25-НЫ ҮНДСЭН ОЛГОЛТ
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatMNT(totalPrimaryPaid)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Сарын 25-ны үндсэн шилжүүлэг</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            10-НЫ ОЛГОЛТ (ҮЛДЭГДЭЛ)
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatMNT(totalSecondaryPaid)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Дараа сарын 10-ны үлдэгдэл олголт</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            НИЙТ ОЛГОСОН МӨНГӨ
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {formatMNT(totalPaid)}
          </div>
          <p className="text-xs text-slate-500 mt-1">25 болон 10-ны бодит нийлбэр</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            ҮЛДСЭН ЦАЛИНГИЙН ӨР
          </span>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {formatMNT(totalRemainingBalance)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Нийт бодсон - Нийт олгосон</p>
        </div>
      </div>

      {/* Employee Quick Payout Status Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">
          Ажилтан бүрийн олголтын төлөв & Түргэн үйлдлүүд
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {employees.map((emp) => {
            const calc = payrollCalculations.find((c) => c.employeeId === emp.id);
            const empPays = payrollPayments.filter(
              (p) => p.employeeId === emp.id && p.status === 'completed'
            );
            const hasPrimary = empPays.some((p) => p.paymentType === 'primary_25');
            const hasSecondary = empPays.some((p) => p.paymentType === 'secondary_10');

            return (
              <div
                key={emp.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: emp.color }}
                      />
                      <span className="font-bold text-slate-900 text-sm">{emp.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      Нийт: {formatMNT(calc?.totalCalculated || 0)}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">25-ны олголт:</span>
                      {hasPrimary ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Олгогдсон
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold">Олгоогүй</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">10-ны олголт:</span>
                      {hasSecondary ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Олгогдсон
                        </span>
                      ) : (
                        <span className="text-slate-400">Хүлээгдэж буй</span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold">
                      <span className="text-slate-600">Үлдэгдэл:</span>
                      <span className={(calc?.remainingBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {formatMNT(calc?.remainingBalance || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-1.5">
                  <button
                    onClick={() => openAddForEmployee(emp, 'primary_25')}
                    className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors cursor-pointer text-center"
                  >
                    25-ны олголт
                  </button>
                  <button
                    onClick={() => openAddForEmployee(emp, 'secondary_10')}
                    className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-[11px] font-bold text-blue-700 transition-colors cursor-pointer text-center"
                  >
                    10-ны үлдэгдэл
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-900 text-sm">
            Гүйлгээний түүх & Олголтын жагсаалт
          </h3>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Бүгд ({payrollPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('primary_25')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'primary_25'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              25-ны олголт ({primaryPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('secondary_10')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'secondary_10'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              10-ны олголт ({secondaryPayments.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Огноо</th>
                <th className="py-3 px-4">Олголтын төрөл</th>
                <th className="py-3 px-4">Ажилтан</th>
                <th className="py-3 px-4 text-right">Бодсон дүн</th>
                <th className="py-3 px-4 text-right">Бодитоор олгосон</th>
                <th className="py-3 px-4 text-center">Гүйлгээний төлөв</th>
                <th className="py-3 px-4">Тайлбар</th>
                <th className="py-3 px-4 text-right">Устгах</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => {
                const emp = employees.find((e) => e.id === p.employeeId);
                const typeName =
                  p.paymentType === 'primary_25'
                    ? '25-ны үндсэн цалин'
                    : p.paymentType === 'secondary_10'
                    ? '10-ны үлдэгдэл / урьдчилгаа'
                    : p.paymentType === 'advance'
                    ? 'Урьдчилгаа'
                    : 'Нэмэлт';

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    {/* Date */}
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {p.paymentDate}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.paymentType === 'primary_25'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {typeName}
                      </span>
                    </td>

                    {/* Employee */}
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {emp ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: emp.color }}
                          />
                          <span>{emp.name}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Calculated Amount */}
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatMNT(p.calculatedAmount)}
                    </td>

                    {/* Paid Amount */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatMNT(p.paidAmount)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {p.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Шилжүүлсэн
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          Хүлээгдэж буй
                        </span>
                      )}
                    </td>

                    {/* Note */}
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {p.note || '-'}
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deletePayment(p.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Гүйлгээг устгах"
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

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Цалингийн олголт бүртгэх
                  </h3>
                  <p className="text-xs text-slate-500">
                    25-ны үндсэн эсвэл 10-ны үлдэгдэл гүйлгээ
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

            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Ажилтан:</label>
                <select
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Олголтын төрөл:</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="primary_25">25-ны үндсэн цалин</option>
                    <option value="secondary_10">10-ны үлдэгдэл / урьдчилгаа</option>
                    <option value="advance">Урьдчилгаа</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Олголтын огноо:</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Бодсон дүн (₮):</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={calculatedAmount}
                    onChange={(e) => setCalculatedAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Бодитоор олгосон (₮):</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Гүйлгээний төлөв:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="completed">Шилжүүлсэн (Амжилттай)</option>
                  <option value="pending">Хүлээгдэж буй</option>
                  <option value="cancelled">Цуцлагдсан</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Тайлбар:</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Гүйлгээний утга, тайлбар..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
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
