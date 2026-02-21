import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';

const ContactPage = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here (e.g., mailto or API)
        window.location.href = "mailto:support@childcare.com";
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">Get in Touch</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    We're here to help you and your baby. Reach out to us or visit your local center.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Contact Information & Anganwadi Card */}
                <div className="space-y-6">
                    {/* Anganwadi Center Card (New Requirement) */}
                    <GlassCard className="p-8 border-l-4 border-pink-500">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <MapPin className="text-pink-500" /> nearby Anganwadi Center
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-pink-100 rounded-full">
                                    <Phone className="w-6 h-6 text-pink-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Helpline Number</p>
                                    <a href="tel:+919876543210" className="text-lg text-pink-600 hover:underline font-bold">
                                        +91-98765-43210
                                    </a>
                                    <p className="text-sm text-gray-500">Available 9 AM - 5 PM</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-pink-100 rounded-full">
                                    <MapPin className="w-6 h-6 text-pink-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Location</p>
                                    <p className="text-gray-700">
                                        Anganwadi Center No. 42,<br />
                                        Kanakapura Village, Ramanagara Dist,<br />
                                        Karnataka - 562117
                                    </p>
                                    <a
                                        href="https://maps.google.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-pink-500 hover:text-pink-700 mt-1 inline-block"
                                    >
                                        View on Google Maps &rarr;
                                    </a>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* General Contact Info */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <GlassCard className="p-6">
                            <Mail className="w-8 h-8 text-purple-500 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Email Us</h3>
                            <p className="text-gray-600 text-sm">support@childcare.com</p>
                            <p className="text-gray-600 text-sm">help@childcare.com</p>
                        </GlassCard>
                        <GlassCard className="p-6">
                            <Clock className="w-8 h-8 text-orange-500 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Office Hours</h3>
                            <p className="text-gray-600 text-sm">Mon - Sat: 9:00 AM - 6:00 PM</p>
                            <p className="text-gray-600 text-sm">Sunday: Closed</p>
                        </GlassCard>
                    </div>
                </div>

                {/* Contact Form */}
                <GlassCard className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50"
                                    placeholder="Phone number"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea
                                rows="4"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50"
                                placeholder="How can we help you?"
                            ></textarea>
                        </div>
                        <Button variant="primary" className="w-full py-4 text-lg shadow-xl shadow-pink-200">
                            Send Message
                        </Button>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
};

export default ContactPage;
