// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, X, Calendar, Lock, User, ChevronLeft, Smartphone, Zap, Gem, Headset, Send, Wallet as WalletIcon, ArrowLeft } from 'lucide-react';
import { View, Transaction } from '../types';
import { walletService, paymentService } from '../services/api';

interface Props {
  setView: (view: View) => void;
  formatPrice: (price: number) => string;
  balance: number;
  onAddBalance?: (amount: number) => void; 
  transactions: Transaction[]; 
}

const Wallet: React.FC<Props> = ({ setView, formatPrice, balance }) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal Step State
  const [modalStep, setModalStep] = useState<'select' | 'card' | 'support'>('select');
  const [selectedMethodName, setSelectedMethodName] = useState('');
  const [selectedMethodIcon, setSelectedMethodIcon] = useState<any>(null);

  const [amountToAdd, setAmountToAdd] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });

  useEffect(() => {
      fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
      setLoading(true);
      try {
          const res = await walletService.getTransactions();
          const mapped = res.data.map((t: any) => ({
              ...t,
              date: new Date(t.createdAt).toLocaleString('en-US')
          }));
          setTransactions(mapped);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter === 'All') return true;
    return tx.title.toLowerCase().includes(activeFilter.toLowerCase());
  });

  const handleConfirmAddBalance = async () => {
      const value = parseFloat(amountToAdd);
      if (!isNaN(value) && value > 0) {
          try {
              const res = await paymentService.charge({
                  amount: value,
                  cardLast4: cardDetails.number.slice(-4) || 'xxxx',
                  cardHolder: cardDetails.name
              });
              
              if (res.data.success) {
                  alert(`تم إضافة ${formatPrice(value)} إلى محفظتك بنجاح!`);
                  setAmountToAdd('');
                  setShowAddBalanceModal(false);
                  fetchTransactions(); 
                  window.location.reload(); 
              }
          } catch (error: any) {
              alert(error.response?.data?.message || 'فشلت عملية الدفع');
          }
      } else {
          alert('يرجى إدخال مبلغ صحيح');
      }
  };

  const openWhatsApp = () => window.open('https://wa.me/9647763410970', '_blank');
  const openTelegram = () => window.open('https://t.me/Ratluzen', '_blank');
  
  const paymentMethods = [
      { id: 'card', name: 'بطاقة الماستر أو الفيزا', icon: CreditCard, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/30', desc: 'دفع فوري وآمن' },
      { id: 'superkey', name: 'سوبركي', icon: Zap, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-yellow-600/5', border: 'border-yellow-500/30', desc: 'شحن عبر وكلاء سوبركي' },
      { id: 'zaincash', name: 'زين كاش', icon: WalletIcon, color: 'text-pink-500', bg: 'from-pink-500/20 to-pink-600/5', border: 'border-pink-500/30', desc: 'المحفظة الإلكترونية' },
      { id: 'halapay', name: 'هلا بي', icon: Gem, color: 'text-purple-500', bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/30', desc: 'خدمة الدفع السريع' },
      { id: 'asiacell', name: 'كارتات آسياسيل', icon: Smartphone, color: 'text-red-500', bg: 'from-red-500/20 to-red-600/5', border: 'border-red-500/30', desc: 'رصيد كروت الشحن' },
  ];

  const handleMethodSelect = (method: typeof paymentMethods[0]) => {
      if (method.id === 'card') { setModalStep('card'); } 
      else { setSelectedMethodName(method.name); setSelectedMethodIcon(method.icon); setModalStep('support'); }
  };

  return (
    <div className="min-h-screen pb-24 pt-4 relative">
      <div className="px-4 mb-4"><h1 className="text-xl font-bold text-white text-right">محفظتي</h1></div>
      <div className="px-4 space-y-5">
        <div className="bg-[#242636] rounded-2xl p-0 overflow-hidden shadow-lg border border-gray-800">
           <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-8 flex flex-col items-center justify-center text-white relative shadow-inner">
              <div className="text-center z-10">
                <p className="text-sm font-bold mb-1 opacity-90 text-green-50">رصيد محفظتك الحالي</p>
                <span className="text-4xl font-black dir-ltr tracking-wider drop-shadow-md">{formatPrice(balance)}</span>
              </div>
           </div>
           <div className="flex p-4 bg-[#242636]">
              <button onClick={() => { setCardDetails({ number: '', name: '', expiry: '', cvv: '' }); setAmountToAdd(''); setModalStep('select'); setShowAddBalanceModal(true); }} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2">
                <Plus size={18} strokeWidth={3} /> إضافة رصيد
              </button>
           </div>
        </div>

        <div>
          <h3 className="text-right font-bold text-white mb-4">تسلسل العمليات</h3>
          <div className="space-y-3">
            {loading ? <p className="text-center text-gray-500">جاري التحميل...</p> : filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx: Transaction) => (
                <div key={tx.id} className="bg-[#1e1f2b] p-4 rounded-xl flex items-center justify-between border border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#252836] flex items-center justify-center text-gray-400 border border-gray-700"><CreditCard size={20} /></div>
                    <div><h4 className="font-bold text-xs text-white mb-1">{tx.title}</h4><p className="text-[10px] text-gray-500 dir-ltr text-right">{tx.date}</p></div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`font-bold text-sm dir-ltr ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>{tx.type === 'credit' ? '+' : ''} {formatPrice(tx.amount)}</span>
                    <p className={`text-[10px] font-bold ${tx.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>{tx.status === 'completed' ? 'مكتملة' : 'قيد الانتظار'}</p>
                  </div>
                </div>
              ))
            ) : <div className="text-center py-8 text-gray-500 text-sm bg-[#1e1f2b] rounded-xl border border-dashed border-gray-800">لا توجد عمليات</div>}
          </div>
        </div>
      </div>

      {showAddBalanceModal && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">
           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddBalanceModal(false)}></div>
           <div className="bg-[#1f212e] w-full max-w-md rounded-t-3xl p-6 relative z-10 animate-slide-up border-t border-gray-700 max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col">
              <div className="flex items-center justify-between mb-6">
                  {modalStep === 'select' ? <button onClick={() => setShowAddBalanceModal(false)} className="p-2 bg-[#242636] rounded-xl text-gray-400"><X size={20} /></button> : <button onClick={() => setModalStep('select')} className="p-2 bg-[#242636] rounded-xl text-gray-400 flex items-center gap-1 text-xs font-bold"><ChevronLeft size={16} /> رجوع</button>}
                  <h2 className="text-lg font-bold text-white">{modalStep === 'select' ? 'طريقة الدفع' : modalStep === 'card' ? 'الدفع عبر البطاقة' : 'تواصل مع الدعم'}</h2><div className="w-9"></div>
              </div>

              {modalStep === 'select' && (
                  <div className="space-y-3 animate-fadeIn pb-4">
                      {paymentMethods.map((method) => (
                          <button key={method.id} onClick={() => handleMethodSelect(method)} className={`w-full bg-gradient-to-r ${method.bg} p-4 rounded-2xl flex items-center justify-between border ${method.border} hover:opacity-90`}>
                              <div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-[#242636] shadow-inner ${method.color}`}><method.icon size={24} /></div><div className="text-right"><span className="font-bold text-sm text-white block">{method.name}</span><span className="text-[10px] text-gray-400 font-bold">{method.desc}</span></div></div>
                              <div className="bg-[#242636]/50 p-2 rounded-lg text-gray-400"><ChevronLeft size={18} /></div>
                          </button>
                      ))}
                  </div>
              )}

              {modalStep === 'support' && (
                  <div className="flex flex-col items-center justify-center py-6 animate-fadeIn text-center">
                      <div className="w-24 h-24 bg-[#242636] rounded-full flex items-center justify-center mb-6 border border-gray-700 shadow-xl relative animate-pulse-slow">
                          {selectedMethodIcon ? React.createElement(selectedMethodIcon, { size: 40, className: "text-yellow-400" }) : <Headset size={40} className="text-yellow-400" />}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">إيداع عبر {selectedMethodName}</h3>
                      <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-xs mx-auto">يرجى التواصل مباشرة مع فريق الدعم الفني.</p>
                      <div className="w-full space-y-3">
                          <button onClick={openWhatsApp} className="w-full bg-[#25D366] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3"><Smartphone size={22} /><span className="text-base">تواصل عبر واتساب</span></button>
                          <button onClick={openTelegram} className="w-full bg-[#0088cc] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3"><Send size={22} /><span className="text-base">تواصل عبر تيليجرام</span></button>
                      </div>
                  </div>
              )}

              {modalStep === 'card' && (
                  <div className="animate-fadeIn">
                    <div className="mb-4"><label className="text-xs font-bold text-gray-400 mb-2 block text-right">المبلغ</label><input type="number" placeholder="0.00" className="w-full bg-[#13141f] border border-gray-700 rounded-xl py-3 px-4 text-white text-xl font-bold dir-ltr" value={amountToAdd} onChange={(e) => setAmountToAdd(e.target.value)}/></div>
                    <div className="space-y-4">
                        <input type="text" placeholder="رقم البطاقة" className="w-full bg-[#242636] border border-gray-700 rounded-xl py-3 px-4 text-white text-right" value={cardDetails.number} onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}/>
                        <input type="text" placeholder="الاسم" className="w-full bg-[#242636] border border-gray-700 rounded-xl py-3 px-4 text-white text-right" value={cardDetails.name} onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}/>
                        <div className="flex gap-4"><input type="text" placeholder="MM/YY" className="flex-1 bg-[#242636] border border-gray-700 rounded-xl py-3 px-4 text-white text-right" value={cardDetails.expiry} onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}/><input type="text" placeholder="CVV" className="flex-1 bg-[#242636] border border-gray-700 rounded-xl py-3 px-4 text-white text-right" value={cardDetails.cvv} onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}/></div>
                    </div>
                    <button className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl mt-8 shadow-lg" onClick={handleConfirmAddBalance}>تأكيد الدفع</button>
                  </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;