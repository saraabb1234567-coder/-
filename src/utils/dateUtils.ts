export const MONGOLIAN_MONTH_NAMES = [
  '1-р сар (Хулгана)',
  '2-р сар (Үхэр)',
  '3-р сар (Бар)',
  '4-р сар (Туулай)',
  '5-р сар (Луу)',
  '6-р сар (Могой)',
  '7-р сар (Морь)',
  '8-р сар (Хонь)',
  '9-р сар (Бич)',
  '10-р сар (Тахиа)',
  '11-р сар (Нохой)',
  '12-р сар (Гахай)',
];

export const MONGOLIAN_MONTH_SIMPLE = [
  '1-р сар',
  '2-р сар',
  '3-р сар',
  '4-р сар',
  '5-р сар',
  '6-р сар',
  '7-р сар',
  '8-р сар',
  '9-р сар',
  '10-р сар',
  '11-р сар',
  '12-р сар',
];

export const MONGOLIAN_WEEKDAYS_SHORT = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
export const MONGOLIAN_WEEKDAYS_FULL = [
  'Даваа',
  'Мягмар',
  'Лхагва',
  'Пүрэв',
  'Баасан',
  'Бямба',
  'Ням',
];

/**
 * Returns total days in a given year and month (1-indexed month)
 * Correctly accounts for leap years in February (28 or 29 days), and 30/31 days.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Formats date into YYYY-MM-DD
 */
export function formatDate(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function parseDateString(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10),
  };
}

/**
 * Returns day of week 0 = Monday, ..., 6 = Sunday (ISO standard)
 */
export function getDayOfWeekIndex(date: Date): number {
  const jsDay = date.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  return (jsDay + 6) % 7;
}

export function isWeekend(dateStr: string): boolean {
  const { year, month, day } = parseDateString(dateStr);
  const d = new Date(year, month - 1, day);
  const dow = d.getDay();
  return dow === 0 || dow === 6; // Sunday or Saturday
}

export function getWeekdayName(dateStr: string, full = false): string {
  const { year, month, day } = parseDateString(dateStr);
  const d = new Date(year, month - 1, day);
  const idx = getDayOfWeekIndex(d);
  return full ? MONGOLIAN_WEEKDAYS_FULL[idx] : MONGOLIAN_WEEKDAYS_SHORT[idx];
}

export function formatMongolianDate(dateStr: string): string {
  const { year, month, day } = parseDateString(dateStr);
  const weekday = getWeekdayName(dateStr, true);
  return `${year} оны ${month}-р сарын ${day}, ${weekday}`;
}

export function getTodayString(): string {
  const now = new Date();
  return formatDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export interface CalendarDayCell {
  dateStr: string;
  year: number;
  month: number;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  weekdayShort: string;
}

/**
 * Generates the full 35 or 42 day grid for a calendar view (Monday-starting)
 */
export function generateMonthCalendarGrid(year: number, month: number): CalendarDayCell[] {
  const todayStr = getTodayString();
  const daysInCurrentMonth = getDaysInMonth(year, month);

  // Day of week of 1st day of month
  const firstDay = new Date(year, month - 1, 1);
  const startDayOffset = getDayOfWeekIndex(firstDay); // 0 (Mon) to 6 (Sun)

  const cells: CalendarDayCell[] = [];

  // Previous month padding days
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = startDayOffset - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dateStr = formatDate(prevYear, prevMonth, day);
    cells.push({
      dateStr,
      year: prevYear,
      month: prevMonth,
      day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: isWeekend(dateStr),
      weekdayShort: getWeekdayName(dateStr, false),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateStr = formatDate(year, month, d);
    cells.push({
      dateStr,
      year,
      month,
      day: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: isWeekend(dateStr),
      weekdayShort: getWeekdayName(dateStr, false),
    });
  }

  // Next month padding days to complete rows (up to multiple of 7)
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7 && remaining > 0) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      const dateStr = formatDate(nextYear, nextMonth, d);
      cells.push({
        dateStr,
        year: nextYear,
        month: nextMonth,
        day: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: isWeekend(dateStr),
        weekdayShort: getWeekdayName(dateStr, false),
      });
    }
  }

  return cells;
}
