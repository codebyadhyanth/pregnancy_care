import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
    Wallet, CreditCard, Clock, IndianRupee, Plus, X, CheckCircle2,
    Loader2, AlertCircle, ArrowRight, Building2
} from 'lucide-react';
import api from '../../services/api';
import GlassCard from '../ui/GlassCard';

// ============================
// Add Bank Account Modal
// ============================
const AddBankModal = ({ isOpen, onClose, onAdded }) => {
    const [form, setForm] = useState({ bankName: '', accountNumber: '', ifscCode: '', isPrimary: false });
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.bankName || !form.accountNumber || !form.ifscCode) {
            toast.error('All fields are required');
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await api.post('/transactions/bank-accounts', form);
            toast.success('Bank account added');
            onAdded(data);
            setForm({ bankName: '', accountNumber: '', ifscCode: '', isPrimary: false });
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add account');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={20} /></button>
                <h3 className="text-xl font-bold text-text-dark mb-4 flex items-center gap-2">
                    <Building2 size={22} className="text-primary-start" /> Add Bank Account
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text" placeholder="Bank Name (e.g. HDFC Bank)"
                        value={form.bankName} onChange={(e) => setForm(p => ({ ...p, bankName: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-start/30"
                    />
                    <input
                        type="text" placeholder="Account Number"
                        value={form.accountNumber} onChange={(e) => setForm(p => ({ ...p, accountNumber: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-start/30"
                    />
                    <input
                        type="text" placeholder="IFSC Code"
                        value={form.ifscCode} onChange={(e) => setForm(p => ({ ...p, ifscCode: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-start/30"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm(p => ({ ...p, isPrimary: e.target.checked }))} className="rounded" />
                        Set as primary account
                    </label>
                    <button type="submit" disabled={submitting}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary-start to-primary-end text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
                        {submitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Save Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ============================
// Apply to Scheme Modal
// ============================
const ApplySchemeModal = ({ isOpen, onClose, scheme, bankAccounts, onApplied }) => {
    const [selectedBank, setSelectedBank] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedBank('');
            setConfirmed(false);
        }
    }, [isOpen]);

    if (!isOpen || !scheme) return null;

    const handleApply = async () => {
        if (!selectedBank) {
            toast.error('Please select a bank account');
            return;
        }
        if (!confirmed) {
            toast.error('Please confirm your application');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/transactions/apply', {
                schemeId: scheme.scheme_id,
                bankAccountId: selectedBank,
                confirmed: true,
            });
            toast.success('Scheme application submitted!');
            onApplied();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Application failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={20} /></button>
                <h3 className="text-xl font-bold text-text-dark mb-1">Apply to Scheme</h3>
                <p className="text-sm text-gray-500 mb-5">{scheme.scheme_name}</p>

                <div className="space-y-3 mb-5">
                    <div className="flex justify-between p-3 bg-pink-50 rounded-2xl">
                        <span className="text-sm text-gray-600">Total Eligible Amount</span>
                        <span className="font-bold text-primary-start">₹{scheme.total_amount}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-purple-50 rounded-2xl">
                        <span className="text-sm text-gray-600">Installments</span>
                        <span className="font-bold text-purple-600">{scheme.installment_count}</span>
                    </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank Account</label>
                {bankAccounts.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-2xl text-sm text-red-600 mb-4">
                        <AlertCircle size={16} /> Please add a bank account first.
                    </div>
                ) : (
                    <select
                        value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-start/30 mb-4"
                    >
                        <option value="">-- Choose account --</option>
                        {bankAccounts.map((ba) => (
                            <option key={ba._id} value={ba._id}>{ba.bankName} ({ba.maskedAccount})</option>
                        ))}
                    </select>
                )}

                <label className="flex items-center gap-2 text-sm text-gray-600 mb-5 cursor-pointer">
                    <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="rounded" />
                    I confirm that the details above are correct.
                </label>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">Cancel</button>
                    <button onClick={handleApply} disabled={submitting || bankAccounts.length === 0}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-primary-start to-primary-end text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
                        {submitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirm Application'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================
// Status Badge
// ============================
const StatusBadge = ({ status }) => {
    const colors = {
        credited: 'bg-emerald-100 text-emerald-700',
        processing: 'bg-amber-100 text-amber-700',
        pending: 'bg-gray-100 text-gray-500',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${colors[status] || colors.pending}`}>
            {status}
        </span>
    );
};

// ============================
// Main Component
// ============================
const MoneyTransactions = () => {
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [schemeCatalog, setSchemeCatalog] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showBankModal, setShowBankModal] = useState(false);
    const [selectedScheme, setSelectedScheme] = useState(null);

    const fetchAll = useCallback(async () => {
        try {
            const [sumRes, txRes, baRes, catRes] = await Promise.all([
                api.get('/transactions/summary'),
                api.get('/transactions'),
                api.get('/transactions/bank-accounts'),
                api.get('/transactions/scheme-catalog'),
            ]);
            setSummary(sumRes.data);
            setTransactions(txRes.data);
            setBankAccounts(baRes.data);
            setSchemeCatalog(catRes.data);
        } catch {
            // handled by interceptor
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Auto-refresh transactions every 5 seconds to pick up simulated credits
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const [sumRes, txRes] = await Promise.all([
                    api.get('/transactions/summary'),
                    api.get('/transactions'),
                ]);
                setSummary(sumRes.data);
                setTransactions(txRes.data);
            } catch {
                // silent
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSimulateCredit = async (transactionId) => {
        try {
            const { data } = await api.post(`/transactions/${transactionId}/simulate-credit`);
            toast.success(data.message);
            // Refresh after estimated delay + buffer
            setTimeout(fetchAll, (data.estimatedDelay + 1) * 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Simulation failed');
        }
    };

    const appliedSchemeIds = transactions.map(tx => tx.schemeId);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-primary-start" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            <AddBankModal isOpen={showBankModal} onClose={() => setShowBankModal(false)}
                onAdded={(acc) => setBankAccounts(prev => [...prev, acc])} />
            <ApplySchemeModal isOpen={!!selectedScheme} onClose={() => setSelectedScheme(null)}
                scheme={selectedScheme} bankAccounts={bankAccounts} onApplied={fetchAll} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text-dark">Money Transactions</h1>
                    <p className="text-text-muted text-sm mt-1">Track your scheme disbursements and installments</p>
                </div>
                <button onClick={() => setShowBankModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-start to-primary-end text-white font-semibold shadow-lg hover:shadow-xl transition-all text-sm">
                    <Plus size={16} /> Add Bank Account
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Schemes Applied', value: summary.totalSchemesApplied, icon: <Wallet size={22} />, color: 'from-pink-100 to-pink-200 text-pink-700' },
                        { label: 'Total Eligible', value: `₹${summary.totalAmountEligible}`, icon: <IndianRupee size={22} />, color: 'from-purple-100 to-purple-200 text-purple-700' },
                        { label: 'Total Credited', value: `₹${summary.totalAmountCredited}`, icon: <CheckCircle2 size={22} />, color: 'from-emerald-100 to-emerald-200 text-emerald-700' },
                        { label: 'Next Installment', value: summary.nextInstallmentDate ? new Date(summary.nextInstallmentDate).toLocaleDateString() : 'N/A', icon: <Clock size={22} />, color: 'from-amber-100 to-amber-200 text-amber-700' },
                    ].map((card) => (
                        <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-3xl p-5 shadow-sm`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{card.label}</span>
                                {card.icon}
                            </div>
                            <p className="text-2xl font-bold">{card.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Available Schemes */}
            <div>
                <h2 className="text-xl font-bold text-text-dark mb-4">Available Schemes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schemeCatalog.map((scheme) => {
                        const alreadyApplied = appliedSchemeIds.includes(scheme.scheme_id);
                        return (
                            <GlassCard key={scheme.scheme_id} className="p-5 space-y-3 border border-pink-50">
                                <h3 className="font-semibold text-text-dark text-sm leading-tight">{scheme.scheme_name}</h3>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>₹{scheme.total_amount}</span>
                                    <span>{scheme.installment_count} installment{scheme.installment_count > 1 ? 's' : ''}</span>
                                </div>
                                {alreadyApplied ? (
                                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                                        <CheckCircle2 size={14} /> Applied
                                    </div>
                                ) : (
                                    <button onClick={() => setSelectedScheme(scheme)}
                                        className="w-full py-2 rounded-2xl text-sm font-semibold bg-pink-50 text-pink-700 hover:bg-pink-100 transition-all flex items-center justify-center gap-1">
                                        Apply <ArrowRight size={14} />
                                    </button>
                                )}
                            </GlassCard>
                        );
                    })}
                </div>
            </div>

            {/* Bank Accounts */}
            {bankAccounts.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-text-dark mb-4">Linked Bank Accounts</h2>
                    <div className="flex flex-wrap gap-3">
                        {bankAccounts.map((ba) => (
                            <div key={ba._id} className="flex items-center gap-3 bg-white/70 border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                                <CreditCard size={18} className="text-primary-start" />
                                <div>
                                    <p className="text-sm font-semibold text-text-dark">{ba.bankName}</p>
                                    <p className="text-xs text-gray-400">{ba.maskedAccount} · {ba.ifscCode}</p>
                                </div>
                                {ba.isPrimary && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-bold">Primary</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Transaction Timeline */}
            {transactions.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-text-dark mb-4">Installment Timeline</h2>
                    <div className="space-y-4">
                        {transactions.map((tx) => {
                            const creditedCount = tx.installments.filter(i => i.status === 'credited').length;
                            const totalCredited = tx.installments.filter(i => i.status === 'credited').reduce((s, i) => s + i.amount, 0);
                            const progress = (creditedCount / tx.installmentCount) * 100;
                            const ba = tx.bankAccount;
                            const hasPending = tx.installments.some(i => i.status === 'pending');

                            return (
                                <GlassCard key={tx._id} className="p-5 space-y-4 border border-pink-50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <h3 className="font-semibold text-text-dark">{tx.schemeName}</h3>
                                            <p className="text-xs text-gray-400">Total: ₹{tx.totalAmount} · {tx.installmentCount} installments</p>
                                        </div>
                                        <StatusBadge status={tx.status === 'completed' ? 'credited' : (tx.installments.some(i => i.status === 'processing') ? 'processing' : 'pending')} />
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>₹{totalCredited} credited</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2.5 rounded-full transition-all duration-700"
                                                style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>

                                    {/* Installment Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {tx.installments.map((inst) => (
                                            <div key={inst.installmentNumber}
                                                className={`p-3 rounded-2xl border text-sm ${inst.status === 'credited'
                                                        ? 'bg-emerald-50 border-emerald-200'
                                                        : inst.status === 'processing'
                                                            ? 'bg-amber-50 border-amber-200'
                                                            : 'bg-gray-50 border-gray-200'
                                                    }`}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-semibold">Installment {inst.installmentNumber}</span>
                                                    <StatusBadge status={inst.status} />
                                                </div>
                                                <p className="text-lg font-bold">₹{inst.amount}</p>
                                                {ba && <p className="text-[11px] text-gray-400 mt-1">{ba.bankName} ({ba.maskedAccount || 'XXXX'})</p>}
                                                {inst.creditedAt && <p className="text-[11px] text-gray-400">{new Date(inst.creditedAt).toLocaleString()}</p>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Simulate Credit Button */}
                                    {hasPending && (
                                        <button onClick={() => handleSimulateCredit(tx._id)}
                                            className="text-sm font-semibold text-primary-start hover:text-primary-end transition-colors flex items-center gap-1">
                                            ⚡ Simulate Next Installment Credit
                                        </button>
                                    )}
                                </GlassCard>
                            );
                        })}
                    </div>
                </div>
            )}

            {transactions.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <Wallet size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No transactions yet</p>
                    <p className="text-sm">Apply to a scheme above to get started</p>
                </div>
            )}
        </div>
    );
};

export default MoneyTransactions;
