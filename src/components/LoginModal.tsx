import React, { useState } from 'react';
import { X, Mail, Phone, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AppTerms } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (data: { name?: string; email?: string; phone?: string; password?: string; isRegister: boolean }) => void;
  terms: AppTerms;
}

const LoginModal: React.FC<Props> = ({ isOpen, onClose, onLogin, terms }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (mode === 'register' && !name.trim()) { alert('يرجى إدخال الاسم الكامل'); return; }
    if (method === 'email' && !email.trim()) { alert('يرجى إدخال البريد الإلكتروني'); return; }
    if (method === 'phone' && !phone.trim()) { alert('يرجى إدخال رقم الهاتف'); return; }
    if (!password) { alert('يرجى إدخال كلمة المرور'); return; }
    if (mode === 'register' && password.length < 6) { alert('يجب أن تكون كلمة المرور 6 أحرف على الأقل'); return; }
    
    onLogin({
        isRegister: mode === 'register',
        name: mode === 'register' ? name : undefined,
        email: method === 'email' ? email : undefined,
        phone: method === 'phone' ? phone : undefined,
        password: password
    });
  };

  return (
    <>
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}></div>
            
            <div className="bg-[#1f212e] w-full max-w-sm rounded-[2rem] relative z-10 animate-slide-up border border-gray-700/50 shadow-2xl overflow-hidden flex flex-col h-auto max-h-[85dvh] sm:max-h-[90vh] min-h-[400px]">
                
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"></div>

                <button onClick={onClose} className="absolute top-5 left-5 z-20 w-8 h-8 flex items-center justify-center bg-[#242636] hover:bg-[#2f3245] rounded-full text-gray-400 hover:text-white transition-all shadow-sm border border-gray-700"><X size={18}/></button>

                <div className="flex pt-6 px-6 pb-2 shrink-0">
                    <button onClick={() => setMode('login')} className={`flex-1 pb-3 text-base font-bold relative transition-all ${mode === 'login' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>تسجيل الدخول{mode === 'login' && (<div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)] animate-fadeIn mx-auto w-1/2"></div>)}</button>
                    <button onClick={() => setMode('register')} className={`flex-1 pb-3 text-base font-bold relative transition-all ${mode === 'register' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>إنشاء حساب{mode === 'register' && (<div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)] animate-fadeIn mx-auto w-1/2"></div>)}</button>
                </div>

                <div className="w-full h-[1px] bg-gray-800 mb-2 mx-auto w-[90%] shrink-0"></div>

                <div className="px-6 overflow-y-auto no-scrollbar flex-1 py-2 pb-4">
                    <div className="text-center mb-6 animate-fadeIn">
                        <h2 className="text-2xl font-black text-white mb-2 tracking-wide">{mode === 'login' ? 'أهلاً بك مجدداً 👋' : 'انضم إلينا الآن 🚀'}</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">{mode === 'login' ? 'سجّل دخولك للمتابعة والاستمتاع بجميع المميزات' : 'أنشئ حسابك الجديد في ثوانٍ وابدأ رحلتك'}</p>
                    </div>

                    <div className="bg-[#13141f] p-1.5 rounded-xl flex mb-6 border border-gray-700/50 shrink-0">
                        <button onClick={() => setMethod('email')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${method === 'email' ? 'bg-[#242636] text-white shadow-md border border-gray-600' : 'text-gray-500 hover:text-gray-300'}`}><Mail size={14} /> البريد الإلكتروني</button>
                        <button onClick={() => setMethod('phone')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${method === 'phone' ? 'bg-[#242636] text-white shadow-md border border-gray-600' : 'text-gray-500 hover:text-gray-300'}`}><Phone size={14} /> رقم الهاتف</button>
                    </div>

                    <div className="space-y-4">
                        {mode === 'register' && (<div className="space-y-1.5 animate-slide-up"><label className="text-xs font-bold text-gray-300 mr-1">الاسم الكامل</label><div className="relative group"><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#242636] border border-gray-700 rounded-xl py-4 pr-11 pl-4 text-white text-right focus:border-yellow-400 focus:bg-[#2a2d3e] focus:outline-none transition-all text-sm shadow-inner placeholder-gray-600" placeholder="الاسم الثلاثي" /><div className="absolute right-3.5 top-4 text-gray-500 group-focus-within:text-yellow-400 transition-colors"><User size={20} strokeWidth={1.5} /></div></div></div>)}
                        {method === 'email' ? (<div className="space-y-1.5 animate-fadeIn"><label className="text-xs font-bold text-gray-300 mr-1">البريد الإلكتروني</label><div className="relative group"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#242636] border border-gray-700 rounded-xl py-4 pr-11 pl-4 text-white text-right focus:border-yellow-400 focus:bg-[#2a2d3e] focus:outline-none transition-all text-sm shadow-inner placeholder-gray-600" placeholder="name@example.com" /><div className="absolute right-3.5 top-4 text-gray-500 group-focus-within:text-yellow-400 transition-colors"><Mail size={20} strokeWidth={1.5} /></div></div></div>) : (<div className="space-y-1.5 animate-fadeIn"><label className="text-xs font-bold text-gray-300 mr-1">رقم الهاتف</label><div className="relative group"><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#242636] border border-gray-700 rounded-xl py-4 pr-11 pl-4 text-white text-right focus:border-yellow-400 focus:bg-[#2a2d3e] focus:outline-none transition-all text-sm shadow-inner placeholder-gray-600 dir-rtl" placeholder="0770 000 0000" /><div className="absolute right-3.5 top-4 text-gray-500 group-focus-within:text-yellow-400 transition-colors"><Phone size={20} strokeWidth={1.5} /></div></div></div>)}
                        <div className="space-y-1.5"><label className="text-xs font-bold text-gray-300 mr-1">كلمة المرور</label><div className="relative group"><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#242636] border border-gray-700 rounded-xl py-4 pr-11 pl-11 text-white text-right focus:border-yellow-400 focus:bg-[#2a2d3e] focus:outline-none transition-all text-sm shadow-inner placeholder-gray-600" placeholder="••••••••" /><div className="absolute right-3.5 top-4 text-gray-500 group-focus-within:text-yellow-400 transition-colors"><Lock size={20} strokeWidth={1.5} /></div><button onClick={() => setShowPassword(!showPassword)} className="absolute left-3.5 top-4 text-gray-500 hover:text-white transition-colors">{showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}</button></div></div>
                    </div>
                </div>

                <div className="p-6 pt-4 bg-[#1f212e] border-t border-gray-800/30 shrink-0">
                    <button onClick={handleSubmit} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold py-4 rounded-xl shadow-lg shadow-yellow-400/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"><span>{mode === 'login' ? 'دخول آمن' : 'إنشاء الحساب'}</span><ArrowRight size={18} strokeWidth={2.5} /></button>
                    {mode === 'register' && (<div className="text-center mt-3 px-2 animate-fadeIn"><p className="text-[10px] text-gray-500 leading-relaxed font-medium">بإنشائك للحساب، أنت توافق على <button onClick={() => setShowFullTerms(true)} className="text-yellow-400 hover:text-yellow-300 mx-1 font-bold underline decoration-yellow-400/30 underline-offset-4 transition-colors">الشروط والأحكام</button> الخاصة بالتطبيق</p></div>)}
                </div>
            </div>
        </div>
        
        {showFullTerms && (
           <div className="fixed inset-0 z-[200] bg-[#13141f] animate-fadeIn flex flex-col">
               <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-[#1f212e]">
                   <button onClick={() => setShowFullTerms(false)} className="p-2 bg-[#242636] rounded-xl text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                   <h2 className="text-lg font-bold text-white">الشروط والأحكام</h2><div className="w-9"></div>
               </div>
               <div className="flex-1 overflow-y-auto p-6 text-gray-300">
                   <div className="space-y-6 text-right"><div className="text-center mb-6"><h3 className="text-xl font-bold text-yellow-400 mb-2">سياسة الاستخدام</h3></div><div className="whitespace-pre-line leading-relaxed text-sm bg-[#242636] p-5 rounded-2xl border border-gray-700/50 shadow-sm">{terms.contentAr}</div></div>
                   <div className="my-8 border-t border-gray-700/50"></div>
                   <div className="space-y-6 text-left dir-ltr"><div className="text-center mb-6"><h3 className="text-xl font-bold text-yellow-400 mb-2">Terms of Service</h3></div><div className="whitespace-pre-line leading-relaxed text-sm bg-[#242636] p-5 rounded-2xl border border-gray-700/50 shadow-sm">{terms.contentEn}</div></div>
               </div>
           </div>
       )}
    </>
  );
};

export default LoginModal;