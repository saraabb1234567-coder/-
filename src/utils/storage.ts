import {
  Employee,
  WorkingGroup,
  ShiftAssignment,
  AppSettings,
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
} from '../types';
import { generateScheduleForMonth } from './scheduler';
import { calculateEmployeePayroll } from './calculations';

export const STORAGE_KEY_PREFIX = 'mongolian_shift_system_v3';

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Гэрлээ',
    role: 'Ээлжийн ахлагч',
    status: 'active',
    color: '#2563eb', // Blue
    groupId: 'group-a',
    phone: '9911-2233',
    notes: 'Баг А ахлагч',
    salaryConfig: {
      calculationType: 'monthly',
      baseSalary: 2200000,
      hourlyRate: 13000,
      dailyRate: 145000,
      overtimeMultiplier: 1.5,
      standardBonus: 100000,
      standardDeductions: 50000,
    },
    createdAt: '2026-01-01',
  },
  {
    id: 'emp-2',
    name: 'Батдэлгэр',
    role: 'Ахлах түгээгч',
    status: 'active',
    color: '#0d9488', // Teal
    groupId: 'group-a',
    phone: '9922-3344',
    notes: 'Баг А гишүүн',
    salaryConfig: {
      calculationType: 'monthly',
      baseSalary: 2000000,
      hourlyRate: 12000,
      dailyRate: 135000,
      overtimeMultiplier: 1.5,
      standardBonus: 80000,
      standardDeductions: 40000,
    },
    createdAt: '2026-01-01',
  },
  {
    id: 'emp-3',
    name: 'Оюука',
    role: 'Ээлжийн ахлагч',
    status: 'active',
    color: '#d97706', // Amber
    groupId: 'group-b',
    phone: '9933-4455',
    notes: 'Баг Б ахлагч',
    salaryConfig: {
      calculationType: 'monthly',
      baseSalary: 2100000,
      hourlyRate: 12500,
      dailyRate: 140000,
      overtimeMultiplier: 1.5,
      standardBonus: 90000,
      standardDeductions: 45000,
    },
    createdAt: '2026-01-01',
  },
  {
    id: 'emp-4',
    name: 'Агий',
    role: 'Ахлах түгээгч',
    status: 'active',
    color: '#7c3aed', // Purple
    groupId: 'group-b',
    phone: '9944-5566',
    notes: 'Баг Б гишүүн',
    salaryConfig: {
      calculationType: 'hourly',
      baseSalary: 1950000,
      hourlyRate: 12000,
      dailyRate: 130000,
      overtimeMultiplier: 1.5,
      standardBonus: 70000,
      standardDeductions: 35000,
    },
    createdAt: '2026-01-01',
  },
  {
    id: 'emp-5',
    name: 'Саруул',
    role: 'Түгээгч оператор',
    status: 'on_leave', // Одоогоор чөлөөтэй
    color: '#e11d48', // Rose
    groupId: null,
    phone: '9955-6677',
    notes: 'Одоогоор чөлөөтэй (ээлжээс түр чөлөөлөгдсөн)',
    salaryConfig: {
      calculationType: 'monthly',
      baseSalary: 1800000,
      hourlyRate: 11000,
      dailyRate: 120000,
      overtimeMultiplier: 1.5,
      standardBonus: 0,
      standardDeductions: 0,
    },
    createdAt: '2026-01-01',
  },
];

