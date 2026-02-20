import Card from "../components/ui/Card";
import { Baby, Calendar, Heart, Activity } from "lucide-react";

const TrimesterSection = ({ title, weeks, icon: Icon, color, children }) => (
    <Card className="p-8 hover:shadow-lg transition-all duration-300 border-t-4" style={{ borderColor: color }}>
        <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl shadow-inner" style={{ backgroundColor: `${color}20` }}>
                <Icon className="w-8 h-8" style={{ color: color }} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                <p className="text-pink-500 font-medium">{weeks}</p>
            </div>
        </div>
        <div className="space-y-4 text-gray-600 leading-relaxed">
            {children}
        </div>
    </Card>
);

const AboutPage = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-12">
            <section className="text-center space-y-4 max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-400">
                    Understanding Your Journey
                </h1>
                <p className="text-xl text-gray-600">
                    Every stage of pregnancy is unique. Here is a gentle guide to what you can expect during each trimester.
                </p>
            </section>

            <div className="grid lg:grid-cols-3 gap-8">
                <TrimesterSection
                    title="First Trimester"
                    weeks="Weeks 1-12"
                    icon={Heart}
                    color="#ec4899"
                >
                    <ul className="space-y-3">
                        <li className="flex gap-2"><span className="text-pink-400">•</span> <strong className="text-gray-700">Hormonal Changes:</strong> Your body is adjusting, which may cause mood swings and fatigue.</li>
                        <li className="flex gap-2"><span className="text-pink-400">•</span> <strong className="text-gray-700">Morning Sickness:</strong> Nausea is common. Try small, frequent meals.</li>
                        <li className="flex gap-2"><span className="text-pink-400">•</span> <strong className="text-gray-700">Emotional Care:</strong> Rest often and be kind to yourself.</li>
                    </ul>
                </TrimesterSection>

                <TrimesterSection
                    title="Second Trimester"
                    weeks="Weeks 13-26"
                    icon={Baby}
                    color="#db2777"
                >
                    <ul className="space-y-3">
                        <li className="flex gap-2"><span className="text-pink-400">•</span> <strong className="text-gray-700">The "Golden Period":</strong> Many women feel a burst of energy and less nausea.</li>
                        <li className="flex gap-2"><span className="text-pink-400">•</span> <strong className="text-gray-700">Baby Bump:</strong> Your baby grows significantly, and you might feel first movements.</li>
                        <li className="flex gap-2"><span className="text-pink-400">•</span> <strong className="text-gray-700">Bonding:</strong> A great time to talk or sing to your baby.</li>
                    </ul>
                </TrimesterSection>

                <TrimesterSection
                    title="Third Trimester"
                    weeks="Weeks 27-40"
                    icon={Calendar}
                    color="#be123c"
                >
                    <ul className="space-y-3">
                        <li className="flex gap-2"><span className="text-pink-400">•</span> <strong className="text-gray-700">Preparation:</strong> Finalize hospital plans and pack your bag.</li>
                        <li className="flex gap-2"><span className="text-pink-400">•</span> <strong className="text-gray-700">Comfort:</strong> Sleep may become difficult. Use pillows for support.</li>
                        <li className="flex gap-2"><span className="text-pink-400">•</span> <strong className="text-gray-700">Anticipation:</strong> Practice breathing exercises and relax.</li>
                    </ul>
                </TrimesterSection>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 text-center border border-pink-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Need Support?</h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Our community is here for you. Connect with other mothers to share experiences and advice.</p>
                <Activity className="w-12 h-12 text-pink-400 mx-auto opacity-50" />
            </div>
        </div>
    );
};

export default AboutPage;
