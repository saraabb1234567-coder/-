import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import {
  Employee,
  WorkingGroup,
  ShiftAssignment,
  AppSettings,
  ScheduleConfig,
  EmployeeStatus,
  EmployeeMonthlyStats,
  HandoverRecord,
  AttendanceRecord,
  PayrollPeriod,
  PayrollCalculation,
  PayrollPayment,
  OilProduct,
  OilSaleRecord,
  FuelPriceConfig,
  FuelPriceHistory,
  FuelShiftSale,
  ShiftSettlement,
  PosTerminalRecord,
  BankTransactionRecord,
  CashDrawerRecord,
  ManagerHandoverRecord,
  FuelNozzle,
  FuelTank,
  MastshapMeasurementLog,
  FuelDeliveryRecord,
  NozzleStatus,
  TankStatus,
} from '../types';
import {
  DEFAULT_EMPLOYEES,
  DEFAULT_GROUPS,
  DEFAULT_SETTINGS,
  DEFAULT_OIL_PRODUCTS,
  DEFAULT_FUEL_PRICES,
  DEFAULT_FUEL_PRICE_HISTORY,
  DEFAULT_OIL_SALES,
  DEFAULT_FUEL_SHIFT_SALES,
  DEFAULT_SETTLEMENTS,
  DEFAULT_POS_RECORDS,
  DEFAULT_BANK_TRANSACTIONS,
  DEFAULT_CASH_DRAWER_RECORDS,
  DEFAULT_MANAGER_HANDOVERS,
  DEFAULT_NOZZLES,
  DEFAULT_TANKS,
  DEFAULT_MASTSHAP_LOGS,
  DEFAULT_DELIVERY_RECORDS,
  DEMO_OIL_SALES,
  DEMO_FUEL_SHIFT_SALES,
  DEMO_SETTLEMENTS,
  DEMO_POS_RECORDS,
  DEMO_BANK_TRANSACTIONS,
  DEMO_CASH_DRAWER_RECORDS,
  DEMO_MANAGER_HANDOVERS,
  DEMO_MASTSHAP_LOGS,
  DEMO_DELIVERY_RECORDS,
  DEMO_PAYROLL_PAYMENTS,
  isDemoId,
  getInitialShifts,
  getInitialHandovers,
  getInitialAttendance,
  getInitialPayrollData,
  loadStoredData,
  saveStoredData,
  clearAllStoredData,
} from '../utils/storage';
import {
  generateScheduleForMonth,
  calculateMonthlyStats,
  swapDateAssignments,
} from '../utils/scheduler';
import {
  calculateWorkedHours,
  calculateLateness,
  calculateEmployeePayroll,
} from '../utils/calculations';
import { parseDateString, getTodayString } from '../utils/dateUtils';

interface ShiftContextType {
  employees: Employee[];
  groups: WorkingGroup[];
  shifts: Record<string, ShiftAssignment>;
  settings: AppSettings;
  selectedYear: number;
  selectedMonth: number;
  monthlyStats: EmployeeMonthlyStats[];