export const DEFAULT_GROUPS: WorkingGroup[] = [
  {
    id: 'group-a',
    name: 'Баг А',
    color: '#3b82f6',
    memberIds: ['emp-1', 'emp-2'],
    description: 'Гэрлээ, Батдэлгэр нарын хос баг',
  },
  {
    id: 'group-b',
    name: 'Баг Б',
    color: '#8b5cf6',
    memberIds: ['emp-3', 'emp-4'],
    description: 'Оюука, Агий нарын хос баг',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  workplaceName: 'ШТС "Петростар-101" Цогцолбор',
  timezone: 'Asia/Ulaanbaatar',
  defaultHoursPerShift: 12,
  shiftMode: 'group_alternating',
  defaultIntervalDays: 2,
  // Handover times
  dayShiftHandoverTime: '09:00',
  nightShiftHandoverTime: '20:30',
  // Payroll cycle rules
  payrollCutoffDay: 18,
  payrollCutoffTime: '18:00',
  payrollPrimaryDay: 25,
  payrollSecondaryDay: 10,
  defaultSecondaryType: 'balance', // Үлдэгдэл цалин
  defaultOvertimeMultiplier: 1.5,
  autoSave: true,
  isAdminMode: true,
  adminUsername: 'Эрхлэгч (Админ)',
  adminPassword: 'admin123',
};

/* =========================================================
   ТОС, БҮТЭЭГДЭХҮҮНИЙ АНХНЫ ӨГӨГДӨЛ (ЖИШЭЭ ӨГӨГДӨЛ)
   ========================================================= */
export const DEFAULT_OIL_PRODUCTS: OilProduct[] = [
  {
    id: 'oil-1',
    name: 'Kixx 5W-30',
    category: 'Хөдөлгүүрийн тос',
    brand: 'Kixx',
    packageSize: '4 л',
    unitPrice: 95000,
    initialStock: 24,
    addedStock: 12,
    soldQuantity: 8,
    currentStock: 28,
    totalSalesAmount: 760000,
    isActive: true,
    note: 'Синтетик өндөр чанарын хөдөлгүүрийн тос',
    createdAt: '2026-10-01',
    updatedAt: '2026-10-12',
  },
  {
    id: 'oil-2',
    name: '10W-30',
    category: 'Хөдөлгүүрийн тос',
    brand: 'ZIC',
    packageSize: '4 л',
    unitPrice: 85000,
    initialStock: 18,
    addedStock: 6,
    soldQuantity: 5,
    currentStock: 19,
    totalSalesAmount: 425000,
    isActive: true,
    note: 'Бүх төрлийн бензин хөдөлгүүрт тохиромжтой',
    createdAt: '2026-10-01',
    updatedAt: '2026-10-12',
  },
  {
    id: 'oil-3',
    name: 'ATF',
    category: 'Хурдны хайрцгийн тос',
    brand: 'Mobil',
    packageSize: '1 л',
    unitPrice: 32000,
    initialStock: 30,
    addedStock: 10,
    soldQuantity: 12,
    currentStock: 28,
    totalSalesAmount: 384000,
    isActive: true,
    note: 'Автомат хурдны хайрцгийн тос',
    createdAt: '2026-10-01',
    updatedAt: '2026-10-12',
  },
  {
    id: 'oil-4',
    name: 'Тосол (-40°C)',
    category: 'Хөргөлтийн шингэн',
    brand: 'Газпром',
    packageSize: '5 л',
    unitPrice: 28000,
    initialStock: 40,
    addedStock: 20,
    soldQuantity: 16,
    currentStock: 44,
    totalSalesAmount: 448000,
    isActive: true,
    note: 'Өвлийн зориулалттай хөргөлтийн шингэн',
    createdAt: '2026-10-01',
    updatedAt: '2026-10-12',
  },
  {
    id: 'oil-5',
    name: 'Шил арчигч (-25°C)',
    category: 'Угаагч шингэн',
    brand: 'Монгол',
    packageSize: '4 л',
    unitPrice: 12000,
    initialStock: 50,
    addedStock: 25,
    soldQuantity: 22,
    currentStock: 53,
    totalSalesAmount: 264000,
    isActive: true,
    note: 'Цонх угаагч хөлддөггүй шингэн',
    createdAt: '2026-10-01',
    updatedAt: '2026-10-12',
  },
];

/* =========================================================
   ШАТАХУУНЫ ҮНИЙН АНХНЫ ТОХИРГОО & ТҮҮХ
   ========================================================= */
export const DEFAULT_FUEL_PRICES: FuelPriceConfig[] = [
  {
    id: 'fuel-ai92',
    fuelType: 'АИ-92',
    fuelCode: 'AI92',
    pricePerLiter: 2390,
    effectiveDateTime: '2026-10-10T00:00',
    note: 'Ердийн хэрэглээний шатахуун',
    updatedBy: 'Админ (Эрхлэгч)',
    updatedAt: '2026-10-10T00:00',
  },
  {
    id: 'fuel-diesel',
    fuelType: 'Дизель түлш',
    fuelCode: 'DIESEL',
    pricePerLiter: 3740,
    effectiveDateTime: '2026-10-08T00:00',
    note: 'Өвлийн цэвэршүүлсэн дизель',
    updatedBy: 'Админ (Эрхлэгч)',
    updatedAt: '2026-10-08T00:00',
  },
  {
    id: 'fuel-a80',
    fuelType: 'А-80',
    fuelCode: 'A80',
    pricePerLiter: 2190,
    effectiveDateTime: '2026-10-01T00:00',
    note: 'Бага октантай автобензин',
    updatedBy: 'Админ (Эрхлэгч)',
    updatedAt: '2026-10-01T00:00',
  },
  {
    id: 'fuel-other',
    fuelType: 'Бусад (Евро-5)',
    fuelCode: 'OTHER',
    pricePerLiter: 2980,
    effectiveDateTime: '2026-10-01T00:00',
    note: 'Дээд зэрэглэлийн супер бензин',
    updatedBy: 'Админ (Эрхлэгч)',
    updatedAt: '2026-10-01T00:00',
  },
];

export const DEFAULT_FUEL_PRICE_HISTORY: FuelPriceHistory[] = [
  {
    id: 'fph-1',
    fuelType: 'АИ-92',
    oldPrice: 2350,
    newPrice: 2390,
    effectiveDateTime: '2026-10-10T00:00',
    changedBy: 'Админ (Эрхлэгч)',
    reason: 'Бөөний үнийн өөрчлөлтөөр нэг литрийн үнэ 40 төгрөгөөр нэмэгдэв',
    createdAt: '2026-10-09T22:30:00',
  },
  {
    id: 'fph-2',
    fuelType: 'Дизель түлш',
    oldPrice: 3680,
    newPrice: 3740,
    effectiveDateTime: '2026-10-08T00:00',
    changedBy: 'Админ (Эрхлэгч)',
    reason: 'Өвлийн арктик түлшинд шилжсэн тариф',
    createdAt: '2026-10-07T21:15:00',
  },
];

export const DEFAULT_OIL_SALES: OilSaleRecord[] = [
  {
    id: 'os-1',
    date: '2026-10-11',
    shiftType: 'day',
    productId: 'oil-1',
    productName: 'Kixx 5W-30',
    packageSize: '4 л',
    unitPrice: 95000,
    quantity: 2,
    totalAmount: 190000,
    employeeId: 'emp-1',
    paymentMethod: 'cash',
    note: 'Хөдөлгүүрийн тос солих үйлчлүүлэгч',
    createdAt: '2026-10-11T11:20:00',
  },
  {
    id: 'os-2',
    date: '2026-10-11',
    shiftType: 'day',
    productId: 'oil-5',
    productName: 'Шил арчигч (-25°C)',
    packageSize: '4 л',
    unitPrice: 12000,
    quantity: 4,
    totalAmount: 48000,
    employeeId: 'emp-2',
    paymentMethod: 'pos',
    note: 'Шил угаагч шингэн',
    createdAt: '2026-10-11T14:45:00',
  },
  {
    id: 'os-3',
    date: '2026-10-12',
    shiftType: 'day',
    productId: 'oil-3',
    productName: 'ATF',
    packageSize: '1 л',
    unitPrice: 32000,
    quantity: 3,
    totalAmount: 96000,
    employeeId: 'emp-1',
    paymentMethod: 'pos',
    note: 'Хурдны хайрцагт нэмсэн',
    createdAt: '2026-10-12T10:15:00',
  },
  {
    id: 'os-4',
    date: '2026-10-12',
    shiftType: 'night',
    productId: 'oil-4',
    productName: 'Тосол (-40°C)',
    packageSize: '5 л',
    unitPrice: 28000,
    quantity: 2,
    totalAmount: 56000,
    employeeId: 'emp-3',
    paymentMethod: 'cash',
    note: 'Радиаторын шингэн',
    createdAt: '2026-10-12T22:30:00',
  },
];

export const DEFAULT_FUEL_SHIFT_SALES: FuelShiftSale[] = [
  {
    id: 'fss-1',
    date: '2026-10-11',
    shiftType: 'day',
    fuelType: 'АИ-92',
    dispenserNumber: 'Буу №1 & №2',
    tiers: [
      {
        id: 'tier-1',
        tierLabel: 'Өдрийн ээлж (Үндсэн тариф)',
        pricePerLiter: 2390,
        litersSold: 1250,
        amount: 2987500,
      },
    ],
    totalLiters: 1250,
    totalAmount: 2987500,
    employeeId: 'emp-1',
    paymentBreakdown: {
      cash: 1800000,
      pos: 1187500,
      card: 0,
      coupon: 0,
    },
    note: 'Өдрийн ээлжийн АИ-92 борлуулалт',
    createdAt: '2026-10-11T20:30:00',
  },
  {
    id: 'fss-2',
    date: '2026-10-11',
    shiftType: 'day',
    fuelType: 'Дизель түлш',
    dispenserNumber: 'Буу №3 & №4',
    tiers: [
      {
        id: 'tier-d1',
        tierLabel: 'Өдрийн ээлж',
        pricePerLiter: 3740,
        litersSold: 840,
        amount: 3141600,
      },
    ],
    totalLiters: 840,
    totalAmount: 3141600,
    employeeId: 'emp-2',
    paymentBreakdown: {
      cash: 1500000,
      pos: 1641600,
      card: 0,
      coupon: 0,
    },
    note: 'Өдрийн ээлжийн Дизель түлш',
    createdAt: '2026-10-11T20:30:00',
  },
  {
    id: 'fss-3',
    date: '2026-10-12',
    shiftType: 'day',
    fuelType: 'АИ-92',
    dispenserNumber: 'Буу №1 & №2',
    // Example: үнэ өөрчлөгдсөн тохиолдолд 2 өөр үнийн шатлалтай бүртгэгдсэн бодит жишээ!
    tiers: [
      {
        id: 'tier-ai92-old',
        tierLabel: 'Үнэ өөрчлөгдөхөөс өмнө',
        pricePerLiter: 2350,
        litersSold: 400,
        amount: 940000,
      },
      {
        id: 'tier-ai92-new',
        tierLabel: 'Шинэ үнээр (14:00 цагаас хойш)',
        pricePerLiter: 2390,
        litersSold: 950,
        amount: 2270500,
      },
    ],
    totalLiters: 1350,
    totalAmount: 3210500, // 940,000 + 2,270,500
    employeeId: 'emp-1',
    paymentBreakdown: {
      cash: 2000000,
      pos: 1210500,
      card: 0,
      coupon: 0,
    },
    note: 'Үнэ 2350-аас 2390 болж өөрчлөгдсөн өдрийн борлуулалт',
    createdAt: '2026-10-12T20:30:00',
  },
];

export const DEFAULT_SETTLEMENTS: ShiftSettlement[] = [
  {
    id: 'set-2026-10-11-day',
    date: '2026-10-11',
    shiftType: 'day',
    employeeIds: ['emp-1', 'emp-2'],
    totalFuelAmount: 6129100, // 2987500 + 3141600
    totalOilAmount: 238000, // 190000 + 48000
    grandTotal: 6367100,
    cashReceived: 3538000,
    posReceived: 2829100,
    couponReceived: 0,
    discrepancy: 0,
    isVerified: true,
    verifiedBy: 'Эрхлэгч (Админ)',
    note: 'Бэлэн мөнгө болон POS дансны гүйлгээ таарсан',
    createdAt: '2026-10-11T21:00:00',
  },
];

/* =========================================================
   POS, БАНК, БЭЛЭН МӨНГӨ БА ЭРХЛЭГЧИД ТУШААХ АНХНЫ ӨГӨГДӨЛ
   ========================================================= */

export const DEFAULT_POS_RECORDS: PosTerminalRecord[] = [
  {
    id: 'pos-1',
    terminalName: 'Хаан банк Терминал №1',
    bankName: 'Хаан банк',
    terminalId: 'KB-88201',
    date: '2026-10-11',
    shiftType: 'day',
    batchNumber: 'Batch 0048',
    slipCount: 38,
    totalAmount: 1845000,
    settledAt: '2026-10-11T20:45',
    isSettled: true,
    employeeId: 'emp-1',
    note: 'Өдрийн ээлжийн Z-тайлан хаагдсан',
    createdAt: '2026-10-11T20:45:00',
  },
  {
    id: 'pos-2',
    terminalName: 'Голомт банк Терминал №2',
    bankName: 'Голомт банк',
    terminalId: 'GB-10492',
    date: '2026-10-11',
    shiftType: 'day',
    batchNumber: 'Batch 0032',
    slipCount: 22,
    totalAmount: 984100,
    settledAt: '2026-10-11T20:40',
    isSettled: true,
    employeeId: 'emp-2',
    note: 'Дизель ба тосны картын гүйлгээнүүд',
    createdAt: '2026-10-11T20:40:00',
  },
  {
    id: 'pos-3',
    terminalName: 'Хаан банк Терминал №1',
    bankName: 'Хаан банк',
    terminalId: 'KB-88201',
    date: '2026-10-12',
    shiftType: 'day',
    batchNumber: 'Batch 0049',
    slipCount: 29,
    totalAmount: 1420500,
    isSettled: false,
    employeeId: 'emp-1',
    note: 'Өдрийн ээлжийн явцын баримтууд',
    createdAt: '2026-10-12T16:00:00',
  },
];

export const DEFAULT_BANK_TRANSACTIONS: BankTransactionRecord[] = [
  {
    id: 'bank-1',
    bankName: 'Хаан банк (QPay QR)',
    accountNumber: '5022******',
    date: '2026-10-11',
    time: '14:22',
    shiftType: 'day',
    transactionType: 'qpay',
    amount: 120000,
    customerInfo: '9911**** АИ-92 дүүргэлт',
    referenceNumber: 'QP-8821039',
    isReconciled: true,
    reconciledBy: 'Эрхлэгч (Админ)',
    note: 'QPay орлого автоматаар тулгагдсан',
    createdAt: '2026-10-11T14:22:00',
  },
  {
    id: 'bank-2',
    bankName: 'Хаан банк (Байгууллагын данс)',
    accountNumber: '5022******',
    date: '2026-10-11',
    time: '17:45',
    shiftType: 'day',
    transactionType: 'transfer',
    amount: 540000,
    customerInfo: 'Монгол Транс ХХК',
    referenceNumber: 'TR-449102',
    isReconciled: true,
    reconciledBy: 'Эрхлэгч (Админ)',
    note: 'Гэрээт байгууллагын дизель түлшний төлбөр',
    createdAt: '2026-10-11T17:45:00',
  },
  {
    id: 'bank-3',
    bankName: 'Хаан банк (QPay QR)',
    accountNumber: '5022******',
    date: '2026-10-12',
    time: '11:15',
    shiftType: 'day',
    transactionType: 'qpay',
    amount: 85000,
    customerInfo: 'Тос худалдан авалт',
    referenceNumber: 'QP-991204',
    isReconciled: true,
    reconciledBy: 'Эрхлэгч (Админ)',
    note: 'Kixx тос худалдан авсан',
    createdAt: '2026-10-12T11:15:00',
  },
];

export const DEFAULT_CASH_DRAWER_RECORDS: CashDrawerRecord[] = [
  {
    id: 'cash-1',
    date: '2026-10-11',
    shiftType: 'day',
    openingBalance: 300000, // Эхний хариултын мөнгө
    cashSalesRevenue: 3538000, // Ээлжийн бэлэн мөнгө
    denominations: {
      c20000: 150, // 3,000,000₮
      c10000: 60,  // 600,000₮
      c5000: 40,   // 200,000₮
      c1000: 35,   // 35,000₮
      c500: 6,     // 3,000₮
      c100: 0,
      c50: 0,
      c20: 0,
    },
    countedCashTotal: 3838000, // 3,538,000 + 300,000
    handedToManager: 3538000, // Борлуулалтыг бүрэн тушаасан
    closingBalance: 300000, // Хариултын 300,000 кассанд үлдсэн
    discrepancy: 0, // Зөрүүгүй
    employeeId: 'emp-1',
    isVerified: true,
    note: 'Ээлжийн бэлэн мөнгө тоолж зөрүүгүй тушаав',
    createdAt: '2026-10-11T20:50:00',
  },
];

export const DEFAULT_MANAGER_HANDOVERS: ManagerHandoverRecord[] = [
  {
    id: 'mh-1',
    receiptNumber: 'АКТ-20261011-01',
    date: '2026-10-11',
    time: '20:55',
    shiftType: 'day',
    operatorEmployeeId: 'emp-1',
    managerName: 'Батбаяр (ШТС Эрхлэгч)',
    cashAmount: 3538000,
    posSlipsAmount: 2829100,
    couponsAmount: 0,
    totalHandedAmount: 6367100,
    isConfirmedByManager: true,
    confirmedAt: '2026-10-11T21:05',
    safeDepositNumber: 'Сейф №1 / Дугтуй #12',
    notes: 'Өдрийн ээлжийн нийт орлогыг хүлээн авч сейфэнд хийв',
    createdAt: '2026-10-11T20:55:00',
  },
];

/* =========================================================
   ШТС: ХОШУУ БА САВНЫ АНХНЫ ӨГӨГДӨЛ (ЖИШЭЭ ТОХИРГОО)
   ========================================================= */

export const DEFAULT_NOZZLES: FuelNozzle[] = [
  {
    id: 'noz-1',
    nozzleNumber: '№1',
    dispenserName: 'Түгээгүүр 1 (Баруун тал)',
    fuelType: 'АИ-92',
    tankId: 'tank-1',
    status: 'active',
    currentMeterReading: 142900,
    lastStatusChangeReason: 'Хэвийн ажиллаж байна',
    updatedAt: '2026-10-12T08:00:00',
  },
  {
    id: 'noz-2',
    nozzleNumber: '№2',
    dispenserName: 'Түгээгүүр 1 (Зүүн тал)',
    fuelType: 'АИ-92',
    tankId: 'tank-1',
    status: 'active',
    currentMeterReading: 138540,
    lastStatusChangeReason: 'Хэвийн ажиллаж байна',
    updatedAt: '2026-10-12T08:00:00',
  },
  {
    id: 'noz-3',
    nozzleNumber: '№3',
    dispenserName: 'Түгээгүүр 2 (Баруун тал)',
    fuelType: 'Дизель түлш',
    tankId: 'tank-2',
    status: 'active',
    currentMeterReading: 210400,
    lastStatusChangeReason: 'Хэвийн ажиллаж байна',
    updatedAt: '2026-10-12T08:00:00',
  },
  {
    id: 'noz-4',
    nozzleNumber: '№4',
    dispenserName: 'Түгээгүүр 2 (Зүүн тал)',
    fuelType: 'Дизель түлш',
    tankId: 'tank-2',
    status: 'paused',
    currentMeterReading: 195200,
    lastStatusChangeReason: 'Шлангны битүүмжлэл шалгаж байгаа тул түр зогсоов',
    updatedAt: '2026-10-12T10:30:00',
  },
  {
    id: 'noz-5',
    nozzleNumber: '№5',
    dispenserName: 'Түгээгүүр 3 (Баруун тал)',
    fuelType: 'АИ-95',
    tankId: 'tank-3',
    status: 'empty',
    currentMeterReading: 84300,
    lastStatusChangeReason: 'Сав #3-ын шатахууны бодит үлдэгдэл доод босгонд хүрсэн тул түгээлт түр зогсов',
    updatedAt: '2026-10-12T11:00:00',
  },
  {
    id: 'noz-6',
    nozzleNumber: '№6',
    dispenserName: 'Түгээгүүр 3 (Зүүн тал)',
    fuelType: 'А-80',
    tankId: 'tank-4',
    status: 'maintenance',
    currentMeterReading: 51200,
    lastStatusChangeReason: 'Тоолуурын цахилгаан хавхлага засвартай байгаа тул ажиллахгүй',
    updatedAt: '2026-10-12T09:15:00',
  },
];

export const DEFAULT_TANKS: FuelTank[] = [
  {
    id: 'tank-1',
    tankNumber: 'Сав #1 - АИ-92',
    fuelType: 'АИ-92',
    totalCapacityLiters: 25000,
    currentLiters: 16200,
    currentMastshapCm: 120,
    litersPerCm: 135,
    minSafeThresholdLiters: 3500,
    maxSafeThresholdLiters: 23500,
    status: 'normal',
    lastMeasurementDate: '2026-10-12 08:30',
    notes: 'Үндсэн газар доорх давхар ханатай сав',
    updatedAt: '2026-10-12T08:30:00',
  },
  {
    id: 'tank-2',
    tankNumber: 'Сав #2 - Дизель түлш',
    fuelType: 'Дизель түлш',
    totalCapacityLiters: 30000,
    currentLiters: 7800,
    currentMastshapCm: 55,
    litersPerCm: 142,
    minSafeThresholdLiters: 4000,
    maxSafeThresholdLiters: 28500,
    status: 'normal',
    lastMeasurementDate: '2026-10-12 08:30',
    notes: 'ДТ үндсэн сав, халаагууртай',
    updatedAt: '2026-10-12T08:30:00',
  },
  {
    id: 'tank-3',
    tankNumber: 'Сав #3 - АИ-95',
    fuelType: 'АИ-95',
    totalCapacityLiters: 15000,
    currentLiters: 2400,
    currentMastshapCm: 24,
    litersPerCm: 100,
    minSafeThresholdLiters: 3000,
    maxSafeThresholdLiters: 14000,
    status: 'low_warning', // Аюулгүйн доод босго 3,000 л-ээс бага тул шар анхааруулга!
    lastMeasurementDate: '2026-10-12 08:30',
    notes: 'Үлдэгдэл аюулгүйн босгоос доошилсон тул цистерн захиалсан',
    updatedAt: '2026-10-12T08:30:00',
  },
  {
    id: 'tank-4',
    tankNumber: 'Сав #4 - А-80',
    fuelType: 'А-80',
    totalCapacityLiters: 10000,
    currentLiters: 5200,
    currentMastshapCm: 65,
    litersPerCm: 80,
    minSafeThresholdLiters: 2000,
    maxSafeThresholdLiters: 9500,
    status: 'normal',
    lastMeasurementDate: '2026-10-11 20:00',
    notes: 'Хөдөө аж ахуй ба нийтийн тээврийн нөөц сав',
    updatedAt: '2026-10-11T20:00:00',
  },
];

export const DEFAULT_MASTSHAP_LOGS: MastshapMeasurementLog[] = [
  {
    id: 'mast-1',
    tankId: 'tank-1',
    tankNumber: 'Сав #1 - АИ-92',
    fuelType: 'АИ-92',
    date: '2026-10-12',
    time: '08:30',
    measuredCm: 120,
    calculatedLiters: 16200,
    systemLitersBefore: 16250,
    differenceLiters: -50,
    waterLevelCm: 0,
    temperatureC: 12,
    measuredBy: 'Гэрлээ (Ээлжийн ахлагч)',
    notes: 'Өглөөний ээлж хүлээлцэх үеийн хэмжилт, ус илрээгүй',
    createdAt: '2026-10-12T08:30:00',
  },
  {
    id: 'mast-2',
    tankId: 'tank-2',
    tankNumber: 'Сав #2 - Дизель түлш',
    fuelType: 'Дизель түлш',
    date: '2026-10-12',
    time: '08:35',
    measuredCm: 55,
    calculatedLiters: 7810,
    systemLitersBefore: 7800,
    differenceLiters: 10,
    waterLevelCm: 0.5,
    temperatureC: 10,
    measuredBy: 'Батдэлгэр (Түгээгч)',
    notes: 'Усны пастаар шалгахад 0.5 см, хэвийн хэмжээнд',
    createdAt: '2026-10-12T08:35:00',
  },
  {
    id: 'mast-3',
    tankId: 'tank-3',
    tankNumber: 'Сав #3 - АИ-95',
    fuelType: 'АИ-95',
    date: '2026-10-12',
    time: '08:40',
    measuredCm: 24,
    calculatedLiters: 2400,
    systemLitersBefore: 2420,
    differenceLiters: -20,
    waterLevelCm: 0,
    temperatureC: 11,
    measuredBy: 'Батбаяр (Эрхлэгч)',
    notes: 'Аюулгүйн босгоос доошилсон тул цистерн буулгах бэлтгэл хийв',
    createdAt: '2026-10-12T08:40:00',
  },
];

export const DEFAULT_DELIVERY_RECORDS: FuelDeliveryRecord[] = [
  {
    id: 'del-1',
    tankId: 'tank-1',
    tankNumber: 'Сав #1 - АИ-92',
    fuelType: 'АИ-92',
    date: '2026-10-10',
    time: '15:20',
    waybillNumber: 'ТДХ-99412',
    supplierName: 'НИК Петровис ХХК',
    tankerPlateNumber: '88-12 УБҮ',
    driverName: 'Г. Мөнхбат',
    orderedLiters: 10000,
    deliveredLiters: 9980,
    mastshapBeforeCm: 50,
    mastshapAfterCm: 124,
    density: 0.745,
    temperatureC: 14,
    acceptedBy: 'Батбаяр (Эрхлэгч)',
    notes: 'Лац ломбо бүрэн, нягт ба усны паста шалгаж хүлээн авав',
    createdAt: '2026-10-10T15:20:00',
  },
];

export function getInitialShifts(
  employees: Employee[],
  groups: WorkingGroup[],
  settings: AppSettings
): Record<string, ShiftAssignment> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  let allShifts: Record<string, ShiftAssignment> = {};
  const months = [
    { year: currentMonth === 1 ? currentYear - 1 : currentYear, month: currentMonth === 1 ? 12 : currentMonth - 1 },
    { year: currentYear, month: currentMonth },
    { year: currentMonth === 12 ? currentYear + 1 : currentYear, month: currentMonth === 12 ? 1 : currentMonth + 1 },
  ];

  for (const m of months) {
    const monthShifts = generateScheduleForMonth(
      {
        mode: settings.shiftMode,
        intervalDays: settings.defaultIntervalDays,
        startEntityId: groups[0]?.id || '',
        targetYear: m.year,
        targetMonth: m.month,
        startDateStr: `${m.year}-${String(m.month).padStart(2, '0')}-01`,
        defaultHours: settings.defaultHoursPerShift,
        numEmployeesPerDay: 2,
        repeatPattern: true,
      },
      employees,
      groups
    );
    allShifts = { ...allShifts, ...monthShifts };
  }

  return allShifts;
}

