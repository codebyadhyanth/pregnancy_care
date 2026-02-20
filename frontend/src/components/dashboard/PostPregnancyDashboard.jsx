import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
    Baby, Weight, Calendar, Milk, Syringe, Star, BookOpen,
    ShoppingBag, Sparkles, ChevronLeft, Loader2, Plus, X,
    TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2,
    Clock, FileText, Heart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';

// ===== DISCLAIMER =====
const Disclaimer = () => (
    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-700 text-center">
        <AlertTriangle size={14} className="inline mr-1" />
        These are predictive and informational insights. For serious medical concerns, please consult a qualified gynecologist or pediatrician.
    </div>
);

// ===== WEIGHT CHART =====
const WeightChart = ({ babyId }) => {
    const [range, setRange] = useState('weekly');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formWeight, setFormWeight] = useState('');

    const fetchWeight = useCallback(async () => {
        try {
            const { data: d } = await api.get(`/baby/${babyId}/weight?range=${range}`);
            setData(d);
        } catch { /* silent */ } finally { setLoading(false); }
    }, [babyId, range]);

    useEffect(() => { fetchWeight(); }, [fetchWeight]);

    const handleLog = async (e) => {
        e.preventDefault();
        if (!formWeight) return;
        try {
            await api.post(`/baby/${babyId}/weight`, { weight: parseFloat(formWeight) });
            toast.success('Weight logged');
            setFormWeight('');
            fetchWeight();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const chartData = data?.rawLogs?.map(l => ({
        date: new Date(l.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        weight: l.weight,
    })) || [];

    const trendIcon = data?.trend === 'gaining' ? <TrendingUp size={16} className="text-emerald-500" /> :
        data?.trend === 'losing' ? <TrendingDown size={16} className="text-red-500" /> :
            <Minus size={16} className="text-gray-400" />;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-dark flex items-center gap-2"><Weight size={20} className="text-blue-500" /> Weight Tracking</h3>
                <div className="flex gap-2">{['weekly', 'monthly'].map(r => (
                    <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${range === r ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{r}</button>
                ))}</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-blue-500 font-semibold uppercase">Birth Weight</p>
                    <p className="text-lg font-bold text-blue-700">{data?.birthWeight || '-'} kg</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-emerald-500 font-semibold uppercase">Current</p>
                    <p className="text-lg font-bold text-emerald-700">{data?.latestWeight || '-'} kg</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-purple-500 font-semibold uppercase">Age</p>
                    <p className="text-lg font-bold text-purple-700">{data?.ageWeeks || 0} weeks</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Trend</p>
                    <div className="flex items-center justify-center gap-1 text-sm font-bold capitalize">{trendIcon} {data?.trend || 'N/A'}</div>
                </div>
            </div>

            {data?.warning && (
                <div className={`p-3 rounded-2xl text-sm font-semibold flex items-center gap-2 ${data.warning === 'underweight' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                    <AlertTriangle size={16} /> Baby may be {data.warning}. Consult pediatrician.
                </div>
            )}

            {chartData.length > 0 && (
                <GlassCard className="p-4 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs><linearGradient id="bwFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="date" fontSize={10} tickLine={false} />
                            <YAxis fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                            <Tooltip />
                            <Area type="monotone" dataKey="weight" stroke="#3b82f6" fill="url(#bwFill)" strokeWidth={2} dot={{ r: 3 }} name="Weight (kg)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>
            )}

            <form onSubmit={handleLog} className="flex gap-2">
                <input type="number" step="0.01" placeholder="Weight (kg)" value={formWeight} onChange={e => setFormWeight(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                <Button type="submit" variant="primary" className="px-5">Log</Button>
            </form>
        </div>
    );
};

// ===== BREASTFEEDING TRACKER =====
const BreastfeedingTracker = ({ babyId }) => {
    const [logs, setLogs] = useState([]);
    const [range, setRange] = useState('daily');
    const [todayLog, setTodayLog] = useState({ morning: false, afternoon: false, evening: false, notes: '' });

    const fetchLogs = useCallback(async () => {
        try {
            const { data } = await api.get(`/baby/${babyId}/breastfeeding?range=${range}`);
            setLogs(data);
        } catch { /* silent */ }
    }, [babyId, range]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const handleSave = async () => {
        try {
            await api.post(`/baby/${babyId}/breastfeeding`, todayLog);
            toast.success('Feeding log saved');
            fetchLogs();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    // Compute summary stats for calendar view
    const totalSessions = logs.reduce((acc, log) => acc + (log.morning ? 1 : 0) + (log.afternoon ? 1 : 0) + (log.evening ? 1 : 0), 0);
    const completeDays = logs.filter(log => log.morning && log.afternoon && log.evening).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-dark flex items-center gap-2"><Milk size={20} className="text-pink-500" /> Breastfeeding Tracker</h3>
                <div className="flex gap-2">{['daily', 'weekly', 'monthly'].map(r => (
                    <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${range === r ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{r}</button>
                ))}</div>
            </div>

            <GlassCard className="p-5">
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Today's Log</h4>
                <div className="grid grid-cols-3 gap-3 mb-3">
                    {['morning', 'afternoon', 'evening'].map(slot => (
                        <button key={slot} onClick={() => setTodayLog(p => ({ ...p, [slot]: !p[slot] }))}
                            className={`p-3 rounded-2xl text-sm font-semibold capitalize text-center transition-all ${todayLog[slot] ? 'bg-pink-100 text-pink-700 border-2 border-pink-300' : 'bg-gray-50 text-gray-400 border-2 border-transparent'}`}>
                            {slot === 'morning' ? '🌅' : slot === 'afternoon' ? '☀️' : '🌙'} {slot}
                        </button>
                    ))}
                </div>
                <input type="text" placeholder="Notes (optional)" value={todayLog.notes} onChange={e => setTodayLog(p => ({ ...p, notes: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-pink-200" />
                <Button variant="primary" className="w-full" onClick={handleSave}>Save Feeding Log</Button>
            </GlassCard>

            {/* Summary Stats Banner */}
            {logs.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-pink-50 rounded-2xl p-3 text-center">
                        <p className="text-[10px] text-pink-500 font-semibold uppercase">Total Sessions</p>
                        <p className="text-lg font-bold text-pink-700">{totalSessions}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-3 text-center">
                        <p className="text-[10px] text-emerald-500 font-semibold uppercase">Complete Days</p>
                        <p className="text-lg font-bold text-emerald-700">{completeDays}</p>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-3 text-center">
                        <p className="text-[10px] text-purple-500 font-semibold uppercase">Days Logged</p>
                        <p className="text-lg font-bold text-purple-700">{logs.length}</p>
                    </div>
                </div>
            )}

            {/* Calendar-style Grid for weekly/monthly views */}
            {(range === 'weekly' || range === 'monthly') && logs.length > 0 && (
                <GlassCard className="p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-600">{range === 'weekly' ? 'This Week' : 'This Month'} – Feeding Calendar</h4>
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                            <span key={d} className="text-[10px] text-gray-400 font-semibold">{d}</span>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                        {logs.map((log, i) => {
                            const sessions = (log.morning ? 1 : 0) + (log.afternoon ? 1 : 0) + (log.evening ? 1 : 0);
                            const bg = sessions === 3 ? 'bg-emerald-100 border-emerald-300' : sessions >= 1 ? 'bg-pink-50 border-pink-200' : 'bg-gray-50 border-gray-100';
                            return (
                                <div key={log._id || i} className={`p-2 rounded-xl border text-center ${bg}`} title={`${new Date(log.date).toLocaleDateString()}: ${sessions}/3 sessions`}>
                                    <p className="text-[10px] text-gray-500">{new Date(log.date).getDate()}</p>
                                    <p className="text-xs font-bold">{sessions === 3 ? '✅' : sessions > 0 ? `${sessions}/3` : '—'}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> All 3 sessions</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-pink-50 border border-pink-200" /> Partial</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-50 border border-gray-100" /> None</span>
                    </div>
                </GlassCard>
            )}

            {/* Recent Log List for daily view */}
            {range === 'daily' && logs.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-600">Recent Logs</h4>
                    {logs.slice(0, 10).map((log, i) => (
                        <div key={log._id || i} className="flex items-center gap-3 bg-white/70 rounded-2xl px-4 py-3 border border-gray-100">
                            <span className="text-xs text-gray-400">{new Date(log.date).toLocaleDateString()}</span>
                            <div className="flex gap-2">
                                {log.morning && <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">🌅 Morning</span>}
                                {log.afternoon && <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">☀️ Afternoon</span>}
                                {log.evening && <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">🌙 Evening</span>}
                            </div>
                            {log.notes && <span className="text-xs text-gray-400 ml-auto">{log.notes}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ===== VACCINATIONS =====
const VaccinationTracker = ({ babyId }) => {
    const [vaccinations, setVaccinations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        try {
            const { data } = await api.get(`/baby/${babyId}/vaccinations`);
            setVaccinations(data);
        } catch { /* silent */ } finally { setLoading(false); }
    }, [babyId]);

    useEffect(() => { fetch(); }, [fetch]);

    const markComplete = async (vaccinationId) => {
        try {
            await api.put(`/baby/${babyId}/vaccinations/${vaccinationId}`, { status: 'completed' });
            toast.success('Vaccination marked complete');
            fetch();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const statusColor = (s) => s === 'completed' ? 'bg-emerald-100 text-emerald-700' : s === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500';

    if (loading) return <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary-start" /></div>;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-dark flex items-center gap-2"><Syringe size={20} className="text-emerald-500" /> Vaccination Schedule</h3>
            <div className="space-y-2">
                {vaccinations.map(v => (
                    <div key={v._id} className={`flex items-center justify-between p-4 rounded-2xl border ${v.status === 'overdue' ? 'border-red-200 bg-red-50/50' : v.status === 'completed' ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-100 bg-white/70'}`}>
                        <div className="flex-1">
                            <p className="font-semibold text-text-dark text-sm">{v.vaccineName}</p>
                            <p className="text-xs text-gray-400">{v.description}</p>
                            <p className="text-xs text-gray-400 mt-1">Due: {new Date(v.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor(v.status)}`}>{v.status}</span>
                            {v.status !== 'completed' && (
                                <button onClick={() => markComplete(v._id)} className="text-emerald-500 hover:text-emerald-700 transition-colors">
                                    <CheckCircle2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <Disclaimer />
        </div>
    );
};

// ===== MONTHLY SUMMARY =====
const MonthlySummary = ({ babyId }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/baby/${babyId}/monthly-summary`);
            setSummary(data);
        } catch { toast.error('Failed to generate summary'); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-dark flex items-center gap-2"><FileText size={20} className="text-purple-500" /> Monthly Summary</h3>
            {!summary ? (
                <Button variant="primary" onClick={generate} disabled={loading} className="w-full">
                    {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : '✨ Generate AI Summary'}
                </Button>
            ) : (
                <div className="space-y-3">
                    {[
                        { key: 'growthSummary', label: 'Growth', color: 'blue' },
                        { key: 'feedingSummary', label: 'Feeding', color: 'pink' },
                        { key: 'vaccinationStatus', label: 'Vaccinations', color: 'emerald' },
                    ].map(({ key, label, color }) => summary[key] && (
                        <div key={key} className={`p-4 rounded-2xl bg-${color}-50 border border-${color}-200`}>
                            <h4 className={`text-xs font-bold uppercase text-${color}-700 mb-1`}>{label}</h4>
                            <p className="text-sm text-gray-700">{summary[key]}</p>
                        </div>
                    ))}
                    {summary.suggestions?.length > 0 && (
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                            <h4 className="text-xs font-bold uppercase text-amber-700 mb-2">Suggestions</h4>
                            <ul className="space-y-1">{summary.suggestions.map((s, i) => (
                                <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>{s}</li>
                            ))}</ul>
                        </div>
                    )}
                </div>
            )}
            <Disclaimer />
        </div>
    );
};

// ===== BABY MASSAGE TECHNIQUES =====
const MASSAGE_DATA = [
    { name: "Gentle Tummy Massage", ageRange: "0-3 months", technique: "Place baby on back. Use warm oil. Make gentle clockwise circles on the tummy with fingertips. 2-3 minutes.", video: "https://www.youtube.com/results?search_query=baby+tummy+massage+newborn" },
    { name: "Leg Cycling", ageRange: "0-6 months", technique: "Hold baby's legs gently and move them in a cycling motion. Helps with gas and digestion. 1-2 minutes per leg.", video: "https://www.youtube.com/results?search_query=baby+leg+cycling+massage" },
    { name: "Back Stroke Massage", ageRange: "1-6 months", technique: "Place baby on tummy. Using flat palms, gently stroke from shoulders to buttocks. Use warm coconut/mustard oil.", video: "https://www.youtube.com/results?search_query=baby+back+massage+technique" },
    { name: "Arm and Hand Massage", ageRange: "0-6 months", technique: "Gently hold baby's arm, stroke from shoulder to wrist. Roll each finger gently. Use light pressure.", video: "https://www.youtube.com/results?search_query=baby+arm+hand+massage" },
    { name: "Full Body Oil Massage (Malish)", ageRange: "0-12 months", technique: "Traditional Indian baby massage. Use warm mustard/coconut oil. Long strokes on limbs, circular on joints. Best before bath.", video: "https://www.youtube.com/results?search_query=indian+baby+malish+oil+massage" },
    { name: "Foot Reflexology for Babies", ageRange: "3-12 months", technique: "Gently press and massage the soles of baby's feet. Each area corresponds to body parts. Light pressure only.", video: "https://www.youtube.com/results?search_query=baby+foot+reflexology+massage" },
    { name: "Colic Relief Massage", ageRange: "0-6 months", technique: "I-L-U technique: Stroke down left side (I), across and down (L), full U shape from right to left on tummy.", video: "https://www.youtube.com/results?search_query=baby+colic+relief+massage+ILU" },
    { name: "Face and Head Massage", ageRange: "0-12 months", technique: "Gentle circles on temples. Light strokes across forehead. Soft pressure behind ears. Avoid fontanelle area.", video: "https://www.youtube.com/results?search_query=baby+face+head+massage+safe" },
];

const BabyMassagePage = () => {
    const [ageFilter, setAgeFilter] = useState('all');
    const filters = ['all', '0-3 months', '0-6 months', '1-6 months', '3-12 months', '0-12 months'];

    const filtered = ageFilter === 'all' ? MASSAGE_DATA : MASSAGE_DATA.filter(m => m.ageRange === ageFilter);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-dark flex items-center gap-2"><BookOpen size={20} className="text-orange-500" /> Baby Massage Techniques</h3>
            <div className="flex flex-wrap gap-2">
                {filters.map(f => (
                    <button key={f} onClick={() => setAgeFilter(f)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${ageFilter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{f}</button>
                ))}
            </div>
            <div className="space-y-3">
                {filtered.map((m, i) => (
                    <GlassCard key={i} className="p-4 space-y-2 border border-orange-50">
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-text-dark text-sm">{m.name}</h4>
                            <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{m.ageRange}</span>
                        </div>
                        <p className="text-xs text-gray-600">{m.technique}</p>
                        <a href={m.video} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-semibold">▶ Watch Video</a>
                    </GlassCard>
                ))}
            </div>
            <Disclaimer />
        </div>
    );
};

// ===== BABY PRODUCTS =====
const BABY_PRODUCTS = [
    { name: "Pampers Premium Diapers (NB)", category: "Diapers", week: "0-4", price: "₹599", discount: "15% OFF", tip: "Extra absorbent for newborns" },
    { name: "MeeMee Soft Cotton Onesies (Pack of 3)", category: "Clothing", week: "0-4", price: "₹499", discount: "20% OFF", tip: "100% cotton, skin-friendly" },
    { name: "Himalaya Baby Lotion", category: "Hygiene", week: "0-8", price: "₹199", discount: null, tip: "Gentle moisturizer for baby skin" },
    { name: "Pigeon Feeding Bottle 120ml", category: "Feeding", week: "0-12", price: "₹349", discount: "10% OFF", tip: "Anti-colic, BPA free" },
    { name: "Johnson's Baby Shampoo 200ml", category: "Hygiene", week: "0-12", price: "₹175", discount: null, tip: "No more tears formula" },
    { name: "Mom & World Baby Wipes (72 pcs)", category: "Hygiene", week: "0-12", price: "₹249", discount: "25% OFF", tip: "Alcohol-free, gentle on skin" },
    { name: "Chicco Baby Nail Clipper", category: "Hygiene", week: "4-12", price: "₹299", discount: null, tip: "Rounded tips for safety" },
    { name: "LuvLap Muslin Swaddle (Pack of 2)", category: "Clothing", week: "0-8", price: "₹599", discount: "15% OFF", tip: "Breathable, soft muslin cotton" },
    { name: "Huggies Wonder Pants (S)", category: "Diapers", week: "4-16", price: "₹649", discount: "10% OFF", tip: "Easy pull-up design" },
    { name: "Morisons Baby Dreams Rattle Set", category: "Feeding", week: "8-24", price: "₹299", discount: null, tip: "BPA-free, colorful rattles" },
    { name: "Bumtum Baby Mattress Protector", category: "Hygiene", week: "0-24", price: "₹449", discount: "20% OFF", tip: "Waterproof, washable" },
    { name: "Avent Natural Feeding Bottle 260ml", category: "Feeding", week: "8-24", price: "₹699", discount: "5% OFF", tip: "Natural latch-on design" },
];

const BabyProductsPage = () => {
    const [catFilter, setCatFilter] = useState('all');
    const categories = ['all', 'Diapers', 'Clothing', 'Hygiene', 'Feeding'];
    const filtered = catFilter === 'all' ? BABY_PRODUCTS : BABY_PRODUCTS.filter(p => p.category === catFilter);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-dark flex items-center gap-2"><ShoppingBag size={20} className="text-teal-500" /> Baby Products</h3>
            <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                    <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${catFilter === c ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{c}</button>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((p, i) => (
                    <GlassCard key={i} className="p-4 space-y-2 border border-teal-50 relative">
                        {p.discount && <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{p.discount}</span>}
                        <span className="text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">{p.category}</span>
                        <h4 className="font-semibold text-text-dark text-sm">{p.name}</h4>
                        <p className="text-xs text-gray-500">{p.tip}</p>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-teal-700">{p.price}</span>
                            <span className="text-[10px] text-gray-400">Week {p.week}</span>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

// ===== KUNDALI + NAME GENERATOR =====
const KundaliNameGenerator = ({ babyId }) => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const { data } = await api.post(`/baby/${babyId}/kundali`);
            setResult(data);
        } catch { toast.error('Failed to generate'); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-dark flex items-center gap-2"><Sparkles size={20} className="text-indigo-500" /> Baby Name Generator</h3>
            {!result ? (
                <GlassCard className="p-6 text-center space-y-4">
                    <p className="text-sm text-gray-600">Generate Kundali-based name suggestions using AI astrology analysis of your baby's birth details.</p>
                    <Button variant="primary" onClick={generate} disabled={loading} className="mx-auto">
                        {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : '🌟 Generate Kundali & Names'}
                    </Button>
                </GlassCard>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                            <p className="text-[10px] text-indigo-500 font-bold uppercase">Nakshatra</p>
                            <p className="text-lg font-bold text-indigo-700">{result.nakshatra || 'N/A'}</p>
                        </div>
                        <div className="bg-purple-50 rounded-2xl p-4 text-center">
                            <p className="text-[10px] text-purple-500 font-bold uppercase">Rashi</p>
                            <p className="text-lg font-bold text-purple-700">{result.rashi || 'N/A'}</p>
                        </div>
                        <div className="bg-pink-50 rounded-2xl p-4 text-center col-span-2 md:col-span-1">
                            <p className="text-[10px] text-pink-500 font-bold uppercase">Recommended Letters</p>
                            <p className="text-lg font-bold text-pink-700">{result.recommended_letters?.join(', ') || 'N/A'}</p>
                        </div>
                    </div>

                    {result.kundaliSummary && <p className="text-sm text-gray-600 bg-indigo-50 p-3 rounded-2xl">{result.kundaliSummary}</p>}

                    {result.names?.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-3">Suggested Names</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {result.names.map((n, i) => (
                                    <GlassCard key={i} className="p-4 border border-indigo-50">
                                        <div className="flex justify-between items-start">
                                            <h5 className="font-bold text-text-dark">{n.name}</h5>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${n.style === 'Modern' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{n.style}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{n.meaning}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Origin: {n.origin}</p>
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button variant="primary" onClick={generate} disabled={loading} className="w-full">
                        {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : '🔄 Regenerate'}
                    </Button>
                </div>
            )}
            <Disclaimer />
        </div>
    );
};

// ===== MOM SECTION =====
const MomPostpartum = ({ babyId }) => {
    const [advice, setAdvice] = useState(null);
    const [loading, setLoading] = useState(false);

    const getAdvice = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/ai/advice', {
                query: 'Give me postpartum recovery tips, nutrition suggestions, and appointment reminders for a new mother.',
                responseMode: 'curated',
            });
            setAdvice(data);
        } catch { toast.error('Failed to get advice'); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-dark flex items-center gap-2"><Star size={20} className="text-pink-500" /> Mom's Care</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="p-5 border border-pink-50 space-y-3">
                    <h4 className="font-semibold text-text-dark text-sm">🩺 Postpartum Recovery Tips</h4>
                    <ul className="text-xs text-gray-600 space-y-2">
                        <li>• Rest as much as possible – sleep when the baby sleeps</li>
                        <li>• Stay hydrated – drink at least 3L water daily</li>
                        <li>• Eat iron-rich foods (green leafy vegetables, jaggery, dates)</li>
                        <li>• Gentle walks after 2 weeks (consult doctor first)</li>
                        <li>• Kegel exercises to strengthen pelvic floor</li>
                        <li>• Monitor for any signs of postpartum depression</li>
                    </ul>
                </GlassCard>
                <GlassCard className="p-5 border border-purple-50 space-y-3">
                    <h4 className="font-semibold text-text-dark text-sm">🥗 Nutrition Suggestions</h4>
                    <ul className="text-xs text-gray-600 space-y-2">
                        <li>• Dal, rice, ghee – traditional Indian postpartum diet</li>
                        <li>• Methi (fenugreek) seeds for milk production</li>
                        <li>• Dry fruits: almonds, walnuts, cashews for energy</li>
                        <li>• Gond (edible gum) laddoos for recovery</li>
                        <li>• Ajwain water for digestion</li>
                        <li>• Panjeeri/Panjiri – traditional energy supplement</li>
                    </ul>
                </GlassCard>
            </div>

            {!advice ? (
                <Button variant="primary" onClick={getAdvice} disabled={loading} className="w-full">
                    {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : '🌸 Get Personalized AI Advice'}
                </Button>
            ) : (
                <GlassCard className="p-5 border border-pink-50 space-y-3">
                    <h4 className="font-semibold text-text-dark text-sm">AI Personalized Advice</h4>
                    {advice.summary && <p className="text-sm text-gray-700">{advice.summary}</p>}
                    {advice.analysis && <p className="text-sm text-gray-700">{advice.analysis}</p>}
                    {advice.recommendations?.length > 0 && (
                        <ul className="text-xs text-gray-600 space-y-1">
                            {advice.recommendations.map((r, i) => <li key={i}>• {r}</li>)}
                        </ul>
                    )}
                </GlassCard>
            )}
            <Disclaimer />
        </div>
    );
};

import PostpartumCareGuide from './postpartum/PostpartumCareGuide';

// ===== MAIN POST-PREGNANCY DASHBOARD =====
const BABY_TABS = [
    { id: 'weight', label: 'Weight', icon: <Weight size={18} /> },
    { id: 'feeding', label: 'Feeding', icon: <Milk size={18} /> },
    { id: 'vaccinations', label: 'Vaccines', icon: <Syringe size={18} /> },
    { id: 'summary', label: 'Summary', icon: <FileText size={18} /> },
    { id: 'massage', label: 'Massage', icon: <BookOpen size={18} /> },
    { id: 'products', label: 'Products', icon: <ShoppingBag size={18} /> },
    { id: 'names', label: 'Names', icon: <Sparkles size={18} /> },
];

const MOM_TABS = [
    { id: 'care', label: 'Mom Care', icon: <Star size={18} /> },
    { id: 'postpartum', label: 'Postpartum Guide', icon: <Heart size={18} /> },
];

const PostPregnancyDashboard = ({ onBack }) => {
    const [babies, setBabies] = useState([]);
    const [activeBabyId, setActiveBabyId] = useState(null);
    const [section, setSection] = useState('baby'); // 'baby' | 'mom'
    const [activeTab, setActiveTab] = useState('weight');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBabies = async () => {
            try {
                const { data } = await api.get('/baby');
                setBabies(data);
                if (data.length > 0) setActiveBabyId(data[0]._id);
            } catch { /* silent */ } finally { setLoading(false); }
        };
        fetchBabies();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-primary-start" /></div>;
    }

    if (!activeBabyId || babies.length === 0) {
        return (
            <div className="text-center py-16">
                <Baby size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-500">No baby records found</p>
                <p className="text-sm text-gray-400">Please confirm delivery first.</p>
                <Button variant="primary" className="mt-4" onClick={onBack}>Go Back</Button>
            </div>
        );
    }

    const activeBaby = babies.find(b => b._id === activeBabyId);
    const tabs = section === 'baby' ? BABY_TABS : MOM_TABS;

    const renderContent = () => {
        if (section === 'mom') {
            switch (activeTab) {
                case 'care': return <MomPostpartum babyId={activeBabyId} />;
                case 'postpartum': return <PostpartumCareGuide />;
                default: return <MomPostpartum babyId={activeBabyId} />;
            }
        }
        switch (activeTab) {
            case 'weight': return <WeightChart babyId={activeBabyId} />;
            case 'feeding': return <BreastfeedingTracker babyId={activeBabyId} />;
            case 'vaccinations': return <VaccinationTracker babyId={activeBabyId} />;
            case 'summary': return <MonthlySummary babyId={activeBabyId} />;
            case 'massage': return <BabyMassagePage />;
            case 'products': return <BabyProductsPage />;
            case 'names': return <KundaliNameGenerator babyId={activeBabyId} />;
            default: return <WeightChart babyId={activeBabyId} />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Baby Info Header */}
            <GlassCard className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-2xl shadow-lg">
                        {activeBaby?.gender === 'male' ? '👶🏻' : '👶🏻'}
                    </div>
                    <div>
                        <h2 className="font-bold text-text-dark">{activeBaby?.name || 'Baby'}</h2>
                        <p className="text-xs text-gray-400">Born: {new Date(activeBaby?.dob).toLocaleDateString()} · {activeBaby?.birthWeight} kg · {activeBaby?.gender}</p>
                    </div>
                </div>
                {babies.length > 1 && (
                    <select value={activeBabyId} onChange={e => setActiveBabyId(e.target.value)}
                        className="text-xs bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                        {babies.map(b => <option key={b._id} value={b._id}>{b.name || `Baby (${new Date(b.dob).toLocaleDateString()})`}</option>)}
                    </select>
                )}
            </GlassCard>

            {/* Section Toggle: Mom / Baby */}
            <div className="flex justify-center gap-2 bg-white/60 rounded-2xl p-1.5 w-fit mx-auto shadow-sm">
                {['baby', 'mom'].map(s => (
                    <button key={s} onClick={() => { setSection(s); if (s === 'baby') setActiveTab('weight'); else setActiveTab('care'); }}
                        className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${section === s ? 'bg-gradient-to-r from-primary-start to-primary-end text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        {s === 'baby' ? '🍼 Baby' : '👩 Mom'}
                    </button>
                ))}
            </div>

            {/* Sub-tabs */}
            <div className="flex flex-wrap justify-center gap-2">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === t.id ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default PostPregnancyDashboard;
