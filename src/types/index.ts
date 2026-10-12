export type EmployeeStatus = 'active' | 'on_leave' | 'inactive';

export type SalaryCalculationType = 'monthly' | 'hourly' | 'daily';

export interface EmployeeSalaryConfig {
  calculationType: SalaryCalculationType;
  baseSalary: number; // Сарын үндсэн цалин (₮)
  hourlyRate: number; // Цагийн үнэлгээ (₮)
  dailyRate: number; // Өдрийн үнэлгээ (₮)
  overtimeMultiplier: number; // Илүү цагийн коэффициент (default 1.5)
  standardBonus: number; // Тогтмол нэмэгдэл (₮)
  standardDeductions: number; // Тогтмол суутгал (₮)
}

export interface Employee {
  id: string; // Тогтвортой дотоод ID
  name: string; // Ажилтны нэр (солиход түүх хадгалагдана)
  role?: string;
  status: EmployeeStatus;
  color: string;
  groupId?: string | null;
  phone?: string;
  notes?: string;
  salaryConfig: EmployeeSalaryConfig;
  createdAt: string;
}

export interface WorkingGroup {
  id: string;
  name: string;
  color: string;
  memberIds: string[];
  description?: string;
}

export interface ShiftAssignment {
  date: string; // YYYY-MM-DD
  employeeIds: string[];
  groupId?: string | null;
  isDayOff?: boolean;
  note?: string;
  hours: number;
}

export type ScheduleMode = 'group_alternating' | 'single' | 'pair' | 'custom';

export interface ScheduleConfig {
  mode: ScheduleMode;
  intervalDays: number;
  startEntityId: string; // Group ID or Employee ID
  targetYear: number;
  targetMonth: number; // 1-12
  startDateStr: string; // YYYY-MM-DD
  defaultHours: number;
  numEmployeesPerDay: number;
  repeatPattern: boolean;
}

export type HandoverShiftType = 'day' | 'night';