export function getInitialHandovers(
  shifts: Record<string, ShiftAssignment>,
  employees: Employee[]
): HandoverRecord[] {
  const handovers: HandoverRecord[] = [];
  const dates = Object.keys(shifts).slice(0, 15);

  dates.forEach((dateStr, idx) => {
    const shift = shifts[dateStr];
    if (!shift || shift.isDayOff || shift.employeeIds.length === 0) return;

    const inEmpId = shift.employeeIds[0] || 'emp-1';
    const outEmpId = shift.employeeIds[1] || 'emp-2';

    handovers.push({
      id: `ho-day-${dateStr}`,
      date: dateStr,
      shiftType: 'day',
      scheduledTime: '09:00',
      actualTime: idx % 3 === 0 ? '09:12' : '08:55',
      incomingEmployeeId: inEmpId,
      outgoingEmployeeId: outEmpId,
      isHandedOver: true,
      latenessMinutes: idx % 3 === 0 ? 12 : 0,
      isAbsent: false,
      note: idx % 3 === 0 ? 'Замын түгжрэлээс шалтгаалан 12 мин хоцорсон' : 'Ээлж хэвийн хүлээлцсэн',
      verifiedByAdmin: true,
      createdAt: `${dateStr}T09:00:00`,
      updatedAt: `${dateStr}T09:15:00`,
    });

    handovers.push({
      id: `ho-night-${dateStr}`,
      date: dateStr,
      shiftType: 'night',
      scheduledTime: '20:30',
      actualTime: idx % 4 === 0 ? '20:45' : '20:25',
      incomingEmployeeId: outEmpId,
      outgoingEmployeeId: inEmpId,
      isHandedOver: true,
      latenessMinutes: idx % 4 === 0 ? 15 : 0,
      isAbsent: false,
      note: idx % 4 === 0 ? '15 минут хоцорч ирсэн, журналд тэмдэглэв' : 'Оройн ээлж хэвийн хүлээн авсан',
      verifiedByAdmin: true,
      createdAt: `${dateStr}T20:30:00`,
      updatedAt: `${dateStr}T20:45:00`,
    });
  });

  return handovers;
}

