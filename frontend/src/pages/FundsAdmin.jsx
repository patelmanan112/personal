import { useState, useEffect } from 'react';
import { fundsService } from '../services/fundsService';
import { generateDaanPDF, generateExpensesPDF, generateSummaryPDF } from '../utils/pdfGenerator';
import Loading from '../components/Loading';
import { Download, Plus, Trash2, Edit2, X, Eye, IndianRupee, PieChart, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const formatMoney = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

export default function FundsAdmin() {
  const [summary, setSummary] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms Modals
  const [showAddContribution, setShowAddContribution] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, contRes, expRes] = await Promise.all([
        fundsService.getSummary(),
        fundsService.getContributions(),
        fundsService.getExpenses()
      ]);
      setSummary(sumRes.data);
      setContributions(contRes.data);
      setExpenses(expRes.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteContribution = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contribution?')) return;
    try {
      await fundsService.deleteContribution(id);
      fetchData();
    } catch (e) {
      alert('Failed to delete contribution');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await fundsService.deleteExpense(id);
      fetchData();
    } catch (e) {
      alert('Failed to delete expense');
    }
  };

  if (loading && !summary) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-ualg-cream pb-12">
      <div className="bg-ualg-navy py-8 px-4 text-center relative">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Admin Fund Management</h1>
        <p className="text-ualg-gold font-medium">Control Center for Financial Tracking</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* SUMMARY SECTION */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-ualg-navy flex items-center gap-2">
              <PieChart className="w-6 h-6 text-ualg-gold" />
              Fund Summary
            </h2>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0 w-full md:w-auto">
              <button onClick={() => generateDaanPDF(contributions, summary.totalCollected)} className="flex-1 md:flex-none justify-center bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                Daan PDF
              </button>
              <button onClick={() => generateExpensesPDF(expenses, summary.totalSpent)} className="flex-1 md:flex-none justify-center bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                Expenses PDF
              </button>
              <button onClick={() => generateSummaryPDF(summary)} className="flex-1 md:flex-none justify-center bg-ualg-navy text-white px-4 py-2 rounded hover:bg-ualg-blue transition-colors text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4"/> Summary PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
              <p className="text-sm text-green-800 font-semibold mb-1">Total Collection</p>
              <p className="text-3xl font-black text-green-700">{formatMoney(summary.totalCollected)}</p>
            </div>
            
            <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
              <p className="text-sm text-red-800 font-semibold mb-1">Total Spent</p>
              <p className="text-3xl font-black text-red-700">{formatMoney(summary.totalSpent)}</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
              <p className="text-sm text-blue-800 font-semibold mb-1">Remaining Balance</p>
              <p className="text-3xl font-black text-blue-700">{formatMoney(summary.remainingBalance)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* DAAN SECTION */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-[700px]">
            <div className="p-6 border-b border-gray-100 flex-shrink-0 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-ualg-navy flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Contributions
                </h2>
              </div>
              <button 
                onClick={() => setShowAddContribution(true)}
                className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-3">
              {contributions.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No contributions found.</div>
              ) : (
                contributions.map(c => (
                  <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800">{c.contributorName}</h4>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(c.date).toLocaleDateString()} • {c.paymentMode}
                      </div>
                      {c.imageUrl && <a href={c.imageUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View Proof</a>}
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className="font-black text-green-700 text-lg">{formatMoney(c.amount)}</span>
                      <button onClick={() => handleDeleteContribution(c.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* EXPENSES SECTION */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-[700px]">
            <div className="p-6 border-b border-gray-100 flex-shrink-0 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-ualg-navy flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-red-600" />
                  Expenses
                </h2>
              </div>
              <button 
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-3">
              {expenses.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No expenses recorded yet.</div>
              ) : (
                expenses.map(e => (
                  <div key={e.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800">{e.expenseName}</h4>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full mr-1">{e.category}</span>
                        {new Date(e.date).toLocaleDateString()}
                      </div>
                      {e.receiptUrl && <a href={e.receiptUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View Receipt</a>}
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className="font-black text-red-700 text-lg">{formatMoney(e.amount)}</span>
                      <button onClick={() => handleDeleteExpense(e.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Add Contribution Modal */}
      {showAddContribution && (
        <ContributionModal 
          onClose={() => setShowAddContribution(false)} 
          onSuccess={() => { setShowAddContribution(false); fetchData(); }} 
        />
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <ExpenseModal 
          onClose={() => setShowAddExpense(false)} 
          onSuccess={() => { setShowAddExpense(false); fetchData(); }} 
        />
      )}
    </div>
  );
}

function ContributionModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    try {
      await fundsService.addContribution(fd);
      onSuccess();
    } catch(err) {
      alert('Failed to add contribution');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-ualg-navy">Add Contribution</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contributor Name *</label>
            <input name="contributorName" required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input name="amount" type="number" min="1" required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input name="date" type="date" required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
            <select name="paymentMode" required className="w-full border p-2 rounded">
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
            <textarea name="note" className="w-full border p-2 rounded" rows="2"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Proof Image (Optional)</label>
            <input name="image" type="file" accept="image/*" className="w-full text-sm" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-ualg-navy text-white font-bold py-3 rounded-lg hover:bg-ualg-blue transition disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Contribution'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ExpenseModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    try {
      await fundsService.addExpense(fd);
      onSuccess();
    } catch(err) {
      alert('Failed to add expense');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-ualg-navy">Add Expense</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name *</label>
            <input name="expenseName" required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select name="category" required className="w-full border p-2 rounded">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input name="amount" type="number" min="1" required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input name="date" type="date" required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paid To (Optional)</label>
            <input name="paidTo" className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea name="description" className="w-full border p-2 rounded" rows="2"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Image (Optional)</label>
            <input name="receipt" type="file" accept="image/*" className="w-full text-sm" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-ualg-navy text-white font-bold py-3 rounded-lg hover:bg-ualg-blue transition disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
