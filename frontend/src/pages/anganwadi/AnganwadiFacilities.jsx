import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Building2, Plus, X, Save } from "lucide-react";

const AnganwadiFacilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [services, setServices] = useState([]);
    const [contactNumber, setContactNumber] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Temp inputs
    const [newFacility, setNewFacility] = useState("");
    const [newService, setNewService] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get("/api/anganwadi/profile", { withCredentials: true });
            setFacilities(data.facilities || []);
            setServices(data.services || []);
            setContactNumber(data.contactNumber || "");
            setAddress(data.address || "");
        } catch (error) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put("/api/anganwadi/facilities", {
                facilities,
                services,
                contactNumber,
                address
            }, { withCredentials: true });
            toast.success("Center details updated successfully");
        } catch (error) {
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const addItem = (list, setList, item, setItem) => {
        if (!item.trim()) return;
        if (list.includes(item.trim())) return;
        setList([...list, item.trim()]);
        setItem("");
    };

    const removeItem = (list, setList, item) => {
        setList(list.filter(i => i !== item));
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="text-[#2E7D6B]" /> Center Facilities & Services
                </h1>
                <p className="text-gray-500">Update what your Anganwadi center offers to beneficiaries.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">

                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <input
                            type="text"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            placeholder="+91 XXXXX XXXXX"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2E7D6B] focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Address (Landmark)</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Near Village Temple, Main Road..."
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2E7D6B] focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-4"></div>

                {/* Facilities */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Facilities</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {facilities.map(item => (
                            <span key={item} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                {item}
                                <button onClick={() => removeItem(facilities, setFacilities, item)} className="hover:text-blue-900">
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newFacility}
                            onChange={(e) => setNewFacility(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem(facilities, setFacilities, newFacility, setNewFacility)}
                            placeholder="Add facility (e.g. Drinking Water, Play Area)"
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2E7D6B] outline-none"
                        />
                        <button
                            onClick={() => addItem(facilities, setFacilities, newFacility, setNewFacility)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Services */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Offered Services</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {services.map(item => (
                            <span key={item} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                {item}
                                <button onClick={() => removeItem(services, setServices, item)} className="hover:text-green-900">
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newService}
                            onChange={(e) => setNewService(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem(services, setServices, newService, setNewService)}
                            placeholder="Add service (e.g. Vaccination, Pre-school)"
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2E7D6B] outline-none"
                        />
                        <button
                            onClick={() => addItem(services, setServices, newService, setNewService)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#2E7D6B] hover:bg-[#256657] text-white px-8 py-3 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors disabled:opacity-70"
                    >
                        {saving ? "Saving..." : <><Save size={20} /> Save Changes</>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AnganwadiFacilities;