export function getInitialAttendance(
  shifts: Record<string, ShiftAssignment>
): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const dates = Object.keys(shifts).slice(0, 15);

  dates.forEach((dateStr, idx) => {
    const shift = shifts[dateStr];
    if (!shift || shift.isDayOff) return;

    shift.employeeIds.forEach((empId, empIdx) => {
      const isNight = empIdx % 2 === 1;

      const d = new Date(dateStr);
      d.setDate(d.getDate() + 1);
      const nextDateStr = d.toISOString().split('T')[0];

      const startDateTime = isNight
        ? `${dateStr}T20:30`
        : `${dateStr}T09:00`;
      const endDateTime = isNight
        ? `${nextDateStr}T09:00`
        : `${dateStr}T20:30`;

      const actualHours = isNight ? 12 : 11;
      const overtimeHours = idx % 5 === 0 ? 1.5 : 0;
      const latenessMinutes = idx % 4 === 0 ? 15 : 0;

      records.push({
        id: `att-${dateStr}-${empId}`,
        employeeId: empId,
        date: dateStr,
        shiftType: isNight ? 'night' : 'day',
        startDateTime,
        endDateTime,
        plannedHours: 12,
        actualHours,
        breakMinutes: 30,
        approvedHours: actualHours,
        overtimeHours,
        latenessMinutes,
        isAbsent: false,
        isApproved: true,
        note: isNight ? 'Шөнийн ээлж (20:30 - 09:00)' : 'Өдрийн ээлж (09:00 - 20:30)',
        createdAt: `${dateStr}T09:00:00`,
        updatedAt: `${dateStr}T21:00:00`,
      });
    });
  });

  return records;
}

