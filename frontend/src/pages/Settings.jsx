import { useState, useEffect } from 'react';
import { Save, User, Activity, AlertTriangle, FileText, Building2 } from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        pregnancyStartDate: '',
        mcpId: '',
        anganwadiCenterId: '',
        address: '',
        motherPhone: '',
        husbandName: '',
        husbandPhone: '',
        profile: {
            age: '',
            height: '',
            weight: '',
            medicalConditions: [],
            dietaryPreference: 'veg',
            activityLevel: 'moderate'
        }
    });

    useEffect(() => {
        console.log("Settings Page Mounted");
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/user/profile');
            const data = res.data;
            setFormData({
                name: data.name,
                pregnancyStartDate: data.pregnancyStartDate ? data.pregnancyStartDate.split('T')[0] : '',
                mcpId: data.mcpId || '',
                anganwadiCenterId: '', // Don't fetch stored center ID for security/updates unless needed
                address: data.address || '',
                motherPhone: data.motherPhone || '',
                husbandName: data.husbandName || '',
                husbandPhone: data.husbandPhone || '',
                profile: {
                    age: data.profile?.age || '',
                    height: data.profile?.height || '',
                    weight: data.profile?.weight || '',
                    medicalConditions: data.profile?.medicalConditions || [],
                    dietaryPreference: data.profile?.dietaryPreference || 'veg',
                    activityLevel: data.profile?.activityLevel || 'moderate'
                }
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
            toast.error("Could not load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            profile: { ...prev.profile, [name]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/user/profile', formData);
            toast.success("Profile updated successfully!");
            // Optionally refresh context if used elsewhere
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleLinkMCP = async () => {
        if (!formData.mcpId || !formData.anganwadiCenterId) {
            toast.error("Please enter both MCP ID and Center ID");
            return;
        }
        try {
            await api.post('/mcp/attach', {
                mcpId: formData.mcpId,
                anganwadiCenterId: formData.anganwadiCenterId,
                address: formData.address,
                motherPhone: formData.motherPhone,
                husbandName: formData.husbandName,
                husbandPhone: formData.husbandPhone
            });
            toast.success("Linked to Anganwadi successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Linkage failed");
        }
    };

    if (loading) return <div className="p-8 text-center text-text-muted">Loading settings...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-text-dark flex items-center gap-2">
                <User className="text-primary-500" /> Settings & Profile
            </h2>

            <GlassCard className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-text-dark mb-4 border-b border-gray-100 pb-2">Basic Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Start Date (LMP)</label>
                                <input
                                    type="date"
                                    value={formData.pregnancyStartDate}
                                    onChange={e => setFormData({ ...formData, pregnancyStartDate: e.target.value })}
                                    className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-300"
                                />
                                <p className="text-[10px] text-orange-500 mt-1">Warning: Changing this will recalculate your pregnancy week.</p>
                            </div>
                        </div>
                    </div>

                    {/* Vitals */}
                    <div>
                        <h3 className="text-lg font-semibold text-text-dark mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <Activity size={18} /> Vitals
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Age</label>
                                <input
                                    type="number" name="age"
                                    value={formData.profile.age}
                                    onChange={handleProfileChange}
                                    className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Height (cm)</label>
                                <input
                                    type="number" name="height"
                                    value={formData.profile.height}
                                    onChange={handleProfileChange}
                                    className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Weight (kg)</label>
                                <input
                                    type="number" name="weight"
                                    value={formData.profile.weight}
                                    onChange={handleProfileChange}
                                    className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lifestyle */}
                    <div>
                        <h3 className="text-lg font-semibold text-text-dark mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <FileText size={18} /> Lifestyle
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Dietary Preference</label>
                                <select
                                    name="dietaryPreference"
                                    value={formData.profile.dietaryPreference}
                                    onChange={handleProfileChange}
                                    className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-300"
                                >
                                    <option value="veg">Vegetarian</option>
                                    <option value="non-veg">Non-Vegetarian</option>
                                    <option value="vegan">Vegan</option>
                                    <option value="gluten-free">Gluten-Free</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Activity Level</label>
                                <select
                                    name="activityLevel"
                                    value={formData.profile.activityLevel}
                                    onChange={handleProfileChange}
                                    className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-300"
                                >
                                    <option value="sedentary">Sedentary</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="active">Active</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* MCP & Anganwadi Linkage (National) */}
                    <div>
                        <h3 className="text-lg font-semibold text-text-dark mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <Building2 size={18} /> MCP & Anganwadi
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">MCP ID (If assigned)</label>
                                    <input
                                        type="text"
                                        value={formData.mcpId}
                                        onChange={e => setFormData({ ...formData, mcpId: e.target.value })}
                                        placeholder="MCP-202X-XXXX"
                                        className="w-full bg-white/50 border border-teal-100 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-teal-300"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Found on your Mother & Child Protection Card</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Anganwadi Center ID</label>
                                    <input
                                        type="text"
                                        value={formData.anganwadiCenterId}
                                        onChange={e => setFormData({ ...formData, anganwadiCenterId: e.target.value })}
                                        placeholder="KA-BLR-01"
                                        className="w-full bg-white/50 border border-teal-100 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-teal-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Current Residential Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-white/50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-300"
                                    rows="2"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Mother's Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.motherPhone}
                                        onChange={e => setFormData({ ...formData, motherPhone: e.target.value })}
                                        className="w-full bg-white/50 border border-gray-200 rounded-lg px-3 py-2 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Husband's Name</label>
                                    <input
                                        type="text"
                                        value={formData.husbandName}
                                        onChange={e => setFormData({ ...formData, husbandName: e.target.value })}
                                        className="w-full bg-white/50 border border-gray-200 rounded-lg px-3 py-2 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="bg-teal-50 p-4 rounded-lg flex items-start gap-3 border border-teal-100">
                                <AlertTriangle className="w-5 h-5 text-teal-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-teal-800">Why link?</h4>
                                    <p className="text-xs text-teal-700 mt-1">Linking allows your Anganwadi worker to track your health, schedule visits, and provide free medicines & nutrition packets efficiently.</p>
                                    <button
                                        type="button"
                                        onClick={handleLinkMCP}
                                        className="mt-3 bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 py-1.5 rounded-md transition-colors"
                                    >
                                        Link Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" variant="primary" className="w-full" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'} <Save size={18} className="ml-2" />
                    </Button>
                </form>
            </GlassCard>
        </div>
    );
};

export default Settings;
