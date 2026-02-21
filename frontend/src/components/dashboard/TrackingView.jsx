import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Droplets, Weight, Calendar, Footprints, Clock } from 'lucide-react';
import api from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import UpdatesSlider from './UpdatesSlider';
import { toast } from 'react-hot-toast';

const TrackingView = () => {
    const [range, setRange] = useState('daily'); // daily, weekly, monthly
    const [trackingData, setTrackingData] = useState([]);
    const [stats, setStats] = useState({ pregnancyWeek: 1, dueDate: null, progressPercentage: 0, daysRemaining: 0 });
    const [loading, setLoading] = useState(true);

    // Form for new log
    const [formData, setFormData] = useState({
        motherWeight: '',
        steps: '',
        distanceKm: '',
        waterIntakeLiters: '',
        symptoms: '',
        notes: ''
    });

    const [todayStats, setTodayStats] = useState({ totalSteps: 0, totalWater: 0, latestWeight: null });

    useEffect(() => {
        fetchTracking();
    }, [range]);

    const fetchTracking = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/dashboard/tracking?range=${range}`);
            // Handle new response structure { stats, data, today }
            if (res.data) {
                if (res.data.data) setTrackingData(res.data.data);
                if (res.data.stats) setStats(res.data.stats);
                if (res.data.today) setTodayStats(res.data.today);
            }
        } catch (error) {
            console.error("Fetch tracking failed", error);
            toast.error("Failed to load tracking data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()).filter(s => s) : []
            };
            await api.post('/dashboard/tracking', payload);
            toast.success("Tracking updated for today!");
            await fetchTracking(); // Wait for fetch
            setFormData(prev => ({ ...prev, motherWeight: '', steps: '', distanceKm: '', waterIntakeLiters: '', symptoms: '', notes: '' }));
        } catch (error) {
            toast.error("Update failed");
        }
    };

    // Prepare chart data based on range
    const chartData = trackingData.slice().reverse().map(d => {
        if (range === 'daily') {
            return {
                name: new Date(d.date || d.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                weight: d.motherWeight || null,
                steps: d.steps || 0,
                water: d.waterIntakeLiters || 0
            };
        } else {
            return {
                name: d.label || `Wk ${d._id}`,
                weight: d.avgWeight ? Number(d.avgWeight.toFixed(1)) : null,
                steps: d.totalSteps || 0,
                water: d.totalWater || 0
            };
        }
    });



    // prioritize "todayStats" for the cards if range is daily or generally?
    // User complaint was Daily tab cards not updating.
    // We should show Today's accumulated stats for Steps/Water, and Latest Weight.

    const latestLog = trackingData[0] || {};
    const displayWeight = todayStats.latestWeight || latestLog.motherWeight || '-';
    const displaySteps = todayStats.totalSteps || 0;
    const displayWater = todayStats.totalWater || 0;

    const statsCards = [
        { label: 'Pregnancy Week', value: `Week ${stats.pregnancyWeek}`, icon: <Calendar className="text-purple-500" />, sub: 'Current Stage' },
        { label: 'Mother Weight', value: displayWeight !== '-' ? `${displayWeight} kg` : '-', icon: <Weight className="text-indigo-500" />, sub: 'Tracked' },
        { label: 'Steps', value: displaySteps, icon: <Footprints className="text-orange-500" />, sub: 'Today' },
        { label: 'Water Intake', value: `${displayWater.toFixed(1)} L`, icon: <Droplets className="text-cyan-500" />, sub: 'Today' },
    ];

    return (
        <div className="space-y-6">
            {/* Progress Bar Section (New) */}
            {/* Progress Bar Section (Enhanced) */}
            <GlassCard className="p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <Clock size={20} className="text-primary-500" />
                        <span className="font-serif font-bold text-text-dark text-lg">Week {stats.pregnancyWeek} <span className="text-sm font-normal text-gray-500">of 40</span></span>
                    </div>
                    <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        {stats.daysRemaining} days to go
                    </span>
                </div>

                <div className="relative pt-2 pb-6">
                    {/* Bar Background */}
                    <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden relative shadow-inner">
                        {/* Trimester Sections for Background Color (Optional aesthetic) */}
                        <div className="absolute left-0 w-[30%] h-full bg-blue-50/50"></div>
                        <div className="absolute left-[30%] w-[35%] h-full bg-green-50/50"></div>
                        <div className="absolute left-[65%] w-[35%] h-full bg-pink-50/50"></div>

                        {/* Progress Fill */}
                        <div
                            className="h-full bg-gradient-to-r from-primary-300 to-primary-500 rounded-full transition-all duration-1000 ease-out relative shadow-md"
                            style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}
                        >
                            <div className="absolute top-0 right-0 bottom-0 w-full bg-white/20 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Markers */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        {/* Start */}
                        <div className="absolute left-0 top-7 -translate-x-1/2 flex flex-col items-center">
                            <div className="w-0.5 h-2 bg-gray-300 mb-1"></div>
                            <span className="text-[10px] text-gray-400 font-medium">0w</span>
                        </div>
                        {/* 12 Weeks */}
                        <div className="absolute left-[30%] top-7 -translate-x-1/2 flex flex-col items-center">
                            <div className="w-0.5 h-2 bg-gray-300 mb-1"></div>
                            <span className="text-[10px] text-gray-500 font-bold">12w</span>
                        </div>
                        {/* 26 Weeks */}
                        <div className="absolute left-[65%] top-7 -translate-x-1/2 flex flex-col items-center">
                            <div className="w-0.5 h-2 bg-gray-300 mb-1"></div>
                            <span className="text-[10px] text-gray-500 font-bold">26w</span>
                        </div>
                        {/* 40 Weeks */}
                        <div className="absolute right-0 top-7 translate-x-1/2 flex flex-col items-center">
                            <div className="w-0.5 h-2 bg-gray-300 mb-1"></div>
                            <span className="text-[10px] text-gray-400 font-medium">40w</span>
                        </div>
                    </div>

                    {/* Trimester Labels */}
                    <div className="flex justify-between mt-6 text-xs font-semibold text-gray-500 uppercase tracking-widest px-1">
                        <span className="text-blue-400">Trimester 1</span>
                        <span className="text-green-400">Trimester 2</span>
                        <span className="text-pink-400">Trimester 3</span>
                    </div>
                </div>
            </GlassCard>

            {/* Range Tabs */}
            <div className="flex justify-center space-x-4 bg-white/40 p-1 rounded-full w-fit mx-auto backdrop-blur-sm">
                {['daily', 'weekly', 'monthly'].map(r => (
                    <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 capitalize ${range === r
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'text-text-muted hover:text-primary-600'
                            }`}
                    >
                        {r}
                    </button>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statsCards.map((card, i) => (
                    <GlassCard key={i} className="p-4 flex flex-col items-center justify-center text-center space-y-2 hover:scale-105 transition-transform duration-300">
                        <div className="p-2 bg-white/60 rounded-full shadow-sm">
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-xs text-text-muted uppercase tracking-wider">{card.label}</p>
                            <p className="text-lg font-bold text-text-dark">{card.value}</p>
                            <p className="text-[10px] text-gray-400">{card.sub}</p>
                        </div>
                    </GlassCard>
                ))}
                <UpdatesSlider />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Form */}
                <GlassCard className="lg:col-span-1 p-6">
                    <h3 className="text-xl font-bold text-text-dark mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-primary-500" />
                        Log Today's Activity
                    </h3>
                    <p className="text-xs text-text-muted mb-4">Date and Week are recorded automatically.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-text-muted">Weight (kg)</label>
                                <input
                                    type="number" step="0.1"
                                    value={formData.motherWeight} onChange={e => setFormData({ ...formData, motherWeight: e.target.value })}
                                    className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 mt-1 focus:ring-1 focus:ring-primary-300"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">Water (L)</label>
                                <input
                                    type="number" step="0.1"
                                    value={formData.waterIntakeLiters} onChange={e => setFormData({ ...formData, waterIntakeLiters: e.target.value })}
                                    className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 mt-1 focus:ring-1 focus:ring-primary-300"
                                    placeholder="+ Add to total"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-text-muted">Steps</label>
                                <input
                                    type="number"
                                    value={formData.steps} onChange={e => setFormData({ ...formData, steps: e.target.value })}
                                    className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 mt-1 focus:ring-1 focus:ring-primary-300"
                                    placeholder="+ Add to total"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">Distance (km)</label>
                                <input
                                    type="number" step="0.1"
                                    value={formData.distanceKm} onChange={e => setFormData({ ...formData, distanceKm: e.target.value })}
                                    className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 mt-1 focus:ring-1 focus:ring-primary-300"
                                    placeholder="+ Add to total"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-text-muted">Symptoms</label>
                            <input
                                type="text" placeholder="Nausea, Headache..."
                                value={formData.symptoms} onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
                                className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 mt-1 focus:ring-1 focus:ring-primary-300"
                            />
                        </div>

                        <Button type="submit" variant="primary" className="w-full mt-2">Update Log</Button>
                    </form>
                </GlassCard>

                {/* Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard className="p-6 h-80 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-text-dark">Overview Trend</h3>
                            <span className="text-xs text-text-muted">{range} view</span>
                        </div>

                        {chartData.length > 0 ? (
                            <div className="w-full h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} connectNulls={false}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#9ca3af" />
                                        <YAxis yAxisId="left" fontSize={10} tickLine={false} axisLine={false} stroke="#9ca3af" domain={['auto', 'auto']} />
                                        <YAxis yAxisId="right" orientation="right" fontSize={10} tickLine={false} axisLine={false} stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area yAxisId="left" type="monotone" dataKey="weight" stroke="#ec4899" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={3} name="Weight (kg)" dot={{ r: 4 }} />
                                        <Area yAxisId="right" type="monotone" dataKey="steps" stroke="#f97316" fillOpacity={1} fill="url(#colorSteps)" strokeWidth={3} name="Steps" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-muted">
                                No data available for this range.
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default TrackingView;
