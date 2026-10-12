import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Settings,
  Users,
  CalendarDays,
  Clock,
  Fuel,
  Gauge,
  AlertTriangle,
  Layers,
  Scale,
  ShieldAlert,
  Droplets,
  CreditCard,
  ArrowLeftRight,
  ShieldCheck,
  Calculator,
  BarChart3,
  Download,
  ChevronRight,
  ExternalLink,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Copy,
  Info,
} from 'lucide-react';
import { TabType } from './Sidebar';

interface UserGuideViewProps {
  onNavigateTab?: (tab: TabType) => void;
}

interface GuideSection {
  id: string;
  number: number;
  title: string;
  icon: React.ElementType;
  category: string;
  targetTab?: TabType;
  summary: string;
  steps: {
    title: string;
    description: string;
    tips?: string;
  }[];
  importantNotes?: string[];
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({ onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('setup');

  const guideSections: GuideSection[] = [
    {
      id: 'setup',
      number: 1,
      title: 'Системийг анх тохируулах',
      icon: Settings,
      category: 'Үндсэн тохиргоо',
      targetTab: 'settings',
      summary: 'Ажлын байрны нэр, цагийн бүс, ээлжийн үндсэн цаг ба цалингийн мөчлөгийг тохируулах.',
      steps: [
        {
          title: '1-р алхам: Тохиргоо цэс рүү орох',
          description: 'Зүүн талын цэснээс "14. Тохиргоо" дэд хуудас руу орно.',
        },
        {
          title: '2-р алхам: Ажлын байрны үндсэн мэдээлэл',
          description: 'ШТС-ийн нэр (жишээ: Петростар-101 Цогцолбор), цагийн бүс (Asia/Ulaanbaatar), нэг ээлжийн үндсэн үргэлжлэх цагийг (12 эсвэл 24 цаг) оруулна.',
        },
        {
          title: '3-р алхам: Ээлж хүлээлцэх тогтмол цаг',
          description: 'Өдрийн ээлж хүлээлцэх үндсэн цаг (09:00), шөнийн ээлж хүлээлцэх цагийг (20:30) тохируулна.',
          tips: 'Энэ цагаас хойш ирсэн түгээгчийн хоцролтыг систем автоматаар минутаар тооцож бүртгэнэ.',
        },
        {
          title: '4-р алхам: Цалингийн мөчлөгийн босго өдрүүд',
          description: 'Цагийн таслалт (Cutoff - Сар бүрийн 18-ны 18:00), урьдчилгаа олгох (25-ны өдөр), үлдэгдэл цалин олгох (дараа сарын 10-ны өдөр) өдрүүдийг тохируулан хадгална.',
        },
      ],
      importantNotes: [
        'Эдгээр тохиргоог зөвхөн ШТС-ийн эрхлэгч админ нууц үгээр өөрчлөх боломжтой.',
      ],
    },
    {
      id: 'employees',
      number: 2,
      title: 'Ажилтан нэмэх, засах & Баг үүсгэх',
      icon: Users,
      category: 'Ажиллах хүч',
      targetTab: 'employees',
      summary: 'ШТС-ийн түгээгч оператор нэмэх, идэвхжүүлэх, чөлөө олгох, хос багт хуваарилах.',
      steps: [
        {
          title: '1-р алхам: Ажилтнууд цэс рүү очих',
          description: 'Зүүн цэснээс "13. Ажилтнууд" дээр дарна. Системд анх үүссэн 5 ажилтан харагдана (Гэрлээ, Батдэлгэр, Оюука, Агий, Саруул).',
        },
        {
          title: '2-р алхам: Шинэ ажилтан нэмэх',
          description: '"Шинэ ажилтан нэмэх" товчийг дарж ажилтны нэр, албан тушаал, утасны дугаар, онцлох өнгийг сонгоно.',
        },
        {
          title: '3-р алхам: Цалингийн тохиргоо хийх',
          description: 'Сар бүрийн үндсэн цалин (жишээ: 1,800,000₮), өдрийн тариф (130,000₮), эсвэл цагийн тариф (12,000₮)-ийг оруулна.',
        },
        {
          title: '4-р алхам: Хос багт хуваарилах',
          description: 'Түгээгчдийг 2, 2-оор нь хос баг болгож ("Баг А: Гэрлээ + Батдэлгэр", "Баг Б: Оюука + Агий") хуваарилна.',
          tips: 'Чөлөөтэй байгаа ажилтныг "Чөлөөтэй" төлөвт шилжүүлбэл хуваарь үүсгэхэд автоматаар алгасна.',
        },
      ],
      importantNotes: [
        'Хуучин ажилтны түүхэн цаг, борлуулалтын бүртгэл системд хадгалагдаж үлдэнэ.',
      ],
    },
    {
      id: 'calendar',
      number: 3,
      title: 'Ээлжийн хуваарь автоматаар үүсгэх',
      icon: CalendarDays,
      category: 'Төлөвлөлт',
      targetTab: 'calendar',
      summary: '2 өдөр ажиллаад 2 өдөр амрах (2/2), 24/48, ээлжлэн солигдох горимоор хуваарь гаргах.',
      steps: [
        {
          title: '1-р алхам: Ээлжийн хуваарь цэс рүү орох',
          description: '"2. Ээлжийн хуваарь" цэс рүү орж "Хуваарь гаргах" товчийг дарна.',
        },
        {
          title: '2-р алхам: Горим сонгох',
          description: 'Горим А: Хосоороо ээлжлэх (Баг А 2 өдөр, Баг Б 2 өдөр), Горим Б: Ганц ганцаараа ээлжлэх, Горим В: 24 цаг ажиллаад 48 цаг амрах.',
        },
        {
          title: '3-р алхам: Эхлэх баг ба сарыг заах',
          description: 'Хуваарь эхлэх өдөр болон аль баг түрүүлж гарахыг сонгоод "Хуваарь үүсгэх" дарна.',
        },
        {
          title: '4-р алхам: Гараар өөрчлөх ба солилцох',
          description: 'Календарь дээрх аль ч өдөр дээр дарж тухайн өдрийн ажилтныг гараар солих, эсвэл "Өдөр солилцох" товчоор 2 өдрийн хуваарийг шууд солих боломжтой.',
        },
      ],
    },
    {
      id: 'attendance',
      number: 4,
      title: 'Цагийн бүртгэл & Шөнө дундыг дамнасан ээлж',
      icon: Clock,
      category: 'Ажиллах хүч',
      targetTab: 'attendance',
      summary: 'Ирсэн, явсан цаг бүртгэх, шөнө 20:30-аас өглөө 09:00 хүртэлх ээлжийн цагийг зөв тооцох.',
      steps: [
        {
          title: '1-р алхам: Цагийн бүртгэл хуудас',
          description: '"3. Цагийн бүртгэл" цэсэнд ажилтан бүрийн өдөр тутмын ирсэн/явсан бүртгэл байрлана.',
        },
        {
          title: '2-р алхам: Шөнө дундыг дамнасан ээлж',
          description: 'Хэрэв ээлж 20:30-д эхэлж дараа өдрийн 09:00 цагт дууссан бол систем огноо шилжсэнийг автоматаар таньж, бодит ажилласан 12.5 цагийг алдаагүй тооцно.',
        },
        {
          title: '3-р алхам: Цаг баталгаажуулах',
          description: 'Эрхлэгч цагийн бүртгэлийг шалгаж "Зөвшөөрөх" товч дарж баталгаажуулна. Баталгаажсан цаг нь цалин бодоход шууд ашиглагдана.',
        },
      ],
    },
    {
      id: 'fuel_prices',
      number: 5,
      title: 'Шатахууны үнэ ба Хошуу тохируулах',
      icon: Fuel,
      category: 'Шатахуун & Бараа',
      targetTab: 'fuel_sales',
      summary: 'АИ-92, Дизель, АИ-95-ын нэгжийн үнийг гараар оруулах, үнийн өөрчлөлтийн түүх хадгалах.',
      steps: [
        {
          title: '1-р алхам: Шатахууны үнийн хэсэг',
          description: '"5. Шатахууны борлуулалт" цэсний баруун дээр байрлах "Үнэ өөрчлөх" товчийг дарна.',
        },
        {
          title: '2-р алхам: Шинэ үнэ ба мөрдөгдөх цаг',
          description: 'Шатахууны төрөл сонгож, шинэ литрийн үнэ (₮), мөрдөж эхлэх огноо цаг, өөрчилсөн шалтгааныг бичнэ.',
        },
        {
          title: '3-р алхам: Үнийн түүх хадгалагдах зарчим',
          description: 'Үнэ өөрчлөгдсөн ч өмнөх ээлжүүдийн хуучин үнээр борлуулагдсан түүх хэзээ ч өөрчлөгдөхгүй, түүх болж үлдэнэ.',
        },
      ],
    },
    {
      id: 'fuel_sales_tiers',
      number: 6,
      title: 'Милль оруулах, литр ба дүнг шалгах',
      icon: Gauge,
      category: 'Шатахуун & Бараа',
      targetTab: 'fuel_sales',
      summary: 'Лангууны эхний ба эцсийн заалтаар литр тооцох, ээлжийн явцад үнэ өөрчлөгдөх үеийн олон шатлалт тооцоо.',
      steps: [
        {
          title: '1-р алхам: Ээлжийн борлуулалт нэмэх',
          description: '"5. Шатахууны борлуулалт" хуудаснаас "Ээлжийн борлуулалт нэмэх" товч дарна.',
        },
        {
          title: '2-р алхам: Хошуу ба лангууны заалт оруулах',
          description: 'Түгээгүүрийн хошуу (№1, №2), эхний милль (start meter) болон эцсийн милль (end meter) оруулна. Систем литрийг автоматаар (End - Start) тооцно.',
        },
        {
          title: '3-р алхам: Нэг ээлжинд олон үнээр хувааж тооцох',
          description: 'Хэрэв тухайн ээлжийн дундуур (жишээ нь 20:00 цагт) үнэ өөрчлөгдсөн бол "+ Үнийн үе шат нэмэх" дарж 1-р үе шатыг хуучин үнээр, 2-р үе шатыг шинэ үнээр тус тус оруулан нийлбэр дүнг бодно.',
        },
        {
          title: '4-р алхам: Төлбөрийн хэлбэр хуваарилах',
          description: 'Нийт дүнг бэлэн мөнгө, POS карт, байгууллагын талон гэж ангилан хадгална.',
        },
      ],
    },
    {
      id: 'nozzle_status',
      number: 7,
      title: 'Хошууны 4 төлөв & Анхааруулга',
      icon: AlertTriangle,
      category: 'Техникийн удирдлага',
      targetTab: 'tanks',
      summary: 'Хошуу бүрийн төлөвийг Хэвийн, Түр зогссон, Шатахуун дууссан, Засвартай гэж тохируулах.',
      steps: [
        {
          title: '1-р алхам: Сав ба Хошуу хуудас руу очих',
          description: '"11. Сав, хошуу" (Tanks) цэсний "2. Хошууны 4 төлөв" таб руу орно.',
        },
        {
          title: '2-р алхам: Төлөв хурдан солих',
          description: 'Хошуу тус бүрийн карт дээр байрлах 4 товчлуураар төлөвийг шууд өөрчилнө: Ногоон (Хэвийн), Шар (Түр зогссон), Улаан (Шатахуун дууссан), Нил ягаан (Засвартай).',
        },
        {
          title: '3-р алхам: Ээлжийн тооцоонд тусах байдал',
          description: 'Хэрэв хошуу "Шатахуун дууссан" эсвэл "Түр зогссон" төлөвтэй бол ээлжийн тооцооны хуудас болон Хянах самбар дээр шар анхааруулга автоматаар асч түгээгч нарт сэрэмжлүүлнэ.',
        },
      ],
    },
    {
      id: 'tanks_capacity',
      number: 8,
      title: 'Савны багтаамж & Бодит үлдэгдэл',
      icon: Layers,
      category: 'Техникийн удирдлага',
      targetTab: 'tanks',
      summary: 'Газар доорх савнуудын нийт багтаамж, бодит үлдэгдэл болон дүүрэлтийн хувийг хянах.',
      steps: [
        {
          title: '1-р алхам: Савны багтаамж харах',
          description: '"11. Сав, хошуу" цэсний "1. Савны багтаамж & Аюулгүйн босго" хэсэгт сав тус бүрийн график индикатор харагдана.',
        },
        {
          title: '2-р алхам: Сав шинээр нэмэх / засах',
          description: '"Шинэ сав нэмэх" товчоор савны нэр, шатахууны төрөл, нийт багтаамж (литр), мастшапын дүйцүүлэлтийг тохируулна.',
        },
      ],
    },
    {
      id: 'mastshap',
      number: 9,
      title: 'Мастшапын хэмжилт & Тооцоолуур',
      icon: Scale,
      category: 'Техникийн удирдлага',
      targetTab: 'tanks',
      summary: 'Шугамаар хэмжсэн сантиметрийг литр рүү хөрвүүлж, системийн тооцоот үлдэгдэлтэй тулган зөрүү шалгах.',
      steps: [
        {
          title: '1-р алхам: Хэмжилт хийх',
          description: 'Өглөөний 09:00 ба оройн 20:30 ээлж хүлээлцэхэд саванд мастшапын метрийн шугам буулгаж шатахууны түвшинг (см) хэмжинэ.',
        },
        {
          title: '2-р алхам: Тооцоолуурт оруулах',
          description: '"Мастшап хэмжих" товч дарж сав сонгоод хэмжсэн сантиметрийг (жишээ: 120 см) оруулна.',
        },
        {
          title: '3-р алхам: Автомат литр ба зөрүү',
          description: 'Систем тухайн савны коэффициентоор (жишээ: 1 см = 135 л) үржүүлж бодит литрийг тооцоод, өмнөх тооцоот үлдэгдэлтэй харьцуулан зөрүү литрийг (+/-) харуулна.',
        },
        {
          title: '4-р алхам: Усны паста шалгах',
          description: 'Шугамын үзүүрт усны паста түрхэж савны ёроолын усны түвшинг (см) тэмдэглэн хадгална.',
        },
      ],
    },
    {
      id: 'safety_thresholds',
      number: 10,
      title: 'Аюулгүйн босго тохируулах',
      icon: ShieldAlert,
      category: 'Техникийн удирдлага',
      targetTab: 'tanks',
      summary: 'Савны доод ба дээд аюулгүйн босго (литр) тохируулж, түвшин буурахад шар/улаан сэрэмжлүүлэг авах.',
      steps: [
        {
          title: '1-р алхам: Босго тогтоох',
          description: 'Сав засах цонхонд "Аюулгүйн доод босго" (жишээ: 3,500 л) болон "Аюулгүйн дээд босго" (жишээ: 23,500 л)-г заана.',
        },
        {
          title: '2-р алхам: Автомат анхааруулга ажиллах',
          description: 'Савны үлдэгдэл доод босгоос доошилбол карт шар/улаан өнгөөр асч "Аюулгүйн босгоос доошилсон" гэсэн сэрэмжлүүлэг дэлгэцэнд гарна.',
        },
        {
          title: '3-р алхам: Цистерн буулгах бэлтгэл',
          description: 'Эрхлэгч энэ анхааруулгыг харж түргэн шуурхай нийлүүлэгч компани руу цистерн машин захиална.',
        },
      ],
    },
    {
      id: 'oil_products',
      number: 11,
      title: 'Тос, нэмэлт бүтээгдэхүүний бүртгэл',
      icon: Droplets,
      category: 'Шатахуун & Бараа',
      targetTab: 'oil_products',
      summary: 'Хөдөлгүүрийн тос, шил арчигч, тосол зэрэг барааны үнэ, эхний/эцсийн үлдэгдэл ба борлуулалт бүртгэх.',
      steps: [
        {
          title: '1-р алхам: Бараа бүртгэх',
          description: '"6. Тос, нэмэлт бүтээгдэхүүн" цэс рүү орж "Шинэ бүтээгдэхүүн нэмэх" дарна.',
        },
        {
          title: '2-р алхам: Нэр ба үнийг гараар оруулах',
          description: 'Нэр (Kixx 5W-30, ZIC, Тосол), брэнд, савлагаа (1 л, 4 л), нэгжийн үнэ (₮), эхний үлдэгдлийг оруулна. Үнийг тогтмол хатуу заагаагүй тул админ өөрөө шийднэ.',
        },
        {
          title: '3-р алхам: Ээлжийн тосны борлуулалт хийх',
          description: '"Борлуулалт бүртгэх" товчоор борлуулсан ширхэгийг оруулахад систем (Тоо × Үнэ) автоматаар тооцож, агуулахын үлдэгдлээс хасна.',
        },
      ],
    },
    {
      id: 'pos_bank_cash',
      number: 12,
      title: 'POS, Банк ба Бэлэн мөнгөний тооцоо',
      icon: CreditCard,
      category: 'Касс & Санхүү',
      targetTab: 'pos_settlement',
      summary: 'Хаан, Голомт POS төхөөрөмжийн багц хаах, QPay гүйлгээ тулгах, бэлэн мөнгө дэвсгэртээр тоолох.',
      steps: [
        {
          title: '1-р алхам: POS тооцоо (Цэс 7)',
          description: 'Банкны POS терминалын баримтын нийт дүн ба баримтын тоог бүртгэж багц хаалт хийнэ.',
        },
        {
          title: '2-р алхам: Банк ба QPay данс (Цэс 8)',
          description: 'QPay болон дансны шилжүүлгээр орсон орлогын баримтын дугаар, дүнг тулган баталгаажуулна.',
        },
        {
          title: '3-р алхам: Бэлэн мөнгө тоолох (Цэс 9)',
          description: 'Кассны шүүгээний бэлэн мөнгийг дэвсгэртээр нь (20,000₮, 10,000₮, 5,000₮ г.м) ширхэглэн оруулахад нийт тоолсон дүн автоматаар гарч зөрүү шалгагдана.',
        },
      ],
    },
    {
      id: 'shift_handover',
      number: 13,
      title: 'Ээлж хүлээлцэх (09:00 ба 20:30)',
      icon: ArrowLeftRight,
      category: 'Хүлээлцэлт',
      targetTab: 'handover',
      summary: 'Ээлж хүлээлцэх үйл явц, цагтаа ирсэн эсэх, хоцролтын минут тооцох, лангууны заалт ба лац хүлээлцэх.',
      steps: [
        {
          title: '1-р алхам: Хүлээлцэх цэс рүү орох',
          description: '"10. Ээлж хүлээлцэх" хуудаснаас тухайн өдрийн өглөөний (09:00) эсвэл оройн (20:30) ээлжийг сонгоно.',
        },
        {
          title: '2-р алхам: Хүлээлцсэн цаг бүртгэх',
          description: 'Хүлээлгэн өгсөн болон хүлээн авсан ажилтныг сонгож, бодит хүлээлцсэн цагийг оруулна. Цагаасаа хоцорсон бол хоцролтын минутыг систем өөрөө тооцно.',
        },
        {
          title: '3-р алхам: Шалгах хуудас (Checklist)',
          description: 'Лангууны заалт зөв эсэх, талбайн цэвэрлэгээ, галын аюулгүй байдал, лац ломбо шалгасан тухай тэмдэглээд хадгална.',
        },
      ],
    },
    {
      id: 'manager_handover',
      number: 14,
      title: 'Эрхлэгчид мөнгө хүлээлгэн өгөх акт',
      icon: ShieldCheck,
      category: 'Хүлээлцэлт',
      targetTab: 'manager_handover',
      summary: 'Түгээгч ээлжийн бүх бэлэн мөнгө, POS баримт, талоныг нэгтгэн эрхлэгчид албан ёсоор тушааж сейфэнд хийх.',
      steps: [
        {
          title: '1-р алхам: Тушаах акт үүсгэх',
          description: '"11. Эрхлэгчид мөнгө хүлээлгэх" цэс рүү орж "Шинэ акт үүсгэх" товч дарна.',
        },
        {
          title: '2-р алхам: Мөнгөн дүн баримтжуулах',
          description: 'Бэлнээр тушаасан мөнгө, POS баримтын дүн, талоны дүнг оруулж нийт дүн бодно.',
        },
        {
          title: '3-р алхам: Сейфийн дугтуйн дугаар',
          description: 'Сейфийн дугтуй / дугаар (жишээ: Сейф №1, Дугтуй #44)-ийг тэмдэглэнэ.',
        },
        {
          title: '4-р алхам: Эрхлэгч батлах',
          description: 'ШТС Эрхлэгч тооцоог тулгаж "Акт баталгаажуулах" товч дарснаар санхүүгийн албан ёсны баримт болно.',
        },
      ],
    },
    {
      id: 'payroll',
      number: 15,
      title: 'Цалин бодох ба Олголт бүртгэх',
      icon: Calculator,
      category: 'Касс & Санхүү',
      targetTab: 'payroll',
      summary: '18-ны cutoff өдрөөр цаг таслах, 25-ны урьдчилгаа, 10-ны үлдэгдэл цалин бодож олголт бүртгэх.',
      steps: [
        {
          title: '1-р алхам: 18-ны cutoff таслалт хийх',
          description: '"4. Цалингийн бүртгэл" цэс рүү орж 18-ны 18:00 цагт "Мөчлөг хаах" товч дарна. Хуучин цагийн бүртгэлүүд түгжигдэнэ.',
        },
        {
          title: '2-р алхам: Цалингийн автомат бодолт',
          description: 'Ажилтан бүрийн батлагдсан цаг, илүү цагийн коэффициент (1.5x), урамшуулал ба суутгалыг нэгтгэн бодно.',
        },
        {
          title: '3-р алхам: 25-ны урьдчилгаа олгох',
          description: '"Олголт бүртгэх" товчоор сарын 25-нд урьдчилгаа цалингийн гүйлгээг бүртгэнэ.',
        },
        {
          title: '4-р алхам: 10-ны эцсийн үлдэгдэл олгох',
          description: 'Дараа сарын 10-нд урьдчилгааг хассан үлдэгдэл цалинг шилжүүлж бүртгэлийг дуусгана.',
        },
      ],
    },
    {
      id: 'reports_export',
      number: 16,
      title: 'Тайлан харах, Экспортлох & Хэвлэх',
      icon: BarChart3,
      category: 'Тайлан & Нөөцлөлт',
      targetTab: 'reports',
      summary: 'Сар бүрийн борлуулалт, ажилтнуудын ачаалал тэгш хуваарилалт, Excel/PDF тайлан татах.',
      steps: [
        {
          title: '1-р алхам: Тайлан хуудас',
          description: '"12. Тайлан" цэс рүү орж сар, жилийг сонгоно.',
        },
        {
          title: '2-р алхам: Шатахуун ба тосны задаргаа',
          description: 'Шатахуун тус бүрийн нийт борлуулсан литр, нийт орлого, бэлэн/карт/дансны хувь хэмжээг график ба хүснэгтээр харна.',
        },
        {
          title: '3-р алхам: Хуваарь хэвлэх (Print)',
          description: 'Хуваарийн хуудаснаас "Хэвлэх" товч дарахад А4 цаасанд төгс тохирсон баталгаажуулах хүснэгт хэвлэгдэнэ.',
        },
      ],
    },
    {
      id: 'backup_restore',
      number: 17,
      title: 'Өгөгдөл экспортлох, импортлох, нөөцлөх',
      icon: Download,
      category: 'Тайлан & Нөөцлөлт',
      targetTab: 'settings',
      summary: 'Бүх ажилтан, хуваарь, борлуулалт, савны тохиргоог JSON файлд нөөцлөх ба буцаан сэргээх.',
      steps: [
        {
          title: '1-р алхам: Нөөц хуулбар татах (Export Backup)',
          description: '"14. Тохиргоо" хуудасны доод хэсэгт байрлах "Нөөц хуулбар татах (JSON)" товчийг дарж компьютертоо хадгална.',
        },
        {
          title: '2-р алхам: Компьютер солих эсвэл сэргээх',
          description: 'Хэрэв өөр төхөөрөмж дээр ашиглах бол нөөцөлсөн файлаа оруулж бүх өгөгдлөө алдагдалгүй сэргээнэ.',
        },
      ],
    },
  ];

  // Search filtering
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return guideSections;
    const q = searchQuery.toLowerCase();
    return guideSections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.category.toLowerCase().includes(q) ||
        sec.steps.some(
          (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        )
    );
  }, [searchQuery, guideSections]);

