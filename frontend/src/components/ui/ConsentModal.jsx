
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import Button from './Button';
import { ShieldCheck, Bot } from 'lucide-react';

const ConsentModal = ({ isOpen, onAccept, onDecline, title, description }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md"
                >
                    <GlassCard className="p-8 border-t-4 border-t-primary-500 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bot size={32} className="text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{title || "AI Assistant Consent"}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {description || "To provide personalized health advice, our AI assistant needs access to your health metrics (weight, symptoms, etc.). Your data is processed securely and never shared with third parties for marketing."}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl mb-6 text-xs text-gray-500 border border-gray-100">
                            <strong>Privacy Note:</strong> Automated responses are for informational purposes only and do not replace professional medical advice. Always consult your doctor for serious concerns.
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={onDecline}
                                className="flex-1"
                            >
                                Not Now
                            </Button>
                            <Button
                                variant="primary"
                                onClick={onAccept}
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                <ShieldCheck size={16} /> I Agree
                            </Button>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConsentModal;
