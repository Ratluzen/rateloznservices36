import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Plus, Trash2, Edit2, Save, X, 
  Package, Layers, FileText, ShoppingBag,
  TrendingUp, Users, Search, Image as ImageIcon,
  CheckCircle, BarChart3, Wallet, Activity,
  AlertTriangle, DollarSign, Server, Clock,
  Gamepad2, Smartphone, Monitor, Wifi, Zap, Gift, 
  Music, Video, Book, Car, Coffee, Shirt, Watch, 
  Globe, ShoppingBasket, Headphones, Camera,
  Plane,
  Bell, Info, Star, ShoppingCart, ArrowUpRight, ArrowDownRight,
  PieChart, Calendar, CircleDollarSign, ClipboardList,
  PackageOpen,
  Facebook, Instagram, Twitter, Linkedin, Youtube, Twitch, 
  Code, Terminal, Database, Cloud, Bitcoin, Coins,
  Key, Lock, Wrench, Settings, Heart, Flame,
  Crown, Diamond, Medal, Trophy,
  Cpu, Mouse, Keyboard, Laptop, Tablet,
  Router, Mic,
  Ticket, Clapperboard, Palette,
  Dumbbell, Pizza, Bed, Home,
  GraduationCap, School,
  LogOut
} from 'lucide-react';
import { View, Product, Category, AppTerms, Banner, UserProfile, Announcement, Region, Denomination, Currency, Order, InventoryCode, CustomInputConfig, Transaction } from '../types';
import { INITIAL_CURRENCIES } from '../constants';

import { productService, contentService, inventoryService, orderService, userService } from '../services/api';

