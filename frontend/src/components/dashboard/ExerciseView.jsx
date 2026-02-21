import { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';
import { Dumbbell, Sparkles, Activity, ShieldCheck, Heart, ArrowUpCircle } from 'lucide-react';

const ExerciseView = () => {
    const [logs, setLogs] = useState([]);
    const [formData, setFormData] = useState({ activity: '', duration: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/dashboard/exercise');
            setLogs(res.data);
        } catch (error) {
            console.error("Fetch exercise failed", error);
        }
    };

    const handleLog = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/dashboard/exercise', formData);
            setLogs([res.data, ...logs]);
            setFormData({ activity: '', duration: '' });
            toast.success("Activity logged!");
        } catch (error) {
            toast.error("Failed to log activity");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <GlassCard className="p-6 sticky top-24">
                    <h3 className="text-xl font-bold text-text-dark mb-4 flex items-center">
                        <Dumbbell className="mr-2 text-blue-500" /> Log Activity
                    </h3>
                    <form onSubmit={handleLog} className="space-y-4">
                        <div>
                            <label className="text-sm text-text-muted">Activity Type</label>
                            <input
                                className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-300 outline-none"
                                placeholder="e.g., Walking, Swimming..."
                                value={formData.activity}
                                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-text-muted">Duration (minutes)</label>
                            <input
                                type="number"
                                className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-300 outline-none"
                                placeholder="e.g., 30"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit" variant="primary" className="w-full bg-blue-500 hover:bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-200" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <Sparkles className="animate-spin mr-2" size={18} /> Analyzing...
                                </span>
                            ) : "Log & Analyze (AI)"}
                        </Button>
                    </form>
                </GlassCard>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-bold text-text-dark">Activity Log & AI Feedback</h3>

                {logs.length === 0 ? (
                    <GlassCard className="p-10 text-center text-text-muted">
                        No activities logged yet.
                    </GlassCard>
                ) : (
                    logs.map(log => (
                        <GlassCard key={log._id} className="p-0 overflow-hidden border-0 shadow-sm">
                            <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-lg text-blue-900">{log.activity}</h4>
                                    <span className="text-sm text-blue-600 font-medium">{log.duration} minutes</span>
                                </div>
                                <span className="text-xs text-blue-400 bg-white px-2 py-1 rounded-full">{new Date(log.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="p-5">
                                <h5 className="flex items-center text-sm font-bold text-gray-700 mb-3">
                                    <Sparkles size={16} className="mr-2 text-primary-500" /> AI Insights
                                </h5>

                                {log.aiRecommendation?.insights ? (
                                    <ul className="space-y-2">
                                        {log.aiRecommendation.insights.map((insight, idx) => (
                                            <li key={idx} className="flex items-start text-sm text-gray-600 bg-gray-50/50 p-2 rounded">
                                                <span className="text-primary-500 font-bold mr-2">•</span>
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    // Fallback for old data structure
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Handle explicit fields if they exist from previous schema version */}
                                        {log.aiRecommendation?.intensityRating && (
                                            <div className="text-sm"><span className="font-semibold">Intensity:</span> {log.aiRecommendation.intensityRating}</div>
                                        )}
                                        {log.aiRecommendation?.safetyAssessment && (
                                            <div className="text-sm"><span className="font-semibold">Safety:</span> {log.aiRecommendation.safetyAssessment}</div>
                                        )}
                                        {/* If string */}
                                        {typeof log.aiRecommendation === 'string' && <p className="text-sm text-text-muted">{log.aiRecommendation}</p>}
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
};

export default ExerciseView;