  const activeSection = guideSections.find((s) => s.id === selectedSectionId) || guideSections[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Гарын авлага & Системийн заавар
              </span>
              <span className="text-xs text-slate-400 font-medium">Нийт 17 бүлэг сэдэв</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              ШТС Удирдлагын Систем Ашиглах Нэгдсэн Заавар
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              ШТС-ийн үйл ажиллагааны бүх шат дамжлагыг алхам алхмаар, зураглал ба тайлбартайгаар зааварчилсан цахим гарын авлага
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Заавраас хайх (түлхүүр үг)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Цэвэрлэх
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Guide Layout (Sidebar Navigation + Content View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Topics List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Зааврын бүлгүүд ({filteredSections.length})</span>
            {searchQuery && <span className="text-blue-600">Шүүгдсэн</span>}
          </div>

          <div className="max-h-[700px] overflow-y-auto space-y-1 pr-1">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isSelected = sec.id === activeSection.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {sec.number}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs truncate">{sec.title}</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isSelected ? 'text-white translate-x-0.5' : 'text-slate-400'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] block truncate mt-0.5 ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {sec.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Section Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            {/* Header of Active Topic */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-2xs">
                  <activeSection.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                      Бүлэг {activeSection.number}
                    </span>
                    <span className="text-xs text-slate-400">{activeSection.category}</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-0.5">
                    {activeSection.title}
                  </h2>
                </div>
              </div>

              {activeSection.targetTab && onNavigateTab && (
                <button
                  onClick={() => onNavigateTab(activeSection.targetTab!)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors shrink-0"
                >
                  <span>Энэ модуль руу очих</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Summary */}
            <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{activeSection.summary}</span>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Алхам алхмаар заавар:
              </h3>

              <div className="space-y-3">
                {activeSection.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                      {step.description}
                    </p>
                    {step.tips && (
                      <div className="ml-7 mt-2 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Зөвлөмж:</strong> {step.tips}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            {activeSection.importantNotes && activeSection.importantNotes.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Анхаарах зүйлс:</span>
                </div>
                <ul className="list-disc list-inside pl-2 space-y-1 text-[11px] text-rose-700">
                  {activeSection.importantNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quick FAQ card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Түгээмэл асуултууд ба хариулт
              </h3>
            </div>

            <div className="divide-y divide-slate-100 text-xs space-y-2">
              <div className="pt-2">
                <span className="font-bold text-slate-900 block">
                  Асуулт: Админ нууц үг ямар байдаг вэ?
                </span>
                <span className="text-slate-600 block mt-0.5">
                  Хариулт: Анхдагч нууц үг нь <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-blue-700">admin123</code> бөгөөд "Тохиргоо" цэс эсвэл түгжээний цонхоор орж өөрчилж болно.
                </span>
              </div>
              <div className="pt-2">
                <span className="font-bold text-slate-900 block">
                  Асуулт: Интернэтгүй үед дата устдаг уу?
                </span>
                <span className="text-slate-600 block mt-0.5">
                  Хариулт: Үгүй, бүх өгөгдөл таны хөтчийн санах ойд (LocalStorage) хадгалагддаг тул хуудас дахин ачаалласан эсвэл сүлжээ тасарсан ч устдаггүй.
                </span>
              </div>
              <div className="pt-2">
                <span className="font-bold text-slate-900 block">
                  Асуулт: Хуучин ээлжийн шатахууны үнэ шинэ үнэ оруулснаар өөрчлөгдөх үү?
                </span>
                <span className="text-slate-600 block mt-0.5">
                  Хариулт: Үгүй, өмнөх ээлжүүдийн борлуулалтын үнэ snapshot байдлаар хадгалагддаг тул түүхэн тооцоолол хэзээ ч хөдлөхгүй найдвартай хамгаалагдсан.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