interface Props {
  setView: (view: View) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  terms: AppTerms;
  setTerms: React.Dispatch<React.SetStateAction<AppTerms>>;
  banners: Banner[];
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  currencies: Currency[];
  setCurrencies: React.Dispatch<React.SetStateAction<Currency[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  inventory: InventoryCode[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryCode[]>>;
  rateAppLink: string;
  setRateAppLink: React.Dispatch<React.SetStateAction<string>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  onLogout: () => void;
}

const AVAILABLE_ICONS = [
  { id: 'gamepad', icon: Gamepad2, label: 'ألعاب' },
  { id: 'shopping', icon: ShoppingBag, label: 'متجر' },
  { id: 'basket', icon: ShoppingBasket, label: 'سلة' },
  { id: 'gift', icon: Gift, label: 'هدايا' },
  { id: 'globe', icon: Globe, label: 'عالمي' },
  { id: 'phone', icon: Smartphone, label: 'هاتف' },
  { id: 'wifi', icon: Wifi, label: 'إنترنت' },
  { id: 'monitor', icon: Monitor, label: 'شاشة' },
  { id: 'laptop', icon: Laptop, label: 'لابتوب' },
  { id: 'tablet', icon: Tablet, label: 'تابلت' },
  { id: 'mouse', icon: Mouse, label: 'ماوس' },
  { id: 'keyboard', icon: Keyboard, label: 'كيبورد' },
  { id: 'cpu', icon: Cpu, label: 'معالج' },
  { id: 'router', icon: Router, label: 'راوتر' },
  { id: 'server', icon: Server, label: 'سيرفر' },
  { id: 'facebook', icon: Facebook, label: 'فيسبوك' },
  { id: 'instagram', icon: Instagram, label: 'انستقرام' },
  { id: 'twitter', icon: Twitter, label: 'تويتر' },
  { id: 'linkedin', icon: Linkedin, label: 'لينكد إن' },
  { id: 'youtube', icon: Youtube, label: 'يوتيوب' },
  { id: 'twitch', icon: Twitch, label: 'تويتش' },
  { id: 'video', icon: Video, label: 'فيديو' },
  { id: 'mic', icon: Mic, label: 'مايك' },
  { id: 'clapperboard', icon: Clapperboard, label: 'سينما' },
  { id: 'music', icon: Music, label: 'موسيقى' },
  { id: 'coffee', icon: Coffee, label: 'قهوة' },
  { id: 'pizza', icon: Pizza, label: 'طعام' },
  { id: 'shirt', icon: Shirt, label: 'ملابس' },
  { id: 'car', icon: Car, label: 'سيارة' },
  { id: 'plane', icon: Plane, label: 'طيران' },
  { id: 'home', icon: Home, label: 'منزل' },
  { id: 'bed', icon: Bed, label: 'فندق' },
  { id: 'dumbbell', icon: Dumbbell, label: 'رياضة' },
  { id: 'code', icon: Code, label: 'كود' },
  { id: 'terminal', icon: Terminal, label: 'طرفية' },
  { id: 'database', icon: Database, label: 'بيانات' },
  { id: 'cloud', icon: Cloud, label: 'سحابة' },
  { id: 'wrench', icon: Wrench, label: 'أدوات' },
  { id: 'settings', icon: Settings, label: 'إعدادات' },
  { id: 'lock', icon: Lock, label: 'قفل' },
  { id: 'key', icon: Key, label: 'مفتاح' },
  { id: 'bitcoin', icon: Bitcoin, label: 'بيتكوين' },
  { id: 'wallet', icon: Wallet, label: 'محفظة' },
  { id: 'coins', icon: Coins, label: 'عملات' },
  { id: 'dollar', icon: DollarSign, label: 'دولار' },
  { id: 'book', icon: Book, label: 'كتاب' },
  { id: 'school', icon: School, label: 'مدرسة' },
  { id: 'grad', icon: GraduationCap, label: 'تخرج' },
  { id: 'star', icon: Star, label: 'نجمة' },
  { id: 'heart', icon: Heart, label: 'قلب' },
  { id: 'flame', icon: Flame, label: 'نار' },
  { id: 'crown', icon: Crown, label: 'تاج' },
  { id: 'diamond', icon: Diamond, label: 'الماس' },
  { id: 'medal', icon: Medal, label: 'ميدالية' },
  { id: 'trophy', icon: Trophy, label: 'كأس' },
  { id: 'ticket', icon: Ticket, label: 'تذكرة' },
  { id: 'palette', icon: Palette, label: 'ألوان' },
];

const Admin: React.FC<Props> = ({ 
  setView, 
  products, setProducts, 
  categories, setCategories,
  terms, setTerms,
  banners, setBanners,
  users, setUsers,
  announcements, setAnnouncements,
  currencies, setCurrencies,
  orders, setOrders,
  inventory, setInventory,
  rateAppLink, setRateAppLink,
  transactions, setTransactions,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'products' | 'categories' | 'terms' | 'users' | 'banners' | 'announcements' | 'currencies' | 'settings'>('dashboard');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [fulfillmentOrder, setFulfillmentOrder] = useState<Order | null>(null);
  const [fulfillmentCode, setFulfillmentCode] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [cancellationOrder, setCancellationOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [termsLang, setTermsLang] = useState<'ar' | 'en'>('ar');
  const [showProductModal, setShowProductModal] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState<'basic' | 'details' | 'variants' | 'automation'>('basic');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState<Partial<Product>>({
    name: '', category: 'games', price: 0, tag: '', imageColor: 'from-gray-700 to-gray-900', imageUrl: '', description: '',
    regions: [], denominations: [], apiConfig: { type: 'manual' }, autoDeliverStock: false,
    customInput: { enabled: false, label: '', placeholder: '', required: false }
  });
  const [tempDenomLabel, setTempDenomLabel] = useState('');
  const [tempDenomPrice, setTempDenomPrice] = useState('');
  const [tempRegionName, setTempRegionName] = useState('');
  const [tempRegionFlag, setTempRegionFlag] = useState('');
  const [editingRegionCustomInput, setEditingRegionCustomInput] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState<{name: string, icon: any}>({ name: '', icon: Gamepad2 });
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null); 
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({ title: '', subtitle: '', desc: '', bg: 'from-blue-900 to-indigo-900', imageUrl: '' });
  const [searchUserId, setSearchUserId] = useState('');
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceMsg, setAnnounceMsg] = useState('');
  const [announceType, setAnnounceType] = useState<'offer' | 'alert' | 'info' | 'ad'>('info');
  const [openInvDropdown, setOpenInvDropdown] = useState<'product' | 'region' | 'denom' | null>(null);
  const [invSelectedProduct, setInvSelectedProduct] = useState<string>('');
  const [invSelectedRegion, setInvSelectedRegion] = useState<string>('');
  const [invSelectedDenom, setInvSelectedDenom] = useState<string>('');
  const [invNewCodes, setInvNewCodes] = useState<string>('');

  const analytics = useMemo(() => {
    const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0);
    const activeUsers = users.filter(u => u.status === 'active').length;
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
    }).reverse();

    const salesChart = last7Days.map(date => {
        const dateStr = date.toLocaleDateString('en-US');
        const dailyOrders = orders.filter(o => o.status === 'completed' && o.date.startsWith(dateStr));
        const dailyValue = dailyOrders.reduce((sum, o) => sum + o.amount, 0);
        return {
            day: date.toLocaleDateString('ar-EG', { weekday: 'short' }),
            fullDate: dateStr,
            value: dailyValue
        };
    });

    const maxChartValue = Math.max(...salesChart.map(d => d.value), 10);
    const categoryStats = categories.map(cat => {
        const count = products.filter(p => cat.id === 'all' ? true : p.category === cat.id).length;
        const total = products.length;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return { ...cat, count, percentage };
    }).filter(c => c.id !== 'all');

    return { totalRevenue, totalOrders: orders.length, totalUsers: users.length, totalProducts: products.length, activeUsers, salesChart, maxChartValue, categoryStats };
  }, [orders, users, products, categories]);

  const recentOrders = orders.slice(0, 5).map(o => ({
      id: o.id, user: o.userName, item: o.productName, price: `$${o.amount}`, status: o.status, time: o.date.split(',')[1]
  }));
  const adminFormatPrice = (price: number) => `$ ${price.toFixed(2)}`;
  const filteredOrders = orders.filter(o => {
      const matchesStatus = orderFilter === 'all' || o.status === orderFilter;
      const query = orderSearchQuery.toLowerCase();
      const matchesSearch = o.id.toLowerCase().includes(query) || (o.userName || '').toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
  });

  const handleCompleteOrder = async () => {
      if (!fulfillmentOrder) return;
      if (!fulfillmentCode.trim()) { alert('يرجى إدخال الكود'); return; }

      try {
          const res = await orderService.updateStatus(fulfillmentOrder.id, {
              status: 'completed',
              deliveredCode: fulfillmentCode
          });
          setOrders(prev => prev.map(o => o.id === fulfillmentOrder.id ? { ...o, status: 'completed', deliveredCode: fulfillmentCode, fulfillmentType: 'manual' } : o));
          setFulfillmentOrder(null);
          setFulfillmentCode('');
          alert('تم تنفيذ الطلب بنجاح');
      } catch (error) {
          alert('فشل تنفيذ الطلب');
      }
  };

  const handleConfirmCancel = async () => {
      if (!cancellationOrder) return;
      try {
          await orderService.updateStatus(cancellationOrder.id, {
              status: 'cancelled',
              rejectionReason: cancellationReason
          });
          setOrders(prev => prev.map(o => o.id === cancellationOrder.id ? { ...o, status: 'cancelled', rejectionReason: cancellationReason } : o));
          setCancellationOrder(null);
          setCancellationReason('');
          alert('تم إلغاء الطلب واسترداد المبلغ');
      } catch (error) {
          alert('فشل إلغاء الطلب');
      }
  };

  const handleSaveProduct = async () => {
    if (!prodForm.name || !prodForm.price) return;
    try {
        let savedProduct: Product;
        const payload = { ...prodForm };
        if (editingProduct) {
            const res = await productService.update(editingProduct.id, payload);
            savedProduct = res.data;
            savedProduct.regions = typeof savedProduct.regions === 'string' ? JSON.parse(savedProduct.regions) : savedProduct.regions;
            savedProduct.denominations = typeof savedProduct.denominations === 'string' ? JSON.parse(savedProduct.denominations) : savedProduct.denominations;
            savedProduct.apiConfig = typeof savedProduct.apiConfig === 'string' ? JSON.parse(savedProduct.apiConfig) : savedProduct.apiConfig;
            savedProduct.customInput = typeof savedProduct.customInput === 'string' ? JSON.parse(savedProduct.customInput) : savedProduct.customInput;
            setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
            const res = await productService.create(payload);
            savedProduct = res.data;
            savedProduct.regions = typeof savedProduct.regions === 'string' ? JSON.parse(savedProduct.regions) : savedProduct.regions;
            setProducts(prev => [savedProduct, ...prev]);
        }
        setShowProductModal(false);
        setEditingProduct(null);
        setActiveProductTab('basic');
        setProdForm({ name: '', category: 'games', price: 0, tag: '', imageColor: 'from-gray-700 to-gray-900', imageUrl: '', description: '', regions: [], denominations: [], apiConfig: { type: 'manual' }, autoDeliverStock: false, customInput: { enabled: false, label: '', placeholder: '', required: false } });
        alert('تم حفظ المنتج بنجاح');
    } catch (error: any) {
        alert(error.response?.data?.message || 'خطأ في حفظ المنتج');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف المنتج؟')) return;
    try {
        await productService.delete(id);
        setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) { alert('فشل الحذف'); }
  };

  const handleAddInventory = async () => {
      if (!invSelectedProduct || !invNewCodes.trim()) { alert('يرجى اختيار المنتج وكتابة الأكواد'); return; }
      const codesArray = invNewCodes.split('\n').filter(code => code.trim() !== '');
      const items = codesArray.map(code => ({
          productId: invSelectedProduct,
          regionId: invSelectedRegion || undefined,
          denominationId: invSelectedDenom || undefined,
          code: code.trim()
      }));
      try {
          const res = await inventoryService.add(items);
          alert(res.data.message);
          const invRes = await inventoryService.getAll();
          setInventory(invRes.data);
          setInvNewCodes('');
      } catch (error) { alert('فشل إضافة المخزون'); }
  };

  const handleDeleteInventory = async (id: string) => {
      try {
          await inventoryService.delete(id);
          setInventory(prev => prev.filter(i => i.id !== id));
      } catch (e) { alert('فشل الحذف'); }
  };

  const handleSaveCategory = async () => {
    if (!catForm.name) return;
    try {
        if (editingCategory) {
            alert("تعديل الفئات غير مدعوم حالياً في الـ API");
        } else {
            const res = await contentService.createCategory({ name: catForm.name, icon: 'Gamepad2' }); 
            const newCat = { ...res.data, icon: catForm.icon };
            setCategories(prev => [...prev, newCat]);
        }
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCatForm({ name: '', icon: Gamepad2 });
    } catch(e) { alert('خطأ'); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (id === 'all') return;
    try {
        await contentService.deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
    } catch(e) { alert('خطأ'); }
  };

  const handleSaveBanner = async () => {
      try {
          const payload = {
              title: bannerForm.title,
              subtitle: bannerForm.subtitle,
              desc: bannerForm.desc,
              bg: bannerForm.bg,
              imageUrl: bannerForm.imageUrl
          };
          if (editingBanner) {
          } else {
              const res = await contentService.createBanner(payload);
              setBanners(prev => [...prev, res.data]);
          }
          setShowBannerModal(false);
          setEditingBanner(null);
          setBannerForm({ title: '', subtitle: '', desc: '', bg: 'from-blue-900 to-indigo-900', imageUrl: '' });
      } catch(e) { alert('خطأ'); }
  };

  const handleDeleteBanner = async (id: number) => {
      try {
          await contentService.deleteBanner(id);
          setBanners(prev => prev.filter(b => b.id !== id));
      } catch(e) { alert('خطأ'); }
  };

  const handleSendAnnouncement = async () => {
      try {
          const payload = { title: announceTitle, message: announceMsg, type: announceType };
          if (editingAnnouncement) {
          } else {
              const res = await contentService.createAnnouncement(payload);
              setAnnouncements(prev => [res.data, ...prev]);
          }
          setShowAnnouncementModal(false);
          setEditingAnnouncement(null);
          setAnnounceMsg('');
          setAnnounceTitle('');
          alert('تم الإرسال');
      } catch(e) { alert('خطأ'); }
  };

  const handleDeleteAnnouncement = async (id: string) => {
      try {
          await contentService.deleteAnnouncement(id);
          setAnnouncements(prev => prev.filter(a => a.id !== id));
      } catch(e) { alert('خطأ'); }
  };

  const handleUpdateBalance = async (type: 'add' | 'deduct') => {
    if (!foundUser) return;
    const val = parseFloat(amountToAdd);
    if (isNaN(val) || val <= 0) return;
    try {
        const res = await userService.updateBalance(foundUser.id, val, type);
        setUsers(prev => prev.map(u => u.id === foundUser.id ? { ...u, balance: res.data.balance } : u));
        setFoundUser({ ...foundUser, balance: res.data.balance });
        setAmountToAdd('');
        alert('تم تحديث الرصيد');
    } catch(e) { alert('فشل التحديث'); }
  };

  const handleBanUser = async () => {
      if (!foundUser) return;
      try {
          const res = await userService.updateStatus(foundUser.id);
          setUsers(prev => prev.map(u => u.id === foundUser.id ? { ...u, status: res.data.status } : u));
          setFoundUser({ ...foundUser, status: res.data.status });
          alert('تم تغيير الحالة');
      } catch(e) { alert('فشل'); }
  };

  const toggleRegion = (region: Region) => {
      const currentRegions = prodForm.regions || [];
      const exists = currentRegions.find(r => r.id === region.id);
      if (exists) {
          setProdForm({ ...prodForm, regions: currentRegions.filter(r => r.id !== region.id) });
      } else {
          setProdForm({ ...prodForm, regions: [...currentRegions, { ...region }] });
      }
  };
  const addCustomRegion = () => {
    if (!tempRegionName) return;
    const newRegion: Region = { id: `custom-${Date.now()}`, name: tempRegionName, flag: tempRegionFlag || '🌐' };
    setProdForm({ ...prodForm, regions: [...(prodForm.regions || []), newRegion] });
    setTempRegionName(''); setTempRegionFlag('');
  };
  const removeRegion = (id: string) => setProdForm({ ...prodForm, regions: (prodForm.regions || []).filter(r => r.id !== id) });
  const updateRegionCustomInput = (regionId: string, inputConfig: CustomInputConfig) => {
      setProdForm(prev => ({ ...prev, regions: prev.regions?.map(r => r.id === regionId ? { ...r, customInput: inputConfig } : r) }));
  };
  const addDenomination = () => {
      if (!tempDenomLabel || !tempDenomPrice) return;
      const newDenom: Denomination = { id: Date.now().toString(), label: tempDenomLabel, price: parseFloat(tempDenomPrice) };
      setProdForm({ ...prodForm, denominations: [...(prodForm.denominations || []), newDenom] });
      setTempDenomLabel(''); setTempDenomPrice('');
  };
  const removeDenomination = (id: string) => setProdForm({ ...prodForm, denominations: (prodForm.denominations || []).filter(d => d.id !== id) });
  const selectedProductObj = products.find(p => p.id === invSelectedProduct);
  const getFilteredInventory = () => inventory.filter(i => {
      if (!invSelectedProduct) return true;
      return i.productId === invSelectedProduct && (!invSelectedRegion || i.regionId === invSelectedRegion) && (!invSelectedDenom || i.denominationId === invSelectedDenom);
  });
  const handleOpenFulfillment = (order: Order) => { setFulfillmentOrder(order); setFulfillmentCode(''); };
  const handleInitiateCancel = (order: Order) => { setCancellationOrder(order); setCancellationReason(''); };
  const handleEditBanner = (banner: Banner) => { setEditingBanner(banner); setBannerForm({ ...banner }); setShowBannerModal(true); };
  const handleSearchUser = () => { const user = users.find(u => u.id === searchUserId || u.email === searchUserId); if(user) setFoundUser(user); else alert('غير موجود'); };
  const handleClearSearch = () => { setFoundUser(null); setSearchUserId(''); setAmountToAdd(''); };
  const handleEditAnnouncement = (ann: Announcement) => { setEditingAnnouncement(ann); setAnnounceTitle(ann.title); setAnnounceMsg(ann.message); setAnnounceType(ann.type); setShowAnnouncementModal(true); };
  const handleUpdateRate = (code: string, newRate: string) => {
      const rate = parseFloat(newRate);
      if (isNaN(rate) || rate <= 0) return;
      setCurrencies(prev => prev.map(c => c.code === code ? { ...c, rate: rate } : c));
  };
  const handleResetCurrencies = () => {
      if (confirm('هل أنت متأكد من استعادة الأسعار الافتراضية؟')) setCurrencies(INITIAL_CURRENCIES);
  };

  return (
    <div className="min-h-screen bg-[#13141f] pb-24 text-white">
      <div className="p-4 bg-[#1f212e] shadow-md flex items-center justify-between sticky top-0 z-40 border-b border-gray-800">
        <button onClick={() => setView(View.PROFILE)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><span className="text-yellow-400">لوحة القيادة</span></h1>
        <button onClick={onLogout} className="flex items-center gap-1 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg border border-red-500/20 text-xs font-bold hover:bg-red-500 hover:text-white transition-colors"><LogOut size={14} /> خروج</button>
      </div>

      <div className="flex overflow-x-auto p-4 gap-2 no-scrollbar border-b border-gray-800 bg-[#13141f]">
        {[ { id: 'dashboard', label: 'الرئيسية', icon: Activity }, { id: 'orders', label: 'الطلبات', icon: ClipboardList }, { id: 'inventory', label: 'المخزون', icon: PackageOpen }, { id: 'products', label: 'المنتجات', icon: ShoppingBag }, { id: 'users', label: 'المستخدمين', icon: Users }, { id: 'categories', label: 'الفئات', icon: Layers }, { id: 'announcements', label: 'الإشعارات', icon: Bell }, { id: 'banners', label: 'البانرات', icon: ImageIcon }, { id: 'currencies', label: 'العملات', icon: CircleDollarSign }, { id: 'terms', label: 'الشروط', icon: FileText }, { id: 'settings', label: 'الإعدادات العامة', icon: Settings } ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap font-bold transition-all ${activeTab === tab.id ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-[#242636] text-gray-400 hover:bg-[#2f3245]'}`}><tab.icon size={18} />{tab.label}</button>
        ))}
      </div>

      <div className="p-4 animate-fadeIn">
        {activeTab === 'dashboard' && (
            <div className="text-center text-gray-500 py-10">
               <p>الإحصائيات متصلة بالخادم الآن</p>
               <div className="grid grid-cols-2 gap-3 mt-4">
                   <div className="bg-[#242636] p-4 rounded-xl"><p className="text-gray-400 text-xs">المنتجات</p><p className="text-2xl font-bold text-white">{products.length}</p></div>
                   <div className="bg-[#242636] p-4 rounded-xl"><p className="text-gray-400 text-xs">الطلبات</p><p className="text-2xl font-bold text-white">{orders.length}</p></div>
               </div>
            </div>
        )}
        
        {activeTab === 'products' && (
          <div className="space-y-4">
             <button onClick={() => { setEditingProduct(null); setProdForm({}); setShowProductModal(true); }} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-yellow-400/20 transition-all"><Plus size={20} /> إضافة منتج جديد</button>
             <div className="space-y-3">
               {products.map(p => (
                 <div key={p.id} className="bg-[#242636] p-3 rounded-xl flex items-center gap-3 border border-gray-700 hover:border-gray-500 transition-colors relative">
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${p.imageColor} flex-shrink-0 relative overflow-hidden`}>{p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />}</div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start"><h4 className="font-bold text-sm text-white">{p.name}</h4><span className="text-xs font-mono font-bold text-yellow-400">${p.price}</span></div>
                        <p className="text-[10px] text-gray-400">{p.category}</p>
                    </div>
                    <div className="flex flex-col gap-2 pl-2">
                      <button type="button" onClick={() => { setEditingProduct(p); setProdForm(p); setShowProductModal(true); }} className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/20"><Edit2 size={16} /></button>
                      <button type="button" onClick={() => handleDeleteProduct(p.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"><Trash2 size={16} /></button>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'orders' && (
            <div className="space-y-4">
                <div className="space-y-3">
                  {filteredOrders.map(order => (
                      <div key={order.id} className="bg-[#242636] p-4 rounded-xl border border-gray-700 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                              <div><h4 className="text-sm font-bold text-white">{order.productName}</h4><p className="text-xs text-gray-400">{order.userName}</p></div>
                              <div className="text-right"><span className="text-sm font-black text-yellow-400 dir-ltr">${order.amount}</span><p className="text-[10px] text-gray-500">{order.status}</p></div>
                          </div>
                          {order.status === 'pending' && <div className="flex gap-2 pt-3 border-t border-gray-700/50"><button onClick={() => handleOpenFulfillment(order)} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold">تنفيذ</button><button onClick={() => handleInitiateCancel(order)} className="px-4 bg-red-500/10 text-red-500 py-2 rounded-lg text-xs font-bold">إلغاء</button></div>}
                          {order.status === 'completed' && order.deliveredCode && <div className="mt-3 bg-[#13141f] p-3 rounded-lg border border-dashed border-gray-700 font-mono text-xs text-white">{order.deliveredCode}</div>}
                      </div>
                  ))}
                </div>
            </div>
        )}
      </div>

      {showProductModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
           <div className="bg-[#1f212e] w-full max-w-lg rounded-2xl border border-gray-700 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-[#242636]">
                 <h2 className="text-xl font-bold text-white">{editingProduct ? 'تعديل منتج' : 'إضافة منتج'}</h2>
                 <button onClick={() => setShowProductModal(false)} className="bg-[#1f212e] p-2 rounded-full text-gray-400"><X size={20}/></button>
              </div>
              <div className="flex bg-[#13141f] border-b border-gray-800 p-2 gap-1 overflow-x-auto no-scrollbar">
                  <button onClick={() => setActiveProductTab('basic')} className={`flex-1 py-2 rounded ${activeProductTab==='basic'?'bg-yellow-400 text-black':'text-gray-400'}`}>الأساسية</button>
                  <button onClick={() => setActiveProductTab('variants')} className={`flex-1 py-2 rounded ${activeProductTab==='variants'?'bg-yellow-400 text-black':'text-gray-400'}`}>الخيارات</button>
                  <button onClick={() => setActiveProductTab('automation')} className={`flex-1 py-2 rounded ${activeProductTab==='automation'?'bg-yellow-400 text-black':'text-gray-400'}`}>الأتمتة</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#1f212e]">
                 {activeProductTab === 'basic' && (
                     <div className="space-y-4">
                        <input className="w-full bg-[#13141f] p-3 rounded-xl border border-gray-700 text-white" placeholder="اسم المنتج" value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} />
                        <input type="number" className="w-full bg-[#13141f] p-3 rounded-xl border border-gray-700 text-white" placeholder="السعر" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: parseFloat(e.target.value)})} />
                        <div className="bg-[#242636] p-4 rounded-xl border border-gray-700">
                            <label className="flex items-center gap-2 text-white text-sm"><input type="checkbox" checked={prodForm.customInput?.enabled} onChange={e => setProdForm({...prodForm, customInput: { ...prodForm.customInput!, enabled: e.target.checked }})} /> تفعيل حقل مخصص</label>
                            {prodForm.customInput?.enabled && <input className="w-full bg-[#13141f] p-2 mt-2 rounded border border-gray-600 text-white text-xs" placeholder="عنوان الحقل (مثال: ID)" value={prodForm.customInput.label} onChange={e => setProdForm({...prodForm, customInput: {...prodForm.customInput!, label: e.target.value}})} />}
                        </div>
                     </div>
                 )}
                 {activeProductTab === 'automation' && (
                     <div className="space-y-4">
                        <label className="flex items-center gap-2 text-white text-sm"><input type="checkbox" checked={prodForm.autoDeliverStock} onChange={e => setProdForm({...prodForm, autoDeliverStock: e.target.checked})} /> تفعيل التسليم التلقائي (من المخزون)</label>
                        <div className="flex gap-2">
                            <button onClick={() => setProdForm({...prodForm, apiConfig: { ...prodForm.apiConfig, type: 'manual' }})} className={`flex-1 py-2 rounded border ${prodForm.apiConfig?.type === 'manual' ? 'bg-blue-600 border-blue-600' : 'border-gray-600'}`}>يدوي</button>
                            <button onClick={() => setProdForm({...prodForm, apiConfig: { ...prodForm.apiConfig, type: 'api' }})} className={`flex-1 py-2 rounded border ${prodForm.apiConfig?.type === 'api' ? 'bg-purple-600 border-purple-600' : 'border-gray-600'}`}>API</button>
                        </div>
                     </div>
                 )}
              </div>
              <div className="p-4 border-t border-gray-800 bg-[#242636]">
                  <button onClick={handleSaveProduct} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3.5 rounded-xl font-bold">حفظ المنتج</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Admin;