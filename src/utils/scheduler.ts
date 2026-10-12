import {
  Employee,
  WorkingGroup,
  ShiftAssignment,
  ScheduleConfig,
  EmployeeMonthlyStats,
} from '../types';
import {
  getDaysInMonth,
  formatDate,
  getWeekdayName,
  isWeekend,
  parseDateString,
} from './dateUtils';

/**
 * Generates shift assignments for an entire month according to configuration.
 */
export function generateScheduleForMonth(
  config: ScheduleConfig,
  employees: Employee[],
  groups: WorkingGroup[],
  existingShifts: Record<string, ShiftAssignment> = {},
  preserveManualOverrides = false
): Record<string, ShiftAssignment> {
  const { targetYear, targetMonth, mode, intervalDays, startEntityId, defaultHours } = config;
  const daysCount = getDaysInMonth(targetYear, targetMonth);
  const result: Record<string, ShiftAssignment> = {};

  // Filter active employees (exclude 'inactive' and 'on_leave')
  const activeEmployees = employees.filter((e) => e.status === 'active');
  const activeGroups = groups.filter((g) => {
    // A group is active if it has members and at least one is active
    return g.memberIds.some((id) => activeEmployees.some((e) => e.id === id));
  });

  if (activeEmployees.length === 0 && mode !== 'custom') {
    return result;
  }

  // Pre-calculate sequence based on mode
  if (mode === 'group_alternating' && activeGroups.length > 0) {
    // Find starting group index
    let startGroupIdx = activeGroups.findIndex((g) => g.id === startEntityId);
    if (startGroupIdx === -1) startGroupIdx = 0;

    let currentGroupIdx = startGroupIdx;
    let dayInIntervalCounter = 0;

    for (let day = 1; day <= daysCount; day++) {
      const dateStr = formatDate(targetYear, targetMonth, day);

      if (preserveManualOverrides && existingShifts[dateStr]?.isDayOff) {
        result[dateStr] = { ...existingShifts[dateStr] };
        continue;
      }

      const assignedGroup = activeGroups[currentGroupIdx % activeGroups.length];
      // Only include active members
      const assignedEmployeeIds = assignedGroup.memberIds.filter((id) =>
        activeEmployees.some((e) => e.id === id)
      );

      result[dateStr] = {
        date: dateStr,
        groupId: assignedGroup.id,
        employeeIds: assignedEmployeeIds,
        isDayOff: false,
        hours: defaultHours || 12,
        note: existingShifts[dateStr]?.note || '',
      };

      dayInIntervalCounter++;
      if (dayInIntervalCounter >= intervalDays) {
        dayInIntervalCounter = 0;
        currentGroupIdx = (currentGroupIdx + 1) % activeGroups.length;
      }
    }
  } else if (mode === 'single') {
    // One employee per day, rotating every intervalDays
    let startEmpIdx = activeEmployees.findIndex((e) => e.id === startEntityId);
    if (startEmpIdx === -1) startEmpIdx = 0;

    let currentEmpIdx = startEmpIdx;
    let dayInIntervalCounter = 0;

    for (let day = 1; day <= daysCount; day++) {
      const dateStr = formatDate(targetYear, targetMonth, day);

      if (preserveManualOverrides && existingShifts[dateStr]?.isDayOff) {
        result[dateStr] = { ...existingShifts[dateStr] };
        continue;
      }

      const emp = activeEmployees[currentEmpIdx % activeEmployees.length];
      result[dateStr] = {
        date: dateStr,
        groupId: emp.groupId || null,
        employeeIds: [emp.id],
        isDayOff: false,
        hours: defaultHours || 12,
        note: existingShifts[dateStr]?.note || '',
      };

      dayInIntervalCounter++;
      if (dayInIntervalCounter >= intervalDays) {
        dayInIntervalCounter = 0;
        currentEmpIdx = (currentEmpIdx + 1) % activeEmployees.length;
      }
    }
  } else if (mode === 'pair') {
    // Pairs rotating from active employees pool
    // Group active employees into pairs
    const pairs: string[][] = [];
    for (let i = 0; i < activeEmployees.length; i += 2) {
      if (i + 1 < activeEmployees.length) {
        pairs.push([activeEmployees[i].id, activeEmployees[i + 1].id]);
      } else {
        // odd employee shares or is solo
        pairs.push([activeEmployees[i].id]);
      }
    }

    if (pairs.length === 0) return result;

    let currentPairIdx = 0;
    let dayInIntervalCounter = 0;

    for (let day = 1; day <= daysCount; day++) {
      const dateStr = formatDate(targetYear, targetMonth, day);

      if (preserveManualOverrides && existingShifts[dateStr]?.isDayOff) {
        result[dateStr] = { ...existingShifts[dateStr] };
        continue;
      }

      const assignedEmpIds = pairs[currentPairIdx % pairs.length];
      // find common group if any
      const commonGroup = groups.find((g) =>
        assignedEmpIds.every((id) => g.memberIds.includes(id))
      );

      result[dateStr] = {
        date: dateStr,
        groupId: commonGroup ? commonGroup.id : null,
        employeeIds: assignedEmpIds,
        isDayOff: false,
        hours: defaultHours || 12,
        note: existingShifts[dateStr]?.note || '',
      };

      dayInIntervalCounter++;
      if (dayInIntervalCounter >= intervalDays) {
        dayInIntervalCounter = 0;
        currentPairIdx = (currentPairIdx + 1) % pairs.length;
      }
    }
  }

  return result;
}

