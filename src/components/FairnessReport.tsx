import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  ArrowLeftRight,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Users,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { MONGOLIAN_MONTH_SIMPLE } from '../utils/dateUtils';
import { downloadFile, exportMonthScheduleToCSV } from '../utils/scheduler';
import { formatMNT } from '../utils/calculations';

type ReportCategory =
  | 'schedule'
  | 'attendance'
  | 'handover_day'
  | 'handover_night'
  | 'lateness'
  | 'worked_hours'
  | 'payroll_calc'
  | 'payout_25'
  | 'payout_10'
  | 'unpaid_balance';

export const FairnessReport: React.FC = () => {
  const {
    selectedYear,
    selectedMonth,
    monthlyStats,
    employees,
    groups,
    shifts,
    handovers,
    attendance,
    payrollCalculations,
    payrollPayments,
    settings,
  } = useShifts();

  const [activeReport, setActiveReport] = useState<ReportCategory>('schedule');

  // Report tabs definition
  const reportTabs: { id: ReportCategory; label: string }[] = [
    { id: 'schedule', label: '1. Сарын ээлжийн хуваарь' },
    { id: 'attendance', label: '2. Ажилтан бүрийн ирц' },
    { id: 'handover_day', label: '3. Өдрийн ээлж (09:00)' },
    { id: 'handover_night', label: '4. Оройн ээлж (20:30)' },
    { id: 'lateness', label: '5. Хоцролтын тайлан' },
    { id: 'worked_hours', label: '6. Ажилласан цагийн тайлан' },
    { id: 'payroll_calc', label: '7. Цалингийн тооцоо' },
    { id: 'payout_25', label: '8. 25-ны олголтын тайлан' },
    { id: 'payout_10', label: '9. 10-ны олголтын тайлан' },
    { id: 'unpaid_balance', label: '10. Төлөгдөөгүй үлдэгдэл' },
  ];

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let fileName = `Tailan_${activeReport}_${selectedYear}_${selectedMonth}.csv`;

    if (activeReport === 'schedule') {
      const csv = exportMonthScheduleToCSV(selectedYear, selectedMonth, shifts, employees, groups);
      downloadFile(csv, fileName, 'text/csv;charset=utf-8;');
      return;
    } else if (activeReport === 'attendance') {
      headers = ['Огноо', 'Ажилтан', 'Ээлж', 'Төлөвлөсөн цаг', 'Бодит цаг', 'Баталгаажсан цаг', 'Төлөв'];
      rows = attendance.map((a) => {
        const emp = employees.find((e) => e.id === a.employeeId)?.name || a.employeeId;
        return [
          a.date,
          emp,
          a.shiftType === 'night' ? 'Шөнийн ээлж' : 'Өдрийн ээлж',
          String(a.plannedHours),
          String(a.actualHours),
          String(a.approvedHours),
          a.isApproved ? 'Баталгаажсан' : 'Хүлээгдэж буй',
        ];
      });
    } else if (activeReport === 'handover_day' || activeReport === 'handover_night') {
      const type = activeReport === 'handover_day' ? 'day' : 'night';
      headers = ['Огноо', 'Төлөвлөсөн цаг', 'Бодитоор ирсэн', 'Хүлээн авсан', 'Хүлээлгэн өгсөн', 'Хоцролт (мин)', 'Хүлээлцсэн эсэх', 'Тайлбар'];
      rows = handovers
        .filter((h) => h.shiftType === type)
        .map((h) => {
          const inEmp = employees.find((e) => e.id === h.incomingEmployeeId)?.name || '';
          const outEmp = employees.find((e) => e.id === h.outgoingEmployeeId)?.name || '';
          return [
            h.date,
            h.scheduledTime,
            h.actualTime,
            inEmp,
            outEmp,
            String(h.latenessMinutes),
            h.isHandedOver ? 'Тийм' : 'Үгүй',
            `"${(h.note || '').replace(/"/g, '""')}"`,
          ];
        });
    } else if (activeReport === 'lateness') {
      headers = ['Огноо', 'Ээлжийн төрөл', 'Хуваарьт цаг', 'Бодит цаг', 'Ажилтан', 'Хоцролтын минут', 'Тайлбар'];
      rows = handovers
        .filter((h) => h.latenessMinutes > 0)
        .map((h) => {
          const emp = employees.find((e) => e.id === h.incomingEmployeeId)?.name || '';
          return [
            h.date,
            h.shiftType === 'day' ? 'Өдрийн ээлж' : 'Оройн ээлж',
            h.scheduledTime,
            h.actualTime,
            emp,
            String(h.latenessMinutes),
            `"${(h.note || '').replace(/"/g, '""')}"`,
          ];
        });
    } else if (activeReport === 'worked_hours') {
      headers = ['Ажилтан', 'Нийт ээлж', 'Бодит цаг', 'Баталгаажсан цаг', 'Илүү цаг'];
      rows = employees.map((emp) => {
        const empAtt = attendance.filter((a) => a.employeeId === emp.id);
        const shiftsCount = empAtt.length;
        const actHours = empAtt.reduce((s, a) => s + (a.actualHours || 0), 0);
        const appHours = empAtt.filter((a) => a.isApproved).reduce((s, a) => s + (a.approvedHours || 0), 0);
        const otHours = empAtt.reduce((s, a) => s + (a.overtimeHours || 0), 0);
        return [emp.name, String(shiftsCount), String(actHours), String(appHours), String(otHours)];
      });
    } else if (activeReport === 'payroll_calc') {
      headers = ['Ажилтан', 'Тооцооны арга', 'Баталгаажсан цаг', 'Үндсэн дүн', 'Илүү цаг', 'Нэмэгдэл', 'Суутгал', 'Нийт бодсон', 'Олгосон', 'Үлдэгдэл'];
      rows = payrollCalculations.map((c) => {
        const emp = employees.find((e) => e.id === c.employeeId);
        return [
          emp?.name || c.employeeId,
          emp?.salaryConfig.calculationType || 'monthly',
          String(c.totalApprovedHours),
          String(c.baseAmount),
          String(c.overtimeAmount),
          String(c.bonusAmount),
          String(c.deductionAmount),
          String(c.totalCalculated),
          String(c.actuallyPaid),
          String(c.remainingBalance),
        ];
      });
    } else if (activeReport === 'payout_25' || activeReport === 'payout_10') {
      const type = activeReport === 'payout_25' ? 'primary_25' : 'secondary_10';
      headers = ['Огноо', 'Ажилтан', 'Бодсон дүн', 'Олгосон дүн', 'Төлөв', 'Тайлбар'];
      rows = payrollPayments
        .filter((p) => p.paymentType === type)
        .map((p) => {
          const emp = employees.find((e) => e.id === p.employeeId)?.name || '';
          return [p.paymentDate, emp, String(p.calculatedAmount), String(p.paidAmount), p.status, `"${(p.note || '').replace(/"/g, '""')}"`];
        });
    } else if (activeReport === 'unpaid_balance') {
      headers = ['Ажилтан', 'Нийт бодсон цалин', 'Нийт олгосон мөнгө', 'Үлдэгдэл цалин'];
      rows = payrollCalculations.map((c) => {
        const emp = employees.find((e) => e.id === c.employeeId)?.name || '';
        return [emp, String(c.totalCalculated), String(c.actuallyPaid), String(c.remainingBalance)];
      });
    }

    const csvContent = '\uFEFF' + [headers, ...rows].map((r) => r.join(',')).join('\r\n');
    downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Нэгдсэн тайлан & Экспорт
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              {selectedYear} оны {MONGOLIAN_MONTH_SIMPLE[selectedMonth - 1]}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Хуваарь, ирц, 09:00 ба 20:30 цагийн хүлээлцэлт, хоцролт, цалин ба олголтын 10 төрлийн тайлан
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Хэвлэх</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV татаж авах</span>
          </button>
        </div>
      </div>

      {/* Report Categories Navigator */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-200/60 rounded-xl">
        {reportTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeReport === tab.id
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report View Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* 1. Schedule */}
        {activeReport === 'schedule' && (
          <div className="p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Сарын ээлжийн хуваарийн тайлан</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Ажилтан</th>
                    <th className="p-3 text-center">Нийт ээлж</th>
                    <th className="p-3 text-center">Ажилласан цаг</th>
                    <th className="p-3 text-center">Амарсан хоног</th>
                    <th className="p-3 text-center">Дараалсан дээд</th>
                    <th className="p-3 text-center">Амралтын өдрийн ээлж</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyStats.map((stat) => (
                    <tr key={stat.employee.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{stat.employee.name}</td>
                      <td className="p-3 text-center font-bold text-slate-900">{stat.totalShifts}</td>
                      <td className="p-3 text-center font-medium">{stat.totalHours} цаг</td>
                      <td className="p-3 text-center text-slate-500">{stat.daysOff} хоног</td>
                      <td className="p-3 text-center font-semibold text-amber-700">{stat.maxConsecutiveShifts} өдөр</td>
                      <td className="p-3 text-center">{stat.weekendShifts} удаа</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Attendance */}
        {activeReport === 'attendance' && (
          <div className="p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Ажилтан бүрийн ирцийн дэлгэрэнгүй тайлан</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Огноо</th>
                    <th className="p-3">Ажилтан</th>
                    <th className="p-3">Ээлж</th>
                    <th className="p-3 text-center">Төлөвлөсөн</th>
                    <th className="p-3 text-center">Бодит цаг</th>
                    <th className="p-3 text-center">Баталгаажсан</th>
                    <th className="p-3">Төлөв</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.map((a) => {
                    const emp = employees.find((e) => e.id === a.employeeId)?.name || '';
                    return (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{a.date}</td>
                        <td className="p-3 font-semibold text-slate-800">{emp}</td>
                        <td className="p-3">{a.shiftType === 'night' ? 'Шөнийн ээлж' : 'Өдрийн ээлж'}</td>
                        <td className="p-3 text-center">{a.plannedHours}ц</td>
                        <td className="p-3 text-center font-bold text-slate-900">{a.actualHours}ц</td>
                        <td className="p-3 text-center font-bold text-emerald-700">{a.isApproved ? `${a.approvedHours}ц` : '-'}</td>
                        <td className="p-3">{a.isApproved ? <span className="text-emerald-700 font-bold">Баталгаажсан</span> : <span className="text-amber-700">Хүлээгдэж буй</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3 & 4. Handover Day & Night */}
        {(activeReport === 'handover_day' || activeReport === 'handover_night') && (
          <div className="p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {activeReport === 'handover_day' ? 'Өдрийн ээлж хүлээлцэх (09:00)' : 'Оройн ээлж хүлээлцэх (20:30)'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Огноо</th>
                    <th className="p-3">Төлөвлөсөн</th>
                    <th className="p-3">Бодит цаг</th>
                    <th className="p-3">Хүлээн авсан</th>
                    <th className="p-3">Хүлээлгэн өгсөн</th>
                    <th className="p-3 text-center">Хоцролт</th>
                    <th className="p-3 text-center">Хүлээлцсэн?</th>
                    <th className="p-3">Тайлбар</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {handovers
                    .filter((h) => h.shiftType === (activeReport === 'handover_day' ? 'day' : 'night'))
                    .map((h) => {
                      const inEmp = employees.find((e) => e.id === h.incomingEmployeeId)?.name || '';
                      const outEmp = employees.find((e) => e.id === h.outgoingEmployeeId)?.name || '';
                      return (
                        <tr key={h.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{h.date}</td>
                          <td className="p-3 font-mono">{h.scheduledTime}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">{h.actualTime}</td>
                          <td className="p-3 font-semibold">{inEmp}</td>
                          <td className="p-3 text-slate-600">{outEmp}</td>
                          <td className="p-3 text-center">
                            {h.latenessMinutes > 0 ? (
                              <span className="text-rose-600 font-bold">+{h.latenessMinutes} мин</span>
                            ) : (
                              <span className="text-emerald-700 font-medium">Яг цагтаа</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {h.isHandedOver ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : 'Үгүй'}
                          </td>
                          <td className="p-3 text-slate-500">{h.note || '-'}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Lateness Report */}
        {activeReport === 'lateness' && (
          <div className="p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Хоцролтын нэгдсэн тайлан</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Огноо</th>
                    <th className="p-3">Ээлж</th>
                    <th className="p-3">Ажилтан</th>
                    <th className="p-3">Төлөвлөсөн</th>
                    <th className="p-3">Ирсэн цаг</th>
                    <th className="p-3 text-center">Хоцролт</th>
                    <th className="p-3">Шалтгаан / Тайлбар</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {handovers
                    .filter((h) => h.latenessMinutes > 0)
                    .map((h) => {
                      const emp = employees.find((e) => e.id === h.incomingEmployeeId)?.name || '';
                      return (
                        <tr key={h.id} className="hover:bg-slate-50 bg-rose-50/15">
                          <td className="p-3 font-semibold text-slate-900">{h.date}</td>
                          <td className="p-3">{h.shiftType === 'day' ? 'Өдрийн ээлж' : 'Оройн ээлж'}</td>
                          <td className="p-3 font-bold text-slate-800">{emp}</td>
                          <td className="p-3 font-mono">{h.scheduledTime}</td>
                          <td className="p-3 font-mono font-bold text-rose-700">{h.actualTime}</td>
                          <td className="p-3 text-center font-bold text-rose-700">+{h.latenessMinutes} мин</td>
                          <td className="p-3 text-slate-600">{h.note || '-'}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Worked Hours */}
        {activeReport === 'worked_hours' && (
          <div className="p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Ажилласан цагийн нэгтгэл</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Ажилтан</th>
                    <th className="p-3 text-center">Нийт ээлж</th>
                    <th className="p-3 text-center">Бодит цаг</th>
                    <th className="p-3 text-center">Баталгаажсан цаг</th>
                    <th className="p-3 text-center">Илүү цаг</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => {
                    const empAtt = attendance.filter((a) => a.employeeId === emp.id);
                    const shiftsCount = empAtt.length;
                    const actHours = empAtt.reduce((s, a) => s + (a.actualHours || 0), 0);
                    const appHours = empAtt.filter((a) => a.isApproved).reduce((s, a) => s + (a.approvedHours || 0), 0);
                    const otHours = empAtt.reduce((s, a) => s + (a.overtimeHours || 0), 0);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{emp.name}</td>
                        <td className="p-3 text-center font-bold">{shiftsCount}</td>
                        <td className="p-3 text-center">{Math.round(actHours * 10) / 10} цаг</td>
                        <td className="p-3 text-center font-bold text-emerald-700">{Math.round(appHours * 10) / 10} цаг</td>
                        <td className="p-3 text-center font-bold text-amber-600">+{otHours} цаг</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Payroll Calc */}
        {activeReport === 'payroll_calc' && (
          <div className="p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Цалингийн тооцооны тайлан (18-ны таслалт)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Ажилтан</th>
                    <th className="p-3 text-right">Үндсэн дүн</th>
                    <th className="p-3 text-right">Илүү цаг</th>
                    <th className="p-3 text-right">Нэмэгдэл</th>
                    <th className="p-3 text-right">Суутгал</th>
                    <th className="p-3 text-right">Нийт бодсон</th>
                    <th className="p-3 text-right">Олгосон мөнгө</th>
                    <th className="p-3 text-right">Үлдэгдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollCalculations.map((c) => {
                    const emp = employees.find((e) => e.id === c.employeeId);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{emp?.name}</td>
                        <td className="p-3 text-right font-mono">{formatMNT(c.baseAmount)}</td>
                        <td className="p-3 text-right font-mono text-amber-600">+{formatMNT(c.overtimeAmount)}</td>
                        <td className="p-3 text-right font-mono text-emerald-600">+{formatMNT(c.bonusAmount)}</td>
                        <td className="p-3 text-right font-mono text-rose-600">-{formatMNT(c.deductionAmount)}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">{formatMNT(c.totalCalculated)}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">{formatMNT(c.actuallyPaid)}</td>
                        <td className="p-3 text-right font-mono font-bold text-rose-600">{formatMNT(c.remainingBalance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8 & 9. Payout 25 & 10 */}
        {(activeReport === 'payout_25' || activeReport === 'payout_10') && (
          <div className="p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {activeReport === 'payout_25' ? '25-ны үндсэн цалингийн олголтын тайлан' : '10-ны үлдэгдэл олголтын тайлан'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Огноо</th>
                    <th className="p-3">Ажилтан</th>
                    <th className="p-3 text-right">Бодсон дүн</th>
                    <th className="p-3 text-right">Олгосон дүн</th>
                    <th className="p-3 text-center">Төлөв</th>
                    <th className="p-3">Тайлбар</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollPayments
                    .filter((p) => p.paymentType === (activeReport === 'payout_25' ? 'primary_25' : 'secondary_10'))
                    .map((p) => {
                      const emp = employees.find((e) => e.id === p.employeeId)?.name || '';
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{p.paymentDate}</td>
                          <td className="p-3 font-bold text-slate-800">{emp}</td>
                          <td className="p-3 text-right font-mono">{formatMNT(p.calculatedAmount)}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700">{formatMNT(p.paidAmount)}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Шилжүүлсэн
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{p.note || '-'}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. Unpaid Balance */}
        {activeReport === 'unpaid_balance' && (
          <div className="p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Төлөгдөөгүй үлдэгдэл цалингийн тайлан</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Ажилтан</th>
                    <th className="p-3 text-right">Нийт бодсон цалин</th>
                    <th className="p-3 text-right">Бодитоор олгосон</th>
                    <th className="p-3 text-right">Үлдэгдэл төлбөр</th>
                    <th className="p-3 text-center">Төлөв</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollCalculations.map((c) => {
                    const emp = employees.find((e) => e.id === c.employeeId);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{emp?.name}</td>
                        <td className="p-3 text-right font-mono">{formatMNT(c.totalCalculated)}</td>
                        <td className="p-3 text-right font-mono text-emerald-700">{formatMNT(c.actuallyPaid)}</td>
                        <td className="p-3 text-right font-mono font-bold text-rose-600">{formatMNT(c.remainingBalance)}</td>
                        <td className="p-3 text-center">
                          {c.remainingBalance <= 0 ? (
                            <span className="text-emerald-700 font-bold">Бүрэн олгогдсон</span>
                          ) : (
                            <span className="text-rose-600 font-bold">Үлдэгдэлтэй</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
