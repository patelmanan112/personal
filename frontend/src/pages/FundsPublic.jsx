import { useState, useEffect } from 'react';
import { fundsService } from '../services/fundsService';
import { generateDaanPDF, generateExpensesPDF, generateSummaryPDF } from '../utils/pdfGenerator';
import Loading from '../components/Loading';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Download, IndianRupee, PieChart, Users, TrendingUp, TrendingDown, Eye, Wallet, ShieldCheck, Sparkles, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatMoney = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function FundsPublic() {
  const [summary, setSummary] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [cSearch, setCSearch] = useState('');
  const [cMode, setCMode] = useState('');
  const [eSearch, setESearch] = useState('');
  const [eCat, setECat] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, contRes, expRes] = await Promise.all([
        fundsService.getSummary(),
        fundsService.getContributions({ search: cSearch, paymentMode: cMode }),
        fundsService.getExpenses({ search: eSearch, category: eCat })
      ]);
      setSummary(sumRes.data);
      setContributions(contRes.data);
      setExpenses(expRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cSearch, cMode, eSearch, eCat]);

  if (loading && !summary) {
    return <Loading />;
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] font-sans flex flex-col relative text-white items-center justify-center pt-20">
        <Navbar />
        <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10 max-w-lg mt-20">
          <h2 className="text-2xl font-bold text-rose-400 mb-4">Temporarily Unavailable</h2>
          <p className="text-gray-300">The funds data could not be loaded. Please ensure the database migrations have been successfully applied.</p>
        </div>
        <div className="flex-1"></div>
        <Footer />
      </div>
    );
  }

  const spentPercentage = summary && summary.totalCollected > 0 
    ? ((summary.totalSpent / summary.totalCollected) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0f1c] font-sans selection:bg-amber-500 selection:text-white overflow-x-hidden flex flex-col relative">
      <Navbar />
      
      {/* ─── FESTIVAL AMBIENT BACKGROUND ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mt-16 sm:mt-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[150px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-[30%] left-[60%] w-[30%] h-[30%] rounded-full bg-amber-500/10 blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '1s'}}></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 flex-1">
        {/* ─── HERO SECTION ─────────────────────────────────────── */}
        <div className="pt-20 pb-40 lg:pb-56 text-center px-4 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
          >
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-amber-50 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase">Ganesh Chaturthi 2026</span>
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-amber-100 to-amber-600 mb-6 tracking-tighter drop-shadow-2xl"
          >
            Live Treasury
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-blue-200/80 text-lg md:text-2xl font-medium max-w-2xl mx-auto flex items-center justify-center gap-3"
          >
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            100% Transparent Financial Records
          </motion.p>
        </div>

        {/* ─── GLASSMORPHIC SUMMARY BOX ─────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 lg:-mt-48 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, type: 'spring', damping: 20 }}
            className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 p-6 sm:p-8 md:p-12 relative overflow-hidden"
          >
            {/* Shimmer effect line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 tracking-tight">
                  <Wallet className="w-10 h-10 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                  Fund Overview
                </h2>
                <p className="text-gray-400 font-medium mt-2 ml-[3.25rem] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> Live updates
                </p>
              </div>
              <button 
                onClick={() => generateSummaryPDF(summary)}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 font-bold text-ualg-navy bg-gradient-to-r from-amber-200 to-amber-500 rounded-2xl overflow-hidden transition-all active:scale-95 shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-100 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Download className="w-5 h-5 relative z-10 group-hover:-translate-y-1 transition-transform" /> 
                <span className="relative z-10">Export Summary</span>
              </button>
            </div>

            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 relative z-10">
              
              {/* Total Daan */}
              <motion.div variants={fadeUp} className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/40 rounded-3xl p-8 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors"></div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <h3 className="text-emerald-100 font-bold text-xl">Total Daan</h3>
                </div>
                <p className="text-5xl lg:text-6xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  {formatMoney(summary.totalCollected)}
                </p>
              </motion.div>
              
              {/* Total Spent */}
              <motion.div variants={fadeUp} className="bg-gradient-to-br from-rose-900/40 to-rose-950/40 rounded-3xl p-8 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.05)] relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl group-hover:bg-rose-500/30 transition-colors"></div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                    <TrendingDown className="w-7 h-7" />
                  </div>
                  <h3 className="text-rose-100 font-bold text-xl">Total Spent</h3>
                </div>
                <p className="text-5xl lg:text-6xl font-black text-rose-400 tracking-tighter drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                  {formatMoney(summary.totalSpent)}
                </p>
              </motion.div>

              {/* Balance */}
              <motion.div variants={fadeUp} className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 rounded-3xl p-8 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)] relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors"></div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <IndianRupee className="w-7 h-7" />
                  </div>
                  <h3 className="text-blue-100 font-bold text-xl">Balance</h3>
                </div>
                <p className="text-5xl lg:text-6xl font-black text-blue-400 tracking-tighter drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                  {formatMoney(summary.remainingBalance)}
                </p>
              </motion.div>

            </motion.div>

            {/* Progress Bar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}
              className="bg-black/20 p-6 md:p-8 rounded-[2rem] border border-white/5 relative z-10"
            >
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fund Utilization</span>
                  <p className="text-3xl font-black text-white mt-1 drop-shadow-md">{spentPercentage}%</p>
                </div>
                <span className="text-sm font-bold text-gray-500">Target: 100%</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-6 overflow-hidden shadow-inner p-1 border border-white/5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] relative overflow-hidden" 
                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                >
                  {/* Animated stripes */}
                  <div className="absolute inset-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.2)_10px,rgba(255,255,255,0.2)_20px)] animate-[pan_2s_linear_infinite]"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ─── DETAILED LISTS ────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* DAAN / CONTRIBUTIONS PANEL */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col h-[850px] bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
              
              <div className="p-8 border-b border-white/5 flex-shrink-0 bg-white/[0.01] z-10 sticky top-0">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      <Users className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">Contributions</h2>
                      <p className="text-sm font-medium text-emerald-400/80 mt-1">{summary.totalContributors} Generous Donors</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => generateDaanPDF(contributions, summary.totalCollected)}
                    className="w-12 h-12 rounded-full bg-white/5 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-400 flex items-center justify-center transition-all border border-white/10 hover:border-emerald-500/30 shadow-lg"
                    title="Download Daan PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <input 
                    type="text" 
                    placeholder="Search donor..."
                    className="flex-1 p-4 text-sm font-medium bg-black/20 text-white placeholder-gray-500 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:bg-black/40 transition-all outline-none"
                    value={cSearch}
                    onChange={e => setCSearch(e.target.value)}
                  />
                  <select 
                    className="p-4 text-sm font-medium bg-black/20 text-white border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:bg-black/40 outline-none cursor-pointer [&>option]:bg-slate-900"
                    value={cMode}
                    onChange={e => setCMode(e.target.value)}
                  >
                    <option value="">All Modes</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                {contributions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                      <Users className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300">No contributions yet</h3>
                    <p className="text-gray-500 text-sm mt-2">Records will appear here instantly.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {contributions.map((c, i) => (
                        <motion.div 
                          key={c.id}
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="group bg-white/[0.02] p-5 rounded-[1.5rem] border border-white/5 flex justify-between items-center hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 font-black text-xl border border-emerald-500/20 shadow-inner">
                              {c.contributorName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{c.contributorName}</h4>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs font-semibold text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg">{new Date(c.date).toLocaleDateString()}</span>
                                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">{c.paymentMode}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-emerald-400 text-2xl drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] block">{formatMoney(c.amount)}</span>
                            {c.imageUrl && (
                              <a href={c.imageUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-amber-400 transition-colors bg-blue-500/10 px-3 py-1 rounded-lg">
                                <Eye className="w-3.5 h-3.5"/> Proof
                              </a>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>

            {/* EXPENSES / SPENT PANEL */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0, duration: 0.6 }}
              className="flex flex-col h-[850px] bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-400 to-red-500"></div>
              
              <div className="p-8 border-b border-white/5 flex-shrink-0 bg-white/[0.01] z-10 sticky top-0">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-rose-500/20 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                      <PieChart className="w-7 h-7 text-rose-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">Expenses</h2>
                      <p className="text-sm font-medium text-rose-400/80 mt-1">{summary.totalExpenses} Records Logged</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => generateExpensesPDF(expenses, summary.totalSpent)}
                    className="w-12 h-12 rounded-full bg-white/5 hover:bg-rose-500/20 text-gray-300 hover:text-rose-400 flex items-center justify-center transition-all border border-white/10 hover:border-rose-500/30 shadow-lg"
                    title="Download Expenses PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <input 
                    type="text" 
                    placeholder="Search expense..."
                    className="flex-1 p-4 text-sm font-medium bg-black/20 text-white placeholder-gray-500 border border-white/10 rounded-2xl focus:ring-2 focus:ring-rose-500/50 focus:bg-black/40 transition-all outline-none"
                    value={eSearch}
                    onChange={e => setESearch(e.target.value)}
                  />
                  <select 
                    className="p-4 text-sm font-medium bg-black/20 text-white border border-white/10 rounded-2xl focus:ring-2 focus:ring-rose-500/50 focus:bg-black/40 outline-none cursor-pointer [&>option]:bg-slate-900"
                    value={eCat}
                    onChange={e => setECat(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="Decoration">Decoration</option>
                    <option value="Ganesh Murti">Ganesh Murti</option>
                    <option value="Puja / Samagri">Puja / Samagri</option>
                    <option value="Prasad / Food">Prasad / Food</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Sound System">Sound System</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Event">Event</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                {expenses.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                      <PieChart className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300">No expenses recorded</h3>
                    <p className="text-gray-500 text-sm mt-2">Expenses will appear here instantly.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {expenses.map((e, i) => (
                        <motion.div 
                          key={e.id} 
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="group bg-white/[0.02] p-5 rounded-[1.5rem] border border-white/5 flex justify-between items-center hover:bg-white/[0.04] hover:border-rose-500/30 transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-500/20 flex items-center justify-center text-rose-400 font-black text-xl border border-rose-500/20 flex-shrink-0 shadow-inner">
                               {e.expenseName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg group-hover:text-rose-400 transition-colors">{e.expenseName}</h4>
                              <div className="flex items-center flex-wrap gap-2 mt-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">{e.category}</span>
                                <span className="text-xs font-semibold text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg">{new Date(e.date).toLocaleDateString()}</span>
                              </div>
                              {e.paidTo && <p className="text-xs font-medium text-gray-500 mt-2.5 flex items-center gap-1.5">Paid to: <span className="text-gray-300 bg-white/5 px-2 py-0.5 rounded">{e.paidTo}</span></p>}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-rose-400 text-2xl drop-shadow-[0_0_8px_rgba(244,63,94,0.3)] block">{formatMoney(e.amount)}</span>
                            {e.receiptUrl && (
                              <a href={e.receiptUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-amber-400 transition-colors bg-blue-500/10 px-3 py-1 rounded-lg">
                                <Eye className="w-3.5 h-3.5"/> Receipt
                              </a>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
      
      {/* Add a global style for custom scrollbar within this component scope if needed, though tailwind can do it with plugins. We'll use inline standard webkit styling hack or just rely on OS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
      
      <Footer />
    </div>
  );
}
