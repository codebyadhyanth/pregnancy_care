import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Baby, ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';

/**
 * CRITICAL: Do not edit without reviewing related modules.
 * This affects pregnancy/baby lifecycle logic.
 * This component manages the delivery confirmation flow:
 *  1. Ask "Have you delivered?"
 *  2. If No → supportive message → redirect back
 *  3. If Yes → reconfirmation modal → Baby Details Form
 *  4. On form submit → create baby record → enter post-pregnancy
 */

const DeliveryConfirmation = ({ onConfirmed, onCancel }) => {
    const [step, setStep] = useState('ask'); // 'ask' | 'confirm' | 'form' | 'notYet'
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        dob: '',
        timeOfBirth: '',
        gender: '',
        birthWeight: '',
    });

    const handleYes = () => setStep('confirm');
    const handleNo = () => setStep('notYet');
    const handleReconfirm = () => setStep('form');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.dob || !form.timeOfBirth || !form.gender || !form.birthWeight) {
            toast.error('Please fill all fields');
            return;
        }

        const bw = parseFloat(form.birthWeight);
        if (isNaN(bw) || bw <= 0 || bw > 10) {
            toast.error('Birth weight must be between 0.1 and 10 kg');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/baby', {
                dob: form.dob,
                timeOfBirth: form.timeOfBirth,
                gender: form.gender,
                birthWeight: bw,
            });
            toast.success(data.message || 'Baby registered!');
            onConfirmed(); // Switch to post-pregnancy dashboard
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence mode="wait">
            {step === 'ask' && (
                <motion.div key="ask" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-center min-h-[60vh]">
                    <GlassCard className="p-10 max-w-md w-full text-center space-y-6 border-t-4 border-t-pink-400 shadow-2xl">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-4xl shadow-lg">
                            🤱
                        </div>
                        <h2 className="text-2xl font-bold text-text-dark">Have you delivered the baby?</h2>
                        <p className="text-sm text-gray-500">This will switch you to the post-pregnancy tracking module.</p>
                        <div className="flex gap-3">
                            <Button variant="primary" className="flex-1 py-3 text-lg font-bold" onClick={handleYes}>
                                Yes 🎉
                            </Button>
                            <Button variant="outline" className="flex-1 py-3 text-lg" onClick={handleNo}>
                                Not Yet
                            </Button>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {step === 'notYet' && (
                <motion.div key="notYet" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-center min-h-[60vh]">
                    <GlassCard className="p-10 max-w-md w-full text-center space-y-6 border-t-4 border-t-purple-400 shadow-2xl">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-4xl shadow-lg">
                            💪
                        </div>
                        <h2 className="text-xl font-bold text-text-dark">You're doing amazing! 🌸</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Every pregnancy journey is unique. Continue with your pre-pregnancy tracking – we're here to support you every step of the way. Stay healthy, stay positive! 🌷
                        </p>
                        <Button variant="primary" className="w-full py-3" onClick={onCancel}>
                            <ArrowLeft size={16} className="inline mr-2" /> Back to Pre-Pregnancy
                        </Button>
                    </GlassCard>
                </motion.div>
            )}

            {step === 'confirm' && (
                <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-center min-h-[60vh]">
                    <GlassCard className="p-10 max-w-md w-full text-center space-y-6 border-t-4 border-t-amber-400 shadow-2xl">
                        <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
                            <AlertTriangle size={32} className="text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold text-text-dark">Are you sure?</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Are you sure you want to switch to <strong>Post-Pregnancy tracking</strong>? This will start the baby care module. Your pre-pregnancy data will remain safe and accessible.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="primary" className="flex-1 py-3 font-bold" onClick={handleReconfirm}>
                                <CheckCircle2 size={16} className="inline mr-1" /> Yes, Confirm
                            </Button>
                            <Button variant="outline" className="flex-1 py-3" onClick={() => setStep('ask')}>
                                Cancel
                            </Button>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {step === 'form' && (
                <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-center min-h-[60vh]">
                    <GlassCard className="p-8 max-w-lg w-full space-y-6 border-t-4 border-t-pink-400 shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-3xl shadow-lg mb-3">
                                🍼
                            </div>
                            <h2 className="text-xl font-bold text-text-dark">Baby Details</h2>
                            <p className="text-xs text-gray-500 mt-1">Please enter your baby's information</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-600 font-semibold block mb-1">Date of Birth *</label>
                                <input type="date" required value={form.dob}
                                    onChange={e => setForm(p => ({ ...p, dob: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-semibold block mb-1">Time of Birth *</label>
                                <input type="time" required value={form.timeOfBirth}
                                    onChange={e => setForm(p => ({ ...p, timeOfBirth: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-semibold block mb-1">Gender *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['male', 'female', 'other'].map(g => (
                                        <button key={g} type="button" onClick={() => setForm(p => ({ ...p, gender: g }))}
                                            className={`p-3 rounded-2xl text-sm font-semibold capitalize text-center transition-all ${form.gender === g
                                                ? 'bg-pink-100 text-pink-700 border-2 border-pink-300 shadow-sm'
                                                : 'bg-gray-50 text-gray-400 border-2 border-transparent hover:bg-gray-100'}`}>
                                            {g === 'male' ? '👦' : g === 'female' ? '👧' : '🧒'} {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-semibold block mb-1">Birth Weight (kg) *</label>
                                <input type="number" step="0.01" min="0.1" max="10" required
                                    value={form.birthWeight}
                                    onChange={e => setForm(p => ({ ...p, birthWeight: e.target.value }))}
                                    placeholder="e.g. 3.2"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" />
                            </div>

                            <Button type="submit" variant="primary" className="w-full py-3 text-lg font-bold" disabled={loading}>
                                {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : '🎉 Register Baby'}
                            </Button>
                        </form>

                        <button onClick={() => setStep('ask')} className="text-xs text-gray-400 hover:text-gray-600 w-full text-center">
                            Cancel
                        </button>
                    </GlassCard>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DeliveryConfirmation;
