import { motion } from 'framer-motion';
import { MessageCircle, Users, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlassCard from './ui/GlassCard';

const FeatureCards = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: <MessageCircle size={32} className="text-primary-start" />,
            title: t('features.adviceTitle'),
            description: t('features.adviceDesc'),
            link: "/advice",
            color: "bg-primary-50",
            delay: 0.1
        },
        {
            icon: <Users size={32} className="text-accent-peach" />,
            title: t('features.communityTitle'),
            description: t('features.communityDesc'),
            link: "/community",
            color: "bg-orange-50",
            delay: 0.2
        },
        {
            icon: <Activity size={32} className="text-success" />,
            title: t('features.healthTitle'),
            description: t('features.healthDesc'),
            link: "/dashboard",
            color: "bg-green-50",
            delay: 0.3
        }
    ];

    return (
        <section className="py-16 md:py-24 relative z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-serif font-bold text-text-dark"
                    >
                        {t('features.heading')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-text-muted max-w-2xl mx-auto"
                    >
                        {t('features.subheading')}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Link key={index} to={feature.link}>
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: feature.delay, duration: 0.5 }}
                            >
                                <GlassCard
                                    hoverEffect={true}
                                    className="h-full flex flex-col items-center text-center p-8 group cursor-pointer border-transparent hover:border-primary-100"
                                >
                                    <div className={`p-4 rounded-full ${feature.color} mb-6 transition-transform group-hover:scale-110 duration-300`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-serif font-semibold text-text-dark mb-3 group-hover:text-primary-start transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-text-muted text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </GlassCard>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureCards;
