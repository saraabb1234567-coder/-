import React from 'react';
import { useShifts } from '../context/ShiftContext';
import {
  MONGOLIAN_MONTH_SIMPLE,
  getDaysInMonth,
  formatDate,
  getWeekdayName,
  isWeekend,
} from '../utils/dateUtils';

export const PrintSchedule: React.FC = () => {
  const { selectedYear, selectedMonth, shifts, employees, groups, settings } =
    useShifts();

  const daysCount = getDaysInMonth(selectedYear, selectedMonth);
  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  const empMap = new Map(employees.map((e) => [e.id, e.name]));
  const grpMap = new Map(groups.map((g) => [g.id, g.name]));

  return (
    <div className="hidden print:block p-8 bg-white text-black min-h-screen">
      {/* Header */}
      <div className="border-b-2 border-black pb-4 mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider">
            {settings.workplaceName || 'АЖЛЫН БАЙРНЫ ЭЭЛЖИЙН ХУВААРЬ'}
          </h1>
          <p className="text-sm font-semibold mt-1">
            {selectedYear} ОНЫ {MONGOLIAN_MONTH_SIMPLE[selectedMonth - 1].toUpperCase()}
          </p>
        </div>
        <div className="text-right text-xs">
          <p>Хэвлэсэн огноо: {new Date().toISOString().split('T')[0]}</p>
          <p className="font-semibold">Нийт хоног: {daysCount}</p>
        </div>
      </div>

      {/* Schedule Table */}
      <table className="w-full border-collapse border border-black text-xs mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2 text-center w-12">Өдөр</th>
            <th className="border border-black p-2 text-center w-16">Гараг</th>
            <th className="border border-black p-2 text-left w-24">Баг</th>
            <th className="border border-black p-2 text-left">Ажиллах ажилтнууд</th>
            <th className="border border-black p-2 text-center w-16">Цаг</th>
            <th className="border border-black p-2 text-left">Тэмдэглэл</th>
            <th className="border border-black p-2 text-center w-24">Гарын үсэг</th>
          </tr>
        </thead>
        <tbody>
          {daysArray.map((day) => {
            const dateStr = formatDate(selectedYear, selectedMonth, day);
            const weekday = getWeekdayName(dateStr, true);
            const weekend = isWeekend(dateStr);
            const shift = shifts[dateStr];

            const groupName = shift?.groupId
              ? grpMap.get(shift.groupId) || '-'
              : '-';
            const empNames = (shift?.employeeIds || [])
              .map((id) => empMap.get(id) || id)
              .join(', ');

            return (
              <tr
                key={day}
                className={weekend ? 'bg-gray-50' : ''}
              >
                <td className="border border-black p-1.5 text-center font-bold">
                  {day}
                </td>
                <td className="border border-black p-1.5 text-center">
                  {weekday}
                </td>
                <td className="border border-black p-1.5 font-medium">
                  {shift?.isDayOff ? '-' : groupName}
                </td>
                <td className="border border-black p-1.5 font-semibold">
                  {shift?.isDayOff ? (
                    <span className="italic font-normal">Амралтын өдөр</span>
                  ) : (
                    empNames || '-'
                  )}
                </td>
                <td className="border border-black p-1.5 text-center">
                  {shift?.isDayOff ? '0' : `${shift?.hours || 12}ц`}
                </td>
                <td className="border border-black p-1.5 text-gray-700">
                  {shift?.note || ''}
                </td>
                <td className="border border-black p-1.5"></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 pt-8 border-t border-black text-xs">
        <div>
          <p className="font-semibold mb-6">Хуваарь гаргасан ээлжийн ахлах:</p>
          <p>Гарын үсэг: ______________________ / .................................... /</p>
        </div>
        <div>
          <p className="font-semibold mb-6">Батлав (Удирдлага / Менежер):</p>
          <p>Гарын үсэг: ______________________ / .................................... /</p>
        </div>
      </div>
    </div>
  );
};
