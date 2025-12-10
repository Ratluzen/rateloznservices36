
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, Product, Category, AppTerms, Banner, UserProfile, Announcement, CartItem, Currency, Order, InventoryCode, Transaction } from './types';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import BottomNav from './components/BottomNav';
import TopHeader from './components/TopHeader';
import CheckoutModal from './components/CheckoutModal';
import ProductDetailsModal from './components/ProductDetailsModal';
import InvoiceModal from './components/InvoiceModal';
import LoginModal from './components/LoginModal';
import { ShoppingBag, ShieldAlert, ArrowLeft } from 'lucide-react';
import { INITIAL_CURRENCIES, INITIAL_TERMS, INITIAL_BANNERS, INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_TRANSACTIONS } from './constants';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { authService, productService, orderService, contentService, userService, inventoryService, paymentService } from './services/api';

// --- Helper for Persistence ---
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    const parsed = JSON.parse(stored);
    
    // Validate that parsed data is not null/undefined
    if (parsed === null || parsed === undefined) {
      console.warn(`Invalid data in ${key}, using default`);
      return defaultValue;
    }
    
    // If default is array, ensure parsed is also array
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      console.warn(`Expected array for ${key}, got ${typeof parsed}, using default`);
      return defaultValue;
    }
    
    return parsed;
  } catch (error) {
    console.error(`Error loading ${key} from storage`, error);
    // Clear corrupted data
    localStorage.removeItem(key);
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any) => {
  try {
    // Don't save null or undefined
    if (value === null || value === undefined) {
      console.warn(`Attempted to save null/undefined to ${key}, skipping`);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage`, error);
    // If quota exceeded, clear old data
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, clearing old data');
      localStorage.clear();
    }
  }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  const [isSecurityBlocked, setIsSecurityBlocked] = useState(false);
  const [securityMessage, setSecurityMessage] = useState('');
  
  // --- Data State (Initialized from Local Storage for Instant Load) ---
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('app_products', INITIAL_PRODUCTS));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage('app_categories', INITIAL_CATEGORIES));
  const [terms, setTerms] = useState<AppTerms>(INITIAL_TERMS); 
  const [banners, setBanners] = useState<Banner[]>(() => loadFromStorage('app_banners', INITIAL_BANNERS));
  const [users, setUsers] = useState<UserProfile[]>(() => loadFromStorage('admin_users', []));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadFromStorage('app_announcements', []));
  const [currencies, setCurrencies] = useState<Currency[]>(INITIAL_CURRENCIES);
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('user_orders', []));
  const [inventory, setInventory] = useState<InventoryCode[]>(() => loadFromStorage('admin_inventory', []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage('user_transactions', INITIAL_TRANSACTIONS)); 
  const [rateAppLink, setRateAppLink] = useState<string>(''); 
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => loadFromStorage('user_cart', []));
  const [activeCheckoutItem, setActiveCheckoutItem] = useState<CartItem | null>(null);
  const [isBulkCheckout, setIsBulkCheckout] = useState(false); 
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => loadFromStorage('current_user', null)); 
  const [showLoginModal, setShowLoginModal] = useState(false);

  // --- Admin State ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => localStorage.getItem('ratelozn_admin_auth') === 'true');

  // --- AUTOMATIC PERSISTENCE ---
  useEffect(() => { saveToStorage('app_products', products); }, [products]);
  useEffect(() => { saveToStorage('app_categories', categories); }, [categories]);
  useEffect(() => { saveToStorage('app_banners', banners); }, [banners]);
  useEffect(() => { saveToStorage('app_announcements', announcements); }, [announcements]);
  useEffect(() => { saveToStorage('admin_users', users); }, [users]);
  useEffect(() => { saveToStorage('user_orders', orders); }, [orders]);
  useEffect(() => { saveToStorage('admin_inventory', inventory); }, [inventory]);
  useEffect(() => { saveToStorage('user_cart', cartItems); }, [cartItems]);
  useEffect(() => { saveToStorage('user_transactions', transactions); }, [transactions]);
  useEffect(() => { if(currentUser) saveToStorage('current_user', currentUser); }, [currentUser]);

  // --- Initialization & Resume Logic ---
  useEffect(() => {
    // 1. Initial Fetch on Mount
    fetchInitialData();
    checkAuthStatus();

    // 2. Re-fetch when app comes to foreground (Resume from background)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('App resumed - checking for updates...');
        fetchInitialData();
        checkAuthStatus();
      }
    };

    // 3. Re-fetch immediately when internet connection is restored
    const handleOnline = () => {
        console.log('Internet restored - syncing data...');
        fetchInitialData();
        checkAuthStatus();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const checkAuthStatus = async () => {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              setCurrentUser(null);
              return;
          }
          
          const res = await authService.getProfile();
          const user = res.data;
          const userData: UserProfile = {
              id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              balance: user.balance,
              joinedDate: '',
              status: user.status === 'banned' ? 'banned' : 'active'
          };
          setCurrentUser(userData);
          if(user.status !== 'banned') fetchUserOrders();
      } catch (error) {
          console.log("Auth check failed (Offline or Token Expired) - Keeping cached user data");
          // If token is invalid, clear it
          if (error instanceof Error && error.message.includes('401')) {
              localStorage.removeItem('token');
              localStorage.removeItem('current_user');
              setCurrentUser(null);
          }
      }
  };

  const fetchInitialData = async () => {
      try {
          // Parallel Fetching for speed
          const [prodsRes, catsRes, bansRes, annsRes] = await Promise.all([
              productService.getAll(),
              contentService.getCategories(),
              contentService.getBanners(),
              contentService.getAnnouncements()
          ]);

          const parsedProducts = prodsRes.data.map((p: any) => ({
             ...p,
             regions: typeof p.regions === 'string' ? JSON.parse(p.regions) : p.regions,
             denominations: typeof p.denominations === 'string' ? JSON.parse(p.denominations) : p.denominations,
             apiConfig: typeof p.apiConfig === 'string' ? JSON.parse(p.apiConfig) : p.apiConfig,
             customInput: typeof p.customInput === 'string' ? JSON.parse(p.customInput) : p.customInput,
          }));

          // Only update if we got data back
          if (parsedProducts.length > 0) setProducts(parsedProducts);
          
          const mappedCats = catsRes.data.map((c: any) => ({
             ...c,
             icon: ShoppingBag // Default icon if not mapped, or enhance mapping logic later
          }));
          
          if (mappedCats.length > 0) setCategories(mappedCats);
          if (bansRes.data.length > 0) setBanners(bansRes.data);
          if (annsRes.data.length > 0) setAnnouncements(annsRes.data);

      } catch (error) {
          console.log("Network error - showing cached data", error);
      }
  };

  const fetchUserOrders = async () => {
      try {
          const res = await orderService.getMyOrders();
          const mappedOrders = res.data.map((o: any) => ({
             ...o,
             date: new Date(o.createdAt).toLocaleString('en-US')
          }));
          setOrders(mappedOrders);
      } catch (e) { console.log("Could not fetch orders (Offline) - Keeping cached orders"); }
  };

  // --- Security Check (Android Only) ---
  useEffect(() => {
    const checkSecurity = async () => {
      if (Capacitor.getPlatform() === 'android') {
        try {
          const uriResult = await Filesystem.getUri({ directory: Directory.Data, path: '' });
          const path = uriResult.uri;
          const suspicious = ['999', 'parallel', 'virtual', 'dual', 'clone'];
          const isStandardUser = path.includes('/user/0/') || path.includes('/data/data/com.ratelozn.services');
          
          if (suspicious.some(k => path.toLowerCase().includes(k)) || (!isStandardUser && !path.includes('localhost'))) {
             setIsSecurityBlocked(true);
             setSecurityMessage('تم اكتشاف تشغيل التطبيق في بيئة غير آمنة (ناسخ تطبيقات).');
          }
        } catch (error) { console.error("Security Check Failed:", error); }
      }
    };
    checkSecurity();
  }, []);

  const balanceUSD = currentUser ? currentUser.balance : 0.00;

  // --- Handlers ---
  const handleLogin = async (data: { name?: string; email?: string; phone?: string; password?: string; isRegister: boolean }) => {
    try {
        let res;
        if (data.isRegister) {
            res = await authService.register(data);
            alert('تم إنشاء الحساب بنجاح!');
        } else {
            res = await authService.login(data);
        }
        localStorage.setItem('token', res.data.token);
        checkAuthStatus();
        setShowLoginModal(false);
    } catch (error: any) {
        alert(error.response?.data?.message || 'خطأ في تسجيل الدخول / الاتصال بالسيرفر');
    }
  };

  const handleSetView = (view: View) => {
    if (!currentUser && [View.WALLET, View.ORDERS, View.PROFILE, View.CART].includes(view)) {
        setShowLoginModal(true);
        return;
    }
    if (view === View.ADMIN && isAdminLoggedIn) loadAdminData();
    setCurrentView(view);
  };

  const loadAdminData = async () => {
      try {
          const [usersRes, ordersRes, invRes] = await Promise.all([
              userService.getAll(),
              orderService.getAll(),
              inventoryService.getAll()
          ]);
          
          const mappedUsers = usersRes.data.map((u:any) => ({
              id: u.id, name: u.name, email: u.email, phone: u.phone, balance: u.balance, status: u.status, joinedDate: new Date(u.createdAt).toLocaleDateString(), ip: u.ip
          }));
          setUsers(mappedUsers);

          setOrders(ordersRes.data.map((o:any) => ({
              ...o, date: new Date(o.createdAt).toLocaleString('en-US')
          })));
          
          setInventory(invRes.data);

      } catch (e) { console.error("Admin Load Error", e); }
  };

  const formatPrice = (amountInUSD: number): string => {
    const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
    return `${currency.symbol} ${(amountInUSD * currency.rate).toFixed(2)}`;
  };

  const handlePurchase = async (
      itemName: string, price: number, fulfillmentType: 'manual' | 'api' = 'manual',
      regionName?: string, quantityLabel?: string, category?: string, productId?: string, 
      regionId?: string, denominationId?: string, customInputValue?: string, 
      customInputLabel?: string, paymentMethod: 'wallet' | 'card' = 'wallet'
  ) => {
      if (!currentUser) { setShowLoginModal(true); return; }

      if (paymentMethod === 'card') {
          try {
              const payRes = await paymentService.charge({
                  amount: price,
                  cardLast4: '4242', 
                  cardHolder: currentUser.name
              });
              if (!payRes.data.success) throw new Error('Payment Failed');
          } catch (e) {
              alert('فشلت عملية الدفع، يرجى المحاولة لاحقاً');
              return;
          }
      }

      try {
          const res = await orderService.create({
              productId, productName: itemName, productCategory: category, price,
              regionId, regionName, denominationId, quantityLabel,
              customInputValue, customInputLabel
          });
          
          checkAuthStatus(); // Refresh balance from server
          
          const newOrder = { ...res.data, date: new Date().toLocaleString('en-US') };
          const updatedOrders = [newOrder, ...orders];
          setOrders(updatedOrders); 
          
          if(res.data.status === 'completed') alert('تم الشراء وتسليم الكود بنجاح! ✅');
          else alert('تم استلام طلبك وهو قيد التنفيذ ⏳');

      } catch (error: any) {
          alert(error.response?.data?.message || 'فشلت العملية، تحقق من الاتصال');
      }
  };

  const addToCart = (item: CartItem) => {
    if (!currentUser) { setShowLoginModal(true); return; }
    setCartItems(prev => [...prev, item]);
  };

  const handleCheckoutSuccess = async (method: 'wallet' | 'card') => {
      if (isBulkCheckout) {
          for (const item of cartItems) {
               await handlePurchase(
                  item.name, item.price, item.apiConfig?.type || 'manual', item.selectedRegion?.name,
                  item.selectedDenomination?.label, item.category, item.productId, item.selectedRegion?.id,
                  item.selectedDenomination?.id, item.customInputValue, item.customInputLabel, method
              );
          }
          alert('تم شراء العناصر بنجاح!');
          setCartItems([]);
          setIsBulkCheckout(false);
      } else if (activeCheckoutItem) {
          await handlePurchase(
              activeCheckoutItem.name, activeCheckoutItem.price, activeCheckoutItem.apiConfig?.type || 'manual',
              activeCheckoutItem.selectedRegion?.name, activeCheckoutItem.selectedDenomination?.label,
              activeCheckoutItem.category, activeCheckoutItem.productId, activeCheckoutItem.selectedRegion?.id,
              activeCheckoutItem.selectedDenomination?.id, activeCheckoutItem.customInputValue, activeCheckoutItem.customInputLabel, method
          );
          setActiveCheckoutItem(null);
      }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  
  const handleUserLogout = () => { 
      localStorage.removeItem('token'); 
      localStorage.removeItem('current_user'); 
      localStorage.removeItem('user_orders'); 
      localStorage.removeItem('user_cart');
      setCurrentUser(null); 
      setCartItems([]); 
      setOrders([]); 
      setCurrentView(View.HOME); 
  };
  
  const handleUpdateProfile = async (u: UserProfile) => { 
      try {
          const res = await authService.updateProfile(u);
          const updatedUser: UserProfile = {
              ...currentUser!, 
              name: res.data.name,
              email: res.data.email,
              phone: res.data.phone
          };
          setCurrentUser(updatedUser);
          if (res.data.token) {
              localStorage.setItem('token', res.data.token);
          }
      } catch (error: any) {
          console.error("Update failed", error);
          alert(error.response?.data?.message || 'فشل تحديث البيانات، يرجى التحقق من الاتصال');
      }
  };
  

  const handleAdminLogout = () => { setIsAdminLoggedIn(false); localStorage.removeItem('ratelozn_admin_auth'); setCurrentView(View.HOME); };

  if (isSecurityBlocked) return <div className="h-screen bg-black text-white flex items-center justify-center p-10 text-center"><ShieldAlert size={50} className="mb-4 text-red-500"/>{securityMessage}</div>;

  return (
    <div className="flex justify-center absolute inset-0 bg-[#000000] overflow-hidden">
      <div className="w-full h-full bg-[#13141f] text-white font-cairo sm:max-w-[430px] sm:h-[900px] sm:my-auto sm:rounded-[3rem] sm:border-[8px] sm:border-[#2d2d2d] shadow-2xl relative overflow-hidden ring-1 ring-white/10 flex flex-col">
        {currentView !== View.ADMIN && (
          <TopHeader 
            setView={handleSetView} 
            formattedBalance={formatPrice(balanceUSD)} 
            cartItemCount={cartItems.length}
            isLoggedIn={!!currentUser}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}
        <div key={currentView} className={`flex-1 overflow-y-auto no-scrollbar scroll-smooth ${currentView !== View.ADMIN ? 'pb-24 pt-14' : ''}`}>
          {currentView === View.HOME && <Home setView={handleSetView} formatPrice={formatPrice} products={products} categories={categories} banners={banners} announcements={announcements} addToCart={addToCart} userBalance={balanceUSD} onPurchase={handlePurchase} onProductSelect={setSelectedProduct} />}
          {currentView === View.SEARCH && <SearchPage setView={handleSetView} formatPrice={formatPrice} products={products} categories={categories} addToCart={addToCart} userBalance={balanceUSD} onPurchase={handlePurchase} onProductSelect={setSelectedProduct} />}
          {currentView === View.WALLET && <Wallet setView={handleSetView} formatPrice={formatPrice} balance={balanceUSD} transactions={transactions} />}
          {currentView === View.PROFILE && <Profile setView={handleSetView} currentCurrency={currencyCode} onCurrencyChange={setCurrencyCode} terms={terms} user={currentUser || undefined} currencies={currencies} rateAppLink={rateAppLink} onLogout={handleUserLogout} onUpdateUser={handleUpdateProfile} />}
          {currentView === View.NOTIFICATIONS && <Notifications setView={handleSetView} formatPrice={formatPrice} announcements={announcements} />}
          {currentView === View.CART && (
             <div className="pt-4 px-4">
                <h1 className="text-xl font-bold text-white text-right mb-4">سلة المشتريات</h1>
                {cartItems.length > 0 ? (
                    <>
                        {cartItems.map(item => (
                            <div key={item.id} className="bg-[#242636] p-3 rounded-xl border border-gray-700 mb-2 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm">{item.name}</p>
                                    <p className="text-yellow-400 text-xs font-mono">{formatPrice(item.price)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setActiveCheckoutItem(item); }} className="bg-green-500 text-white px-3 py-1 rounded text-xs">شراء</button>
                                    <button onClick={() => setCartItems(prev => prev.filter(i => i.id !== item.id))} className="bg-red-500 text-white px-3 py-1 rounded text-xs">حذف</button>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => setIsBulkCheckout(true)} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl mt-4">شراء الكل ({formatPrice(cartTotal)})</button>
                    </>
                ) : <div className="text-center text-gray-500 mt-10">السلة فارغة</div>}
                <CheckoutModal isOpen={!!activeCheckoutItem || isBulkCheckout} onClose={() => { setActiveCheckoutItem(null); setIsBulkCheckout(false); }} itemName={isBulkCheckout ? 'شراء الكل' : activeCheckoutItem?.name || ''} price={isBulkCheckout ? cartTotal : activeCheckoutItem?.price || 0} userBalance={balanceUSD} onSuccess={handleCheckoutSuccess} formatPrice={formatPrice} />
             </div>
          )}
          {currentView === View.ORDERS && (
             <div className="pt-4 px-4">
                 <div className="flex justify-between mb-4"><button onClick={() => handleSetView(View.HOME)}><ArrowLeft/></button><h1 className="text-xl font-bold">طلباتي</h1></div>
                 {orders.map(o => (
                     <div key={o.id} className="bg-[#242636] p-4 rounded-xl border border-gray-700 mb-2">
                         <div className="flex justify-between"><span className="font-bold">{o.productName}</span><span className={`text-xs px-2 rounded ${o.status==='completed'?'bg-green-500/20 text-green-500':'text-yellow-500'}`}>{o.status}</span></div>
                         {o.deliveredCode && <div className="mt-2 bg-black/30 p-2 rounded font-mono text-xs select-all">{o.deliveredCode}</div>}
                         {o.status==='completed' && <button onClick={() => setSelectedInvoiceOrder(o)} className="text-xs text-yellow-400 underline mt-2">فاتورة</button>}
                     </div>
                 ))}
             </div>
          )}
          {currentView === View.ADMIN && isAdminLoggedIn && <Admin setView={handleSetView} products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} terms={terms} setTerms={setTerms} banners={banners} setBanners={setBanners} users={users} setUsers={setUsers} announcements={announcements} setAnnouncements={setAnnouncements} currencies={currencies} setCurrencies={setCurrencies} orders={orders} setOrders={setOrders} inventory={inventory} setInventory={setInventory} rateAppLink={rateAppLink} setRateAppLink={setRateAppLink} transactions={transactions} setTransactions={setTransactions} onLogout={handleAdminLogout} />}
        </div>
        {currentView !== View.ADMIN && <BottomNav currentView={currentView} setView={handleSetView} />}
        {selectedProduct && <ProductDetailsModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} formatPrice={formatPrice} addToCart={addToCart} userBalance={balanceUSD} onPurchase={handlePurchase} isLoggedIn={!!currentUser} onRequireAuth={() => setShowLoginModal(true)} />}
        {selectedInvoiceOrder && <InvoiceModal order={selectedInvoiceOrder} isOpen={!!selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} formatPrice={formatPrice} />}
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} terms={terms} />
      </div>
    </div>
  );
};

export default App;