export interface HandoverRecord {
  id: string;
  date: string; // YYYY-MM-DD
  shiftType: HandoverShiftType; // 'day' (09:00) эсвэл 'night' (20:30)
  scheduledTime: string; // "09:00" эсвэл "20:30"
  actualTime: string; // "08:55", "20:35" гэх мэт
  incomingEmployeeId: string; // Хүлээж авсан / Ирсэн ажилтан
  outgoingEmployeeId: string; // Хүлээлгэн өгсөн ажилтан
  isHandedOver: boolean; // Хүлээлцсэн эсэх
  latenessMinutes: number; // Хоцролтын минут
  isAbsent: boolean; // Тасалсан эсэх
  note?: string; // Тайлбар
  verifiedByAdmin: boolean; // Админ шалгаж баталгаажуулсан эсэх
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  shiftType: 'day' | 'night' | 'custom';
  startDateTime: string; // YYYY-MM-DDTHH:mm
  endDateTime: string; // YYYY-MM-DDTHH:mm (Шөнө дамнахыг зөв тооцно)
  plannedHours: number;
  actualHours: number;
  breakMinutes: number;
  approvedHours: number; // Баталгаажсан цаг (Цалинд тооцогдоно)
  overtimeHours: number; // Илүү цаг
  latenessMinutes: number; // Хоцролт
  isAbsent: boolean; // Таслалт
  isApproved: boolean; // Баталгаажсан (Өөрчлөлтөөс түгжигдэнэ)
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type SecondaryPayoutType = 'balance' | 'advance' | 'custom_period';

export interface PayrollPeriod {
  id: string; // e.g. "period-2026-10"
  year: number;
  month: number;
  cutoffDay: number; // 18-ны өдөр
  cutoffTime: string; // "18:00"
  payoutDayPrimary: number; // 25-ны өдөр
  payoutDaySecondary: number; // Дараа сарын 10-ны өдөр
  secondaryPayoutType: SecondaryPayoutType;
  isClosed: boolean; // 18-нд бүртгэл хаагдсан эсэх
  closedAt: string | null;
  notes?: string;
}

export interface PayrollCalculation {
  id: string;
  periodId: string;
  employeeId: string;
  totalApprovedHours: number;
  totalOvertimeHours: number;
  totalShifts: number;
  baseAmount: number;
  overtimeAmount: number;
  bonusAmount: number;
  deductionAmount: number;
  advanceAmount: number;
  totalCalculated: number; // Нийт бодсон цалин
  actuallyPaid: number; // Бодитоор олгосон мөнгө (25 болон 10-ны нийлбэр)
  remainingBalance: number; // Үлдэгдэл цалин = totalCalculated - actuallyPaid
  isFinalized: boolean;
  updatedAt: string;
}

export type PaymentType = 'primary_25' | 'secondary_10' | 'advance' | 'bonus';

export interface PayrollPayment {
  id: string;
  periodId: string;
  employeeId: string;
  paymentDate: string; // YYYY-MM-DD
  paymentType: PaymentType;
  calculatedAmount: number;
  paidAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  note?: string;
  createdAt: string;
}

/* =========================================================
   ШТС-ийн ТОС, БҮТЭЭГДЭХҮҮН, ШАТАХУУНЫ ҮНЭ, ТООЦООНЫ ЗАГВАР
   ========================================================= */

export interface OilProduct {
  id: string;
  name: string; // Бүтээгдэхүүний нэр (жишээ: Kixx 5W-30, 10W-30, ATF, Тосол, Шил арчигч)
  category: string; // Төрөл: Хөдөлгүүрийн тос, Хурдны хайрцгийн тос, Тосол, Шил арчигч г.м
  brand: string; // Брэнд: Kixx, ZIC, Mobil, Газпром, Дотоодын г.м
  packageSize: string; // Савлагаа: 1 л, 4 л, 5 л, 20 л, 1 ширхэг
  unitPrice: number; // Нэгжийн үнэ (₮, гараар оруулна)
  initialStock: number; // Эхний үлдэгдэл
  addedStock: number; // Нэмэгдсэн тоо хэмжээ (орлого)
  soldQuantity: number; // Нийт борлуулсан тоо хэмжээ
  currentStock: number; // Эцсийн үлдэгдэл = initialStock + addedStock - soldQuantity
  totalSalesAmount: number; // Нийт борлуулалтын дүн = soldQuantity * unitPrice
  isActive: boolean; // Идэвхтэй эсэх (идэвхгүй болсон ч хуучин түүх хадгалагдана)
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OilSaleRecord {
  id: string;
  date: string; // YYYY-MM-DD
  shiftType: HandoverShiftType; // 'day' | 'night'
  productId: string;
  productName: string; // Түүхэнд зориулсан snapshot
  packageSize: string;
  unitPrice: number; // Тухайн ээлжинд ашигласан нэгж үнэ (үнэ өөрчлөгдсөн ч хуучин түүх өөрчлөгдөхгүй!)
  quantity: number; // Борлуулсан тоо хэмжээ
  totalAmount: number; // quantity * unitPrice
  employeeId: string; // Борлуулсан ажилтан
  paymentMethod: 'cash' | 'pos' | 'card' | 'transfer';
  note?: string;
  createdAt: string;
}

export interface FuelPriceConfig {
  id: string;
  fuelType: string; // 'АИ-92', 'Дизель түлш', 'А-80', 'Бусад'
  fuelCode: string; // 'AI92', 'DIESEL', 'A80', 'OTHER'
  pricePerLiter: number; // Нэг литрийн үнэ (₮, гараар оруулна)
  effectiveDateTime: string; // Үйлчилж эхлэх огноо, цаг (YYYY-MM-DDTHH:mm)
  note?: string;
  updatedBy: string; // Өөрчилсөн хэрэглэгч
  updatedAt: string;
}

export interface FuelPriceHistory {
  id: string;
  fuelType: string;
  oldPrice: number;
  newPrice: number;
  effectiveDateTime: string;
  changedBy: string;
  reason: string;
  createdAt: string;
}

// Нэг ээлжинд үнэ өөрчлөгдөх үеийн олон шатлалт борлуулалтын мөр
export interface FuelSalePriceTier {
  id: string;
  tierLabel: string; // Жишээ нь: "Үнэ өөрчлөгдөхөөс өмнө", "Шинэ үнээр (20:00 цагаас хойш)"
  pricePerLiter: number; // Тухайн үеийн нэгжийн үнэ (₮)
  litersSold: number; // Борлуулсан литр
  amount: number; // litersSold * pricePerLiter
  startMeter?: number; // Эхний лангууны заалт
  endMeter?: number; // Эцсийн лангууны заалт
}

export interface FuelShiftSale {
  id: string;
  date: string; // YYYY-MM-DD
  shiftType: HandoverShiftType; // 'day' | 'night'
  fuelType: string; // 'АИ-92', 'Дизель түлш', 'А-80', etc.
  dispenserNumber: string; // Бууны дугаар: №1, №2, №3...
  tiers: FuelSalePriceTier[]; // Үнэ өөрчлөгдсөн үед олон үнийн мөрүүд
  totalLiters: number; // Бүх үнийн мөрийн нийт литр
  totalAmount: number; // Бүх үнийн мөрийн нийт дүн (₮)
  employeeId: string;
  paymentBreakdown: {
    cash: number;
    pos: number;
    card: number;
    coupon: number;
  };
  note?: string;
  createdAt: string;
}

// Ээлжийн нэгдсэн тооцоо (POS & Бэлэн мөнгө нэгтгэл)
export interface ShiftSettlement {
  id: string;
  date: string; // YYYY-MM-DD
  shiftType: HandoverShiftType; // 'day' | 'night'
  employeeIds: string[];
  totalFuelAmount: number; // Шатахууны нийт борлуулалт
  totalOilAmount: number; // Тосны нийт борлуулалт
  grandTotal: number; // totalFuelAmount + totalOilAmount
  cashReceived: number; // Бэлнээр хураасан мөнгө
  posReceived: number; // POS картаар орсон
  couponReceived: number; // Талон / картаар орсон
  discrepancy: number; // Зөрүү = (cash + pos + coupon) - grandTotal (илүүдэл / дутагдал)
  isVerified: boolean; // Эрхлэгч баталгаажуулсан эсэх
  verifiedBy?: string;
  note?: string;
  createdAt: string;
}

export interface AppSettings {
  workplaceName: string;
  timezone: string; // 'Asia/Ulaanbaatar'
  defaultHoursPerShift: number;
  shiftMode: ScheduleMode;
  defaultIntervalDays: number;
  // Handover times
  dayShiftHandoverTime: string; // "09:00"
  nightShiftHandoverTime: string; // "20:30"
  // Payroll cycle settings
  payrollCutoffDay: number; // 18
  payrollCutoffTime: string; // "18:00"
  payrollPrimaryDay: number; // 25
  payrollSecondaryDay: number; // 10
  defaultSecondaryType: SecondaryPayoutType;
  defaultOvertimeMultiplier: number;
  autoSave: boolean;
  // Admin PIN / эрх хамгаалалт (Үнэ өөрчлөхөд)
  isAdminMode: boolean;
  adminUsername: string;
}

export interface EmployeeMonthlyStats {
  employee: Employee;
  totalShifts: number;
  totalHours: number;
  daysOff: number;
  maxConsecutiveShifts: number;
  weekendShifts: number;
  deviationFromAverage: number;
}

/* =========================================================
   POS, БАНК, БЭЛЭН МӨНГӨ БА ЭРХЛЭГЧИД ХҮЛЭЭЛГЭН ӨГӨХ ЗАГВАР
   ========================================================= */

export interface PosTerminalRecord {
  id: string;
  terminalName: string; // "Хаан банк №1", "Голомт банк №2", "Төрийн банк №3"
  bankName: string;
  terminalId: string; // "KB-001248"
  date: string;
  shiftType: HandoverShiftType;
  batchNumber: string; // "Багц #042"
  slipCount: number; // Нийт баримтын тоо
  totalAmount: number; // Нийт дүн (₮)
  settledAt?: string;
  isSettled: boolean;
  employeeId: string;
  note?: string;
  createdAt: string;
}

export interface BankTransactionRecord {
  id: string;
  bankName: string; // "Хаан банк", "Голомт банк", "QPay төв данс"
  accountNumber: string;
  date: string;
  time: string;
  shiftType: HandoverShiftType;
  transactionType: 'qpay' | 'transfer' | 'card_settlement';
  amount: number;
  customerInfo?: string;
  referenceNumber: string; // Гүйлгээний утга / дугаар
  isReconciled: boolean;
  reconciledBy?: string;
  note?: string;
  createdAt: string;
}

export interface CashDenominationCount {
  c20000: number; // 20,000₮
  c10000: number; // 10,000₮
  c5000: number;  // 5,000₮
  c1000: number;  // 1,000₮
  c500: number;   // 500₮
  c100: number;   // 100₮
  c50: number;    // 50₮
  c20: number;    // 20₮
}

export interface CashDrawerRecord {
  id: string;
  date: string;
  shiftType: HandoverShiftType;
  openingBalance: number; // Эхний хайрцгийн үлдэгдэл
  cashSalesRevenue: number; // Ээлжийн бэлэн мөнгөний орлого
  denominations: CashDenominationCount; // Дэвсгэртээр тоолсон
  countedCashTotal: number; // Нийт тоолсон бэлэн мөнгө
  handedToManager: number; // Эрхлэгчид тушаасан мөнгө
  closingBalance: number; // Шүүгээнд үлдээсэн үлдэгдэл
  discrepancy: number; // Зөрүү
  employeeId: string;
  isVerified: boolean;
  note?: string;
  createdAt: string;
}

export interface ManagerHandoverRecord {
  id: string;
  receiptNumber: string; // "АКТ-20261012-01"
  date: string;
  time: string;
  shiftType: HandoverShiftType;
  operatorEmployeeId: string; // Түгээгч ажилтан
  managerName: string; // Хүлээж авсан эрхлэгч
  cashAmount: number; // Бэлнээр тушаасан (₮)
  posSlipsAmount: number; // POS баримтын дүн (₮)
  couponsAmount: number; // Талон / карт дүн (₮)
  totalHandedAmount: number; // Нийт дүн
  isConfirmedByManager: boolean;
  confirmedAt?: string;
  safeDepositNumber?: string; // Сейфийн дугтуй / дугаар
  notes?: string;
  createdAt: string;
}

