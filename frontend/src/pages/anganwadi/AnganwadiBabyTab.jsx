import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    Baby, Weight, Syringe, Calendar, FileText,
    Plus, Loader2, ChevronDown, ChevronUp, Clock,
    AlertTriangle, CheckCircle2
} from "lucide-react";

/**
 * CRITICAL: Do not edit without reviewing related modules.
 * This affects pregnancy/baby lifecycle logic.
 * Anganwadi Baby Tab – view/manage baby records for linked mothers.
 * Uses cookie-based auth (protectAnganwadiRoute middleware sets req.center).
 */

const AnganwadiBabyTab = () => {
    const [babies, setBabies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedBaby, setExpandedBaby] = useState(null);
    const [remarkText, setRemarkText] = useState("");
    const [reminderForm, setReminderForm] = useState({ title: "", date: "", description: "" });
    const [growthNotes, setGrowthNotes] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [activeAction, setActiveAction] = useState(null); // 'remark' | 'vaccination' | 'appointment' | 'growth'

    const fetchBabies = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/anganwadi/babies", { withCredentials: true });
            setBabies(data);
        } catch (error) {
            console.error("Failed to fetch babies:", error);
            toast.error("Failed to load baby records");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBabies();
    }, [fetchBabies]);

    const handleAddRemark = async (babyId) => {
        if (!remarkText.trim()) return toast.error("Please enter a remark");
        setSubmitting(true);
        try {
            await axios.post(`/api/anganwadi/babies/${babyId}/remarks`, { remark: remarkText }, { withCredentials: true });
            toast.success("Health remark added");
            setRemarkText("");
            setActiveAction(null);
            fetchBabies();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add remark");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetReminder = async (babyId, type) => {
        if (!reminderForm.title.trim() || !reminderForm.date) {
            return toast.error("Title and date are required");
        }
        setSubmitting(true);
        try {
            const endpoint = type === "vaccination"
                ? `/api/anganwadi/babies/${babyId}/vaccination-reminder`
                : `/api/anganwadi/babies/${babyId}/appointments`;
            await axios.post(endpoint, reminderForm, { withCredentials: true });
            toast.success(type === "vaccination" ? "Vaccination reminder set" : "Appointment scheduled");
            setReminderForm({ title: "", date: "", description: "" });
            setActiveAction(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to set reminder");
        } finally {
            setSubmitting(false);
        }
    };

    const fetchGrowthNotes = async (babyId) => {
        try {
            const { data } = await axios.get(`/api/anganwadi/babies/${babyId}/growth-notes`, { withCredentials: true });
            setGrowthNotes(data);
            setActiveAction("growth");
        } catch (error) {
            toast.error("Failed to load growth notes");
        }
    };

    const getAgeLabel = (dob) => {
        const now = new Date();
        const birth = new Date(dob);
        const diffMs = now - birth;
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (days < 7) return `${days} day${days !== 1 ? "s" : ""} old`;
        const weeks = Math.floor(days / 7);
        if (weeks < 8) return `${weeks} week${weeks !== 1 ? "s" : ""} old`;
        const months = Math.floor(days / 30.44);
        return `${months} month${months !== 1 ? "s" : ""} old`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#2E7D6B]" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-pink-50 rounded-xl">
                        <Baby className="w-7 h-7 text-pink-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Baby Records</h2>
                        <p className="text-gray-500 text-sm">Manage babies of linked mothers</p>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-3xl font-bold text-[#2E7D6B]">{babies.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Total Babies Registered</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-3xl font-bold text-blue-600">
                        {babies.filter(b => {
                            const weeks = Math.floor((new Date() - new Date(b.dob)) / (1000 * 60 * 60 * 24 * 7));
                            return weeks <= 4;
                        }).length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Newborns ({"<"} 1 month)</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-3xl font-bold text-amber-600">
                        {babies.filter(b => b.birthWeight < 2.5).length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Low Birth Weight</p>
                </div>
            </div>

            {/* Baby List */}
            {babies.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <Baby className="w-14 h-14 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No Baby Records Yet</h3>
                    <p className="text-gray-400 text-sm mt-2">
                        Baby records appear here when linked mothers confirm delivery.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {babies.map((baby) => (
                        <div key={baby._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Baby Card Header */}
                            <button
                                onClick={() => {
                                    setExpandedBaby(expandedBaby === baby._id ? null : baby._id);
                                    setActiveAction(null);
                                }}
                                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${baby.gender === "male" ? "bg-blue-400" : baby.gender === "female" ? "bg-pink-400" : "bg-purple-400"}`}>
                                        {baby.gender === "male" ? "♂" : baby.gender === "female" ? "♀" : "⚥"}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-gray-800">
                                            {baby.name || `Baby of ${baby.mother?.name || "Unknown"}`}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(baby.dob).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {getAgeLabel(baby.dob)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Weight size={12} />
                                                {baby.birthWeight} kg
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {baby.birthWeight < 2.5 && (
                                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                            <AlertTriangle size={12} /> Low Weight
                                        </span>
                                    )}
                                    {expandedBaby === baby._id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                </div>
                            </button>

                            {/* Expanded Details & Actions */}
                            {expandedBaby === baby._id && (
                                <div className="border-t border-gray-100 p-5 space-y-5">
                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-400 text-xs uppercase tracking-wider">Mother</p>
                                            <p className="font-semibold text-gray-700 mt-1">{baby.mother?.name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs uppercase tracking-wider">Phone</p>
                                            <p className="font-semibold text-gray-700 mt-1">{baby.mother?.motherPhone || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs uppercase tracking-wider">Gender</p>
                                            <p className="font-semibold text-gray-700 mt-1 capitalize">{baby.gender}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs uppercase tracking-wider">Time of Birth</p>
                                            <p className="font-semibold text-gray-700 mt-1">{baby.timeOfBirth || "N/A"}</p>
                                        </div>
                                    </div>

                                    {/* Health Remarks History */}
                                    {baby.healthRemarks && baby.healthRemarks.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Health Remarks</p>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {baby.healthRemarks.slice(-3).reverse().map((r, i) => (
                                                    <div key={i} className="flex items-start gap-2 text-sm p-2 bg-gray-50 rounded-lg">
                                                        <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-gray-700">{r.remark}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                by {r.addedBy} • {new Date(r.date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setActiveAction(activeAction === "remark" ? null : "remark")}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeAction === "remark" ? "bg-[#2E7D6B] text-white" : "bg-gray-100 text-gray-600 hover:bg-[#E8F5F3] hover:text-[#2E7D6B]"}`}
                                        >
                                            <FileText size={14} /> Add Remark
                                        </button>
                                        <button
                                            onClick={() => setActiveAction(activeAction === "vaccination" ? null : "vaccination")}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeAction === "vaccination" ? "bg-[#2E7D6B] text-white" : "bg-gray-100 text-gray-600 hover:bg-[#E8F5F3] hover:text-[#2E7D6B]"}`}
                                        >
                                            <Syringe size={14} /> Vaccination Reminder
                                        </button>
                                        <button
                                            onClick={() => setActiveAction(activeAction === "appointment" ? null : "appointment")}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeAction === "appointment" ? "bg-[#2E7D6B] text-white" : "bg-gray-100 text-gray-600 hover:bg-[#E8F5F3] hover:text-[#2E7D6B]"}`}
                                        >
                                            <Calendar size={14} /> Schedule Appointment
                                        </button>
                                        <button
                                            onClick={() => fetchGrowthNotes(baby._id)}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeAction === "growth" ? "bg-[#2E7D6B] text-white" : "bg-gray-100 text-gray-600 hover:bg-[#E8F5F3] hover:text-[#2E7D6B]"}`}
                                        >
                                            <Weight size={14} /> Growth Notes
                                        </button>
                                    </div>

                                    {/* Remark Form */}
                                    {activeAction === "remark" && (
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                            <textarea
                                                value={remarkText}
                                                onChange={(e) => setRemarkText(e.target.value)}
                                                placeholder="Enter health remark for this baby..."
                                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#2E7D6B] focus:border-transparent outline-none resize-none"
                                                rows={3}
                                            />
                                            <button
                                                onClick={() => handleAddRemark(baby._id)}
                                                disabled={submitting}
                                                className="flex items-center gap-2 bg-[#2E7D6B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#256657] disabled:opacity-50 transition-colors"
                                            >
                                                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                                Add Remark
                                            </button>
                                        </div>
                                    )}

                                    {/* Vaccination / Appointment Form */}
                                    {(activeAction === "vaccination" || activeAction === "appointment") && (
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                            <input
                                                type="text"
                                                value={reminderForm.title}
                                                onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                                                placeholder={activeAction === "vaccination" ? "Vaccine name (e.g., BCG, OPV-1)" : "Appointment title"}
                                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#2E7D6B] focus:border-transparent outline-none"
                                            />
                                            <input
                                                type="date"
                                                value={reminderForm.date}
                                                onChange={(e) => setReminderForm({ ...reminderForm, date: e.target.value })}
                                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#2E7D6B] focus:border-transparent outline-none"
                                            />
                                            <textarea
                                                value={reminderForm.description}
                                                onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
                                                placeholder="Description (optional)"
                                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#2E7D6B] focus:border-transparent outline-none resize-none"
                                                rows={2}
                                            />
                                            <button
                                                onClick={() => handleSetReminder(baby._id, activeAction)}
                                                disabled={submitting}
                                                className="flex items-center gap-2 bg-[#2E7D6B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#256657] disabled:opacity-50 transition-colors"
                                            >
                                                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                                {activeAction === "vaccination" ? "Set Vaccination Reminder" : "Schedule Appointment"}
                                            </button>
                                        </div>
                                    )}

                                    {/* Growth Notes */}
                                    {activeAction === "growth" && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            {growthNotes.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic">No growth notes recorded yet.</p>
                                            ) : (
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {growthNotes.map((note, i) => (
                                                        <div key={i} className="flex items-start gap-2 text-sm p-2 bg-white rounded-lg border border-gray-100">
                                                            <FileText size={14} className="text-[#2E7D6B] mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="text-gray-700">{note.remark}</p>
                                                                <p className="text-xs text-gray-400 mt-0.5">
                                                                    by {note.addedBy} • {new Date(note.date).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnganwadiBabyTab;
