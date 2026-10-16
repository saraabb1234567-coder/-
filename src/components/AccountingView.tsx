import React, { useState } from 'react';
import {
  Fuel,
  Droplets,
  DollarSign,
  History,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
  Receipt,
  X,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import {
  OilProduct,
  OilSaleRecord,
  FuelPriceConfig,
  FuelSalePriceTier,
  FuelShiftSale,
  ShiftSettlement,
  HandoverShiftType,
} from '../types';
import { formatMNT } from '../utils/calculations';
import { getTodayString } from '../utils/dateUtils';

type AccountingTab = 'oil_products' | 'oil_sales' | 'fuel_prices' | 'fuel_sales' | 'settlement';

export const AccountingView: React.FC = () => {
  const {
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
    deleteFuelShiftSale,
    settlements,
    recordSettlement,
    verifySettlement,
    employees,
    settings,
  } = useShifts();

  const todayStr = getTodayString();
  const [activeTab, setActiveTab] = useState<AccountingTab>('oil_products');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OilProduct | null>(null);

  const [showOilSaleModal, setShowOilSaleModal] = useState(false);
  const [showFuelPriceModal, setShowFuelPriceModal] = useState(false);
  const [editingFuelPrice, setEditingFuelPrice] = useState<FuelPriceConfig | null>(null);

  const [showFuelSaleModal, setShowFuelSaleModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Product Form state
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('Хөдөлгүүрийн тос');
  const [pBrand, setPBrand] = useState('');
  const [pPackageSize, setPPackageSize] = useState('4 л');
  const [pUnitPrice, setPUnitPrice] = useState<number>(85000);
  const [pInitialStock, setPInitialStock] = useState<number>(20);
  const [pAddedStock, setPAddedStock] = useState<number>(0);
  const [pNote, setPNote] = useState('');

  // 2. Oil Sale Form state
  const [osDate, setOsDate] = useState(todayStr);
  const [osShiftType, setOsShiftType] = useState<HandoverShiftType>('day');
  const [osProductId, setOsProductId] = useState(oilProducts[0]?.id || '');
  const [osQuantity, setOsQuantity] = useState<number>(1);
  const [osEmployeeId, setOsEmployeeId] = useState(employees[0]?.id || '');
  const [osPaymentMethod, setOsPaymentMethod] = useState<'cash' | 'pos' | 'card' | 'transfer'>('cash');
  const [osNote, setOsNote] = useState('');

  // 3. Fuel Price Change Form state
  const [fpFuelType, setFpFuelType] = useState('АИ-92');
  const [fpNewPrice, setFpNewPrice] = useState<number>(2390);
  const [fpEffectiveDateTime, setFpEffectiveDateTime] = useState(`${todayStr}T00:00`);
  const [fpReason, setFpReason] = useState('');
  const [fpAdminConfirm, setFpAdminConfirm] = useState(false);

  // 4. Fuel Sale Form state (Multiple price tiers)
  const [fssDate, setFssDate] = useState(todayStr);
  const [fssShiftType, setFssShiftType] = useState<HandoverShiftType>('day');
  const [fssFuelType, setFssFuelType] = useState('АИ-92');
  const [fssDispenser, setFssDispenser] = useState('Буу №1 & №2');
  const [fssEmployeeId, setFssEmployeeId] = useState(employees[0]?.id || '');
  const [fssTiers, setFssTiers] = useState<FuelSalePriceTier[]>([
    {
      id: 'tier-1',
      tierLabel: 'Үндсэн тариф',
      pricePerLiter: 2390,
      litersSold: 1000,
      amount: 2390000,
    },
  ]);
  const [fssCash, setFssCash] = useState<number>(1500000);
  const [fssPos, setFssPos] = useState<number>(890000);
  const [fssNote, setFssNote] = useState('');

  // 5. Settlement Form state
  const [setlDate, setSetlDate] = useState(todayStr);
  const [setlShiftType, setSetlShiftType] = useState<HandoverShiftType>('day');
  const [setlCash, setSetlCash] = useState<number>(0);
  const [setlPos, setSetlPos] = useState<number>(0);
  const [setlCoupon, setSetlCoupon] = useState<number>(0);
  const [setlNote, setSetlNote] = useState('');

  // Total summary calculations
  const totalOilStockValue = oilProducts.reduce(
    (sum, p) => sum + p.currentStock * p.unitPrice,
    0
  );
  const totalOilSoldRevenue = oilSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalFuelSoldRevenue = fuelShiftSales.reduce((sum, s) => sum + s.totalAmount, 0);

  // --- Handlers ---
  const openAddProduct = () => {
    setEditingProduct(null);
    setPName('');
    setPCategory('Хөдөлгүүрийн тос');
    setPBrand('');
    setPPackageSize('4 л');
    setPUnitPrice(85000);
    setPInitialStock(10);
    setPAddedStock(0);
    setPNote('');
    setModalError(null);
    setIsSubmitting(false);
    setShowProductModal(true);
  };

  const openEditProduct = (prod: OilProduct) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPCategory(prod.category);
    setPBrand(prod.brand);
    setPPackageSize(prod.packageSize);
    setPUnitPrice(prod.unitPrice);
    setPInitialStock(prod.initialStock);
    setPAddedStock(prod.addedStock);
    setPNote(prod.note || '');
    setModalError(null);
    setIsSubmitting(false);
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!pName.trim()) {
      setModalError('Бүтээгдэхүүний нэрийг оруулна уу!');
      return;
    }

    if (pUnitPrice <= 0) {
      setModalError('Нэгжийн үнэ 0-ээс их байх ёстой!');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    if (editingProduct) {
      updateOilProduct(editingProduct.id, {
        name: pName.trim(),
        category: pCategory.trim(),
        brand: pBrand.trim(),
        packageSize: pPackageSize.trim(),
        unitPrice: Number(pUnitPrice),
        initialStock: Number(pInitialStock),
        addedStock: Number(pAddedStock),
        note: pNote.trim(),
      });
    } else {
      addOilProduct({
        name: pName.trim(),
        category: pCategory.trim(),
        brand: pBrand.trim(),
        packageSize: pPackageSize.trim(),
        unitPrice: Number(pUnitPrice),
        initialStock: Number(pInitialStock),
        addedStock: Number(pAddedStock),
        isActive: true,
        note: pNote.trim(),
      });
    }

    setIsSubmitting(false);
    setShowProductModal(false);
  };

  // Record Oil Sale Handler
  const openAddOilSale = (defaultProdId?: string) => {
    setOsDate(todayStr);
    setOsShiftType('day');
    setOsProductId(defaultProdId || oilProducts[0]?.id || '');
    setOsQuantity(1);
    setOsEmployeeId(employees[0]?.id || '');
    setOsPaymentMethod('cash');
    setOsNote('');
    setModalError(null);
    setIsSubmitting(false);
    setShowOilSaleModal(true);
  };

  const handleSaveOilSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const prod = oilProducts.find((p) => p.id === osProductId);
    if (!prod) {
      setModalError('Бүтээгдэхүүн сонгогдоогүй байна!');
      return;
    }

    if (osQuantity <= 0) {
      setModalError('Борлуулсан тоо хэмжээ 0-ээс их байна!');
      return;
    }

    if (prod.currentStock < osQuantity) {
      setModalError(`Үлдэгдэл хүрэлцэхгүй байна! Боломжит үлдэгдэл: ${prod.currentStock}`);
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    recordOilSale({
      date: osDate,
      shiftType: osShiftType,
      productId: prod.id,
      productName: prod.name,
      packageSize: prod.packageSize,
      unitPrice: prod.unitPrice, // Snapshots current price!
      quantity: Number(osQuantity),
      employeeId: osEmployeeId,
      paymentMethod: osPaymentMethod,
      note: osNote.trim(),
    });

    setIsSubmitting(false);
    setShowOilSaleModal(false);
  };

  // Fuel Price Change Handler
  const openUpdateFuelPrice = (config?: FuelPriceConfig) => {
    const target = config || fuelPrices[0];
    if (target) {
      setEditingFuelPrice(target);
      setFpFuelType(target.fuelType);
      setFpNewPrice(target.pricePerLiter);
      setFpEffectiveDateTime(`${todayStr}T00:00`);
      setFpReason('');
      setFpAdminConfirm(false);
      setModalError(null);
      setIsSubmitting(false);
      setShowFuelPriceModal(true);
    }
  };

  const handleSaveFuelPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (fpNewPrice <= 0) {
      setModalError('Шатахууны үнэ 0-ээс их байх ёстой!');
      return;
    }
    if (!fpAdminConfirm) {
      setModalError('Үнэ өөрчлөхийг баталгаажуулна уу!');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    updateFuelPrice(
      fpFuelType,
      Number(fpNewPrice),
      fpEffectiveDateTime,
      fpReason || 'Үнэ шинэчлэгдсэн',
      settings.adminUsername || 'Эрхлэгч (Админ)'
    );

    setIsSubmitting(false);
    setShowFuelPriceModal(false);
  };

  // Fuel Shift Sale with Price Tiers Handler
  const openAddFuelSale = () => {
    const defaultFuel = fuelPrices.find((f) => f.fuelType === 'АИ-92') || fuelPrices[0];
    setFssDate(todayStr);
    setFssShiftType('day');
    setFssFuelType(defaultFuel ? defaultFuel.fuelType : 'АИ-92');
    setFssDispenser('Буу №1 & №2');
    setFssEmployeeId(employees[0]?.id || '');

    const currentPrice = defaultFuel ? defaultFuel.pricePerLiter : 2390;
    setFssTiers([
      {
        id: `tier-${Date.now()}`,
        tierLabel: 'Үндсэн тариф',
        pricePerLiter: currentPrice,
        litersSold: 800,
        amount: Math.round(800 * currentPrice),
      },
    ]);
    setFssCash(1000000);
    setFssPos(Math.round(800 * currentPrice) - 1000000);
    setFssNote('');
    setShowFuelSaleModal(true);
  };

  const addTierRow = () => {
    const activePrice = fuelPrices.find((f) => f.fuelType === fssFuelType)?.pricePerLiter || 2390;
    setFssTiers((prev) => [
      ...prev,
      {
        id: `tier-${Date.now()}`,
        tierLabel: `Шинэ үнээр (${prev.length + 1}-р мөр)`,
        pricePerLiter: activePrice,
        litersSold: 200,
        amount: Math.round(200 * activePrice),
      },
    ]);
  };

  const updateTierRow = (index: number, updates: Partial<FuelSalePriceTier>) => {
    setFssTiers((prev) =>
      prev.map((t, idx) => {
        if (idx !== index) return t;
        const price = updates.pricePerLiter !== undefined ? updates.pricePerLiter : t.pricePerLiter;
        const liters = updates.litersSold !== undefined ? updates.litersSold : t.litersSold;
        const amount = Math.round(price * liters);
        return { ...t, ...updates, amount };
      })
    );
  };

  const removeTierRow = (index: number) => {
    if (fssTiers.length <= 1) return;
    setFssTiers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveFuelSale = (e: React.FormEvent) => {
    e.preventDefault();
    const totalLiters = fssTiers.reduce((sum, t) => sum + (t.litersSold || 0), 0);
    const totalAmount = fssTiers.reduce((sum, t) => sum + (t.amount || 0), 0);

    recordFuelShiftSale({
      date: fssDate,
      shiftType: fssShiftType,
      fuelType: fssFuelType,
      dispenserNumber: fssDispenser,
      tiers: fssTiers,
      totalLiters,
      totalAmount,
      employeeId: fssEmployeeId,
      paymentBreakdown: {
        cash: Number(fssCash),
        pos: Number(fssPos),
        card: 0,
        coupon: 0,
      },
      note: fssNote.trim(),
    });

    setShowFuelSaleModal(false);
  };

  // Shift Settlement Handler
  const openSettlement = () => {
    // Sum sales for selected date and shift
    const matchingFuelSales = fuelShiftSales.filter(
      (s) => s.date === setlDate && s.shiftType === setlShiftType
    );
    const matchingOilSales = oilSales.filter(
      (s) => s.date === setlDate && s.shiftType === setlShiftType
    );

    const fuelSum = matchingFuelSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const oilSum = matchingOilSales.reduce((sum, s) => sum + s.totalAmount, 0);

    const cashFromSales =
      matchingFuelSales.reduce((sum, s) => sum + (s.paymentBreakdown.cash || 0), 0) +
      matchingOilSales.filter((s) => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.totalAmount, 0);

    const posFromSales =
      matchingFuelSales.reduce((sum, s) => sum + (s.paymentBreakdown.pos || 0), 0) +
      matchingOilSales.filter((s) => s.paymentMethod === 'pos').reduce((sum, s) => sum + s.totalAmount, 0);

    setSetlCash(cashFromSales || (fuelSum + oilSum));
    setSetlPos(posFromSales || 0);
    setSetlCoupon(0);
    setSetlNote('Ээлжийн тооцоо хаав');
    setShowSettlementModal(true);
  };

  const handleSaveSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const matchingFuelSales = fuelShiftSales.filter(
      (s) => s.date === setlDate && s.shiftType === setlShiftType
    );
    const matchingOilSales = oilSales.filter(
      (s) => s.date === setlDate && s.shiftType === setlShiftType
    );

    const totalFuelAmount = matchingFuelSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalOilAmount = matchingOilSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const grandTotal = totalFuelAmount + totalOilAmount;

    const totalReceived = Number(setlCash) + Number(setlPos) + Number(setlCoupon);
    const discrepancy = totalReceived - grandTotal;

    recordSettlement({
      date: setlDate,
      shiftType: setlShiftType,
      employeeIds: employees.slice(0, 2).map((e) => e.id),
      totalFuelAmount,
      totalOilAmount,
      grandTotal,
      cashReceived: Number(setlCash),
      posReceived: Number(setlPos),
      couponReceived: Number(setlCoupon),
      discrepancy,
      isVerified: true,
      verifiedBy: settings.adminUsername || 'Эрхлэгч',
      note: setlNote.trim(),
    });

    setShowSettlementModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Тооцоо: Тос бүтээгдэхүүн, шатахуун & POS
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              ШТС Удирдлага
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Тосны нэр үнэ гараар оруулах, АИ-92 үнэ шинэчлэх, үнэ өөрчлөгдсөн үеийн шатлалт борлуулалт ба кассын нэгтгэл
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddProduct}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Бүтээгдэхүүн нэмэх</span>
          </button>

          <button
            onClick={() => openAddOilSale()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Droplets className="w-4 h-4 text-amber-600" />
            <span>Тос борлуулах</span>
          </button>

          <button
            onClick={openAddFuelSale}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Fuel className="w-4 h-4 text-blue-600" />
            <span>Шатахуун борлуулах</span>
          </button>

          <button
            onClick={openSettlement}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Ээлжийн тооцоо хаах</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Fuel Prices (AI-92 Highlight) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>АИ-92 ҮНЭ (ОДООГИЙН)</span>
            <Fuel className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatMNT(fuelPrices.find((f) => f.fuelType === 'АИ-92')?.pricePerLiter || 2390)}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Дизель: {formatMNT(fuelPrices.find((f) => f.fuelType === 'Дизель түлш')?.pricePerLiter || 3740)}</span>
            <button
              onClick={() => {
                setActiveTab('fuel_prices');
                openUpdateFuelPrice();
              }}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Үнэ засах
            </button>
          </p>
        </div>

        {/* Oil Products Stock Value */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ТОСНЫ ҮЛДЭГДЭЛ (ҮНЭЛГЭЭ)</span>
            <Droplets className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatMNT(totalOilStockValue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Нийт {oilProducts.length} төрлийн бүтээгдэхүүний үлдэгдэл
          </p>
        </div>

        {/* Total Oil Sales Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ТОСНЫ НИЙТ БОРЛУУЛАЛТ</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {formatMNT(totalOilSoldRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {oilSales.length} удаагийн тос борлуулалт бүртгэгдсэн
          </p>
        </div>

        {/* Total Fuel Sales Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ШАТАХУУНЫ БОРЛУУЛАЛТ</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-700">
            {formatMNT(totalFuelSoldRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Нийт ээлжүүдийн түгээсэн дүн
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/60 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('oil_products')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'oil_products'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>1. Тос, бүтээгдэхүүний бүртгэл & Үлдэгдэл</span>
        </button>

        <button
          onClick={() => setActiveTab('fuel_prices')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'fuel_prices'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Fuel className="w-3.5 h-3.5" />
          <span>2. Шатахууны үнэ & Өөрчлөлтийн түүх</span>
        </button>

        <button
          onClick={() => setActiveTab('oil_sales')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'oil_sales'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>3. Тосны борлуулалтын журнал</span>
        </button>

        <button
          onClick={() => setActiveTab('fuel_sales')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'fuel_sales'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>4. Ээлжийн шатахуун борлуулалт (Олон үнэтэй)</span>
        </button>

        <button
          onClick={() => setActiveTab('settlement')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'settlement'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>5. Ээлжийн нэгдсэн тооцоо (POS & Бэлэн мөнгө)</span>
        </button>
      </div>

      {/* TAB 1: OIL PRODUCTS */}
      {activeTab === 'oil_products' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Тос, бүтээгдэхүүний нэршил, үнэ ба үлдэгдлийн бүртгэл
              </h3>
              <p className="text-xs text-slate-500">
                Админ өөрөө хүссэн бүтээгдэхүүний нэр, савлагаа, нэгжийн үнийг гараар бүртгэж засна
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openAddProduct}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Шинэ бүтээгдэхүүн нэмэх</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Бүтээгдэхүүний нэр</th>
                  <th className="py-3 px-4">Төрөл / Брэнд</th>
                  <th className="py-3 px-4 text-center">Савлагаа</th>
                  <th className="py-3 px-4 text-right">Нэгжийн үнэ (₮)</th>
                  <th className="py-3 px-4 text-center">Эхний үлдэгдэл</th>
                  <th className="py-3 px-4 text-center">Орлого (Нэмэгдсэн)</th>
                  <th className="py-3 px-4 text-center">Борлуулсан тоо</th>
                  <th className="py-3 px-4 text-center font-bold">Эцсийн үлдэгдэл</th>
                  <th className="py-3 px-4 text-right">Нийт борлуулалт</th>
                  <th className="py-3 px-4 text-center">Төлөв</th>
                  <th className="py-3 px-4 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {oilProducts.map((prod) => (
                  <tr
                    key={prod.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      !prod.isActive ? 'bg-slate-50/70 opacity-60' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {prod.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{prod.category}</div>
                      <div className="text-[10px] text-slate-400">{prod.brand}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">
                      {prod.packageSize}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                      {formatMNT(prod.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 font-medium">
                      {prod.initialStock}
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-medium">
                      +{prod.addedStock}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {prod.soldQuantity}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-base text-slate-900 bg-slate-50/50">
                      <span className={prod.currentStock < 5 ? 'text-rose-600' : 'text-slate-900'}>
                        {prod.currentStock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatMNT(prod.totalSalesAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {prod.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Идэвхтэй
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-600">
                          Идэвхгүй
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openAddOilSale(prod.id)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-[11px] font-bold cursor-pointer"
                          title="Шууд борлуулах"
                        >
                          Борлуулах
                        </button>
                        <button
                          onClick={() => openEditProduct(prod)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded cursor-pointer"
                          title="Засах"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleOilProductActive(prod.id)}
                          className={`p-1 rounded cursor-pointer ${
                            prod.isActive
                              ? 'text-slate-400 hover:text-rose-600'
                              : 'text-emerald-600 hover:text-emerald-700'
                          }`}
                          title={prod.isActive ? 'Идэвхгүй болгох' : 'Идэвхжүүлэх'}
                        >
                          {prod.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FUEL PRICES */}
      {activeTab === 'fuel_prices' && (
        <div className="space-y-6">
          {/* Active Fuel Prices Grid */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Одоо мөрдөгдөж буй шатахууны тариф (Үнэ гараар өөрчлөх)
                </h3>
                <p className="text-xs text-slate-500">
                  А-80, АИ-92, Дизель түлш зэрэг төрлүүдийн 1 литрийн үнийг админ гараар шинэчилнэ
                </p>
              </div>

              <button
                onClick={() => openUpdateFuelPrice()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>Шатахууны үнэ шинэчлэх</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {fuelPrices.map((fp) => (
                <div
                  key={fp.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-base">{fp.fuelType}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                        {fp.fuelCode}
                      </span>
                    </div>
                    <div className="mt-2 text-2xl font-bold font-mono text-blue-700">
                      {formatMNT(fp.pricePerLiter)} <span className="text-xs font-normal text-slate-500">/ литр</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{fp.note || 'Стандарт тариф'}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Хүчин төгөлдөр: {fp.effectiveDateTime.replace('T', ' ')}</span>
                    <button
                      onClick={() => openUpdateFuelPrice(fp)}
                      className="font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Өөрчлөх
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Change History Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                Шатахууны үнийн өөрчлөлтийн албан ёсны түүх
              </h3>
              <p className="text-xs text-slate-500">
                Үнэ өөрчлөгдсөн огноо, өмнөх үнэ, шинэ үнэ, зөрүү болон шалтгааны журнал
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Өөрчилсөн цаг</th>
                    <th className="py-3 px-4">Шатахууны төрөл</th>
                    <th className="py-3 px-4 text-right">Өмнөх үнэ</th>
                    <th className="py-3 px-4 text-right">Шинэ үнэ</th>
                    <th className="py-3 px-4 text-center">Зөрүү</th>
                    <th className="py-3 px-4">Үйлчилж эхэлсэн хугацаа</th>
                    <th className="py-3 px-4">Шалтгаан / Тайлбар</th>
                    <th className="py-3 px-4">Өөрчилсөн хэрэглэгч</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fuelPriceHistory.map((h) => {
                    const diff = h.newPrice - h.oldPrice;
                    return (
                      <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {h.createdAt.replace('T', ' ').slice(0, 16)}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{h.fuelType}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-500">
                          {formatMNT(h.oldPrice)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatMNT(h.newPrice)}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {diff > 0 ? (
                            <span className="text-rose-600">+{diff}₮</span>
                          ) : (
                            <span className="text-emerald-600">{diff}₮</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                          {h.effectiveDateTime.replace('T', ' ')}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs">{h.reason}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{h.changedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OIL SALES LOG */}
      {activeTab === 'oil_sales' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Тос, бүтээгдэхүүний борлуулалтын журнал
              </h3>
              <p className="text-xs text-slate-500">
                Тухайн ээлжинд ашигласан нэгж үнэ хадгалагдсан тул хожим үнэ өөрчлөгдсөн ч түүх өөрчлөгдөхгүй
              </p>
            </div>

            <button
              onClick={() => openAddOilSale()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Шинэ борлуулалт бүртгэх</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Огноо</th>
                  <th className="py-3 px-4">Ээлж</th>
                  <th className="py-3 px-4">Бүтээгдэхүүн</th>
                  <th className="py-3 px-4 text-center">Савлагаа</th>
                  <th className="py-3 px-4 text-right">Худалдаалсан нэгж үнэ</th>
                  <th className="py-3 px-4 text-center">Тоо хэмжээ</th>
                  <th className="py-3 px-4 text-right font-bold">Нийт дүн</th>
                  <th className="py-3 px-4">Ажилтан</th>
                  <th className="py-3 px-4 text-center">Төлбөрийн хэлбэр</th>
                  <th className="py-3 px-4">Тайлбар</th>
                  <th className="py-3 px-4 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {oilSales.map((sale) => {
                  const emp = employees.find((e) => e.id === sale.employeeId);
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {sale.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sale.shiftType === 'day'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-indigo-50 text-indigo-800'
                          }`}
                        >
                          {sale.shiftType === 'day' ? 'Өдөр' : 'Орой'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{sale.productName}</td>
                      <td className="py-3 px-4 text-center text-slate-600">{sale.packageSize}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {formatMNT(sale.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {sale.quantity} ш
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                        {formatMNT(sale.totalAmount)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {emp ? emp.name : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-700 uppercase">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {sale.note || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteOilSale(sale.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Устгах (Үлдэгдлийг буцаана)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FUEL SHIFT SALES (Multi-tier Price) */}
      {activeTab === 'fuel_sales' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Ээлжийн шатахууны борлуулалт (Үнэ өөрчлөгдсөн үеийн олон шатлалт бүртгэл)
              </h3>
              <p className="text-xs text-slate-500">
                Ээлжийн дундуур үнэ өөрчлөгдсөн үед эхний үнээрх литр болон шинэ үнээрх литрийг тус тусад нь бүртгэнэ
              </p>
            </div>

            <button
              onClick={openAddFuelSale}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Шатахууны борлуулалт бүртгэх</span>
            </button>
          </div>

          <div className="p-4 space-y-4">
            {fuelShiftSales.map((sale) => {
              const emp = employees.find((e) => e.id === sale.employeeId);
              return (
                <div
                  key={sale.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{sale.date}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {sale.shiftType === 'day' ? 'Өдрийн ээлж' : 'Оройн ээлж'}
                      </span>
                      <span className="font-bold text-slate-900">{sale.fuelType}</span>
                      <span className="text-xs text-slate-500">({sale.dispenserNumber})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-600">
                        Хариуцсан түгээгч: <strong>{emp?.name || '-'}</strong>
                      </span>
                      <button
                        onClick={() => deleteFuelShiftSale(sale.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Устгах"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Multi-tier Table */}
                  <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="p-2">Үнийн шатлал / Тарифын нэр</th>
                          <th className="p-2 text-right">Худалдаалсан нэгж үнэ</th>
                          <th className="p-2 text-center">Борлуулсан литр</th>
                          <th className="p-2 text-right font-bold">Борлуулалтын дүн</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sale.tiers.map((tier) => (
                          <tr key={tier.id}>
                            <td className="p-2 font-medium text-slate-800">{tier.tierLabel}</td>
                            <td className="p-2 text-right font-mono font-semibold text-blue-700">
                              {formatMNT(tier.pricePerLiter)} / л
                            </td>
                            <td className="p-2 text-center font-bold text-slate-900">
                              {tier.litersSold} л
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-slate-900">
                              {formatMNT(tier.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                        <tr>
                          <td className="p-2 text-slate-900">Нийт нийлбэр:</td>
                          <td className="p-2 text-right"></td>
                          <td className="p-2 text-center text-blue-800 font-bold">
                            {sale.totalLiters} литр
                          </td>
                          <td className="p-2 text-right font-mono text-emerald-700 text-sm">
                            {formatMNT(sale.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-4">
                      <span>
                        Бэлэн мөнгө: <strong>{formatMNT(sale.paymentBreakdown.cash)}</strong>
                      </span>
                      <span>
                        POS / Карт: <strong>{formatMNT(sale.paymentBreakdown.pos)}</strong>
                      </span>
                    </div>
                    {sale.note && <span className="italic text-slate-400">"{sale.note}"</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: SHIFT SETTLEMENT & RECONCILIATION */}
      {activeTab === 'settlement' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Ээлжийн тооцоо хаалт (Шатахуун + Тос + Бэлэн мөнгө + POS)
              </h3>
              <p className="text-xs text-slate-500">
                Ээлж бүрийн нийт борлуулалтыг бодит хураасан бэлэн мөнгө, POS данстай нэгтгэн зөрүү шалгах
              </p>
            </div>

            <button
              onClick={openSettlement}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Шинэ ээлжийн тооцоо хаах</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Огноо</th>
                  <th className="py-3 px-4">Ээлж</th>
                  <th className="py-3 px-4 text-right">Шатахууны борлуулалт</th>
                  <th className="py-3 px-4 text-right">Тосны борлуулалт</th>
                  <th className="py-3 px-4 text-right font-bold">Нийт кассын дүн</th>
                  <th className="py-3 px-4 text-right">Бэлнээр хураасан</th>
                  <th className="py-3 px-4 text-right">POS орлого</th>
                  <th className="py-3 px-4 text-center font-bold">Кассын зөрүү</th>
                  <th className="py-3 px-4 text-center">Баталгаажсан?</th>
                  <th className="py-3 px-4">Тэмдэглэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{s.date}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-800 text-[10px]">
                        {s.shiftType === 'day' ? 'Өдөр' : 'Орой'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-800">
                      {formatMNT(s.totalFuelAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-700">
                      {formatMNT(s.totalOilAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatMNT(s.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {formatMNT(s.cashReceived)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {formatMNT(s.posReceived)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {s.discrepancy === 0 ? (
                        <span className="text-emerald-700">0 ₮ (Таарсан)</span>
                      ) : s.discrepancy > 0 ? (
                        <span className="text-blue-600">+{formatMNT(s.discrepancy)} (Илүүдэл)</span>
                      ) : (
                        <span className="text-rose-600">{formatMNT(s.discrepancy)} (Дутагдал)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {s.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {s.verifiedBy || 'Баталсан'}
                        </span>
                      ) : (
                        <button
                          onClick={() => verifySettlement(s.id, settings.adminUsername || 'Эрхлэгч')}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px] font-bold hover:bg-blue-100 cursor-pointer"
                        >
                          Батлах
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{s.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          MODALS
          ========================================================= */}

      {/* 1. Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingProduct ? 'Бүтээгдэхүүний мэдээлэл засах' : 'Шинэ тос, бүтээгдэхүүн бүртгэх'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Нэр, төрөл, савлагаа, нэгжийн үнийг гараар оруулах
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Бүтээгдэхүүний нэр: * (Жишээ: Kixx 5W-30, 10W-30, ATF, Тосол, Шил арчигч)
                </label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="Жишээ: Kixx 5W-30, Тосол..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Төрөл:</label>
                  <input
                    type="text"
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    placeholder="Хөдөлгүүрийн тос, Тосол..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Брэнд:</label>
                  <input
                    type="text"
                    value={pBrand}
                    onChange={(e) => setPBrand(e.target.value)}
                    placeholder="Kixx, ZIC, Mobil..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Савлагааны хэмжээ:</label>
                  <input
                    type="text"
                    value={pPackageSize}
                    onChange={(e) => setPPackageSize(e.target.value)}
                    placeholder="1 л, 4 л, 5 л..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-blue-700 block">Нэгжийн үнэ (₮): *</label>
                  <input
                    type="number"
                    min="1"
                    step="500"
                    required
                    value={pUnitPrice}
                    onChange={(e) => setPUnitPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-blue-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Эхний үлдэгдэл:</label>
                  <input
                    type="number"
                    min="0"
                    value={pInitialStock}
                    onChange={(e) => setPInitialStock(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Нэмэгдсэн (Орлого):</label>
                  <input
                    type="number"
                    min="0"
                    value={pAddedStock}
                    onChange={(e) => setPAddedStock(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Тайлбар:</label>
                <input
                  type="text"
                  value={pNote}
                  onChange={(e) => setPNote(e.target.value)}
                  placeholder="Бүтээгдэхүүний нэмэлт тайлбар..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Хадгалж байна...' : editingProduct ? 'Хадгалах' : 'Нэмэх'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Record Oil Sale Modal */}
      {showOilSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Тосны борлуулалт бүртгэх</h3>
                  <p className="text-xs text-slate-500">
                    Тоо хэмжээ оруулахад систем автоматаар нийт дүнг бодно
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOilSaleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOilSale} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Бүтээгдэхүүн сонгох: *</label>
                <select
                  value={osProductId}
                  onChange={(e) => setOsProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  {oilProducts
                    .filter((p) => p.isActive)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.packageSize}) — {formatMNT(p.unitPrice)} [Үлдэгдэл: {p.currentStock}]
                      </option>
                    ))}
                </select>
              </div>

              {/* Selected Product Details Preview */}
              {(() => {
                const selectedProd = oilProducts.find((p) => p.id === osProductId);
                const currentPrice = selectedProd ? selectedProd.unitPrice : 0;
                const calcTotal = currentPrice * osQuantity;
                return (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Нэгжийн үнэ:</span>
                      <span className="font-mono font-bold text-blue-700">{formatMNT(currentPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Тоо хэмжээ:</span>
                      <span className="font-bold">{osQuantity} ширхэг</span>
                    </div>
                    <div className="pt-1 border-t border-blue-200 flex items-center justify-between text-sm font-bold text-slate-900">
                      <span>Нийт төлөх дүн:</span>
                      <span className="font-mono text-emerald-700">{formatMNT(calcTotal)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Борлуулсан тоо: *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={osQuantity}
                    onChange={(e) => setOsQuantity(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Төлбөрийн хэлбэр:</label>
                  <select
                    value={osPaymentMethod}
                    onChange={(e) => setOsPaymentMethod(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <option value="cash">Бэлэн мөнгө</option>
                    <option value="pos">POS карт</option>
                    <option value="transfer">Дансаар</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Огноо:</label>
                  <input
                    type="date"
                    required
                    value={osDate}
                    onChange={(e) => setOsDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Ээлж:</label>
                  <select
                    value={osShiftType}
                    onChange={(e) => setOsShiftType(e.target.value as HandoverShiftType)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="day">Өдрийн ээлж</option>
                    <option value="night">Оройн ээлж</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Борлуулсан ажилтан:</label>
                <select
                  value={osEmployeeId}
                  onChange={(e) => setOsEmployeeId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role || 'Түгээгч'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Тайлбар:</label>
                <input
                  type="text"
                  value={osNote}
                  onChange={(e) => setOsNote(e.target.value)}
                  placeholder="Машины дугаар, онцлох тэмдэглэл..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOilSaleModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Батлаж байна...' : 'Борлуулалт батлах'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Update Fuel Price Modal */}
      {showFuelPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Шатахууны үнэ шинэчлэх (Админ)</h3>
                  <p className="text-xs text-slate-500">
                    АИ-92, Дизель, А-80-ийн 1 литрийн үнийг гараар өөрчлөх
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFuelPriceModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFuelPrice} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Шатахууны төрөл: *</label>
                <select
                  value={fpFuelType}
                  onChange={(e) => {
                    setFpFuelType(e.target.value);
                    const curr = fuelPrices.find((f) => f.fuelType === e.target.value);
                    if (curr) setFpNewPrice(curr.pricePerLiter);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="АИ-92">АИ-92 автобензин</option>
                  <option value="Дизель түлш">Дизель түлш</option>
                  <option value="А-80">А-80 автобензин</option>
                  <option value="Бусад (Евро-5)">Бусад (Евро-5)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-700 block">
                  Шинэ 1 литрийн үнэ (₮): *
                </label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  required
                  value={fpNewPrice}
                  onChange={(e) => setFpNewPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold font-mono text-blue-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Үйлчилж эхлэх огноо, цаг: *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={fpEffectiveDateTime}
                  onChange={(e) => setFpEffectiveDateTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Үнэ өөрчлөх шалтгаан / Тайлбар: *
                </label>
                <textarea
                  rows={2}
                  required
                  value={fpReason}
                  onChange={(e) => setFpReason(e.target.value)}
                  placeholder="Жишээ: Бөөний үнийн өөрчлөлт, шинэ нийлүүлэлт..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Admin Confirmation Checkbox */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                <label className="flex items-start gap-2 cursor-pointer text-xs font-semibold text-amber-900">
                  <input
                    type="checkbox"
                    checked={fpAdminConfirm}
                    onChange={(e) => setFpAdminConfirm(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 mt-0.5"
                  />
                  <span>
                    Би эрх бүхий хэрэглэгчийн хувьд үнийн өөрчлөлтийг баталгаажуулж байна. Өмнөх борлуулалтын түүх хөндөгдөхгүй, цаашдын борлуулалт шинэ үнээр тооцогдоно.
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFuelPriceModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  disabled={!fpAdminConfirm || isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Батлаж байна...' : 'Үнэ батлах & Түүхэнд бичих'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Fuel Sale (Multi-tier) Modal */}
      {showFuelSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Ээлжийн шатахууны борлуулалт (Олон үнийн шатлал)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Үнэ өөрчлөгдсөн үед 2 ба түүнээс дээш үнээр борлуулалт бүртгэх боломжтой
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFuelSaleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFuelSale} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Огноо:</label>
                  <input
                    type="date"
                    required
                    value={fssDate}
                    onChange={(e) => setFssDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Ээлж:</label>
                  <select
                    value={fssShiftType}
                    onChange={(e) => setFssShiftType(e.target.value as HandoverShiftType)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="day">Өдрийн ээлж</option>
                    <option value="night">Оройн ээлж</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Шатахууны төрөл:</label>
                  <select
                    value={fssFuelType}
                    onChange={(e) => setFssFuelType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer font-bold"
                  >
                    <option value="АИ-92">АИ-92</option>
                    <option value="Дизель түлш">Дизель түлш</option>
                    <option value="А-80">А-80</option>
                    <option value="Бусад (Евро-5)">Бусад (Евро-5)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Түгээгүүр / Бууны дугаар:</label>
                  <input
                    type="text"
                    value={fssDispenser}
                    onChange={(e) => setFssDispenser(e.target.value)}
                    placeholder="Буу №1 & №2"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Price Tiers List (Multiple Rows support) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 block">
                    Үнийн шатлалууд (Эхний үнээрх + Шинэ үнээрх):
                  </label>
                  <button
                    type="button"
                    onClick={addTierRow}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Өөр үнэтэй мөр нэмэх</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {fssTiers.map((tier, idx) => (
                    <div
                      key={tier.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">
                          {idx + 1}-р үнийн мөр:
                        </span>
                        {fssTiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTierRow(idx)}
                            className="text-rose-600 text-xs hover:underline cursor-pointer"
                          >
                            Мөр хасах
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[10px] text-slate-500 block">Тайлбар:</label>
                          <input
                            type="text"
                            value={tier.tierLabel}
                            onChange={(e) => updateTierRow(idx, { tierLabel: e.target.value })}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[10px] text-slate-500 block">Нэгж үнэ (₮):</label>
                          <input
                            type="number"
                            value={tier.pricePerLiter}
                            onChange={(e) => updateTierRow(idx, { pricePerLiter: Number(e.target.value) })}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-bold font-mono"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[10px] text-slate-500 block">Литр:</label>
                          <input
                            type="number"
                            value={tier.litersSold}
                            onChange={(e) => updateTierRow(idx, { litersSold: Number(e.target.value) })}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-center"
                          />
                        </div>
                      </div>

                      <div className="text-right text-xs font-bold text-slate-800">
                        Мөрийн дүн: <span className="font-mono text-blue-700">{formatMNT(tier.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grand Total for Tiers */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>
                    Нийт борлуулсан: <strong>{fssTiers.reduce((s, t) => s + (t.litersSold || 0), 0)} литр</strong>
                  </span>
                  <span>
                    Нийт дүн: <strong className="font-mono text-emerald-800 text-sm">{formatMNT(fssTiers.reduce((s, t) => s + (t.amount || 0), 0))}</strong>
                  </span>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Бэлнээр хураасан (₮):</label>
                  <input
                    type="number"
                    value={fssCash}
                    onChange={(e) => setFssCash(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">POS картаар (₮):</label>
                  <input
                    type="number"
                    value={fssPos}
                    onChange={(e) => setFssPos(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Хариуцсан түгээгч:</label>
                <select
                  value={fssEmployeeId}
                  onChange={(e) => setFssEmployeeId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role || 'Түгээгч'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFuelSaleModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Борлуулалт хадгалах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Shift Settlement Modal */}
      {showSettlementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Ээлжийн тооцоо хаах & Батлах</h3>
                  <p className="text-xs text-slate-500">
                    Шатахуун, тос, бэлэн мөнгө ба POS орлогыг нэгтгэх
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSettlementModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettlement} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Огноо:</label>
                  <input
                    type="date"
                    required
                    value={setlDate}
                    onChange={(e) => setSetlDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Ээлж:</label>
                  <select
                    value={setlShiftType}
                    onChange={(e) => setSetlShiftType(e.target.value as HandoverShiftType)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="day">Өдрийн ээлж</option>
                    <option value="night">Оройн ээлж</option>
                  </select>
                </div>
              </div>

              {/* Automatic Totals from Sales for this shift */}
              {(() => {
                const fSum = fuelShiftSales
                  .filter((s) => s.date === setlDate && s.shiftType === setlShiftType)
                  .reduce((sum, s) => sum + s.totalAmount, 0);
                const oSum = oilSales
                  .filter((s) => s.date === setlDate && s.shiftType === setlShiftType)
                  .reduce((sum, s) => sum + s.totalAmount, 0);
                const grand = fSum + oSum;
                const totalRec = Number(setlCash) + Number(setlPos) + Number(setlCoupon);
                const disc = totalRec - grand;

                return (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Шатахууны нийт борлуулалт:</span>
                      <span className="font-mono font-bold text-slate-800">{formatMNT(fSum)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Тос, бүтээгдэхүүний борлуулалт:</span>
                      <span className="font-mono font-bold text-slate-800">{formatMNT(oSum)}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-200 flex items-center justify-between font-bold text-sm text-slate-900">
                      <span>Нийт кассын борлуулалт:</span>
                      <span className="font-mono text-blue-700">{formatMNT(grand)}</span>
                    </div>
                    <div className="pt-1 flex items-center justify-between font-bold text-xs">
                      <span>Кассын зөрүү (Илүүдэл/Дутагдал):</span>
                      <span className={disc === 0 ? 'text-emerald-700' : disc > 0 ? 'text-blue-600' : 'text-rose-600'}>
                        {disc === 0 ? '0 ₮ (Тэнцсэн)' : formatMNT(disc)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Бэлнээр хураасан (₮):</label>
                  <input
                    type="number"
                    required
                    value={setlCash}
                    onChange={(e) => setSetlCash(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">POS дансаар орсон (₮):</label>
                  <input
                    type="number"
                    required
                    value={setlPos}
                    onChange={(e) => setSetlPos(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Тайлбар:</label>
                <input
                  type="text"
                  value={setlNote}
                  onChange={(e) => setSetlNote(e.target.value)}
                  placeholder="Ээлжийн тооцооны тэмдэглэл..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettlementModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Тооцоо баталгаажуулах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
