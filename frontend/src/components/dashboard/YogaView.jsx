import { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';
import { Flower, Sparkles, Clock, Calendar, CheckCircle, AlertOctagon, Youtube, X, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const YogaCard = ({ pose, index, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => onClick(pose)}
        className="cursor-pointer group"
    >
        <GlassCard className="h-full border-l-4 border-purple-400 p-5 group-hover:shadow-xl transition-all duration-300 bg-white/70 group-hover:-translate-y-1">
            <h4 className="font-bold text-lg text-purple-800 mb-2 group-hover:text-purple-600 transition-colors">{pose.name}</h4>

            <div className="flex items-center space-x-4 text-sm text-text-muted mb-3">
                <div className="flex items-center"><Clock size={16} className="mr-1 text-purple-500" /> {pose.durationMinutes} mins</div>
                <div className="flex items-center"><Youtube size={16} className="mr-1 text-red-500" /> Video Guide</div>
            </div>

            <div className="bg-purple-50 p-2 rounded text-purple-800 text-xs line-clamp-2">
                {Array.isArray(pose.benefits) ? pose.benefits.join(', ') : pose.benefits}
            </div>
            <div className="mt-3 text-center text-xs font-bold text-purple-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Click for details
            </div>
        </GlassCard>
    </motion.div>
);

const PoseModal = ({ pose, onClose }) => {
    if (!pose) return null;

    const handleYoutubeRedirect = () => {
        const query = pose.youtubeSearch || `${pose.name} prenatal yoga`;
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[80vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="bg-purple-600 p-4 flex justify-between items-center text-white sticky top-0 z-10">
                        <h3 className="font-bold text-xl">{pose.name}</h3>
                        <button onClick={onClose}><X size={24} /></button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                                <Clock size={16} className="mr-2" /> {pose.durationMinutes} mins
                            </span>
                            <button
                                onClick={handleYoutubeRedirect}
                                className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-red-700 transition-colors shadow-lg"
                            >
                                <PlayCircle size={16} className="mr-2" /> Watch Video
                            </button>
                        </div>

                        <div>
                            <h4 className="font-bold text-text-dark mb-2 flex items-center"><CheckCircle size={18} className="text-green-500 mr-2" /> Benefits</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm bg-green-50 p-4 rounded-xl">
                                {Array.isArray(pose.benefits)
                                    ? pose.benefits.map((b, i) => <li key={i}>{b}</li>)
                                    : <li>{pose.benefits}</li>
                                }
                            </ul>
                        </div>

                        {pose.steps && (
                            <div>
                                <h4 className="font-bold text-text-dark mb-2">Instructions</h4>
                                <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm bg-gray-50 p-4 rounded-xl">
                                    {Array.isArray(pose.steps)
                                        ? pose.steps.map((step, i) => <li key={i}>{step}</li>)
                                        : <li>Follow video instructions.</li>
                                    }
                                </ol>
                            </div>
                        )}

                        {pose.precautions && (
                            <div>
                                <h4 className="font-bold text-text-dark mb-2 flex items-center"><AlertOctagon size={18} className="text-orange-500 mr-2" /> Precautions</h4>
                                <p className="text-sm text-orange-800 bg-orange-50 p-4 rounded-xl border border-orange-100">
                                    {pose.precautions}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const YogaView = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPose, setSelectedPose] = useState(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/dashboard/yoga');
            setPlans(res.data);
        } catch (error) {
            console.error("Fetch yoga plans failed", error);
        }
    };

    const generatePlan = async () => {
        setLoading(true);
        try {
            const res = await api.post('/dashboard/yoga');
            setPlans([res.data, ...plans]);
            toast.success("New yoga plan customized for you!");
        } catch (error) {
            toast.error("Failed to generate plan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {selectedPose && <PoseModal pose={selectedPose} onClose={() => setSelectedPose(null)} />}

            <GlassCard className="p-8 text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
                <Flower size={48} className="mx-auto text-purple-500 mb-4" />
                <h2 className="text-2xl font-serif font-bold text-text-dark mb-2">Personalized Pregnancy Yoga</h2>
                <Button
                    onClick={generatePlan}
                    disabled={loading}
                    className="mt-4 px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 transition-all transform hover:scale-105"
                >
                    {loading ? (
                        <span className="flex items-center">
                            <Sparkles className="animate-spin mr-2" size={18} /> Generating Routine...
                        </span>
                    ) : "Generate New Routine (AI)"}
                </Button>
            </GlassCard>

            <div className="space-y-12">
                {plans.map((plan) => (
                    <div key={plan._id} className="relative">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                            <div>
                                <h3 className="text-xl font-bold text-text-dark">Week {plan.week} Routine</h3>
                                <p className="text-sm text-text-muted">Generated on {new Date(plan.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">{plan.generatedPlan.routineDurationDays || 7} Days Challenge</span>
                        </div>

                        {plan.generatedPlan.generalAdvice && (
                            <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl italic border border-blue-100">
                                💡 Tip: {plan.generatedPlan.generalAdvice}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plan.generatedPlan.poses && plan.generatedPlan.poses.map((pose, idx) => (
                                <YogaCard key={idx} pose={pose} index={idx} onClick={setSelectedPose} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YogaView;