  // Handover state & actions (09:00 & 20:30)
  handovers: HandoverRecord[];
  addHandover: (rec: Omit<HandoverRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHandover: (id: string, updates: Partial<HandoverRecord>) => void;
  verifyHandover: (id: string) => void;

  // Attendance & Worked Hours state & actions
  attendance: AttendanceRecord[];
  addAttendance: (rec: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>) => void;
  toggleApproveAttendance: (id: string) => void;

  // Payroll Period state & actions (18th Cutoff)
  payrollPeriod: PayrollPeriod;
  toggleClosePayrollPeriod: () => void;
  updatePayrollPeriodConfig: (updates: Partial<PayrollPeriod>) => void;

  // Payroll Calculations & Disbursements (25th & 10th)
  payrollCalculations: PayrollCalculation[];
  payrollPayments: PayrollPayment[];
  recordPayment: (payment: Omit<PayrollPayment, 'id' | 'createdAt'>) => void;
  updatePayment: (id: string, updates: Partial<PayrollPayment>) => void;
  deletePayment: (id: string) => void;
  recalculatePayroll: () => void;
  updateEmployeeAdjustment: (
    employeeId: string,
    adjustments: { bonus?: number; deduction?: number; advance?: number }
  ) => void;

  // ШТС: Тос, бүтээгдэхүүн
  oilProducts: OilProduct[];
  addOilProduct: (prod: Omit<OilProduct, 'id' | 'createdAt' | 'updatedAt' | 'currentStock' | 'totalSalesAmount' | 'soldQuantity'>) => void;
  updateOilProduct: (id: string, updates: Partial<OilProduct>) => void;
  toggleOilProductActive: (id: string) => void;

  // ШТС: Тосны борлуулалт
  oilSales: OilSaleRecord[];
  recordOilSale: (sale: Omit<OilSaleRecord, 'id' | 'createdAt' | 'totalAmount'>) => void;
  deleteOilSale: (id: string) => void;

  // ШТС: Шатахууны үнэ & үнийн түүх
  fuelPrices: FuelPriceConfig[];
  fuelPriceHistory: FuelPriceHistory[];
  updateFuelPrice: (
    fuelType: string,
    newPrice: number,
    effectiveDateTime: string,
    reason: string,
    changedBy: string
  ) => void;

  // ШТС: Ээлжийн шатахууны борлуулалт & олон шатлалт үнэ
  fuelShiftSales: FuelShiftSale[];
  recordFuelShiftSale: (sale: Omit<FuelShiftSale, 'id' | 'createdAt'>) => void;
  updateFuelShiftSale: (id: string, updates: Partial<FuelShiftSale>) => void;
  deleteFuelShiftSale: (id: string) => void;

  // ШТС: Ээлжийн нэгдсэн тооцоо (POS & Бэлэн мөнгө)
  settlements: ShiftSettlement[];
  recordSettlement: (settlement: Omit<ShiftSettlement, 'id' | 'createdAt'>) => void;
  verifySettlement: (id: string, verifiedBy: string) => void;

  // ШТС: POS Төхөөрөмжийн тооцоо
  posRecords: PosTerminalRecord[];
  addPosRecord: (record: Omit<PosTerminalRecord, 'id' | 'createdAt'>) => void;
  updatePosRecord: (id: string, updates: Partial<PosTerminalRecord>) => void;
  settlePosRecord: (id: string) => void;
  deletePosRecord: (id: string) => void;

  // ШТС: Банкны дансны тооцоо & QPay
  bankTransactions: BankTransactionRecord[];
  addBankTransaction: (tx: Omit<BankTransactionRecord, 'id' | 'createdAt'>) => void;
  updateBankTransaction: (id: string, updates: Partial<BankTransactionRecord>) => void;
  reconcileBankTransaction: (id: string, reconciledBy: string) => void;
  deleteBankTransaction: (id: string) => void;

  // ШТС: Бэлэн мөнгөний тооцоо & Дэвсгэрт
  cashDrawerRecords: CashDrawerRecord[];
  saveCashDrawerRecord: (drawer: Omit<CashDrawerRecord, 'id' | 'createdAt'>) => void;

  // ШТС: Эрхлэгчид мөнгө хүлээлгэн өгөх
  managerHandovers: ManagerHandoverRecord[];
  addManagerHandover: (handover: Omit<ManagerHandoverRecord, 'id' | 'createdAt'>) => void;
  updateManagerHandover: (id: string, updates: Partial<ManagerHandoverRecord>) => void;
  confirmManagerHandover: (id: string) => void;
  deleteManagerHandover: (id: string) => void;

  // ШТС: Хошууны төлөв & удирдлага
  nozzles: FuelNozzle[];
  updateNozzleStatus: (id: string, status: NozzleStatus, reason?: string) => void;
  addNozzle: (noz: Omit<FuelNozzle, 'id' | 'updatedAt'>) => void;
  updateNozzle: (id: string, updates: Partial<FuelNozzle>) => void;
  deleteNozzle: (id: string) => void;

  // ШТС: Савны багтаамж & Аюулгүйн босго
  tanks: FuelTank[];
  addTank: (tank: Omit<FuelTank, 'id' | 'updatedAt' | 'status'>) => void;
  updateTank: (id: string, updates: Partial<FuelTank>) => void;
  deleteTank: (id: string) => void;

  // ШТС: Мастшапын хэмжилт
  mastshapLogs: MastshapMeasurementLog[];
  recordMastshapMeasurement: (log: Omit<MastshapMeasurementLog, 'id' | 'createdAt'>) => void;

  // ШТС: Шатахуун буулгалт (Хүлээн авах)
  deliveryRecords: FuelDeliveryRecord[];
  recordFuelDelivery: (delivery: Omit<FuelDeliveryRecord, 'id' | 'createdAt'>) => void;

  // ШТС: Админ эрх хамгаалалт & Нууц үг
  isAdminUnlocked: boolean;
  unlockAdminMode: (password: string) => boolean;
  lockAdminMode: () => void;
  changeAdminPassword: (oldPass: string, newPass: string) => boolean;

  // Navigation
  setSelectedYearMonth: (year: number, month: number) => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToToday: () => void;

  // Employee actions (internal ID preserved)
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  toggleEmployeeStatus: (id: string, newStatus: EmployeeStatus) => void;
  assignEmployeeToGroup: (employeeId: string, groupId: string | null) => void;
  assignEmployeeToDate: (employeeId: string, dateStr: string) => void;
  hasShiftHistory: (employeeId: string) => boolean;

  // Group actions (Pair management)
  addGroup: (group: Omit<WorkingGroup, 'id'>) => void;
  updateGroup: (id: string, updates: Partial<WorkingGroup>) => void;
  deleteGroup: (id: string) => void;
  swapTwoGroups: (groupIdA: string, groupIdB: string) => void;

  // Shift schedule actions
  updateShift: (dateStr: string, shift: Partial<ShiftAssignment>) => void;
  swapDates: (dateA: string, dateB: string) => void;
  generateSchedule: (config: ScheduleConfig) => void;

  // Settings & System
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetToDemoData: () => void;
  loadDemoData: () => void;
  purgeDemoData: () => number;
  importAllData: (data: any) => boolean;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const today = parseDateString(getTodayString());
  const [selectedYear, setSelectedYear] = useState<number>(today.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(today.month);

  // 1. Employees & Groups
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadStoredData<Employee[]>('employees', DEFAULT_EMPLOYEES)
  );

  const [groups, setGroups] = useState<WorkingGroup[]>(() =>
    loadStoredData<WorkingGroup[]>('groups', DEFAULT_GROUPS)
  );

  // 2. Settings
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadStoredData<AppSettings>('settings', DEFAULT_SETTINGS)
  );

  // 3. Shift Assignments
  const [shifts, setShifts] = useState<Record<string, ShiftAssignment>>(() => {
    const stored = loadStoredData<Record<string, ShiftAssignment> | null>('shifts', null);
    if (stored && Object.keys(stored).length > 0) return stored;
    return getInitialShifts(DEFAULT_EMPLOYEES, DEFAULT_GROUPS, DEFAULT_SETTINGS);
  });

  // 4. Handover Records (09:00 & 20:30)
  const [handovers, setHandovers] = useState<HandoverRecord[]>(() => {
    const stored = loadStoredData<HandoverRecord[] | null>('handovers', null);
    if (stored && stored.length > 0) return stored;
    return getInitialHandovers(shifts, employees);
  });

