import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, BookOpen, Plus, Trash2, Loader, Send } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const AnganwadiGuidance = () => {
    const [guidanceList, setGuidanceList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "guidance"
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchGuidance = async () => {
        try {
            const { data } = await axios.get("/api/anganwadi/guidance", {
                withCredentials: true
            });
            setGuidanceList(data);
        } catch (error) {
            console.error("Failed to fetch guidance");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGuidance();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post("/api/anganwadi/guidance", formData, {
                withCredentials: true
            });
            toast.success("Guidance published!");
            setFormData({ title: "", content: "", type: "guidance" });
            setShowForm(false);
            fetchGuidance();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to publish");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this guidance?")) return;
        try {
            await axios.delete(`/api/anganwadi/guidance/${id}`, {
                withCredentials: true
            });
            toast.success("Removed");
            setGuidanceList(prev => prev.filter(g => g._id !== id));
        } catch (error) {
            toast.error("Failed to remove");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-teal-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Guidance & Announcements</h1>
                    <p className="text-gray-500 text-sm">Publish health tips and announcements for your linked mothers.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#2E7D6B] hover:bg-[#256657] text-white px-6 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    New Guidance
                </button>
            </div>

            {/* Create Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                    className="w-full p-2

 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="e.g. Iron & Folic Acid Supplementation"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    required
                                    rows={4}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="Write your guidance or announcement here..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                >
                                    <option value="guidance">Guidance</option>
                                    <option value="announcement">Announcement</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                                >
                                    {submitting ? <Loader className="animate-spin" size={16} /> : <Send size={16} />}
                                    Publish
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Guidance List */}
            {guidanceList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">No guidance published yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Click "New Guidance" to create your first one.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {guidanceList.map((item) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className={`p-2 rounded-lg mt-0.5 ${item.type === 'announcement' ? 'bg-amber-50' : 'bg-teal-50'}`}>
                                        {item.type === 'announcement'
                                            ? <Megaphone className="text-amber-600" size={20} />
                                            : <BookOpen className="text-teal-600" size={20} />
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900">{item.title}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.type === 'announcement'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-teal-100 text-teal-700'
                                                }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm whitespace-pre-line">{item.content}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnganwadiGuidance;
