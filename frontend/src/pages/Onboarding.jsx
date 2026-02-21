import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, HeartPulse, Baby, Activity, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        age: '',
        height: '',
        weight: '',
        pregnancyStartDate: '', // New field instead of manual week
        // pregnancyWeek: '', // Calculated on backend (and previewed here)
        trimester: 'First', // Can be derived or manual override? Let's auto-derive for preview but keep in state if needed
        previousPregnancies: 0,
        medicalConditions: [],
        allergies: [],
        dietaryPreference: 'veg',
        activityLevel: 'moderate',
        bloodPressureHistory: 'Normal',
        diabetesHistory: false,
        medicationsCurrentlyTaking: [],
        doctorNotes: ''
    });

    const [calculatedStats, setCalculatedStats] = useState({ week: 0, dueDate: null });

    const totalSteps = 5;

    useEffect(() => {
        if (formData.pregnancyStartDate) {
            const startStr = formData.pregnancyStartDate; // YYYY-MM-DD
            if (startStr) {
                const start = new Date(startStr);
                const now = new Date();
                const diffTime = Math.abs(now - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const week = Math.floor(diffDays / 7) || 1;

                const due = new Date(start);
                due.setDate(due.getDate() + 280); // +40 weeks

                setCalculatedStats({ week, dueDate: due });
            }
        }
    }, [formData.pregnancyStartDate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleArrayToggle = (field, value) => {
        const current = formData[field];
        if (current.includes(value)) {
            setFormData({ ...formData, [field]: current.filter(item => item !== value) });
        } else {
            setFormData({ ...formData, [field]: [...current, value] });
        }
    };

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        // Age validation: must be between 20 and 40 years
        if (formData.age !== '') {
            const ageNum = Number(formData.age);
            if (Number.isNaN(ageNum) || ageNum < 20 || ageNum > 40) {
                toast.error("Age must be between 20 and 40 years");
                return;
            }
        }

        try {
            await api.post('/dashboard/onboarding', formData);
            toast.success("Welcome to your dashboard!");
            navigate('/dashboard');
        } catch (error) {
            console.error("Onboarding failed", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <Activity className="text-primary-500" />
                            <h2 className="text-2xl font-serif font-bold text-text-dark">Vital Stats</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Age</label>
                                <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full bg-white/50 border border-primary-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-300" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Weight (kg)</label>
                                <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full bg-white/50 border border-primary-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-300" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Height (cm)</label>
                                <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-full bg-white/50 border border-primary-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-300" />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <Baby className="text-secondary-500" />
                            <h2 className="text-2xl font-serif font-bold text-text-dark">Pregnancy Details</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">
                                <Calendar size={14} className="inline mr-1 text-primary-500" />
                                Last Period Date (LMP) or Conception Date
                            </label>
                            <input
                                type="date"
                                name="pregnancyStartDate"
                                value={formData.pregnancyStartDate}
                                onChange={handleInputChange}
                                className="w-full bg-white/50 border border-primary-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary-300"
                            />
                            {formData.pregnancyStartDate && (
                                <div className="mt-3 bg-purple-50 p-3 rounded-lg border border-purple-100 animate-fade-in">
                                    <p className="text-sm font-semibold text-purple-700">Estimated Current Week: <span className="text-lg">{calculatedStats.week}</span></p>
                                    <p className="text-xs text-purple-600 mt-1">
                                        Estimated Due Date: {calculatedStats.dueDate?.toLocaleDateString()}
                                    </p>
                                    <div className="w-full bg-purple-200 h-1.5 rounded-full mt-2">
                                        <div
                                            className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((calculatedStats.week / 40) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-right text-purple-400 mt-1">{40 - calculatedStats.week} weeks to go</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Previous Pregnancies</label>
                            <input type="number" name="previousPregnancies" value={formData.previousPregnancies} onChange={handleInputChange} className="w-full bg-white/50 border border-primary-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-300" />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <HeartPulse className="text-red-500" />
                            <h2 className="text-2xl font-serif font-bold text-text-dark">Medical History</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Conditions</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Diabetes', 'Hypertension', 'Thyroid', 'PCOS', 'Asthma'].map(c => (
                                    <div key={c} onClick={() => handleArrayToggle('medicalConditions', c)} className={`cursor-pointer px-3 py-2 rounded border flex items-center justify-between transition-colors ${formData.medicalConditions.includes(c) ? 'bg-primary-100 border-primary-500 text-primary-800' : 'bg-white/50 border-gray-200'}`}>
                                        <span className="text-sm">{c}</span>
                                        {formData.medicalConditions.includes(c) && <Check size={14} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="diabetesHistory" checked={formData.diabetesHistory} onChange={handleInputChange} className="rounded text-primary-500 focus:ring-primary-500" />
                                <span className="text-sm text-text-dark">Family History of Diabetes?</span>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mt-2 mb-1">Blood Pressure History</label>
                            <select name="bloodPressureHistory" value={formData.bloodPressureHistory} onChange={handleInputChange} className="w-full bg-white/50 border border-primary-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-300">
                                <option>Normal</option>
                                <option>High (Hypertension)</option>
                                <option>Low (Hypotension)</option>
                                <option>Fluctuating</option>
                            </select>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <AlertTriangle className="text-orange-500" />
                            <h2 className="text-2xl font-serif font-bold text-text-dark">Allergies & Meds</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Common Allergies</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Peanuts', 'Dairy', 'Gluten', 'Penicillin', 'Dust', 'Pollen'].map(a => (
                                    <div key={a} onClick={() => handleArrayToggle('allergies', a)} className={`cursor-pointer px-3 py-2 rounded border flex items-center justify-between transition-colors ${formData.allergies.includes(a) ? 'bg-orange-100 border-orange-400 text-orange-800' : 'bg-white/50 border-gray-200'}`}>
                                        <span className="text-sm">{a}</span>
                                        {formData.allergies.includes(a) && <Check size={14} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mt-2 mb-1">Current Medications (Comma separated)</label>
                            <textarea
                                value={formData.medicationsCurrentlyTaking.join(', ')}
                                onChange={(e) => setFormData({ ...formData, medicationsCurrentlyTaking: e.target.value.split(',').map(s => s.trim()) })}
                                className="w-full bg-white/50 border border-primary-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-300 h-20 resize-none"
                            />
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <FileText className="text-blue-500" />
                            <h2 className="text-2xl font-serif font-bold text-text-dark">Lifestyle & Notes</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Dietary Preference</label>
                            <select name="dietaryPreference" value={formData.dietaryPreference} onChange={handleInputChange} className="w-full bg-white/50 border border-primary-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-300">
                                <option value="veg">Vegetarian</option>
                                <option value="non-veg">Non-Vegetarian</option>
                                <option value="vegan">Vegan</option>
                                <option value="gluten-free">Gluten-Free</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Activity Level</label>
                            <select name="activityLevel" value={formData.activityLevel} onChange={handleInputChange} className="w-full bg-white/50 border border-primary-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-300">
                                <option value="sedentary">Sedentary</option>
                                <option value="moderate">Moderate</option>
                                <option value="active">Active</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mt-2 mb-1">Additional Notes (Doctor's advice etc.)</label>
                            <textarea name="doctorNotes" value={formData.doctorNotes} onChange={handleInputChange} className="w-full bg-white/50 border border-primary-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-300 h-24 resize-none" />
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-10 flex items-center justify-center bg-gradient-to-br from-background-soft to-primary-50 px-4">
            <GlassCard className="w-full max-w-lg p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1 bg-primary-100 w-full">
                    <motion.div className="h-full bg-primary-500" initial={{ width: 0 }} animate={{ width: `${(step / totalSteps) * 100}%` }} />
                </div>
                <div className="mb-8 mt-4">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-primary-100">
                    <Button variant="ghost" onClick={prevStep} disabled={step === 1} className={step === 1 ? 'invisible' : ''}><ChevronLeft size={20} className="mr-1" /> Back</Button>
                    {step < totalSteps ? (
                        <Button variant="primary" onClick={nextStep}>Next <ChevronRight size={20} className="ml-1" /></Button>
                    ) : (
                        <Button variant="primary" onClick={handleSubmit}>Complete Setup</Button>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default Onboarding;
