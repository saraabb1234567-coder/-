import React, { useState } from 'react';
import {
  Building2,
  Plus,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  QrCode,
  ArrowDownLeft,
  X,
  CreditCard,
  Edit3,
  AlertTriangle,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { BankTransactionRecord, HandoverShiftType } from '../types';
import { formatMNT } from '../utils/calculations';
import { getTodayString } from '../utils/dateUtils';

export const BankSettlementView: React.FC = () => {
  const {
    bankTransactions,
    addBankTransaction,
    updateBankTransaction,
    reconcileBankTransaction,
    deleteBankTransaction,
    settings,
  } = useShifts();

  const todayStr = getTodayString();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTx, setEditingTx] = useState<BankTransactionRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [bankName, setBankName] = useState('Хаан банк (QPay QR)');
  const [accountNumber, setAccountNumber] = useState('5022194821');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('14:30');
  const [shiftType, setShiftType] = useState<HandoverShiftType>('day');
  const [transactionType, setTransactionType] = useState<'qpay' | 'transfer' | 'card_settlement'>('qpay');
  const [amount, setAmount] = useState<number>(75000);
  const [customerInfo, setCustomerInfo] = useState('');
  const [referenceNumber, setReferenceNumber] = useState(`QP-${Date.now().toString().slice(-6)}`);
  const [note, setNote] = useState('');

  // Metrics
  const totalBankAmount = bankTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const qpayAmount = bankTransactions
    .filter((tx) => tx.transactionType === 'qpay')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const transferAmount = bankTransactions
    .filter((tx) => tx.transactionType === 'transfer')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const reconciledCount = bankTransactions.filter((tx) => tx.isReconciled).length;

  const filteredTransactions = bankTransactions.filter((tx) => {
    if (selectedType !== 'all' && tx.transactionType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.bankName.toLowerCase().includes(q) ||
        tx.referenceNumber.toLowerCase().includes(q) ||
        tx.customerInfo?.toLowerCase().includes(q) ||
        tx.note?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setDate(todayStr);
    setTime(new Date().toTimeString().slice(0, 5));
    setShiftType('day');
    setTransactionType('qpay');
    setAmount(65000);
    setCustomerInfo('');
    setReferenceNumber(`QP-${Date.now().toString().slice(-6)}`);
    setNote('');
    setShowAddModal(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Гүйлгээний дүн 0-ээс их байх ёстой!');
      return;
    }

    addBankTransaction({
      bankName,
      accountNumber,
      date,
      time,
      shiftType,
      transactionType,
      amount: Number(amount),
      customerInfo: customerInfo.trim() || undefined,
      referenceNumber: referenceNumber.trim(),
      isReconciled: true,
      reconciledBy: settings.adminUsername || 'Эрхлэгч',
      note: note.trim() || undefined,
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
              Банкны дансны тооцоо & QPay орлого
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Дансны тулгалт
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ШТС-ийн Хаан банк данс, QPay QR төлбөр, байгууллагын гэрээт шилжүүлгийн орлогын бүртгэл ба банкны хуулга тулгалт
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Дансны гүйлгээ бүртгэх</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>НИЙТ ДАНСНЫ ОРЛОГО (₮)</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-800">
            {formatMNT(totalBankAmount)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {bankTransactions.length} гүйлгээ бүртгэгдсэн
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>QPAY QR ОРЛОГО</span>
            <QrCode className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {formatMNT(qpayAmount)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Иргэдийн шууд уншуулсан QR төлбөр
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ГЭРЭЭТ ШИЛЖҮҮЛЭГ</span>
            <ArrowDownLeft className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-800">
            {formatMNT(transferAmount)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Байгууллагын дансаар хийсэн шилжүүлгүүд
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ХУУЛГА ТУЛГАЛТ</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {reconciledCount} / {bankTransactions.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {bankTransactions.length - reconciledCount === 0
              ? 'Бүх гүйлгээ тулгагдсан'
              : `${bankTransactions.length - reconciledCount} гүйлгээ хүлээгдэж байна`}
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
              placeholder="Утга, дугаар, харилцагчаар хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
          >
            <option value="all">Бүх гүйлгээ</option>
            <option value="qpay">QPay QR төлбөр</option>
            <option value="transfer">Дансны шилжүүлэг</option>
            <option value="card_settlement">Картын орлого</option>
          </select>

          {(searchQuery || selectedType !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
              }}
              className="text-xs text-rose-600 font-bold hover:underline px-2 cursor-pointer"
            >
              Шүүлт цэвэрлэх
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Нийт <strong>{filteredTransactions.length}</strong> гүйлгээ харагдаж байна
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Огноо / Цаг</th>
                <th className="py-3 px-4">Төрөл</th>
                <th className="py-3 px-4">Банк / Данс</th>
                <th className="py-3 px-4">Гүйлгээний дугаар / Утга</th>
                <th className="py-3 px-4">Харилцагч / Тайлбар</th>
                <th className="py-3 px-4 text-right font-bold">Орлогын дүн (₮)</th>
                <th className="py-3 px-4 text-center">Тулгалтын төлөв</th>
                <th className="py-3 px-4 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{tx.date}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{tx.time} ({tx.shiftType === 'day' ? 'Өдөр' : 'Орой'})</div>
                  </td>
                  <td className="py-3 px-4">
                    {tx.transactionType === 'qpay' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <QrCode className="w-3 h-3" />
                        QPay QR
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <ArrowDownLeft className="w-3 h-3" />
                        Шилжүүлэг
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <div className="font-bold">{tx.bankName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{tx.accountNumber}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                    {tx.referenceNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">
                    <div>{tx.customerInfo || '-'}</div>
                    {tx.note && <div className="text-[10px] text-slate-400 italic">"{tx.note}"</div>}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 text-sm whitespace-nowrap">
                    +{formatMNT(tx.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {tx.isReconciled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Тулгасан
                      </span>
                    ) : (
                      <button
                        onClick={() => reconcileBankTransaction(tx.id, settings.adminUsername || 'Эрхлэгч')}
                        className="px-2 py-0.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded text-[10px] font-bold cursor-pointer"
                      >
                        Тулгах
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm('Энэ гүйлгээний бүртгэлийг устгах уу?')) {
                          deleteBankTransaction(tx.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Устгах"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Банкны гүйлгээ / QPay орлого бүртгэх
                  </h3>
                  <p className="text-xs text-slate-500">
                    Банкны дансанд орсон орлогын баримтыг гараар бүртгэх
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

            <form onSubmit={handleSaveTransaction} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Гүйлгээний төрөл:</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="qpay">QPay QR төлбөр</option>
                    <option value="transfer">Дансны шилжүүлэг</option>
                    <option value="card_settlement">Картын нэгтгэл</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Банк / Данс:</label>
                  <select
                    value={bankName}
                    onChange={(e) => {
                      setBankName(e.target.value);
                      if (e.target.value.includes('Хаан')) setAccountNumber('5022194821');
                      else setAccountNumber('1415129940');
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="Хаан банк (QPay QR)">Хаан банк (QPay QR)</option>
                    <option value="Хаан банк (Төв данс)">Хаан банк (Төв данс)</option>
                    <option value="Голомт банк">Голомт банк</option>
                  </select>
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
                  <label className="text-xs font-bold text-slate-700 block">Цаг:</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-700 block">
                  Орлогын дүн (₮): *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-800 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Гүйлгээний дугаар / Утга: *
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="QP-991204 / TR-441..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Харилцагч / Автомашины дугаар:
                </label>
                <input
                  type="text"
                  value={customerInfo}
                  onChange={(e) => setCustomerInfo(e.target.value)}
                  placeholder="Жишээ: 1234 УБҮ, Монгол Транс..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
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