export function getInitialPayrollData(
  employees: Employee[],
  attendance: AttendanceRecord[],
  settings: AppSettings
): {
  period: PayrollPeriod;
  calculations: PayrollCalculation[];
  payments: PayrollPayment[];
} {
  const period: PayrollPeriod = {
    id: 'period-2026-10',
    year: 2026,
    month: 10,
    cutoffDay: settings.payrollCutoffDay,
    cutoffTime: settings.payrollCutoffTime,
    payoutDayPrimary: settings.payrollPrimaryDay,
    payoutDaySecondary: settings.payrollSecondaryDay,
    secondaryPayoutType: settings.defaultSecondaryType,
    isClosed: false,
    closedAt: null,
    notes: '2026 оны 10-р сарын цалингийн мөчлөг',
  };

  const payments: PayrollPayment[] = [
    {
      id: 'pay-25-emp-1',
      periodId: 'period-2026-10',
      employeeId: 'emp-1',
      paymentDate: '2026-10-25',
      paymentType: 'primary_25',
      calculatedAmount: 1800000,
      paidAmount: 1800000,
      status: 'completed',
      note: '25-ны үндсэн цалингийн олголт',
      createdAt: '2026-10-25T11:00:00',
    },
    {
      id: 'pay-25-emp-2',
      periodId: 'period-2026-10',
      employeeId: 'emp-2',
      paymentDate: '2026-10-25',
      paymentType: 'primary_25',
      calculatedAmount: 1600000,
      paidAmount: 1600000,
      status: 'completed',
      note: '25-ны үндсэн цалингийн олголт',
      createdAt: '2026-10-25T11:00:00',
    },
    {
      id: 'pay-25-emp-3',
      periodId: 'period-2026-10',
      employeeId: 'emp-3',
      paymentDate: '2026-10-25',
      paymentType: 'primary_25',
      calculatedAmount: 1700000,
      paidAmount: 1700000,
      status: 'completed',
      note: '25-ны үндсэн цалингийн олголт',
      createdAt: '2026-10-25T11:00:00',
    },
    {
      id: 'pay-25-emp-4',
      periodId: 'period-2026-10',
      employeeId: 'emp-4',
      paymentDate: '2026-10-25',
      paymentType: 'primary_25',
      calculatedAmount: 1500000,
      paidAmount: 1500000,
      status: 'completed',
      note: '25-ны үндсэн цалингийн олголт',
      createdAt: '2026-10-25T11:00:00',
    },
  ];

  const calculations = employees.map((emp) =>
    calculateEmployeePayroll(emp, period.id, attendance, payments)
  );

  return { period, calculations, payments };
}

export function loadStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`${STORAGE_KEY_PREFIX}_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading localStorage key: ${key}`, e);
    return defaultValue;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving localStorage key: ${key}`, e);
  }
}

export function clearAllStoredData(): void {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX) || key.startsWith('mongolian_shift_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Error clearing localStorage', e);
  }
}
