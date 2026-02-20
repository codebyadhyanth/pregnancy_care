import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useTrackerStore } from "../store/trackerStore";
import { useCommunityStore } from "../store/communityStore";
import Card from "../components/ui/Card";
import { User, Calendar, Activity, Heart, Star, Clock, Pill, MessageCircle } from "lucide-react";

const InfoCard = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-pink-50 shadow-sm transition-transform hover:scale-105">
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-6 h-6" style={{ color: color }} />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
    </div>
)

const DashboardPage = () => {
    const { user } = useAuthStore();
    const { medications, exercises, fetchMedications, fetchExercises } = useTrackerStore();
    const { posts, fetchPosts } = useCommunityStore();

    useEffect(() => {
        fetchMedications();
        fetchExercises();
        fetchPosts(); // To show post count or recent activity
    }, [fetchMedications, fetchExercises, fetchPosts]);

    // Calculate stats
    const totalMeds = medications.length;
    const totalExercises = exercises.length;
    const userPostsCount = posts.filter(p => p.user?._id === user?._id).length;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 p-1 shadow-lg">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <User className="w-10 h-10 text-pink-300" />
                    </div>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
                    <p className="text-pink-500 font-medium flex items-center gap-2">
                        <Star className="w-4 h-4 fill-current" /> Premium Member
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InfoCard
                    icon={Pill}
                    label="Medications"
                    value={totalMeds}
                    color="#ec4899"
                />
                <InfoCard
                    icon={Activity}
                    label="Exercises"
                    value={totalExercises}
                    color="#db2777"
                />
                <InfoCard
                    icon={MessageCircle}
                    label="My Posts"
                    value={userPostsCount}
                    color="#be123c"
                />
                <InfoCard
                    icon={Clock}
                    label="Days to go"
                    value="196 Days"
                    color="#9f1239"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-pink-500" /> Recent Activity
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {exercises.slice(0, 3).map((ex, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-pink-50 transition-colors cursor-pointer border border-transparent hover:border-pink-100">
                                    <div className="w-2 h-2 rounded-full bg-pink-500" />
                                    <p className="text-gray-600 flex-1">
                                        You logged <span className="font-semibold text-gray-800">{ex.type}</span> for {ex.duration} mins
                                    </p>
                                    <span className="text-xs text-gray-400">Recently</span>
                                </div>
                            ))}
                            {medications.slice(0, 3).map((med, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-pink-50 transition-colors cursor-pointer border border-transparent hover:border-pink-100">
                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                    <p className="text-gray-600 flex-1">
                                        Added medication <span className="font-semibold text-gray-800">{med.name}</span>
                                    </p>
                                    <span className="text-xs text-gray-400">Recently</span>
                                </div>
                            ))}
                            {exercises.length === 0 && medications.length === 0 && (
                                <p className="text-gray-400 text-center py-4">No recent activity found. Start tracking!</p>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="p-6 bg-gradient-to-b from-pink-500 to-rose-600 text-white border-none shadow-lg transform hover:-translate-y-1 transition-transform">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Heart className="w-5 h-5 fill-current" /> Daily Tip</h3>
                        <p className="text-pink-50 text-sm leading-relaxed mb-4">
                            Stay hydrated! Drinking water helps form the placenta and amniotic sac. It also prevents constipation and UTIs.
                        </p>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Your Schedule</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-600 p-2 hover:bg-pink-50 rounded-lg transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                                    <span>FEB</span>
                                    <span className="text-sm">15</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">Ultrasound Scan</p>
                                    <p className="text-xs text-gray-500">Dr. Smith • 10:00 AM</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
