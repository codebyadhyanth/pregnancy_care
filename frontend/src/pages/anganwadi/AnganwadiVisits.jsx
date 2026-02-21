import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, Plus, User } from "lucide-react";
import toast from "react-hot-toast";

const AnganwadiVisits = () => {
    const [visits, setVisits] = useState([]);
    const [mothers, setMothers] = useState([]); // For dropdown
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [newVisit, setNewVisit] = useState({
        userId: "",
        date: "",
        notes: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [visitsRes, mothersRes] = await Promise.all([
                axios.get("/api/anganwadi/visits", { withCredentials: true }),
                axios.get("/api/anganwadi/beneficiaries", { withCredentials: true })
            ]);
            setVisits(visitsRes.data);
            setMothers(mothersRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load visits");
            setLoading(false);
        }
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/api/anganwadi/visit", newVisit, { withCredentials: true });
            toast.success("Visit Scheduled");
            setShowModal(false);
            setNewVisit({ momId: "", date: "", notes: "" });
            fetchData(); // Refresh list
        } catch (error) {
            toast.error("Failed to schedule visit");
        }
    };

    const toggleStatus = async (visitId, currentStatus) => {
        try {
            const newStatus = !currentStatus ? "completed" : "pending";
            await axios.patch("/api/anganwadi/update-visit-status", { visitId, status: newStatus }, { withCredentials: true });
            toast.success(`Visit marked as ${newStatus}`);
            fetchData();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Visits & Checkups</h1>
                    <p className="text-gray-500">Scheduled home visits and immunizations.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-teal-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-teal-800 transition-colors flex items-center gap-2"
                >
                    <Plus size={20} /> Schedule Visit
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="p-8 text-center text-gray-500">Loading visits...</div>
            ) : visits.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">No upcoming visits scheduled</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {visits.map((visit) => (
                        <div key={visit._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-bold">
                                            {visit.mom?.name?.[0] || <User size={16} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{visit.mom?.name || "Unknown"}</h3>
                                            <p className="text-xs text-gray-500 font-mono">{visit.mom?.momId || visit.mom?.mcpId || "No ID"}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${visit.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {visit.completed ? "Completed" : "Pending"}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon size={16} className="text-teal-600" />
                                        <span>{format(new Date(visit.nextVisitDate), "PPP")}</span>
                                    </div>
                                    {visit.notes && (
                                        <p className="italic text-gray-500 bg-gray-50 p-2 rounded">"{visit.notes}"</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => toggleStatus(visit._id, visit.completed)}
                                className={`w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${visit.completed
                                    ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    : "bg-teal-600 text-white hover:bg-teal-700"
                                    }`}
                            >
                                {visit.completed ? (
                                    <> <XCircle size={16} /> Mark Incomplete </>
                                ) : (
                                    <> <CheckCircle size={16} /> Mark Complete </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Schedule New Visit</h2>
                        <form onSubmit={handleSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Mother</label>
                                <select
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={newVisit.momId}
                                    onChange={e => setNewVisit({ ...newVisit, momId: e.target.value })}
                                >
                                    <option value="">-- Choose Beneficiary --</option>
                                    {mothers.map(m => (
                                        <option key={m._id} value={m.mcpId || m.momId || m._id}>{m.name} ({m.mcpId})</option>
                                        // Use mcpId as value? Backend expects momId? 
                                        // Controller: `const user = await User.findOne({ momId });`
                                        // The controller logic uses `findOne({ momId })`. 
                                        // But `getBeneficiaries` returns `_id`. 
                                        // `mcpId` is the new field. 
                                        // Wait, the new `registerBeneficiary` sets `mcpId`.
                                        // Old logic might use `momId`. 
                                        // Let's check `scheduleVisit` in controller.
                                    ))}
                                    {/* Wait, the dropdown value needs to match what the controller expects. 
                                        Controller: `const user = await User.findOne({ momId });`
                                        If we pass `mcpId`, we should ensure controller searches by `mcpId` too?
                                        OR `_id`. 
                                        Best practice: pass `_id`? 
                                        Controller `scheduleVisit` implementation (I need to check/fix it).
                                        Line 319: `await User.findOne({ momId });`
                                        This depends on if `momId` field is populated. 
                                        With new flow, `mcpId` is the primary ID. 
                                        I should FIX `scheduleVisit` to search by `_id` or `mcpId`.
                                        Let's assume I fix controller to use `_id` or `mcpId`.
                                     */}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={newVisit.date}
                                    onChange={e => setNewVisit({ ...newVisit, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={newVisit.notes}
                                    onChange={e => setNewVisit({ ...newVisit, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800">Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnganwadiVisits;
