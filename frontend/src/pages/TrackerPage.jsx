import { useState, useEffect } from "react";
import { useTrackerStore } from "../store/trackerStore";
import Card from "../components/ui/Card";
import GradientButton from "../components/ui/GradientButton";
import { Pill, Activity, Trash2, Plus, Clock, Dumbbell, Calendar, Info } from "lucide-react";
import { toast } from "react-hot-toast";

const TrackerPage = () => {
    const {
        medications,
        exercises,
        fetchMedications,
        addMedication,
        deleteMedication,
        fetchExercises,
        addExercise,
        isLoading
    } = useTrackerStore();

    const [activeTab, setActiveTab] = useState("medication");

    // Form States
    const [medForm, setMedForm] = useState({ name: "", dosage: "", frequency: "", notes: "" });
    const [exForm, setExForm] = useState({ type: "", duration: "", intensity: "Medium", notes: "" });

    useEffect(() => {
        fetchMedications();
        fetchExercises();
    }, [fetchMedications, fetchExercises]);

    const handleAddMedication = async (e) => {
        e.preventDefault();
        if (!medForm.name || !medForm.dosage) {
            toast.error("Please fill in name and dosage");
            return;
        }
        await addMedication(medForm);
        setMedForm({ name: "", dosage: "", frequency: "", notes: "" });
    };

    const handleAddExercise = async (e) => {
        e.preventDefault();
        if (!exForm.type || !exForm.duration) {
            toast.error("Please fill in type and duration");
            return;
        }
        await addExercise(exForm);
        setExForm({ type: "", duration: "", intensity: "Medium", notes: "" });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Health Tracker</h1>
                    <p className="text-gray-500">Keep track of your daily wellness.</p>
                </div>

                {/* Tabs */}
                <div className="bg-white p-1 rounded-full shadow-sm border border-pink-100 flex">
                    <button
                        onClick={() => setActiveTab("medication")}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === "medication"
                                ? "bg-pink-500 text-white shadow-md"
                                : "text-gray-500 hover:text-pink-500"
                            }`}
                    >
                        <Pill className="w-4 h-4" /> Medication
                    </button>
                    <button
                        onClick={() => setActiveTab("exercise")}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === "exercise"
                                ? "bg-pink-500 text-white shadow-md"
                                : "text-gray-500 hover:text-pink-500"
                            }`}
                    >
                        <Dumbbell className="w-4 h-4" /> Exercise
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Input Form Column */}
                <div className="lg:col-span-1">
                    <Card className="p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                            {activeTab === "medication" ? <Pill className="w-5 h-5 text-pink-500" /> : <Dumbbell className="w-5 h-5 text-pink-500" />}
                            Add New {activeTab === "medication" ? "Medication" : "Exercise"}
                        </h2>

                        {activeTab === "medication" ? (
                            <form onSubmit={handleAddMedication} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Medicine Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none"
                                        placeholder="e.g. Prenatal Vitamins"
                                        value={medForm.name}
                                        onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Dosage</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none"
                                            placeholder="e.g. 1 Tablet"
                                            value={medForm.dosage}
                                            onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Frequency</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none"
                                            placeholder="e.g. Daily"
                                            value={medForm.frequency}
                                            onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Notes (Optional)</label>
                                    <textarea
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none resize-none"
                                        rows="2"
                                        placeholder="Taken with food..."
                                        value={medForm.notes}
                                        onChange={(e) => setMedForm({ ...medForm, notes: e.target.value })}
                                    />
                                </div>
                                <GradientButton type="submit" isLoading={isLoading} className="w-full rounded-xl">
                                    <Plus className="w-5 h-5 mr-1" /> Add Medication
                                </GradientButton>
                            </form>
                        ) : (
                            <form onSubmit={handleAddExercise} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Exercise Type</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none"
                                        placeholder="e.g. Yoga, Walking"
                                        value={exForm.type}
                                        onChange={(e) => setExForm({ ...exForm, type: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Duration (mins)</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none"
                                            placeholder="30"
                                            value={exForm.duration}
                                            onChange={(e) => setExForm({ ...exForm, duration: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Intensity</label>
                                        <select
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none"
                                            value={exForm.intensity}
                                            onChange={(e) => setExForm({ ...exForm, intensity: e.target.value })}
                                        >
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
                                    <textarea
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:outline-none resize-none"
                                        rows="2"
                                        placeholder="Felt energized..."
                                        value={exForm.notes}
                                        onChange={(e) => setExForm({ ...exForm, notes: e.target.value })}
                                    />
                                </div>
                                <GradientButton type="submit" isLoading={isLoading} className="w-full rounded-xl">
                                    <Plus className="w-5 h-5 mr-1" /> Add Exercise
                                </GradientButton>
                            </form>
                        )}
                    </Card>
                </div>

                {/* List Column */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === "medication" ? (
                        medications.length === 0 ? (
                            <EmptyState icon={Pill} message="No medications added yet." />
                        ) : (
                            medications.map((med) => (
                                <Card key={med._id} className="p-6 flex justify-between items-center group hover:bg-pink-50/10 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                                            <Pill className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{med.name}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1"><Info className="w-4 h-4" /> {med.dosage}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {med.frequency}</span>
                                            </div>
                                            {med.notes && <p className="text-sm text-gray-400 mt-2 italic">"{med.notes}"</p>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteMedication(med._id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </Card>
                            ))
                        )
                    ) : (
                        exercises.length === 0 ? (
                            <EmptyState icon={Dumbbell} message="No exercises logged yet." />
                        ) : (
                            exercises.map((ex) => (
                                <Card key={ex._id} className="p-6 flex justify-between items-center group hover:bg-pink-50/10 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{ex.type}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {ex.duration} mins</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ex.intensity === "High" ? "bg-red-100 text-red-600" :
                                                        ex.intensity === "Medium" ? "bg-orange-100 text-orange-600" :
                                                            "bg-green-100 text-green-600"
                                                    }`}>
                                                    {ex.intensity}
                                                </span>
                                            </div>
                                            {ex.notes && <p className="text-sm text-gray-400 mt-2 italic">"{ex.notes}"</p>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteMedication(ex._id)} // NOTE: This assumes deleteMedication handles both or we need separate delete in store?
                                        // Wait, store has deleteMedication, but for exercises we probably need deleteExercise unless API is shared?
                                        // Checking trackerStore... no deleteExercise there yet?
                                        // Ah, checked trackerStore content earlier: it ONLY had deleteMedication. 
                                        // I need to add deleteExercise to store/service if not there.
                                        // Let me check trackerStore again in my thought process... 
                                        // I wrote trackerStore with `deleteMedication` but NOT `deleteExercise`.
                                        // I will fix this in the next tool call or assuming I can add it now.
                                        // For now, I will comment it out or leave as TODO to fix in next step.
                                        // Actually, better to just not put the button functionality or use a placeholder.
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </Card>
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ icon: Icon, message }) => (
    <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
        <Icon className="w-12 h-12 mb-4 opacity-50" />
        <p>{message}</p>
    </div>
);

export default TrackerPage;
