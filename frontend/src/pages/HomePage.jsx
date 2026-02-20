import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Activity, Users, Calendar, ArrowRight } from "lucide-react";
import GradientButton from "../components/ui/GradientButton";
import Card from "../components/ui/Card";

const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 group border-none bg-white/50 backdrop-blur-sm">
        <div className="flex justify-center mb-6">
            <div
                className="p-4 rounded-full transition-transform duration-300 group-hover:scale-110 shadow-lg"
                style={{ backgroundColor: `${color}15`, color: color }}
            >
                <Icon className="w-8 h-8" />
            </div>
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </Card>
);

const HomePage = () => {
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const [canInstall, setCanInstall] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            setInstallPromptEvent(e);
            setCanInstall(true);
        };

        const handleAppInstalled = () => {
            setInstallPromptEvent(null);
            setCanInstall(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPromptEvent) {
            // Graceful fallback for unsupported browsers (e.g., iOS Safari)
            alert("To install Janani Setu, use your browser's \"Add to Home Screen\" option.");
            return;
        }

        installPromptEvent.prompt();
        await installPromptEvent.userChoice;
        setInstallPromptEvent(null);
        setCanInstall(false);
    };

    return (
        <div className="space-y-24 pb-12">
            {/* Hero Section */}
            <section className="relative pt-12 pb-20 text-center space-y-8 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-b from-pink-100/50 to-transparent rounded-full blur-3xl -z-10" />

                <div className="space-y-6 max-w-4xl mx-auto px-4">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">
                        Your Journey, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">
                            Our Gentle Care
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                        A comprehensive, nurturing companion for your pregnancy. Track your health, connect with a supported community, and find peace in every step.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
                    <Link to="/signup">
                        <GradientButton className="text-lg px-8 py-4 w-full sm:w-auto shadow-pink-300/50 shadow-lg">
                            Join the Community <ArrowRight className="w-5 h-5 ml-2 inline-block" />
                        </GradientButton>
                    </Link>
                    <Link to="/about">
                        <button className="text-lg px-8 py-4 w-full sm:w-auto font-semibold text-gray-600 hover:text-pink-600 transition-colors bg-white/50 hover:bg-white rounded-full border border-pink-100">
                            Learn More
                        </button>
                    </Link>
                </div>

                {/* PWA Install Button - shown only when browser supports install prompt */}
                {canInstall && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleInstallClick}
                            className="inline-flex items-center px-6 py-3 rounded-full bg-pink-100 text-pink-700 font-semibold shadow-md hover:bg-pink-200 transition-colors border border-pink-200"
                        >
                            Install Janani Setu App
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                )}
            </section>

            {/* Features Grid */}
            <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
                <FeatureCard
                    icon={Heart}
                    title="Health Tracking"
                    description="Monitor vital stats and baby's growth week by week with gentle visualizers."
                    color="#ec4899"
                />
                <FeatureCard
                    icon={Activity}
                    title="Wellness"
                    description="Personalized exercise routines and nutritional advice for your changing body."
                    color="#db2777"
                />
                <FeatureCard
                    icon={Calendar}
                    title="Appointments"
                    description="Never miss a check-up with smart, friendly reminders."
                    color="#be123c"
                />
                <FeatureCard
                    icon={Users}
                    title="Community"
                    description="Connect with other expecting moms in a safe, moderated space."
                    color="#9f1239"
                />
            </section>

            {/* Emotional CTA */}
            <section className="text-center py-20 px-4">
                <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white p-12 max-w-4xl mx-auto rounded-[3rem] shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold">Ready to start your journey?</h2>
                        <p className="text-pink-100 text-lg max-w-xl mx-auto">Join thousands of mothers who trust PregnancyCare for a safer, happier pregnancy.</p>
                        <Link to="/signup" className="inline-block">
                            <button className="bg-white text-pink-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-pink-50 transition-colors transform hover:-translate-y-1">
                                Sign Up Now
                            </button>
                        </Link>
                    </div>
                </Card>
            </section>
        </div>
    );
};

export default HomePage;
