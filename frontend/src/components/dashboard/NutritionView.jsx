import { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';
import { Apple, Sparkles, Droplets, Flame, Plus, Check } from 'lucide-react';

const NutritionView = () => {
    const [data, setData] = useState({
        log: { items: [], totals: {} },
        summary: { totals: {}, waterIntake: 0, goals: {} }
    });
    const [suggestions, setSuggestions] = useState({ suggestions: [], fruits: [] });
    const [foodEntry, setFoodEntry] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    useEffect(() => {
        fetchLogs();
        fetchSuggestions();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/dashboard/nutrition');
            setData(res.data);
        } catch (error) {
            console.error("Fetch nutrition failed", error);
        }
    };

    const fetchSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            const res = await api.post('/dashboard/nutrition/suggestions', {
                trimester: "2", // Should be dynamic from user profile
                region: "India"
            });
            setSuggestions(res.data);
        } catch (error) {
            console.error("Fetch suggestions failed", error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleLog = async (e, item = null) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const payload = item
                ? { isSuggestion: true, suggestionItem: item }
                : { foodEntry };

            await api.post('/dashboard/nutrition', payload);
            await fetchLogs();
            if (!item) setFoodEntry('');
            toast.success(item ? `Logged ${item.name}!` : "Food logged & analyzed!");
        } catch (error) {
            toast.error("Failed to log food");
        } finally {
            setLoading(false);
        }
    };

    const handleFruitClick = async (fruitName) => {
        // Mock macros for fruit as we don't analyzed them in real-time here for simplicity
        // or we can just send the name to the backend to analyze and add.
        // Let's treat it as a quick add.
        const mockFruitItem = {
            name: fruitName,
            calories: 60, protein: 1, carbs: 15, fats: 0.5, iron: 0.2, calcium: 10
        };
        handleLog(null, mockFruitItem);
    };

    const { summary, log } = data;
    const totals = summary?.totals || {};
    const goals = summary?.goals || { calories: 2200, protein: 75, water: 3 };
    const items = log?.items || [];

    // Helpers for progress
    const getProgress = (current, target) => Math.min((current / target) * 100, 100);
    const getStatusColor = (current, target) => current >= target ? "bg-green-500" : "bg-primary-500";

    return (
        <div className="space-y-6">

            {/* Daily Required Progress */}
            <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-text-dark mb-4">Today You Need</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {/* Calories */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-text-muted">Calories</span>
                            <span className="font-bold">{Math.round(totals.calories || 0)} / {goals.calories}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${getStatusColor(totals.calories || 0, goals.calories)} transition-all duration-500`} style={{ width: `${getProgress(totals.calories || 0, goals.calories)}%` }}></div>
                        </div>
                    </div>
                    {/* Protein */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-text-muted">Protein (g)</span>
                            <span className="font-bold">{Math.round(totals.protein || 0)} / {goals.protein}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${getStatusColor(totals.protein || 0, goals.protein)} transition-all duration-500`} style={{ width: `${getProgress(totals.protein || 0, goals.protein)}%` }}></div>
                        </div>
                    </div>
                    {/* Carbs */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-text-muted">Carbs (g)</span>
                            <span className="font-bold">{Math.round(totals.carbs || 0)} / {goals.carbs}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${getStatusColor(totals.carbs || 0, goals.carbs)} transition-all duration-500`} style={{ width: `${getProgress(totals.carbs || 0, goals.carbs)}%` }}></div>
                        </div>
                    </div>
                    {/* Iron */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-text-muted">Iron (mg)</span>
                            <span className="font-bold">{totals.iron?.toFixed(1) || 0} / {goals.iron}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${getStatusColor(totals.iron || 0, goals.iron)} transition-all duration-500`} style={{ width: `${getProgress(totals.iron || 0, goals.iron)}%` }}></div>
                        </div>
                    </div>
                    {/* Water */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-text-muted">Water (L)</span>
                            <span className="font-bold">{summary?.waterIntake || 0} / {goals.water}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full bg-blue-400 transition-all duration-500`} style={{ width: `${getProgress(summary?.waterIntake || 0, goals.water)}%` }}></div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Manual Log */}
                <div className="space-y-6">
                    <GlassCard className="p-6">
                        <h3 className="text-xl font-bold text-text-dark mb-4 flex items-center">
                            <Apple className="mr-2 text-green-500" /> Log Meal
                        </h3>
                        <form onSubmit={(e) => handleLog(e)} className="space-y-4">
                            <textarea
                                className="w-full bg-white/50 border border-primary-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-300 outline-none resize-none h-24 transition-all"
                                placeholder="e.g., Rice bowl with lentils..."
                                value={foodEntry}
                                onChange={(e) => setFoodEntry(e.target.value)}
                                required
                            />
                            <Button type="submit" variant="primary" className="w-full bg-green-500 hover:bg-green-600 border-green-500 text-white shadow-green-200" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <Sparkles className="animate-spin mr-2" size={18} /> Analyzing...
                                    </span>
                                ) : "Analyze & Log"}
                            </Button>
                        </form>
                    </GlassCard>

                    {/* AI Suggestions */}
                    <GlassCard className="p-6">
                        <h3 className="text-lg font-bold text-text-dark mb-3 flex items-center gap-2">
                            <Sparkles size={18} className="text-purple-500" /> Recommended for You
                        </h3>
                        {loadingSuggestions ? (
                            <div className="text-center text-sm text-text-muted">Thinking of healthy options...</div>
                        ) : (
                            <div className="space-y-3">
                                {suggestions.suggestions.map((item, idx) => (
                                    <div key={idx} className="bg-white/60 p-3 rounded-lg flex justify-between items-start group hover:bg-white/80 transition-colors">
                                        <div>
                                            <div className="font-bold text-text-dark">{item.name}</div>
                                            <div className="text-xs text-text-muted mt-1 space-x-2">
                                                <span>{item.calories} kcal</span>
                                                <span>• {item.protein}g Protein</span>
                                            </div>
                                            <ul className="text-[10px] text-gray-500 list-disc list-inside mt-1">
                                                {item.benefits?.slice(0, 2).map((b, i) => <li key={i}>{b}</li>)}
                                            </ul>
                                        </div>
                                        <button
                                            onClick={() => handleLog(null, item)}
                                            className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                ))}

                                {/* Fruits Chips */}
                                {suggestions.fruits.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs font-bold text-text-muted mb-2 uppercase">Quick Add Fruits</p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.fruits.map((fruit, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleFruitClick(fruit)}
                                                    className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-200 hover:bg-orange-200 transition-colors"
                                                >
                                                    {fruit}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* Recent Logs (Today) */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    <h3 className="text-xl font-bold text-text-dark">Today's Logs</h3>
                    {!items || items.length === 0 ? (
                        <div className="text-text-muted text-center py-10">No meals logged today.</div>
                    ) : (
                        items.slice().reverse().map((log, idx) => (
                            <GlassCard key={idx} className="p-4 border-l-4 border-green-400 group hover:scale-[1.02] transition-transform">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-medium text-text-dark">{log.name || log.foodEntry}</p>
                                    <span className="text-xs text-text-muted">{new Date(log.addedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 mt-2">
                                    <div className="bg-gray-100 rounded px-2 py-1 text-center">
                                        <span className="block font-bold">{Math.round(log.calories)}</span> kcal
                                    </div>
                                    <div className="bg-gray-100 rounded px-2 py-1 text-center">
                                        <span className="block font-bold">{Math.round(log.protein)}g</span> Prot
                                    </div>
                                    <div className="bg-gray-100 rounded px-2 py-1 text-center">
                                        <span className="block font-bold">{Math.round(log.iron)}mg</span> Iron
                                    </div>
                                    <div className="bg-gray-100 rounded px-2 py-1 text-center">
                                        <span className="block font-bold">{Math.round(log.calcium)}mg</span> Calc
                                    </div>
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NutritionView;
