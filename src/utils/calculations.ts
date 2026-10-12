import {
  AttendanceRecord,
  Employee,
  PayrollCalculation,
  AppSettings,
  PayrollPayment,
} from '../types';

/**
 * Calculates duration between start and end datetime in hours,
 * taking into account overnight shifts (spanning midnight) and break minutes.
 */
export function calculateWorkedHours(
  startDateTimeStr: string,
  endDateTimeStr: string,
  breakMinutes = 0
): { actualHours: number; isOvernight: boolean } {
  try {
    const start = new Date(startDateTimeStr);
    const end = new Date(endDateTimeStr);

    let diffMs = end.getTime() - start.getTime();

    // If negative, assume user picked next day for overnight without full date
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000;
    }

    const breakMs = (breakMinutes || 0) * 60 * 1000;
    const netMs = Math.max(0, diffMs - breakMs);
    const actualHours = Math.round((netMs / (1000 * 60 * 60)) * 10) / 10;

    const isOvernight =
      start.getDate() !== end.getDate() ||
      end.getHours() < start.getHours();

    return { actualHours, isOvernight };
  } catch (e) {
    return { actualHours: 0, isOvernight: false };
  }
}

/**
 * Calculates lateness in minutes given scheduled time (e.g. "09:00" or "20:30")
 * and actual time (e.g. "09:15" or "20:25").
 * Returns 0 if on-time or early, or positive number if late.
 */
export function calculateLateness(
  scheduledTimeStr: string,
  actualTimeStr: string
): number {
  if (!scheduledTimeStr || !actualTimeStr) return 0;
  try {
    const [sH, sM] = scheduledTimeStr.split(':').map(Number);
    const [aH, aM] = actualTimeStr.split(':').map(Number);

    const scheduledMinutes = sH * 60 + sM;
    const actualMinutes = aH * 60 + aM;

    const diff = actualMinutes - scheduledMinutes;
    return diff > 0 ? diff : 0;
  } catch (e) {
    return 0;
  }
}

/**
 * Formats monetary amounts in Mongolian Tugrik (MNT).
 * Example: 1850000 -> "1,850,000 ₮"
 */
export function formatMNT(amount: number): string {
  const rounded = Math.round(amount || 0);
  return `${new Intl.NumberFormat('mn-MN').format(rounded)} ₮`;
}

/**
 * Computes payroll calculations for an employee in a given period
 * based on approved attendance records and employee salary rules.
 */
export function calculateEmployeePayroll(
  employee: Employee,
  periodId: string,
  attendanceList: AttendanceRecord[],
  payments: PayrollPayment[],
  adjustments: {
    bonus?: number;
    deduction?: number;
    advance?: number;
  } = {}
): PayrollCalculation {
  const config = employee.salaryConfig;

  // Filter records for this employee that are approved (or all if not yet locked)
  const empRecords = attendanceList.filter((r) => r.employeeId === employee.id);
  const totalShifts = empRecords.filter((r) => !r.isAbsent).length;
  
  // Sum approved hours (use approvedHours if set, otherwise actualHours)
  const totalApprovedHours = empRecords.reduce((sum, r) => {
    return sum + (r.isApproved ? r.approvedHours : r.actualHours || 0);
  }, 0);

  const totalOvertimeHours = empRecords.reduce((sum, r) => {
    return sum + (r.overtimeHours || 0);
  }, 0);

  let baseAmount = 0;
  const effectiveHourlyRate =
    config.hourlyRate ||
    (config.baseSalary > 0 ? Math.round(config.baseSalary / 168) : 12000);

  // Calculation models
  if (config.calculationType === 'monthly') {
    // If fixed monthly, full base salary
    baseAmount = config.baseSalary || 0;
  } else if (config.calculationType === 'hourly') {
    // Hourly rate * approved hours
    baseAmount = Math.round(totalApprovedHours * effectiveHourlyRate);
  } else if (config.calculationType === 'daily') {
    // Daily rate * total shifts
    baseAmount = Math.round(totalShifts * (config.dailyRate || 100000));
  }

  // Overtime payment
  const overtimeMultiplier = config.overtimeMultiplier || 1.5;
  const overtimeAmount = Math.round(
    totalOvertimeHours * effectiveHourlyRate * overtimeMultiplier
  );

  const bonusAmount =
    (config.standardBonus || 0) + (adjustments.bonus !== undefined ? adjustments.bonus : 0);
  const deductionAmount =
    (config.standardDeductions || 0) +
    (adjustments.deduction !== undefined ? adjustments.deduction : 0);
  const advanceAmount = adjustments.advance !== undefined ? adjustments.advance : 0;

  // Total calculated gross/net
  const totalCalculated = Math.max(
    0,
    baseAmount + overtimeAmount + bonusAmount - deductionAmount
  );

  // Filter payments made for this employee in this period
  const empPayments = payments.filter(
    (p) =>
      p.periodId === periodId &&
      p.employeeId === employee.id &&
      p.status === 'completed'
  );

  const actuallyPaid = empPayments.reduce((sum, p) => sum + p.paidAmount, 0);

  // Remaining balance
  const remainingBalance = totalCalculated - actuallyPaid;

  return {
    id: `calc-${periodId}-${employee.id}`,
    periodId,
    employeeId: employee.id,
    totalApprovedHours: Math.round(totalApprovedHours * 10) / 10,
    totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
    totalShifts,
    baseAmount,
    overtimeAmount,
    bonusAmount,
    deductionAmount,
    advanceAmount,
    totalCalculated,
    actuallyPaid,
    remainingBalance,
    isFinalized: false,
    updatedAt: new Date().toISOString(),
  };
}