  // 5. Attendance & Hours Records
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const stored = loadStoredData<AttendanceRecord[] | null>('attendance', null);
    if (stored && stored.length > 0) return stored;
    return getInitialAttendance(shifts);
  });

  // 6. Payroll Period & Payments
  const [payrollPeriod, setPayrollPeriod] = useState<PayrollPeriod>(() => {
    const stored = loadStoredData<PayrollPeriod | null>('payroll_period', null);
    if (stored) return stored;
    const initial = getInitialPayrollData(DEFAULT_EMPLOYEES, [], DEFAULT_SETTINGS);
    return initial.period;
  });

  const [payrollPayments, setPayrollPayments] = useState<PayrollPayment[]>(() => {
    const stored = loadStoredData<PayrollPayment[] | null>('payroll_payments', null);
    if (stored) return stored;
    const initial = getInitialPayrollData(DEFAULT_EMPLOYEES, [], DEFAULT_SETTINGS);
    return initial.payments;
  });

  const [adjustmentsMap, setAdjustmentsMap] = useState<
    Record<string, { bonus?: number; deduction?: number; advance?: number }>
  >(() => loadStoredData('payroll_adjustments', {}));

  // 7. ШТС: Тос, бүтээгдэхүүн
  const [oilProducts, setOilProducts] = useState<OilProduct[]>(() =>
    loadStoredData<OilProduct[]>('oil_products', DEFAULT_OIL_PRODUCTS)
  );

  // 8. ШТС: Тосны борлуулалт
  const [oilSales, setOilSales] = useState<OilSaleRecord[]>(() =>
    loadStoredData<OilSaleRecord[]>('oil_sales', DEFAULT_OIL_SALES)
  );

  // 9. ШТС: Шатахууны үнэ & түүх
  const [fuelPrices, setFuelPrices] = useState<FuelPriceConfig[]>(() =>
    loadStoredData<FuelPriceConfig[]>('fuel_prices', DEFAULT_FUEL_PRICES)
  );

  const [fuelPriceHistory, setFuelPriceHistory] = useState<FuelPriceHistory[]>(() =>
    loadStoredData<FuelPriceHistory[]>('fuel_price_history', DEFAULT_FUEL_PRICE_HISTORY)
  );

  // 10. ШТС: Ээлжийн шатахууны борлуулалт
  const [fuelShiftSales, setFuelShiftSales] = useState<FuelShiftSale[]>(() =>
    loadStoredData<FuelShiftSale[]>('fuel_shift_sales', DEFAULT_FUEL_SHIFT_SALES)
  );

  // 11. ШТС: Ээлжийн тооцоо (Settlement)
  const [settlements, setSettlements] = useState<ShiftSettlement[]>(() =>
    loadStoredData<ShiftSettlement[]>('shift_settlements', DEFAULT_SETTLEMENTS)
  );

  // 12. ШТС: POS Төхөөрөмжийн тооцоо
  const [posRecords, setPosRecords] = useState<PosTerminalRecord[]>(() =>
    loadStoredData<PosTerminalRecord[]>('pos_records', DEFAULT_POS_RECORDS)
  );

  // 13. ШТС: Банкны дансны тооцоо & QPay
  const [bankTransactions, setBankTransactions] = useState<BankTransactionRecord[]>(() =>
    loadStoredData<BankTransactionRecord[]>('bank_transactions', DEFAULT_BANK_TRANSACTIONS)
  );

  // 14. ШТС: Бэлэн мөнгөний тооцоо & Дэвсгэрт
  const [cashDrawerRecords, setCashDrawerRecords] = useState<CashDrawerRecord[]>(() =>
    loadStoredData<CashDrawerRecord[]>('cash_drawer_records', DEFAULT_CASH_DRAWER_RECORDS)
  );

  // 15. ШТС: Эрхлэгчид мөнгө хүлээлгэн өгөх
  const [managerHandovers, setManagerHandovers] = useState<ManagerHandoverRecord[]>(() =>
    loadStoredData<ManagerHandoverRecord[]>('manager_handovers', DEFAULT_MANAGER_HANDOVERS)
  );

  // 16. ШТС: Хошууны төлөв
  const [nozzles, setNozzles] = useState<FuelNozzle[]>(() =>
    loadStoredData<FuelNozzle[]>('fuel_nozzles', DEFAULT_NOZZLES)
  );

  // 17. ШТС: Савны багтаамж & Аюулгүйн босго
  const [tanks, setTanks] = useState<FuelTank[]>(() =>
    loadStoredData<FuelTank[]>('fuel_tanks', DEFAULT_TANKS)
  );

  // 18. ШТС: Мастшапын хэмжилтийн түүх
  const [mastshapLogs, setMastshapLogs] = useState<MastshapMeasurementLog[]>(() =>
    loadStoredData<MastshapMeasurementLog[]>('mastshap_logs', DEFAULT_MASTSHAP_LOGS)
  );

  // 19. ШТС: Шатахуун буулгалт (Хүлээн авалт)
  const [deliveryRecords, setDeliveryRecords] = useState<FuelDeliveryRecord[]>(() =>
    loadStoredData<FuelDeliveryRecord[]>('delivery_records', DEFAULT_DELIVERY_RECORDS)
  );

  // 20. Админ эрх горим (Нууц үгээр онгойлгох)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() =>
    loadStoredData<boolean>('admin_unlocked_session', true)
  );

  // Auto-save to localStorage
  useEffect(() => saveStoredData('employees', employees), [employees]);
  useEffect(() => saveStoredData('groups', groups), [groups]);
  useEffect(() => saveStoredData('settings', settings), [settings]);
  useEffect(() => saveStoredData('shifts', shifts), [shifts]);
  useEffect(() => saveStoredData('handovers', handovers), [handovers]);
  useEffect(() => saveStoredData('attendance', attendance), [attendance]);
  useEffect(() => saveStoredData('payroll_period', payrollPeriod), [payrollPeriod]);
  useEffect(() => saveStoredData('payroll_payments', payrollPayments), [payrollPayments]);
  useEffect(() => saveStoredData('payroll_adjustments', adjustmentsMap), [adjustmentsMap]);
  useEffect(() => saveStoredData('oil_products', oilProducts), [oilProducts]);
  useEffect(() => saveStoredData('oil_sales', oilSales), [oilSales]);
  useEffect(() => saveStoredData('fuel_prices', fuelPrices), [fuelPrices]);
  useEffect(() => saveStoredData('fuel_price_history', fuelPriceHistory), [fuelPriceHistory]);
  useEffect(() => saveStoredData('fuel_shift_sales', fuelShiftSales), [fuelShiftSales]);
  useEffect(() => saveStoredData('shift_settlements', settlements), [settlements]);
  useEffect(() => saveStoredData('pos_records', posRecords), [posRecords]);
  useEffect(() => saveStoredData('bank_transactions', bankTransactions), [bankTransactions]);
  useEffect(() => saveStoredData('cash_drawer_records', cashDrawerRecords), [cashDrawerRecords]);
  useEffect(() => saveStoredData('manager_handovers', managerHandovers), [managerHandovers]);
  useEffect(() => saveStoredData('fuel_nozzles', nozzles), [nozzles]);
  useEffect(() => saveStoredData('fuel_tanks', tanks), [tanks]);
  useEffect(() => saveStoredData('mastshap_logs', mastshapLogs), [mastshapLogs]);
  useEffect(() => saveStoredData('delivery_records', deliveryRecords), [deliveryRecords]);
  useEffect(() => saveStoredData('admin_unlocked_session', isAdminUnlocked), [isAdminUnlocked]);

  // Recalculate Payroll Calculations
  const payrollCalculations = useMemo(() => {
    return employees.map((emp) => {
      const adj = adjustmentsMap[emp.id] || {};
      return calculateEmployeePayroll(
        emp,
        payrollPeriod.id,
        attendance,
        payrollPayments,
        adj
      );
    });
  }, [employees, attendance, payrollPayments, payrollPeriod.id, adjustmentsMap]);

  /* =========================================================
     ТОС, БҮТЭЭГДЭХҮҮНИЙ ҮЙЛДЛҮҮД
     ========================================================= */
  const addOilProduct = (
    prodData: Omit<OilProduct, 'id' | 'createdAt' | 'updatedAt' | 'currentStock' | 'totalSalesAmount' | 'soldQuantity'>
  ) => {
    const newId = `oil-${Date.now()}`;
    const initial = prodData.initialStock || 0;
    const added = prodData.addedStock || 0;
    const current = initial + added;
    const newProduct: OilProduct = {
      ...prodData,
      id: newId,
      soldQuantity: 0,
      currentStock: current,
      totalSalesAmount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setOilProducts((prev) => [...prev, newProduct]);
  };

  const updateOilProduct = (id: string, updates: Partial<OilProduct>) => {
    setOilProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const initial = updates.initialStock !== undefined ? updates.initialStock : p.initialStock;
        const added = updates.addedStock !== undefined ? updates.addedStock : p.addedStock;
        const sold = updates.soldQuantity !== undefined ? updates.soldQuantity : p.soldQuantity;
        const price = updates.unitPrice !== undefined ? updates.unitPrice : p.unitPrice;
        const current = initial + added - sold;
        const totalSalesAmount = sold * price;

        return {
          ...p,
          ...updates,
          currentStock: current,
          totalSalesAmount,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const toggleOilProductActive = (id: string) => {
    setOilProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  /* =========================================================
     ТОСНЫ БОРЛУУЛАЛТЫН ҮЙЛДЛҮҮД
     Бүтээгдэхүүн бүрийн борлуулалтын үнэ болон борлуулсан тоог
     тухайн үеийн нэгж үнээр snapshot хийн хадгална.
     Үнэ өөрчлөгдсөн ч өмнөх ээлжийн үнэ өөрчлөгдөхгүй!
     ========================================================= */
  const recordOilSale = (saleData: Omit<OilSaleRecord, 'id' | 'createdAt' | 'totalAmount'>) => {
    const newId = `os-${Date.now()}`;
    const totalAmount = Math.round(saleData.quantity * saleData.unitPrice);
    const newSale: OilSaleRecord = {
      ...saleData,
      id: newId,
      totalAmount,
      createdAt: new Date().toISOString(),
    };

    setOilSales((prev) => [newSale, ...prev]);

    // Update product stock and sold counter
    setOilProducts((prev) =>
      prev.map((p) => {
        if (p.id !== saleData.productId) return p;
        const newSold = p.soldQuantity + saleData.quantity;
        const newCurrent = p.initialStock + p.addedStock - newSold;
        const newTotalSales = p.totalSalesAmount + totalAmount;
        return {
          ...p,
          soldQuantity: newSold,
          currentStock: newCurrent,
          totalSalesAmount: newTotalSales,
        };
      })
    );
  };

  const deleteOilSale = (id: string) => {
    const saleToDelete = oilSales.find((s) => s.id === id);
    if (!saleToDelete) return;

    // Revert product stock
    setOilProducts((prev) =>
      prev.map((p) => {
        if (p.id !== saleToDelete.productId) return p;
        const newSold = Math.max(0, p.soldQuantity - saleToDelete.quantity);
        const newCurrent = p.initialStock + p.addedStock - newSold;
        const newTotalSales = Math.max(0, p.totalSalesAmount - saleToDelete.totalAmount);
        return {
          ...p,
          soldQuantity: newSold,
          currentStock: newCurrent,
          totalSalesAmount: newTotalSales,
        };
      })
    );

    setOilSales((prev) => prev.filter((s) => s.id !== id));
  };

  /* =========================================================
     ШАТАХУУНЫ ҮНИЙН ӨӨРЧЛӨЛТ БА ТҮҮХ
     АИ-92 гэх мэт шатахууны үнэ өөрчлөгдөхөд шинэ үнээр дараагийн
     борлуулалт тооцогдоно. Өмнөх ээлжийн борлуулалтын үнэ хадгалагдана.
     Үнийн өөрчлөлтийн түүх хадгална.
     ========================================================= */
  const updateFuelPrice = (
    fuelType: string,
    newPrice: number,
    effectiveDateTime: string,
    reason: string,
    changedBy: string
  ) => {
    const currentConfig = fuelPrices.find((f) => f.fuelType === fuelType);
    const oldPrice = currentConfig ? currentConfig.pricePerLiter : 0;

    // 1. Add to history
    const historyEntry: FuelPriceHistory = {
      id: `fph-${Date.now()}`,
      fuelType,
      oldPrice,
      newPrice,
      effectiveDateTime,
      changedBy,
      reason,
      createdAt: new Date().toISOString(),
    };
    setFuelPriceHistory((prev) => [historyEntry, ...prev]);

    // 2. Update current active price config
    setFuelPrices((prev) =>
      prev.map((f) => {
        if (f.fuelType !== fuelType) return f;
        return {
          ...f,
          pricePerLiter: newPrice,
          effectiveDateTime,
          updatedBy: changedBy,
          updatedAt: new Date().toISOString(),
          note: reason,
        };
      })
    );
  };

  /* =========================================================
     ЭЭЛЖИЙН ШАТАХУУНЫ БОРЛУУЛАЛТ (Олон үнийн шатлал дэмжинэ)
     ========================================================= */
  const recordFuelShiftSale = (saleData: Omit<FuelShiftSale, 'id' | 'createdAt'>) => {
    const newId = `fss-${Date.now()}`;
    const newSale: FuelShiftSale = {
      ...saleData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setFuelShiftSales((prev) => [newSale, ...prev]);
  };

  const updateFuelShiftSale = (id: string, updates: Partial<FuelShiftSale>) => {
    setFuelShiftSales((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteFuelShiftSale = (id: string) => {
    setFuelShiftSales((prev) => prev.filter((s) => s.id !== id));
  };

  /* =========================================================
     ЭЭЛЖИЙН НЭГДСЭН ТООЦОО (POS & Бэлэн мөнгө)
     ========================================================= */
  const recordSettlement = (settlementData: Omit<ShiftSettlement, 'id' | 'createdAt'>) => {
    const newId = `set-${Date.now()}`;
    const newSettlement: ShiftSettlement = {
      ...settlementData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setSettlements((prev) => [newSettlement, ...prev]);
  };

  const verifySettlement = (id: string, verifiedBy: string) => {
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, isVerified: true, verifiedBy } : s
      )
    );
  };

  // Handover actions
  const addHandover = (rec: Omit<HandoverRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `ho-${Date.now()}`;
    const lateness = calculateLateness(rec.scheduledTime, rec.actualTime);
    const newRec: HandoverRecord = {
      ...rec,
      id: newId,
      latenessMinutes: lateness,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setHandovers((prev) => [newRec, ...prev]);
  };

  const updateHandover = (id: string, updates: Partial<HandoverRecord>) => {
    setHandovers((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const actual = updates.actualTime !== undefined ? updates.actualTime : h.actualTime;
        const scheduled = updates.scheduledTime !== undefined ? updates.scheduledTime : h.scheduledTime;
        const latenessMinutes = calculateLateness(scheduled, actual);

        return {
          ...h,
          ...updates,
          latenessMinutes,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const verifyHandover = (id: string) => {
    setHandovers((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, verifiedByAdmin: true, updatedAt: new Date().toISOString() } : h
      )
    );
  };

  // Attendance actions
  const addAttendance = (rec: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `att-${Date.now()}`;
    const { actualHours } = calculateWorkedHours(
      rec.startDateTime,
      rec.endDateTime,
      rec.breakMinutes
    );
    const newRecord: AttendanceRecord = {
      ...rec,
      id: newId,
      actualHours,
      approvedHours: rec.isApproved ? rec.approvedHours || actualHours : actualHours,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAttendance((prev) => [newRecord, ...prev]);
  };

  const updateAttendance = (id: string, updates: Partial<AttendanceRecord>) => {
    setAttendance((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const start = updates.startDateTime || a.startDateTime;
        const end = updates.endDateTime || a.endDateTime;
        const breakM = updates.breakMinutes !== undefined ? updates.breakMinutes : a.breakMinutes;
        const { actualHours } = calculateWorkedHours(start, end, breakM);

        return {
          ...a,
          ...updates,
          actualHours,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const toggleApproveAttendance = (id: string) => {
    setAttendance((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              isApproved: !a.isApproved,
              approvedHours: !a.isApproved ? a.actualHours : a.approvedHours,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );
  };

  // Payroll Period actions
  const toggleClosePayrollPeriod = () => {
    setPayrollPeriod((prev) => ({
      ...prev,
      isClosed: !prev.isClosed,
      closedAt: !prev.isClosed ? new Date().toISOString() : null,
    }));
  };

  const updatePayrollPeriodConfig = (updates: Partial<PayrollPeriod>) => {
    setPayrollPeriod((prev) => ({ ...prev, ...updates }));
  };

  // Payments actions
  const recordPayment = (p: Omit<PayrollPayment, 'id' | 'createdAt'>) => {
    const newId = `pay-${Date.now()}`;
    const newPayment: PayrollPayment = {
      ...p,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setPayrollPayments((prev) => [...prev, newPayment]);
  };

  const updatePayment = (id: string, updates: Partial<PayrollPayment>) => {
    setPayrollPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePayment = (id: string) => {
    setPayrollPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const recalculatePayroll = () => {};

  const updateEmployeeAdjustment = (
    employeeId: string,
    adjustments: { bonus?: number; deduction?: number; advance?: number }
  ) => {
    setAdjustmentsMap((prev) => ({
      ...prev,
      [employeeId]: {
        ...(prev[employeeId] || {}),
        ...adjustments,
      },
    }));
  };

  // Navigation handlers
  const setSelectedYearMonth = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear((prev) => prev + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const goToPrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear((prev) => prev - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const goToToday = () => {
    const t = parseDateString(getTodayString());
    setSelectedYear(t.year);
    setSelectedMonth(t.month);
  };

  const hasShiftHistory = (employeeId: string): boolean => {
    return Object.values(shifts).some(
      (s) => !s.isDayOff && s.employeeIds.includes(employeeId)
    );
  };

  const addEmployee = (empData: Omit<Employee, 'id' | 'createdAt'>) => {
    const newId = `emp-${Date.now()}`;
    const newEmployee: Employee = {
      ...empData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setEmployees((prev) => [...prev, newEmployee]);

    if (newEmployee.groupId) {
      setGroups((prevGroups) =>
        prevGroups.map((g) =>
          g.id === newEmployee.groupId
            ? { ...g, memberIds: [...g.memberIds, newId] }
            : g
        )
      );
    }
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== id) return emp;
        const updated = { ...emp, ...updates };

        if (updates.groupId !== undefined && updates.groupId !== emp.groupId) {
          setGroups((prevGroups) =>
            prevGroups.map((g) => {
              const cleaned = g.memberIds.filter((mid) => mid !== id);
              if (g.id === updates.groupId) {
                return { ...g, memberIds: [...cleaned, id] };
              }
              return { ...g, memberIds: cleaned };
            })
          );
        }

        return updated;
      })
    );
  };

  const toggleEmployeeStatus = (id: string, newStatus: EmployeeStatus) => {
    updateEmployee(id, { status: newStatus });
  };

  const assignEmployeeToGroup = (employeeId: string, groupId: string | null) => {
    updateEmployee(employeeId, { groupId });
  };

  const assignEmployeeToDate = (employeeId: string, dateStr: string) => {
    setShifts((prev) => {
      const existing = prev[dateStr] || {
        date: dateStr,
        employeeIds: [],
        hours: settings.defaultHoursPerShift,
        isDayOff: false,
      };

      const employeeIds = existing.employeeIds.includes(employeeId)
        ? existing.employeeIds
        : [...existing.employeeIds, employeeId];

      return {
        ...prev,
        [dateStr]: {
          ...existing,
          employeeIds,
          isDayOff: false,
        },
      };
    });
  };

  const addGroup = (groupData: Omit<WorkingGroup, 'id'>) => {
    const newId = `group-${Date.now()}`;
    const newGroup: WorkingGroup = { ...groupData, id: newId };
    setGroups((prev) => [...prev, newGroup]);
  };

  const updateGroup = (id: string, updates: Partial<WorkingGroup>) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const updated = { ...g, ...updates };
        if (updates.memberIds) {
          setEmployees((prevEmps) =>
            prevEmps.map((emp) => {
              if (updates.memberIds?.includes(emp.id)) {
                return { ...emp, groupId: id };
              } else if (emp.groupId === id) {
                return { ...emp, groupId: null };
              }
              return emp;
            })
          );
        }
        return updated;
      })
    );
  };

  const deleteGroup = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.groupId === id ? { ...e, groupId: null } : e))
    );
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const swapTwoGroups = (groupIdA: string, groupIdB: string) => {
    setGroups((prev) => {
      const groupA = prev.find((g) => g.id === groupIdA);
      const groupB = prev.find((g) => g.id === groupIdB);
      if (!groupA || !groupB) return prev;

      const aMembers = [...groupA.memberIds];
      const bMembers = [...groupB.memberIds];

      setEmployees((prevEmps) =>
        prevEmps.map((emp) => {
          if (aMembers.includes(emp.id)) return { ...emp, groupId: groupIdB };
          if (bMembers.includes(emp.id)) return { ...emp, groupId: groupIdA };
          return emp;
        })
      );

      return prev.map((g) => {
        if (g.id === groupIdA) return { ...g, memberIds: bMembers };
        if (g.id === groupIdB) return { ...g, memberIds: aMembers };
        return g;
      });
    });
  };

  const updateShift = (dateStr: string, shiftData: Partial<ShiftAssignment>) => {
    setShifts((prev) => {
      const existing = prev[dateStr] || {
        date: dateStr,
        employeeIds: [],
        hours: settings.defaultHoursPerShift,
        isDayOff: false,
      };

      return {
        ...prev,
        [dateStr]: {
          ...existing,
          ...shiftData,
          date: dateStr,
        },
      };
    });
  };

  const swapDates = (dateA: string, dateB: string) => {
    setShifts((prev) => swapDateAssignments(dateA, dateB, prev));
  };

  const generateSchedule = (config: ScheduleConfig) => {
    const generated = generateScheduleForMonth(config, employees, groups, shifts, false);
    setShifts((prev) => ({
      ...prev,
      ...generated,
    }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  /* =========================================================
     POS, БАНК, БЭЛЭН МӨНГӨ БА ЭРХЛЭГЧИД ТУШААХ ФУНКЦҮҮД
     ========================================================= */
  const addPosRecord = (record: Omit<PosTerminalRecord, 'id' | 'createdAt'>) => {
    const newRec: PosTerminalRecord = {
      ...record,
      id: `pos-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPosRecords((prev) => [newRec, ...prev]);
  };

  const updatePosRecord = (id: string, updates: Partial<PosTerminalRecord>) => {
    setPosRecords((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const settlePosRecord = (id: string) => {
    setPosRecords((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isSettled: true, settledAt: new Date().toISOString() }
          : p
      )
    );
  };

  const deletePosRecord = (id: string) => {
    setPosRecords((prev) => prev.filter((p) => p.id !== id));
  };

  const addBankTransaction = (tx: Omit<BankTransactionRecord, 'id' | 'createdAt'>) => {
    const newTx: BankTransactionRecord = {
      ...tx,
      id: `bank-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBankTransactions((prev) => [newTx, ...prev]);
  };

  const updateBankTransaction = (id: string, updates: Partial<BankTransactionRecord>) => {
    setBankTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const reconcileBankTransaction = (id: string, reconciledBy: string) => {
    setBankTransactions((prev) =>
      prev.map((tx) =>
        tx.id === id ? { ...tx, isReconciled: true, reconciledBy } : tx
      )
    );
  };

  const deleteBankTransaction = (id: string) => {
    setBankTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const saveCashDrawerRecord = (drawer: Omit<CashDrawerRecord, 'id' | 'createdAt'>) => {
    const newDrawer: CashDrawerRecord = {
      ...drawer,
      id: `cash-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCashDrawerRecords((prev) => [newDrawer, ...prev]);
  };

  const addManagerHandover = (handover: Omit<ManagerHandoverRecord, 'id' | 'createdAt'>) => {
    const newHandover: ManagerHandoverRecord = {
      ...handover,
      id: `mh-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setManagerHandovers((prev) => [newHandover, ...prev]);
  };

  const updateManagerHandover = (id: string, updates: Partial<ManagerHandoverRecord>) => {
    setManagerHandovers((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  const confirmManagerHandover = (id: string) => {
    setManagerHandovers((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, isConfirmedByManager: true, confirmedAt: new Date().toISOString() }
          : h
      )
    );
  };

  const deleteManagerHandover = (id: string) => {
    setManagerHandovers((prev) => prev.filter((h) => h.id !== id));
  };

  /* =========================================================
     ШТС: ХОШУУНЫ ТӨЛӨВ БА УДИРДЛАГА
     ========================================================= */
  const updateNozzleStatus = (id: string, status: NozzleStatus, reason?: string) => {
    setNozzles((prev) =>
      prev.map((noz) =>
        noz.id === id
          ? {
              ...noz,
              status,
              lastStatusChangeReason: reason || noz.lastStatusChangeReason,
              updatedAt: new Date().toISOString(),
            }
          : noz
      )
    );
  };

  const addNozzle = (nozData: Omit<FuelNozzle, 'id' | 'updatedAt'>) => {
    const newNoz: FuelNozzle = {
      ...nozData,
      id: `noz-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setNozzles((prev) => [...prev, newNoz]);
  };

  const updateNozzle = (id: string, updates: Partial<FuelNozzle>) => {
    setNozzles((prev) =>
      prev.map((noz) =>
        noz.id === id
          ? {
              ...noz,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : noz
      )
    );
  };

  const deleteNozzle = (id: string) => {
    setNozzles((prev) => prev.filter((noz) => noz.id !== id));
  };

  /* =========================================================
     ШТС: САВНЫ БАГТААМЖ, АЮУЛГҮЙН БОСГО БА МАСТШАП
     ========================================================= */
  const calculateTankStatus = (
    currentLiters: number,
    minSafeThreshold: number,
    maxSafeThreshold: number
  ): TankStatus => {
    if (currentLiters <= 500) return 'critical_empty';
    if (currentLiters < minSafeThreshold) return 'low_warning';
    if (currentLiters >= maxSafeThreshold) return 'high_warning';
    return 'normal';
  };

  const addTank = (tankData: Omit<FuelTank, 'id' | 'updatedAt' | 'status'>) => {
    const initialStatus = calculateTankStatus(
      tankData.currentLiters,
      tankData.minSafeThresholdLiters,
      tankData.maxSafeThresholdLiters
    );
    const newTank: FuelTank = {
      ...tankData,
      id: `tank-${Date.now()}`,
      status: initialStatus,
      updatedAt: new Date().toISOString(),
    };
    setTanks((prev) => [...prev, newTank]);
  };

  const updateTank = (id: string, updates: Partial<FuelTank>) => {
    setTanks((prev) =>
      prev.map((tank) => {
        if (tank.id !== id) return tank;
        const currentLiters = updates.currentLiters !== undefined ? updates.currentLiters : tank.currentLiters;
        const minSafe = updates.minSafeThresholdLiters !== undefined ? updates.minSafeThresholdLiters : tank.minSafeThresholdLiters;
        const maxSafe = updates.maxSafeThresholdLiters !== undefined ? updates.maxSafeThresholdLiters : tank.maxSafeThresholdLiters;
        const status = calculateTankStatus(currentLiters, minSafe, maxSafe);

        return {
          ...tank,
          ...updates,
          status,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteTank = (id: string) => {
    setTanks((prev) => prev.filter((tank) => tank.id !== id));
  };

  const recordMastshapMeasurement = (logData: Omit<MastshapMeasurementLog, 'id' | 'createdAt'>) => {
    const newLog: MastshapMeasurementLog = {
      ...logData,
      id: `mast-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMastshapLogs((prev) => [newLog, ...prev]);

    // Танкны бодит үлдэгдэл ба мастшап түвшинг автоматаар шинэчлэх
    setTanks((prev) =>
      prev.map((tank) => {
        if (tank.id !== logData.tankId) return tank;
        const newLiters = logData.calculatedLiters;
        const status = calculateTankStatus(newLiters, tank.minSafeThresholdLiters, tank.maxSafeThresholdLiters);
        return {
          ...tank,
          currentLiters: newLiters,
          currentMastshapCm: logData.measuredCm,
          status,
          lastMeasurementDate: `${logData.date} ${logData.time}`,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const recordFuelDelivery = (deliveryData: Omit<FuelDeliveryRecord, 'id' | 'createdAt'>) => {
    const newDelivery: FuelDeliveryRecord = {
      ...deliveryData,
      id: `del-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDeliveryRecords((prev) => [newDelivery, ...prev]);

    // Танкад шатахуун нэмж буулгасан тул савны үлдэгдлийг нэмэгдүүлэх
    setTanks((prev) =>
      prev.map((tank) => {
        if (tank.id !== deliveryData.tankId) return tank;
        const newLiters = Math.min(tank.totalCapacityLiters, tank.currentLiters + deliveryData.deliveredLiters);
        const newMastshap = deliveryData.mastshapAfterCm || tank.currentMastshapCm;
        const status = calculateTankStatus(newLiters, tank.minSafeThresholdLiters, tank.maxSafeThresholdLiters);
        return {
          ...tank,
          currentLiters: newLiters,
          currentMastshapCm: newMastshap,
          status,
          lastMeasurementDate: `${deliveryData.date} ${deliveryData.time}`,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  /* =========================================================
     ШТС: АДМИН ЭРХ БА НУУЦ ҮГИЙН ХАМГААЛАЛТ
     ========================================================= */
  const unlockAdminMode = (password: string): boolean => {
    const currentPass = settings.adminPassword || 'admin123';
    if (password === currentPass) {
      setIsAdminUnlocked(true);
      return true;
    }
    return false;
  };

  const lockAdminMode = () => {
    setIsAdminUnlocked(false);
  };

  const changeAdminPassword = (oldPass: string, newPass: string): boolean => {
    const currentPass = settings.adminPassword || 'admin123';
    if (oldPass !== currentPass) {
      return false;
    }
    updateSettings({ adminPassword: newPass });
    return true;
  };

  const resetToDemoData = () => {
    clearAllStoredData();
    setEmployees(DEFAULT_EMPLOYEES);
    setGroups(DEFAULT_GROUPS);
    setSettings(DEFAULT_SETTINGS);
    setOilProducts(DEFAULT_OIL_PRODUCTS);
    setFuelPrices(DEFAULT_FUEL_PRICES);
    setFuelPriceHistory(DEFAULT_FUEL_PRICE_HISTORY);
    setOilSales(DEMO_OIL_SALES);
    setFuelShiftSales(DEMO_FUEL_SHIFT_SALES);
    setSettlements(DEMO_SETTLEMENTS);
    setPosRecords(DEMO_POS_RECORDS);
    setBankTransactions(DEMO_BANK_TRANSACTIONS);
    setCashDrawerRecords(DEMO_CASH_DRAWER_RECORDS);
    setManagerHandovers(DEMO_MANAGER_HANDOVERS);
    setNozzles(DEFAULT_NOZZLES);
    setTanks(DEFAULT_TANKS);
    setMastshapLogs(DEMO_MASTSHAP_LOGS);
    setDeliveryRecords(DEMO_DELIVERY_RECORDS);
    setIsAdminUnlocked(true);
    const initialShifts = getInitialShifts(DEFAULT_EMPLOYEES, DEFAULT_GROUPS, DEFAULT_SETTINGS);
    setShifts(initialShifts);
    setHandovers(getInitialHandovers(initialShifts, DEFAULT_EMPLOYEES));
    setAttendance(getInitialAttendance(initialShifts));
    const pData = getInitialPayrollData(DEFAULT_EMPLOYEES, [], DEFAULT_SETTINGS);
    setPayrollPeriod(pData.period);
    setPayrollPayments(DEMO_PAYROLL_PAYMENTS);
    setAdjustmentsMap({});
  };

  const loadDemoData = () => {
    setOilSales(DEMO_OIL_SALES);
    setFuelShiftSales(DEMO_FUEL_SHIFT_SALES);
    setSettlements(DEMO_SETTLEMENTS);
    setPosRecords(DEMO_POS_RECORDS);
    setBankTransactions(DEMO_BANK_TRANSACTIONS);
    setCashDrawerRecords(DEMO_CASH_DRAWER_RECORDS);
    setManagerHandovers(DEMO_MANAGER_HANDOVERS);
    setMastshapLogs(DEMO_MASTSHAP_LOGS);
    setDeliveryRecords(DEMO_DELIVERY_RECORDS);
    setPayrollPayments(DEMO_PAYROLL_PAYMENTS);
  };

  const purgeDemoData = (): number => {
    let count = 0;
    setFuelShiftSales((prev) => {
      const remaining = prev.filter((s) => !isDemoId(s.id));
      count += prev.length - remaining.length;
      return remaining;
    });
    setOilSales((prev) => {
      const remaining = prev.filter((s) => !isDemoId(s.id));
      count += prev.length - remaining.length;
      return remaining;
    });
    setSettlements((prev) => {
      const remaining = prev.filter((s) => !isDemoId(s.id));
      count += prev.length - remaining.length;
      return remaining;
    });
    setPosRecords((prev) => {
      const remaining = prev.filter((s) => !isDemoId(s.id));
      count += prev.length - remaining.length;
      return remaining;
    });
    setBankTransactions((prev) => {
      const remaining = prev.filter((s) => !isDemoId(s.id));
      count += prev.length - remaining.length;
      return remaining;
    });
    setCashDrawerRecords((prev) => {
      const remaining = prev.filter((s) => !isDemoId(s.id));
      count += prev.length - remaining.length;
      return remaining;
    });
    setManagerHandovers((prev) => {
      const remaining = prev.filter((s) => !isDemoId(s.id));
      count += prev.length - remaining.length;
      return remaining;
    });
    setMastshapLogs((prev) => {
      const remaining = prev.filter((s) => !isDemoId(s.id));
      count += prev.length - remaining.length;
      return remaining;
    });
    setDeliveryRecords((prev) => {
      const remaining = prev.filter((s) => !isDemoId(s.id));
      count += prev.length - remaining.length;
      return remaining;
    });
    setPayrollPayments((prev) => {
      const remaining = prev.filter((p) => !isDemoId(p.id));
      count += prev.length - remaining.length;
      return remaining;
    });
    return count;
  };

  const importAllData = (data: any): boolean => {
    try {
      if (!data || typeof data !== 'object') return false;
      if (data.employees && Array.isArray(data.employees)) setEmployees(data.employees);
      if (data.groups && Array.isArray(data.groups)) setGroups(data.groups);
      if (data.settings && typeof data.settings === 'object') setSettings(data.settings);
      if (data.shifts && typeof data.shifts === 'object') setShifts(data.shifts);
      if (data.handovers && Array.isArray(data.handovers)) setHandovers(data.handovers);
      if (data.attendance && Array.isArray(data.attendance)) setAttendance(data.attendance);
      if (data.payrollPeriod && typeof data.payrollPeriod === 'object') setPayrollPeriod(data.payrollPeriod);
      if (data.payrollPayments && Array.isArray(data.payrollPayments)) setPayrollPayments(data.payrollPayments);
      if (data.oilProducts && Array.isArray(data.oilProducts)) setOilProducts(data.oilProducts);
      if (data.oilSales && Array.isArray(data.oilSales)) setOilSales(data.oilSales);
      if (data.fuelPrices && Array.isArray(data.fuelPrices)) setFuelPrices(data.fuelPrices);
      if (data.fuelPriceHistory && Array.isArray(data.fuelPriceHistory)) setFuelPriceHistory(data.fuelPriceHistory);
      if (data.fuelShiftSales && Array.isArray(data.fuelShiftSales)) setFuelShiftSales(data.fuelShiftSales);
      if (data.settlements && Array.isArray(data.settlements)) setSettlements(data.settlements);
      if (data.posRecords && Array.isArray(data.posRecords)) setPosRecords(data.posRecords);
      if (data.bankTransactions && Array.isArray(data.bankTransactions)) setBankTransactions(data.bankTransactions);
      if (data.cashDrawerRecords && Array.isArray(data.cashDrawerRecords)) setCashDrawerRecords(data.cashDrawerRecords);
      if (data.managerHandovers && Array.isArray(data.managerHandovers)) setManagerHandovers(data.managerHandovers);
      if (data.nozzles && Array.isArray(data.nozzles)) setNozzles(data.nozzles);
      if (data.tanks && Array.isArray(data.tanks)) setTanks(data.tanks);
      if (data.mastshapLogs && Array.isArray(data.mastshapLogs)) setMastshapLogs(data.mastshapLogs);
      if (data.deliveryRecords && Array.isArray(data.deliveryRecords)) setDeliveryRecords(data.deliveryRecords);
      return true;
    } catch (e) {
      console.error('Error importing data:', e);
      return false;
    }
  };

  const monthlyStats = useMemo(() => {
    return calculateMonthlyStats(selectedYear, selectedMonth, employees, shifts);
  }, [selectedYear, selectedMonth, employees, shifts]);

  return (
    <ShiftContext.Provider
      value={{
        employees,
        groups,
        shifts,
        settings,
        selectedYear,
        selectedMonth,
        monthlyStats,
        handovers,
        addHandover,
        updateHandover,
        verifyHandover,
        attendance,
        addAttendance,
        updateAttendance,
        toggleApproveAttendance,
        payrollPeriod,
        toggleClosePayrollPeriod,
        updatePayrollPeriodConfig,
        payrollCalculations,
        payrollPayments,
        recordPayment,
        updatePayment,
        deletePayment,
        recalculatePayroll,
        updateEmployeeAdjustment,
        oilProducts,
        addOilProduct,
        updateOilProduct,
        toggleOilProductActive,
        oilSales,
        recordOilSale,
        deleteOilSale,
        fuelPrices,
        fuelPriceHistory,
        updateFuelPrice,
        fuelShiftSales,
        recordFuelShiftSale,
        updateFuelShiftSale,
        deleteFuelShiftSale,
        settlements,
        recordSettlement,
        verifySettlement,
        posRecords,
        addPosRecord,
        updatePosRecord,
        settlePosRecord,
        deletePosRecord,
        bankTransactions,
        addBankTransaction,
        updateBankTransaction,
        reconcileBankTransaction,
        deleteBankTransaction,
        cashDrawerRecords,
        saveCashDrawerRecord,
        managerHandovers,
        addManagerHandover,
        updateManagerHandover,
        confirmManagerHandover,
        deleteManagerHandover,
        nozzles,
        updateNozzleStatus,
        addNozzle,
        updateNozzle,
        deleteNozzle,
        tanks,
        addTank,
        updateTank,
        deleteTank,
        mastshapLogs,
        recordMastshapMeasurement,
        deliveryRecords,
        recordFuelDelivery,
        isAdminUnlocked,
        unlockAdminMode,
        lockAdminMode,
        changeAdminPassword,
        setSelectedYearMonth,
        goToNextMonth,
        goToPrevMonth,
        goToToday,
        addEmployee,
        updateEmployee,
        toggleEmployeeStatus,
        assignEmployeeToGroup,
        assignEmployeeToDate,
        hasShiftHistory,
        addGroup,
        updateGroup,
        deleteGroup,
        swapTwoGroups,
        updateShift,
        swapDates,
        generateSchedule,
        updateSettings,
        resetToDemoData,
        loadDemoData,
        purgeDemoData,
        importAllData,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
};

export const useShifts = (): ShiftContextType => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShifts must be used within a ShiftProvider');
  }
  return context;
};
