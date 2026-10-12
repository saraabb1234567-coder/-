import React, { useState } from 'react';
import {
  Calculator,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Wallet,
  TrendingUp,
  DollarSign,
  Plus,
  Edit3,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { formatMNT } from '../utils/calculations';
import { Employee, SalaryCalculationType } from '../types';

export const PayrollView: React.FC = () => {
  const {
    payrollPeriod,
    toggleClosePayrollPeriod,
    updatePayrollPeriodConfig,
    payrollCalculations,
    employees,
    updateEmployee,
    updateEmployeeAdjustment,
    settings,
  } = useShifts();

  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);

  // Adjustment fields
  const [bonus, setBonus] = useState<number>(0);
  const [deduction, setDeduction] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(0);
  const [calculationType, setCalculationType] = useState<SalaryCalculationType>('monthly');
  const [baseSalary, setBaseSalary] = useState<number>(2000000);
  const [hourlyRate, setHourlyRate] = useState<number>(12000);

  const openAdjust = (emp: Employee) => {
    const calc = payrollCalculations.find((c) => c.employeeId === emp.id);
    setSelectedEmp(emp);
    setBonus(calc?.bonusAmount || emp.salaryConfig.standardBonus || 0);
    setDeduction(calc?.deductionAmount || emp.salaryConfig.standardDeductions || 0);
    setAdvance(calc?.advanceAmount || 0);
    setCalculationType(emp.salaryConfig.calculationType);
    setBaseSalary(emp.salaryConfig.baseSalary);
    setHourlyRate(emp.salaryConfig.hourlyRate);
    setShowAdjustModal(true);
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    // Update employee salary configuration
    updateEmployee(selectedEmp.id, {
      salaryConfig: {
        ...selectedEmp.salaryConfig,
        calculationType,
        baseSalary: Number(baseSalary),
        hourlyRate: Number(hourlyRate),
      },
    });

    // Update adjustments
    updateEmployeeAdjustment(selectedEmp.id, {
      bonus: Number(bonus),
      deduction: Number(deduction),
      advance: Number(advance),
    });

    setShowAdjustModal(false);
    setSelectedEmp(null);
  };

  // Grand totals
  const totalCalculatedSum = payrollCalculations.reduce(
    (sum, c) => sum + c.totalCalculated,
    0
  );
  const totalPaidSum = payrollCalculations.reduce(
    (sum, c) => sum + c.actuallyPaid,
    0
  );
  const totalRemainingSum = payrollCalculations.reduce(
    (sum, c) => sum + c.remainingBalance,
    0
  );
  const totalApprovedHoursSum = payrollCalculations.reduce(
    (sum, c) => sum + c.totalApprovedHours,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with 18th Cutoff Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Цалингийн тооцоо & 18-ны таслалт
            </h2>
            {payrollPeriod.isClosed ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <Lock className="w-3 h-3" />
                18-ны өдөр бүртгэл хаагдсан
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                <Unlock className="w-3 h-3" />
                Бүртгэл нээлттэй (Идэвхтэй мөчлөг)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Сарын {payrollPeriod.cutoffDay}-ны {payrollPeriod.cutoffTime} цагт цагийн тооцоо таслагдаж, 25 болон дараа сарын 10-нд олгогдоно
          </p>
        </div>

        {/* Cutoff Toggle */}
        <div className="flex items-center gap-2">
          {payrollPeriod.isClosed ? (
            <button
              onClick={() => setShowUnlockConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Unlock className="w-4 h-4 text-amber-700" />
              <span>Хаалтыг нээх (Засвар оруулах)</span>
            </button>
          ) : (
            <button
              onClick={toggleClosePayrollPeriod}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>18-ны тооцоог хааж баталгаажуулах</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            НИЙТ БОДСОН ЦАЛИН
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatMNT(totalCalculatedSum)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Баталгаажсан цаг ба нэмэгдлийн нийлбэр
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            БОДИТООР ОЛГОСОН МӨНГӨ
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {formatMNT(totalPaidSum)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            25 болон 10-нд шилжүүлсэн дүн
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            ҮЛДЭГДЭЛ ЦАЛИН
          </span>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {formatMNT(totalRemainingSum)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Олгогдоогүй үлдсэн нийт төлбөр
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            БААТАЛГААЖСАН ЦАГ
          </span>
          <div className="mt-2 text-2xl font-bold text-blue-700">
            {totalApprovedHoursSum} цаг
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Нийт ажилтнуудын ажилласан хугацаа
          </p>
        </div>
      </div>

      {/* Main Payroll Calculation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Ажилтнуудын цалингийн дэлгэрэнгүй тооцоолол
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            18-ны таслалт дээр үндэслэгдсэн
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ажилтан</th>
                <th className="py-3 px-4">Тооцооны арга</th>
                <th className="py-3 px-4 text-center">Цаг / Ээлж</th>
                <th className="py-3 px-4 text-right">Үндсэн дүн</th>
                <th className="py-3 px-4 text-right">Илүү цаг</th>
                <th className="py-3 px-4 text-right">Нэмэгдэл</th>
                <th className="py-3 px-4 text-right">Суутгал</th>
                <th className="py-3 px-4 text-right">Нийт бодсон</th>
                <th className="py-3 px-4 text-right">Олгосон мөнгө</th>
                <th className="py-3 px-4 text-right">Үлдэгдэл</th>
                <th className="py-3 px-4 text-center">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrollCalculations.map((calc) => {
                const emp = employees.find((e) => e.id === calc.employeeId);
                if (!emp) return null;

                const modelName =
                  emp.salaryConfig.calculationType === 'monthly'
                    ? 'Сарын үндсэн'
                    : emp.salaryConfig.calculationType === 'hourly'
                    ? 'Цагаар бодох'
                    : 'Өдрөөр бодох';

                return (
                  <tr key={calc.id} className="hover:bg-slate-50 transition-colors">
                    {/* Employee */}
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: emp.color }}
                        />
                        <span>{emp.name}</span>
                        {emp.status === 'on_leave' && (
                          <span className="text-[10px] px-1 py-0.2 bg-amber-100 text-amber-800 rounded font-normal">
                            Чөлөөтэй
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Model */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {modelName}
                      </span>
                    </td>

                    {/* Hours & Shifts */}
                    <td className="py-3 px-4 text-center font-mono">
                      <div>{calc.totalApprovedHours}ц</div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        ({calc.totalShifts} ээлж)
                      </div>
                    </td>

                    {/* Base amount */}
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                      {formatMNT(calc.baseAmount)}
                    </td>

                    {/* Overtime */}
                    <td className="py-3 px-4 text-right font-mono text-amber-700 font-medium">
                      {calc.overtimeAmount > 0 ? `+${formatMNT(calc.overtimeAmount)}` : '-'}
                    </td>

                    {/* Bonus */}
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 font-medium">
                      {calc.bonusAmount > 0 ? `+${formatMNT(calc.bonusAmount)}` : '-'}
                    </td>

                    {/* Deductions */}
                    <td className="py-3 px-4 text-right font-mono text-rose-700 font-medium">
                      {calc.deductionAmount > 0 ? `-${formatMNT(calc.deductionAmount)}` : '-'}
                    </td>

                    {/* Total Calculated */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatMNT(calc.totalCalculated)}
                    </td>

                    {/* Actually Paid */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatMNT(calc.actuallyPaid)}
                    </td>

                    {/* Remaining Balance */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      {formatMNT(calc.remainingBalance)}
                    </td>

                    {/* Adjust Action */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => openAdjust(emp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md font-semibold text-[11px] cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Тохируулах</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-lg text-white font-bold flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: selectedEmp.color }}
                >
                  {selectedEmp.name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedEmp.name} — Цалингийн нөхцөл засах
                  </h3>
                  <p className="text-xs text-slate-500">
                    Үндсэн цалин, цагийн үнэлгээ, нэмэгдэл, суутгал
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Calculation Model */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Цалин бодох арга:
                </label>
                <select
                  value={calculationType}
                  onChange={(e) => setCalculationType(e.target.value as SalaryCalculationType)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="monthly">Үндсэн сарын цалингаар</option>
                  <option value="hourly">Ажилласан цагаар бодох</option>
                  <option value="daily">Өдрийн үнэлгээгээр бодох</option>
                </select>
              </div>

              {/* Base salary / Hourly rate */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Сарын үндсэн (₮):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Цагийн үнэлгээ (₮):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Bonus & Deductions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-700 block">
                    Нэмэгдэл / Урамшуулал (₮):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={bonus}
                    onChange={(e) => setBonus(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-rose-700 block">
                    Суутгал / Торгууль (₮):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={deduction}
                    onChange={(e) => setDeduction(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Advance payment adjustment */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Урьдчилгаа олгосон дүн (₮):
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={advance}
                  onChange={(e) => setAdvance(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
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

      {/* Unlock confirmation dialog */}
      {showUnlockConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-900 text-base">
                18-ны хаалтыг түр нээх үү?
              </h4>
              <p className="text-xs text-slate-500">
                Хаалтыг нээснээр цагийн тооцоо болон нэмэгдэл, суутгалд админы засвар оруулах боломжтой болно.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowUnlockConfirm(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                Болих
              </button>
              <button
                onClick={() => {
                  toggleClosePayrollPeriod();
                  setShowUnlockConfirm(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Тийм, нээх
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
