import { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';
import { Trash2, AlarmClock, Pill } from 'lucide-react';

const MedicationView = () => {
    const [medications, setMedications] = useState([]);
    const [formData, setFormData] = useState({
        medicineName: '',
        dosage: '',
        time: '',
        frequency: 'daily'
    });

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        try {
            const res = await api.get('/dashboard/medication');
            setMedications(res.data);
        } catch (error) {
            console.error("Fetch medications failed", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/dashboard/medication', formData);
            setMedications([...medications, res.data]);
            setFormData({ medicineName: '', dosage: '', time: '', frequency: 'daily' });
            toast.success("Medication added");
        } catch (error) {
            toast.error("Failed to add medication");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this medication?")) return;
        try {
            await api.delete(`/dashboard/medication/${id}`);
            setMedications(medications.filter(m => m._id !== id));
            toast.success("Medication removed");
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="lg:col-span-1 p-6">
                <h3 className="text-xl font-bold text-text-dark mb-4">Add Medication</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-text-muted">Medicine Name</label>
                        <input
                            required
                            value={formData.medicineName} onChange={e => setFormData({ ...formData, medicineName: e.target.value })}
                            className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-1 focus:ring-primary-300"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-text-muted">Dosage (e.g., 500mg)</label>
                        <input
                            value={formData.dosage} onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                            className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-1 focus:ring-primary-300"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-text-muted">Time</label>
                        <input
                            type="time" required
                            value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}
                            className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-1 focus:ring-primary-300"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-text-muted">Frequency</label>
                        <select
                            value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                            className="w-full bg-white/50 border border-primary-100 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-1 focus:ring-primary-300"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="as-needed">As Needed</option>
                        </select>
                    </div>
                    <Button type="submit" variant="primary" className="w-full">Set Reminder</Button>
                </form>
            </GlassCard>

            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xl font-bold text-text-dark mb-2">My Medications</h3>
                {medications.length === 0 ? (
                    <GlassCard className="p-8 text-center text-text-muted">
                        No medications added yet.
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {medications.map(med => (
                            <GlassCard key={med._id} className="p-4 flex flex-col justify-between relative group hover:border-red-200 transition-colors">
                                <button
                                    onClick={() => handleDelete(med._id)}
                                    className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div>
                                    <div className="flex items-center space-x-2 text-primary-600 mb-2">
                                        <Pill size={20} />
                                        <span className="font-bold text-lg">{med.medicineName}</span>
                                    </div>
                                    <div className="text-sm text-text-muted space-y-1">
                                        <p>Dosage: {med.dosage}</p>
                                        <div className="flex items-center space-x-1 text-text-dark">
                                            <AlarmClock size={14} />
                                            <span>{med.time} ({med.frequency})</span>
                                        </div>
                                    </div>
                                </div>
                                {med.reminderEnabled && (
                                    <div className="mt-4 text-xs bg-green-50 text-green-600 px-2 py-1 rounded inline-block w-max">
                                        Reminder Active
                                    </div>
                                )}
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicationView;
