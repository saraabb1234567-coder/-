import React, { useState } from 'react';
import {
  Droplets,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Search,
  Filter,
  TrendingUp,
  Package,
  AlertTriangle,
  Receipt,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ShieldAlert,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import { OilProduct, OilSaleRecord, HandoverShiftType } from '../types';
import { formatMNT } from '../utils/calculations';
import { getTodayString } from '../utils/dateUtils';

type OilSubTab = 'catalog' | 'sales_log';

export const OilProductsView: React.FC = () => {
  const {
    oilProducts,
    addOilProduct,
    updateOilProduct,
    toggleOilProductActive,
    oilSales,
    recordOilSale,
    deleteOilSale,
    employees,
  } = useShifts();

  const todayStr = getTodayString();
  const [activeSubTab, setActiveSubTab] = useState<OilSubTab>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OilProduct | null>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);

  // Product Form State
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('Хөдөлгүүрийн тос');
  const [pBrand, setPBrand] = useState('Kixx');
  const [pPackageSize, setPPackageSize] = useState('4 л');
  const [pUnitPrice, setPUnitPrice] = useState<number>(95000);
  const [pInitialStock, setPInitialStock] = useState<number>(20);
  const [pAddedStock, setPAddedStock] = useState<number>(0);
  const [pNote, setPNote] = useState('');

  // Sale Form State
  const [osDate, setOsDate] = useState(todayStr);
  const [osShiftType, setOsShiftType] = useState<HandoverShiftType>('day');
  const [osProductId, setOsProductId] = useState(oilProducts[0]?.id || '');
  const [osQuantity, setOsQuantity] = useState<number>(1);
  const [osEmployeeId, setOsEmployeeId] = useState(employees[0]?.id || '');
  const [osPaymentMethod, setOsPaymentMethod] = useState<'cash' | 'pos' | 'card' | 'transfer'>('cash');
  const [osNote, setOsNote] = useState('');

  // Metrics
  const totalStockValue = oilProducts.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0);
  const totalSalesRevenue = oilSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const lowStockCount = oilProducts.filter((p) => p.currentStock <= 5 && p.isActive).length;

  const categories = Array.from(new Set(oilProducts.map((p) => p.category))).filter(Boolean);

  const filteredProducts = oilProducts.filter((prod) => {
    if (selectedCategory !== 'all' && prod.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        prod.name.toLowerCase().includes(q) ||
        prod.brand.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredSales = oilSales.filter((sale) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const emp = employees.find((e) => e.id === sale.employeeId)?.name.toLowerCase() || '';
      return (
        sale.productName.toLowerCase().includes(q) ||
        sale.note?.toLowerCase().includes(q) ||
        emp.includes(q)
      );
    }
    return true;
  });

  const openAddProduct = () => {
    setEditingProduct(null);
    setPName('');
    setPCategory('Хөдөлгүүрийн тос');
    setPBrand('');
    setPPackageSize('4 л');
    setPUnitPrice(85000);
    setPInitialStock(15);
    setPAddedStock(0);
    setPNote('');
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
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    if (pUnitPrice <= 0) {
      alert('Нэгжийн үнэ 0-ээс их байх ёстой!');
      return;
    }

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

    setShowProductModal(false);
  };

  const openAddSale = (defaultProdId?: string) => {
    setOsDate(todayStr);
    setOsShiftType('day');
    setOsProductId(defaultProdId || oilProducts[0]?.id || '');
    setOsQuantity(1);
    setOsEmployeeId(employees[0]?.id || '');
    setOsPaymentMethod('cash');
    setOsNote('');
    setShowSaleModal(true);
  };

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = oilProducts.find((p) => p.id === osProductId);
    if (!prod) return;

    if (osQuantity <= 0) {
      alert('Борлуулсан тоо хэмжээ 0-ээс их байна!');
      return;
    }

    recordOilSale({
      date: osDate,
      shiftType: osShiftType,
      productId: prod.id,
      productName: prod.name,
      packageSize: prod.packageSize,
      unitPrice: prod.unitPrice,
      quantity: Number(osQuantity),
      employeeId: osEmployeeId,
      paymentMethod: osPaymentMethod,
      note: osNote.trim(),
    });

    setShowSaleModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Тос, нэмэлт бүтээгдэхүүний удирдлага
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Бараа материалын бүртгэл
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Хөдөлгүүрийн болон хурдны хайрцгийн тос, тосол, шил арчигчийн үнэ, үлдэгдэл ба ээлжийн борлуулалтын журнал
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Бүтээгдэхүүн нэмэх</span>
          </button>
          <button
            onClick={() => openAddSale()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Droplets className="w-4 h-4" />
            <span>Тос борлуулах</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>НИЙТ БҮТЭЭГДЭХҮҮН</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {oilProducts.length} төрөл
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Идэвхтэй: {oilProducts.filter((p) => p.isActive).length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ҮЛДЭГДЛИЙН ҮНЭЛГЭЭ (₮)</span>
            <Droplets className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-700">
            {formatMNT(totalStockValue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Агуулахын одоогийн нөөцийн дүн
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>НИЙТ БОРЛУУЛАЛТ (₮)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {formatMNT(totalSalesRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {oilSales.length} удаагийн борлуулалт
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ҮЛДЭГДЭЛ БАГА (АНХААРУУЛГА)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600">
            {lowStockCount} бүтээгдэхүүн
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Үлдэгдэл 5-аас доош орсон бараанууд
          </p>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'catalog'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Бүтээгдэхүүний каталог & Үлдэгдэл ({oilProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sales_log')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'sales_log'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Борлуулалтын журнал ({oilSales.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Нэр, брэнд, төрлөөр хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          {activeSubTab === 'catalog' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
            >
              <option value="all">Бүх төрөл</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs text-rose-600 font-bold hover:underline px-2 cursor-pointer"
            >
              Шүүлт цэвэрлэх
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: CATALOG & INVENTORY */}
      {activeSubTab === 'catalog' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Бүтээгдэхүүний нэр</th>
                  <th className="py-3 px-4">Төрөл / Брэнд</th>
                  <th className="py-3 px-4 text-center">Савлагаа</th>
                  <th className="py-3 px-4 text-right">Нэгжийн үнэ (₮)</th>
                  <th className="py-3 px-4 text-center">Эхний үлдэгдэл</th>
                  <th className="py-3 px-4 text-center">Орлого</th>
                  <th className="py-3 px-4 text-center">Борлуулсан тоо</th>
                  <th className="py-3 px-4 text-center font-bold">Эцсийн үлдэгдэл</th>
                  <th className="py-3 px-4 text-right">Нийт борлуулалт</th>
                  <th className="py-3 px-4 text-center">Төлөв</th>
                  <th className="py-3 px-4 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => (
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
                    <td className="py-3 px-4 text-center font-bold text-base bg-slate-50/50">
                      <span className={prod.currentStock <= 5 ? 'text-rose-600 font-mono' : 'text-slate-900 font-mono'}>
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
                          onClick={() => openAddSale(prod.id)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-xs font-bold cursor-pointer"
                          title="Борлуулалт бүртгэх"
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

      {/* SUB-TAB 2: SALES LOG */}
      {activeSubTab === 'sales_log' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
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
                  <th className="py-3 px-4">Борлуулсан ажилтан</th>
                  <th className="py-3 px-4 text-center">Төлбөрийн хэлбэр</th>
                  <th className="py-3 px-4">Тайлбар</th>
                  <th className="py-3 px-4 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((sale) => {
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
                      <td className="py-3 px-4 text-center font-bold font-mono text-slate-900">
                        {sale.quantity} ш
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                        {formatMNT(sale.totalAmount)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {emp ? emp.name : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-700 uppercase">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {sale.note || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm('Энэ борлуулалтыг устгаж, үлдэгдлийг буцаах уу?')) {
                              deleteOilSale(sale.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Устгах"
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

      {/* Add / Edit Product Modal */}
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Бүтээгдэхүүний нэр: * (Жишээ: Kixx 5W-30, 10W-30, ATF, Тосол, Шил арчигч)
                </label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="Жишээ: Kixx 5W-30..."
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingProduct ? 'Хадгалах' : 'Нэмэх'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Oil Sale Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
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
                onClick={() => setShowSaleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
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
                  onClick={() => setShowSaleModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Бүртгэх
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
