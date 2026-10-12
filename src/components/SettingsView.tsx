import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Clock,
  Layers,
  Save,
  RotateCcw,
  Download,
  CheckCircle2,
  Calendar,
  Wallet,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { ScheduleMode, SecondaryPayoutType } from '../types';
import { downloadFile } from '../utils/scheduler';

interface SettingsViewProps {
  onOpenConfirmReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenConfirmReset }) => {
  const {
    settings,
    updateSettings,
    payrollPeriod,
    updatePayrollPeriodConfig,
    employees,
    groups,
    shifts,
    handovers,
    attendance,
    payrollPayments,
  } = useShifts();

  const [workplaceName, setWorkplaceName] = useState(settings.workplaceName);
  const [timezone, setTimezone] = useState(settings.timezone || 'Asia/Ulaanbaatar');
  const [defaultHours, setDefaultHours] = useState(settings.defaultHoursPerShift);
  const [shiftMode, setShiftMode] = useState<ScheduleMode>(settings.shiftMode);
  const [intervalDays, setIntervalDays] = useState(settings.defaultIntervalDays);

  // Handover times
  const [dayHandoverTime, setDayHandoverTime] = useState(settings.dayShiftHandoverTime || '09:00');
  const [nightHandoverTime, setNightHandoverTime] = useState(settings.nightShiftHandoverTime || '20:30');

  // Payroll cycle rules
  const [cutoffDay, setCutoffDay] = useState(payrollPeriod.cutoffDay || 18);
  const [cutoffTime, setCutoffTime] = useState(payrollPeriod.cutoffTime || '18:00');
  const [primaryDay, setPrimaryDay] = useState(payrollPeriod.payoutDayPrimary || 25);
  const [secondaryDay, setSecondaryDay] = useState(payrollPeriod.payoutDaySecondary || 10);
  const [secondaryType, setSecondaryType] = useState<SecondaryPayoutType>(
    payrollPeriod.secondaryPayoutType || 'balance'
  );
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(settings.defaultOvertimeMultiplier || 1.5);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      workplaceName,
      timezone,
      defaultHoursPerShift: Number(defaultHours),
      shiftMode,
      defaultIntervalDays: Number(intervalDays),
      dayShiftHandoverTime: dayHandoverTime,
      nightShiftHandoverTime: nightHandoverTime,
      payrollCutoffDay: Number(cutoffDay),
      payrollCutoffTime: cutoffTime,
      payrollPrimaryDay: Number(primaryDay),
      payrollSecondaryDay: Number(secondaryDay),
      defaultSecondaryType: secondaryType,
      defaultOvertimeMultiplier: Number(overtimeMultiplier),
    });

    updatePayrollPeriodConfig({
      cutoffDay: Number(cutoffDay),
      cutoffTime,
      payoutDayPrimary: Number(primaryDay),
      payoutDaySecondary: Number(secondaryDay),
      secondaryPayoutType: secondaryType,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings: {
        workplaceName,
        timezone,
        defaultHoursPerShift: defaultHours,
        shiftMode,
        defaultIntervalDays: intervalDays,
        dayShiftHandoverTime: dayHandoverTime,
        nightShiftHandoverTime: nightHandoverTime,
        payrollCutoffDay: cutoffDay,
        payrollCutoffTime: cutoffTime,
        payrollPrimaryDay: primaryDay,
        payrollSecondaryDay: secondaryDay,
        defaultSecondaryType: secondaryType,
        defaultOvertimeMultiplier: overtimeMultiplier,
      },
      employees,
      groups,
      shifts,
      handovers,
      attendance,
      payrollPeriod,
      payrollPayments,
    };
    downloadFile(
      JSON.stringify(backupData, null, 2),
      `Eeljiin_System_Backup_${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Системийн нэгдсэн тохиргоо
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Ээлж хүлээлцэх цаг, 18-ны таслалт, 25 ба 10-ны олголтын дүрэм болон нөөцлөлт
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Бүх тохиргоо амжилттай хадгалагдлаа!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        {/* Organization & Timezone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Байгууллага / Салбарын нэр</span>
            </label>
            <input
              type="text"
              value={workplaceName}
              onChange={(e) => setWorkplaceName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Цагийн бүс (Timezone)</span>
            </label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              disabled
            />
          </div>
        </div>

        {/* Handover Times (09:00 & 20:30) */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Ээлж хүлээлцэх цагийн тохиргоо
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Өдрийн ээлж хүлээлцэх цаг</span>
              </label>
              <input
                type="time"
                value={dayHandoverTime}
                onChange={(e) => setDayHandoverTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                required
              />
              <p className="text-[11px] text-slate-500">Үндсэн тохиргоо: 09:00</p>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Оройн ээлж хүлээлцэх цаг</span>
              </label>
              <input
                type="time"
                value={nightHandoverTime}
                onChange={(e) => setNightHandoverTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                required
              />
              <p className="text-[11px] text-slate-500">Үндсэн тохиргоо: 20:30</p>
            </div>
          </div>
        </div>

        {/* Payroll Cycle Rules (18th Cutoff, 25th & 10th payouts) */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Цалингийн мөчлөгийн тохиргоо (18-ны таслалт & 25, 10-ны олголт)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Cutoff Day & Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                1. Цаг таслах өдөр ба цаг:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={cutoffDay}
                  onChange={(e) => setCutoffDay(Number(e.target.value))}
                  className="w-16 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center"
                />
                <input
                  type="time"
                  value={cutoffTime}
                  onChange={(e) => setCutoffTime(e.target.value)}
                  className="flex-1 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
              <p className="text-[11px] text-slate-500">Анхдагч: 18-ны 18:00 цаг</p>
            </div>

            {/* Primary Payout Day */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                2. Үндсэн цалингийн олголт:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={primaryDay}
                  onChange={(e) => setPrimaryDay(Number(e.target.value))}
                  className="w-20 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center"
                />
                <span className="text-xs text-slate-600">-ны өдөр</span>
              </div>
              <p className="text-[11px] text-slate-500">Анхдагч: 25-ны өдөр</p>
            </div>

            {/* Secondary Payout Day & Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                3. Дараагийн олголтын өдөр:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={secondaryDay}
                  onChange={(e) => setSecondaryDay(Number(e.target.value))}
                  className="w-20 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center"
                />
                <span className="text-xs text-slate-600">-ны өдөр</span>
              </div>
              <p className="text-[11px] text-slate-500">Анхдагч: Дараа сарын 10</p>
            </div>
          </div>

          {/* 10th Payout Type option */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                10-ны өдрийн олголтын төрөл:
              </label>
              <select
                value={secondaryType}
                onChange={(e) => setSecondaryType(e.target.value as SecondaryPayoutType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <option value="balance">Үлдэгдэл цалин (Нийт бодсон - 25-ны олгосон)</option>
                <option value="advance">Урьдчилгаа цалин</option>
                <option value="custom_period">Тусдаа хугацааны цалин</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Илүү цагийн үржүүлэгч (коэффициент):
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={overtimeMultiplier}
                onChange={(e) => setOvertimeMultiplier(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              />
              <p className="text-[11px] text-slate-500">Стандарт хувь хэмжээ: 1.5x</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Тохиргоог хадгалах</span>
          </button>
        </div>
      </form>

      {/* Backup and Reset */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">
          Өгөгдөл нөөцлөлт & Демо сэргээлт
        </h3>
        <p className="text-xs text-slate-500">
          Бүх өгөгдөл (ажилтнууд, хосууд, хүлээлцэлт, цагийн бүртгэл, цалин, олголтууд) browser localStorage санах ойд найдвартай хадгалагдана.
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Бүх өгөгдлийг JSON файлаар нөөцлөх</span>
          </button>

          <button
            onClick={onOpenConfirmReset}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Анхны демо өгөгдөл сэргээх (Reset)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