/**
 * Calculates monthly fairness and statistics for all employees
 */
export function calculateMonthlyStats(
  targetYear: number,
  targetMonth: number,
  employees: Employee[],
  shifts: Record<string, ShiftAssignment>
): EmployeeMonthlyStats[] {
  const daysCount = getDaysInMonth(targetYear, targetMonth);

  // Month date strings
  const monthDates: string[] = [];
  for (let d = 1; d <= daysCount; d++) {
    monthDates.push(formatDate(targetYear, targetMonth, d));
  }

  // Calculate per-employee stats
  const statsList = employees.map((emp) => {
    let totalShifts = 0;
    let totalHours = 0;
    let weekendShifts = 0;
    let maxConsecutive = 0;
    let currentStreak = 0;

    for (const dateStr of monthDates) {
      const shift = shifts[dateStr];
      const isWorking = shift && !shift.isDayOff && shift.employeeIds.includes(emp.id);

      if (isWorking) {
        totalShifts++;
        totalHours += shift.hours || 12;
        if (isWeekend(dateStr)) {
          weekendShifts++;
        }
        currentStreak++;
        if (currentStreak > maxConsecutive) {
          maxConsecutive = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }

    const daysOff = daysCount - totalShifts;

    return {
      employee: emp,
      totalShifts,
      totalHours,
      daysOff,
      maxConsecutiveShifts: maxConsecutive,
      weekendShifts,
      deviationFromAverage: 0,
    };
  });

  // Calculate average among active employees
  const activeStats = statsList.filter((s) => s.employee.status === 'active');
  const avgShifts =
    activeStats.length > 0
      ? activeStats.reduce((sum, s) => sum + s.totalShifts, 0) / activeStats.length
      : 0;

  return statsList.map((s) => ({
    ...s,
    deviationFromAverage: Math.round((s.totalShifts - avgShifts) * 10) / 10,
  }));
}

/**
 * Swaps assignments between two specific dates
 */
export function swapDateAssignments(
  dateA: string,
  dateB: string,
  shifts: Record<string, ShiftAssignment>
): Record<string, ShiftAssignment> {
  const newShifts = { ...shifts };
  const shiftA = newShifts[dateA] || {
    date: dateA,
    employeeIds: [],
    hours: 12,
    isDayOff: false,
  };
  const shiftB = newShifts[dateB] || {
    date: dateB,
    employeeIds: [],
    hours: 12,
    isDayOff: false,
  };

  newShifts[dateA] = {
    ...shiftB,
    date: dateA,
  };

  newShifts[dateB] = {
    ...shiftA,
    date: dateB,
  };

  return newShifts;
}

/**
 * Generates CSV string for exporting monthly shifts with UTF-8 BOM
 */
export function exportMonthScheduleToCSV(
  targetYear: number,
  targetMonth: number,
  shifts: Record<string, ShiftAssignment>,
  employees: Employee[],
  groups: WorkingGroup[]
): string {
  const daysCount = getDaysInMonth(targetYear, targetMonth);
  const empMap = new Map(employees.map((e) => [e.id, e.name]));
  const grpMap = new Map(groups.map((g) => [g.id, g.name]));

  const headers = ['Огноо', 'Гараг', 'Төлөв', 'Баг', 'Ажилтнууд', 'Ээлжийн цаг', 'Тэмдэглэл'];
  const rows: string[][] = [headers];

  for (let d = 1; d <= daysCount; d++) {
    const dateStr = formatDate(targetYear, targetMonth, d);
    const weekday = getWeekdayName(dateStr, true);
    const shift = shifts[dateStr];

    if (!shift) {
      rows.push([dateStr, weekday, 'Хуваарилагдаагүй', '-', '-', '0', '']);
      continue;
    }

    if (shift.isDayOff) {
      rows.push([dateStr, weekday, 'Амралтын өдөр', '-', '-', '0', shift.note || '']);
      continue;
    }

    const groupName = shift.groupId ? grpMap.get(shift.groupId) || '-' : '-';
    const empNames = shift.employeeIds.map((id) => empMap.get(id) || id).join(', ');
    const hours = String(shift.hours || 12);
    const note = (shift.note || '').replace(/"/g, '""');

    rows.push([
      dateStr,
      weekday,
      'Ажиллах',
      groupName,
      `"${empNames}"`,
      hours,
      `"${note}"`,
    ]);
  }

  // Prepend UTF-8 BOM for Cyrillic support in Microsoft Excel
  const csvContent = '\uFEFF' + rows.map((r) => r.join(',')).join('\r\n');
  return csvContent;
}

/**
 * Triggers a file download in browser
 */
export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
