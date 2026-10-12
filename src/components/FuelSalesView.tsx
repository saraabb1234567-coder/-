import React, { useState } from 'react';
import {
  Fuel,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Clock,
  User,
  Sparkles,
  Info,
  X,
  CreditCard,
  Receipt,
  Edit3,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import {
  FuelShiftSale,
  FuelSalePriceTier,
  HandoverShiftType,
} from '../types';
import { formatMNT } from '../utils/calculations';
import { getTodayString } from '../utils/dateUtils';

export const FuelSalesView: React.FC = () => {
  const {
    fuelShiftSales,
    recordFuelShiftSale,
    deleteFuelShiftSale,
    fuelPrices,
    employees,
  } = useShifts();

  const todayStr = getTodayString();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [fDate, setFDate] = useState(todayStr);
  const [fShiftType, setFShiftType] = useState<HandoverShiftType>('day');
  const [fFuelType, setFFuelType] = useState('АИ-92');
  const [fDispenser, setFDispenser] = useState('Буу №1');
  const [fEmployeeId, setFEmployeeId] = useState(employees[0]?.id || '');
  const [fTiers, setFTiers] = useState<FuelSalePriceTier[]>([
    {
      id: 'tier-1',
      tierLabel: 'Үндсэн тариф',
      pricePerLiter: 2390,
      litersSold: 850,
      amount: 2031500,
      startMeter: 142050,
      endMeter: 142900,
    },
  ]);
  const [fCash, setFCash] = useState<number>(1200000);
  const [fPos, setFPos] = useState<number>(831500);
  const [fCoupon, setFCoupon] = useState<number>(0);
  const [fNote, setFNote] = useState('');

  // Metrics
  const totalLitersSold = fuelShiftSales.reduce((sum, s) => sum + s.totalLiters, 0);
  const totalSalesRevenue = fuelShiftSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const ai92SalesRevenue = fuelShiftSales
    .filter((s) => s.fuelType.includes('АИ-92'))
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const dieselSalesRevenue = fuelShiftSales
    .filter((s) => s.fuelType.includes('Дизель'))
    .reduce((sum, s) => sum + s.totalAmount, 0);

  // Filtered List
  const filteredSales = fuelShiftSales.filter((sale) => {
    if (selectedDate && sale.date !== selectedDate) return false;
    if (selectedShift !== 'all' && sale.shiftType !== selectedShift) return false;
    if (selectedFuelType !== 'all' && !sale.fuelType.includes(selectedFuelType)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const emp = employees.find((e) => e.id === sale.employeeId)?.name.toLowerCase() || '';
      return (
        sale.dispenserNumber.toLowerCase().includes(q) ||
        sale.fuelType.toLowerCase().includes(q) ||
        sale.note?.toLowerCase().includes(q) ||
        emp.includes(q)
      );
    }
    return true;
  });

  const openAddSale = () => {
    const defaultFuel = fuelPrices.find((f) => f.fuelType === 'АИ-92') || fuelPrices[0];
    const currentPrice = defaultFuel ? defaultFuel.pricePerLiter : 2390;
    setFDate(todayStr);
    setFShiftType('day');
    setFFuelType(defaultFuel ? defaultFuel.fuelType : 'АИ-92');
    setFDispenser('Буу №1 & №2');
    setFEmployeeId(employees[0]?.id || '');
    setFTiers([
      {
        id: `tier-${Date.now()}`,
        tierLabel: 'Үндсэн тариф',
        pricePerLiter: currentPrice,
        litersSold: 800,
        amount: Math.round(800 * currentPrice),
        startMeter: 100000,
        endMeter: 100800,
      },
    ]);
    setFCash(1000000);
    setFPos(Math.round(800 * currentPrice) - 1000000);
    setFCoupon(0);
    setFNote('');
    setShowAddModal(true);
  };

  const handleFuelTypeChange = (newFuel: string) => {
    setFFuelType(newFuel);
    const priceCfg = fuelPrices.find((p) => p.fuelType === newFuel);
    const newPrice = priceCfg ? priceCfg.pricePerLiter : 2390;
    setFTiers((prev) =>
      prev.map((t, idx) => {
        if (idx === 0) {
          const amount = Math.round(t.litersSold * newPrice);
          return { ...t, pricePerLiter: newPrice, amount };
        }
        return t;
      })
    );
  };

  const addTierRow = () => {
    const activePrice = fuelPrices.find((f) => f.fuelType === fFuelType)?.pricePerLiter || 2390;
    setFTiers((prev) => [
      ...prev,
      {
        id: `tier-${Date.now()}`,
        tierLabel: `Шинэ үнээр (${prev.length + 1}-р шатлал)`,
        pricePerLiter: activePrice,
        litersSold: 200,
        amount: Math.round(200 * activePrice),
        startMeter: 0,
        endMeter: 0,
      },
    ]);
  };

  const updateTierRow = (index: number, updates: Partial<FuelSalePriceTier>) => {
    setFTiers((prev) =>
      prev.map((t, idx) => {
        if (idx !== index) return t;
        const price = updates.pricePerLiter !== undefined ? updates.pricePerLiter : t.pricePerLiter;
        let liters = updates.litersSold !== undefined ? updates.litersSold : t.litersSold;
        if (updates.endMeter !== undefined && updates.startMeter !== undefined) {
          liters = Math.max(0, updates.endMeter - updates.startMeter);
        } else if (updates.endMeter !== undefined && t.startMeter !== undefined) {
          liters = Math.max(0, updates.endMeter - t.startMeter);
        }
        const amount = Math.round(price * liters);
        return { ...t, ...updates, litersSold: liters, amount };
      })
    );
  };

  const removeTierRow = (index: number) => {
    if (fTiers.length <= 1) return;
    setFTiers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    const totalLiters = fTiers.reduce((sum, t) => sum + (t.litersSold || 0), 0);
    const totalAmount = fTiers.reduce((sum, t) => sum + (t.amount || 0), 0);

    if (totalLiters <= 0) {
      alert('Борлуулсан нийт литр 0-ээс их байх ёстой!');
      return;
    }

    recordFuelShiftSale({
      date: fDate,
      shiftType: fShiftType,
      fuelType: fFuelType,
      dispenserNumber: fDispenser,
      tiers: fTiers,
      totalLiters,
      totalAmount,
      employeeId: fEmployeeId,
      paymentBreakdown: {
        cash: Number(fCash),
        pos: Number(fPos),
        card: 0,
        coupon: Number(fCoupon),
      },
      note: fNote.trim(),
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
              Шатахууны борлуулалтын бүртгэл
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Лангуу & Бууны заалт
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Бууны тоолуурын эхний ба эцсийн заалт, литрийн тооцоо, ээлжийн дундуур үнэ өөрчлөгдөх үеийн олон шатлалт бүртгэл
          </p>
        </div>

        <button
          onClick={openAddSale}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Шатахууны борлуулалт бүртгэх</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>НИЙТ БОРЛУУЛАЛТ (₮)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {formatMNT(totalSalesRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Бүх ээлжүүдийн түгээсэн нийт дүн
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ТҮГЭЭСЭН ШАТАХУУН (ЛИТР)</span>
            <Fuel className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-800">
            {totalLitersSold.toLocaleString()} л
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {fuelShiftSales.length} ээлжийн бүртгэлтэй
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>АИ-92 БОРЛУУЛАЛТ</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-700">
            {formatMNT(ai92SalesRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Одоогийн үнэ: {formatMNT(fuelPrices.find((f) => f.fuelType === 'АИ-92')?.pricePerLiter || 2390)}/л
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ДИЗЕЛЬ ТҮЛШ БОРЛУУЛАЛТ</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-700">
            {formatMNT(dieselSalesRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Одоогийн үнэ: {formatMNT(fuelPrices.find((f) => f.fuelType === 'Дизель түлш')?.pricePerLiter || 3740)}/л
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Буу, ажилтан, түлшээр хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
            title="Огноогоор шүүх"
          />

          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
          >
            <option value="all">Бүх ээлж</option>
            <option value="day">Өдрийн ээлж (09:00)</option>
            <option value="night">Оройн ээлж (20:30)</option>
          </select>

          <select
            value={selectedFuelType}
            onChange={(e) => setSelectedFuelType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
          >
            <option value="all">Бүх шатахуун</option>
            <option value="АИ-92">АИ-92</option>
            <option value="Дизель">Дизель түлш</option>
            <option value="А-80">А-80</option>
          </select>

          {(selectedDate || selectedShift !== 'all' || selectedFuelType !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDate('');
                setSelectedShift('all');
                setSelectedFuelType('all');
                setSearchQuery('');
              }}
              className="text-xs text-rose-600 font-bold hover:underline px-2 cursor-pointer"
            >
              Шүүлт цэвэрлэх
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Нийт <strong>{filteredSales.length}</strong> ээлжийн бүртгэл харагдаж байна
        </div>
      </div>

      {/* Fuel Sales List */}
      <div className="space-y-4">
        {filteredSales.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <Fuel className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">Шатахууны борлуулалтын бүртгэл олдсонгүй</p>
            <p className="text-xs text-slate-400 mt-1">Шүүлтүүрээ өөрчлөх эсвэл шинэ борлуулалт бүртгэнэ үү</p>
          </div>
        ) : (
          filteredSales.map((sale) => {
            const emp = employees.find((e) => e.id === sale.employeeId);
            return (
              <div
                key={sale.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 transition-all hover:border-slate-300"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold text-slate-900 text-sm font-mono">{sale.date}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        sale.shiftType === 'day'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {sale.shiftType === 'day' ? 'Өдрийн ээлж (09:00)' : 'Шөнийн ээлж (20:30)'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-blue-100 text-blue-900">
                      {sale.fuelType}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {sale.dispenserNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Түгээгч:</span>
                      <strong className="text-slate-900">{emp?.name || 'Ажилтан'}</strong>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('Энэ борлуулалтын бүртгэлийг устгах уу?')) {
                          deleteFuelShiftSale(sale.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-50 cursor-pointer"
                      title="Устгах"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Meter & Price Tiers Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Үнийн шатлал / Тариф</th>
                        <th className="py-2.5 px-3 text-right">Эхний заалт</th>
                        <th className="py-2.5 px-3 text-right">Эцсийн заалт</th>
                        <th className="py-2.5 px-3 text-center">Борлуулсан литр</th>
                        <th className="py-2.5 px-3 text-right">Нэгжийн үнэ (₮)</th>
                        <th className="py-2.5 px-3 text-right font-bold">Нийт дүн (₮)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sale.tiers.map((tier) => (
                        <tr key={tier.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-medium text-slate-900">{tier.tierLabel}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                            {tier.startMeter !== undefined ? tier.startMeter.toLocaleString() : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            {tier.endMeter !== undefined ? tier.endMeter.toLocaleString() : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-900">
                            {tier.litersSold.toLocaleString()} л
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                            {formatMNT(tier.pricePerLiter)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {formatMNT(tier.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan={3} className="py-2.5 px-3 text-slate-900">
                          Нийт ээлжийн дүн:
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-blue-800 text-sm">
                          {sale.totalLiters.toLocaleString()} л
                        </td>
                        <td className="py-2.5 px-3"></td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 text-base">
                          {formatMNT(sale.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Payment Breakdown Footer */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Бэлнээр: <strong>{formatMNT(sale.paymentBreakdown.cash)}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      POS / Картаар: <strong>{formatMNT(sale.paymentBreakdown.pos)}</strong>
                    </span>
                    {sale.paymentBreakdown.coupon > 0 && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Талон: <strong>{formatMNT(sale.paymentBreakdown.coupon)}</strong>
                      </span>
                    )}
                  </div>

                  {sale.note && (
                    <div className="italic text-slate-400 text-xs">
                      "{sale.note}"
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Fuel Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Шатахууны борлуулалт шинээр бүртгэх
                  </h3>
                  <p className="text-xs text-slate-500">
                    Бууны эхний/эцсийн тоолуур, олон шатлалт тариф ба төлбөрийн хэлбэр
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

            <form onSubmit={handleSaveSale} className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Огноо:</label>
                  <input
                    type="date"
                    required
                    value={fDate}
                    onChange={(e) => setFDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Ээлж:</label>
                  <select
                    value={fShiftType}
                    onChange={(e) => setFShiftType(e.target.value as HandoverShiftType)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="day">Өдрийн ээлж (09:00 - 20:30)</option>
                    <option value="night">Шөнийн ээлж (20:30 - 08:30)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Шатахууны төрөл:</label>
                  <select
                    value={fFuelType}
                    onChange={(e) => handleFuelTypeChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {fuelPrices.map((fp) => (
                      <option key={fp.id} value={fp.fuelType}>
                        {fp.fuelType} ({formatMNT(fp.pricePerLiter)}/л)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Буу / Лангууны дугаар:</label>
                  <input
                    type="text"
                    required
                    placeholder="Жишээ: Буу №1 & №2"
                    value={fDispenser}
                    onChange={(e) => setFDispenser(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Хариуцсан түгээгч:</label>
                  <select
                    value={fEmployeeId}
                    onChange={(e) => setFEmployeeId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role || 'Түгээгч'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Tiers (Supports multi-tier if price changed mid-shift) */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Бууны тоолуур & Үнийн шатлалууд
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Ээлжийн дундуур үнэ өөрчлөгдсөн бол "+ Үнийн шатлал нэмэх" товчийг дарна уу
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addTierRow}
                    className="px-2.5 py-1 bg-white border border-slate-300 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    + Шатлал нэмэх
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {fTiers.map((tier, idx) => (
                    <div
                      key={tier.id}
                      className="p-3 bg-white rounded-lg border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>Шатлал #{idx + 1}</span>
                        {fTiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTierRow(idx)}
                            className="text-rose-500 hover:text-rose-700 text-xs cursor-pointer"
                          >
                            Устгах
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 block">Тайлбар / Тариф:</label>
                          <input
                            type="text"
                            value={tier.tierLabel}
                            onChange={(e) => updateTierRow(idx, { tierLabel: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block">1 литрийн үнэ (₮):</label>
                          <input
                            type="number"
                            min="1"
                            value={tier.pricePerLiter}
                            onChange={(e) => updateTierRow(idx, { pricePerLiter: Number(e.target.value) })}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono font-bold text-blue-700"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block">Борлуулсан литр:</label>
                          <input
                            type="number"
                            min="1"
                            value={tier.litersSold}
                            onChange={(e) => updateTierRow(idx, { litersSold: Number(e.target.value) })}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block">Нийт дүн (₮):</label>
                          <div className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-emerald-700">
                            {formatMNT(tier.amount)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Эхний заалт (сонголттой):</label>
                          <input
                            type="number"
                            value={tier.startMeter || ''}
                            placeholder="0"
                            onChange={(e) => updateTierRow(idx, { startMeter: Number(e.target.value) })}
                            className="w-full px-2 py-1 border border-slate-100 rounded text-[11px] font-mono text-slate-600"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Эцсийн заалт (сонголттой):</label>
                          <input
                            type="number"
                            value={tier.endMeter || ''}
                            placeholder="0"
                            onChange={(e) => updateTierRow(idx, { endMeter: Number(e.target.value) })}
                            className="w-full px-2 py-1 border border-slate-100 rounded text-[11px] font-mono text-slate-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-blue-50/80 rounded-lg text-xs flex items-center justify-between font-bold">
                  <span>Бүх шатлалын нийлбэр дүн:</span>
                  <div className="space-x-3 text-right">
                    <span className="text-blue-900 font-mono">
                      {fTiers.reduce((s, t) => s + (t.litersSold || 0), 0)} литр
                    </span>
                    <span className="text-emerald-700 font-mono text-sm">
                      {formatMNT(fTiers.reduce((s, t) => s + (t.amount || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Split */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                <h4 className="font-bold text-slate-900 text-xs">Төлбөрийн хэлбэрийн задргаа</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block">Бэлэн мөнгө (₮):</label>
                    <input
                      type="number"
                      min="0"
                      value={fCash}
                      onChange={(e) => setFCash(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block">POS / Карт (₮):</label>
                    <input
                      type="number"
                      min="0"
                      value={fPos}
                      onChange={(e) => setFPos(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block">Талон / Карт (₮):</label>
                    <input
                      type="number"
                      min="0"
                      value={fCoupon}
                      onChange={(e) => setFCoupon(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Тэмдэглэл / Тайлбар:</label>
                <input
                  type="text"
                  placeholder="Ээлжийн онцлох тайлбар..."
                  value={fNote}
                  onChange={(e) => setFNote(e.target.value)}
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
