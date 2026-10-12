import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Clock,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Fuel,
  Droplets,
  CreditCard,
  Banknote,
  Building2,
  Users,
  Flame,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { MONGOLIAN_MONTH_SIMPLE } from '../utils/dateUtils';
import { formatMNT } from '../utils/calculations';
import { exportMonthScheduleToCSV, downloadFile } from '../utils/scheduler';

export const ReportsView: React.FC = () => {
  const {
    selectedYear,
    selectedMonth,
    monthlyStats,
    fuelShiftSales,
    oilSales,
    posRecords,
    bankTransactions,
    cashDrawerRecords,
    settlements,
    employees,
    groups,
    shifts,
  } = useShifts();

  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'payment_methods' | 'staff_fairness' | 'discrepancy'>('sales');

  // Sales Totals
  const totalFuelRevenue = fuelShiftSales.reduce((s, x) => s + x.totalAmount, 0);
  const totalFuelLiters = fuelShiftSales.reduce((s, x) => s + x.totalLiters, 0);
  const totalOilRevenue = oilSales.reduce((s, x) => s + x.totalAmount, 0);
  const grandSalesRevenue = totalFuelRevenue + totalOilRevenue;

  // Payment Breakdown
  const cashFromFuel = fuelShiftSales.reduce((s, x) => s + (x.paymentBreakdown.cash || 0), 0);
  const cashFromOil = oilSales.filter((s) => s.paymentMethod === 'cash').reduce((s, x) => s + x.totalAmount, 0);
  const totalCashCollected = cashFromFuel + cashFromOil;

  const posFromFuel = fuelShiftSales.reduce((s, x) => s + (x.paymentBreakdown.pos || 0), 0);
  const posFromOil = oilSales.filter((s) => s.paymentMethod === 'pos').reduce((s, x) => s + x.totalAmount, 0);
  const totalPosCollected = posFromFuel + posFromOil;

  const totalBankQpay = bankTransactions.reduce((s, x) => s + x.amount, 0);

  // Staff Fairness Metrics
  const activeStaff = monthlyStats.filter((s) => s.employee.status === 'active');
  const avgShifts = activeStaff.length
    ? Math.round(activeStaff.reduce((acc, s) => acc + s.totalShifts, 0) / activeStaff.length)
    : 0;
  const avgHours = activeStaff.length
    ? Math.round(activeStaff.reduce((acc, s) => acc + s.totalHours, 0) / activeStaff.length)
    : 0;

  const handleExportCSV = () => {
    const csv = exportMonthScheduleToCSV(selectedYear, selectedMonth, shifts, employees, groups);
    downloadFile(csv, `Tailan_${selectedYear}_${selectedMonth}.csv`, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Нэгдсэн тайлан & Шинжилгээ
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {selectedYear} оны {MONGOLIAN_MONTH_SIMPLE[selectedMonth - 1]}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Борлуулалтын орлого, төлбөрийн хэрэгслийн хуваарилалт, кассын зөрүү ба ажилтнуудын ачааллын тэгш байдал
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>CSV татах</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Хэвлэх</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>НИЙТ БОРЛУУЛАЛТ (₮)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {formatMNT(grandSalesRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Шатахуун + Тос нэмэлт бараа
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ШАТАХУУНЫ ОРЛОГО</span>
            <Fuel className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-800">
            {formatMNT(totalFuelRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Нийт түгээсэн: {totalFuelLiters.toLocaleString()} л
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ТОС, БҮТЭЭГДЭХҮҮН</span>
            <Droplets className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-700">
            {formatMNT(totalOilRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {oilSales.length} удаагийн борлуулалт
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>АЖИЛТНЫ ДУНДАЖ ЭЭЛЖ</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-800">
            {avgShifts} ээлж
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Дундаж цаг: {avgHours} цаг/сар
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-200/60 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeReportTab === 'sales'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>1. Борлуулалтын нэгдсэн тайлан</span>
        </button>

        <button
          onClick={() => setActiveReportTab('payment_methods')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeReportTab === 'payment_methods'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>2. Төлбөрийн хэрэгслийн бүтэц</span>
        </button>

        <button
          onClick={() => setActiveReportTab('staff_fairness')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeReportTab === 'staff_fairness'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>3. Ажилтнуудын ачаалал & Шударга хуваарилалт</span>
        </button>

        <button
          onClick={() => setActiveReportTab('discrepancy')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeReportTab === 'discrepancy'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>4. Кассын зөрүү & Хаалтын хяналт</span>
        </button>
      </div>

      {/* TAB 1: SALES REPORT */}
      {activeReportTab === 'sales' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Борлуулалтын дэлгэрэнгүй бүтэц</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex justify-between items-center font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                <span className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-blue-600" />
                  Шатахууны борлуулалт
                </span>
                <span className="font-mono text-blue-700">{formatMNT(totalFuelRevenue)}</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Нийт түгээсэн хэмжээ:</span>
                  <span className="font-bold font-mono text-slate-900">{totalFuelLiters.toLocaleString()} литр</span>
                </div>
                <div className="flex justify-between">
                  <span>Бүртгэгдсэн ээлжийн тоо:</span>
                  <span className="font-semibold">{fuelShiftSales.length} ээлж</span>
                </div>
                <div className="flex justify-between">
                  <span>Бэлнээр төлсөн:</span>
                  <span className="font-mono font-semibold">{formatMNT(cashFromFuel)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ПОС картаар төлсөн:</span>
                  <span className="font-mono font-semibold">{formatMNT(posFromFuel)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex justify-between items-center font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                <span className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-amber-500" />
                  Тос, нэмэлт бүтээгдэхүүн
                </span>
                <span className="font-mono text-amber-700">{formatMNT(totalOilRevenue)}</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Борлуулалтын тоо:</span>
                  <span className="font-bold font-mono text-slate-900">{oilSales.length} удаа</span>
                </div>
                <div className="flex justify-between">
                  <span>Бэлнээр авсан:</span>
                  <span className="font-mono font-semibold">{formatMNT(cashFromOil)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ПОС картаар авсан:</span>
                  <span className="font-mono font-semibold">{formatMNT(posFromOil)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT METHODS */}
      {activeReportTab === 'payment_methods' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Төлбөрийн хэрэгслийн хувийн жин</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/60 text-center space-y-1">
              <Banknote className="w-6 h-6 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-slate-500 uppercase">Бэлэн мөнгө</div>
              <div className="text-xl font-bold font-mono text-emerald-800">
                {formatMNT(totalCashCollected)}
              </div>
              <div className="text-xs text-slate-500">
                {grandSalesRevenue > 0 ? Math.round((totalCashCollected / grandSalesRevenue) * 100) : 0}% эзэлж байна
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-blue-50/60 text-center space-y-1">
              <CreditCard className="w-6 h-6 text-blue-600 mx-auto" />
              <div className="text-xs font-bold text-slate-500 uppercase">POS Карт</div>
              <div className="text-xl font-bold font-mono text-blue-800">
                {formatMNT(totalPosCollected)}
              </div>
              <div className="text-xs text-slate-500">
                {grandSalesRevenue > 0 ? Math.round((totalPosCollected / grandSalesRevenue) * 100) : 0}% эзэлж байна
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-indigo-50/60 text-center space-y-1">
              <Building2 className="w-6 h-6 text-indigo-600 mx-auto" />
              <div className="text-xs font-bold text-slate-500 uppercase">QPay & Банкны данс</div>
              <div className="text-xl font-bold font-mono text-indigo-800">
                {formatMNT(totalBankQpay)}
              </div>
              <div className="text-xs text-slate-500">
                {bankTransactions.length} гүйлгээ
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STAFF FAIRNESS */}
      {activeReportTab === 'staff_fairness' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              Ажилтнуудын ээлжийн тэгш хуваарилалт & Ачаалал
            </h3>
            <p className="text-xs text-slate-500">
              Нийт ээлж, ажилласан цаг, амралтын өдрүүд болон дараалсан ээлжийн стресс үзүүлэлт
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ажилтан</th>
                  <th className="py-3 px-4 text-center">Төлөв</th>
                  <th className="py-3 px-4 text-center">Нийт ээлж</th>
                  <th className="py-3 px-4 text-center">Нийт цаг</th>
                  <th className="py-3 px-4 text-center">Амралтын өдөр</th>
                  <th className="py-3 px-4 text-center">Дараалсан ээлж</th>
                  <th className="py-3 px-4 text-center">Хазайлт</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyStats.map((stat) => (
                  <tr key={stat.employee.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stat.employee.color }}
                        />
                        <span>{stat.employee.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          stat.employee.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {stat.employee.status === 'active' ? 'Идэвхтэй' : 'Чөлөөтэй'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-slate-900">
                      {stat.totalShifts}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-blue-700">
                      {stat.totalHours} цаг
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {stat.daysOff} өдөр
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {stat.maxConsecutiveShifts}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {stat.deviationFromAverage === 0 ? (
                        <span className="text-emerald-600">0</span>
                      ) : stat.deviationFromAverage > 0 ? (
                        <span className="text-blue-600">+{stat.deviationFromAverage}</span>
                      ) : (
                        <span className="text-amber-600">{stat.deviationFromAverage}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DISCREPANCY */}
      {activeReportTab === 'discrepancy' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              Кассын зөрүү & Ээлж хаалтын хяналт
            </h3>
            <p className="text-xs text-slate-500">
              Борлуулалтын бодит орлого ба кассын бэлэн мөнгө, ПОС-ийн тулгалт
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Огноо / Ээлж</th>
                  <th className="py-3 px-4 text-right">Шатахуун борлуулалт</th>
                  <th className="py-3 px-4 text-right">Тос борлуулалт</th>
                  <th className="py-3 px-4 text-right font-bold">Нийт кассын дүн</th>
                  <th className="py-3 px-4 text-right">Хураасан бэлэн</th>
                  <th className="py-3 px-4 text-right">ПОС орлого</th>
                  <th className="py-3 px-4 text-center font-bold">Зөрүү</th>
                  <th className="py-3 px-4 text-center">Баталгаажсан?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {s.date} ({s.shiftType === 'day' ? 'Өдөр' : 'Орой'})
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {formatMNT(s.totalFuelAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-700">
                      {formatMNT(s.totalOilAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatMNT(s.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {formatMNT(s.cashReceived)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {formatMNT(s.posReceived)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {s.discrepancy === 0 ? (
                        <span className="text-emerald-700">0 ₮ (Таарсан)</span>
                      ) : s.discrepancy > 0 ? (
                        <span className="text-blue-700">+{formatMNT(s.discrepancy)}</span>
                      ) : (
                        <span className="text-rose-600">{formatMNT(s.discrepancy)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {s.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          Баталсан
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold text-[10px]">Хүлээгдэж буй</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
