import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Save, ArrowLeft, Loader } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const AnganwadiGenerateId = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        husbandName: "",
        fatherName: "",
        motherPhone: "",
        husbandPhone: "",
        address: "",
        permanentAddress: "",
        jurisdiction: "",
        state: "",
        district: "",
        pregnancyStartDate: "",
        expectedDeliveryDate: "",
        riskCategory: "Normal"
    });

    // Fetch centre profile to pre-fill state/district
    useEffect(() => {
        const fetchCentreProfile = async () => {
            try {
                const { data } = await axios.get("/api/anganwadi/profile", {
                    withCredentials: true
                });
                setFormData(prev => ({
                    ...prev,
                    state: data.state || "",
                    district: data.district || ""
                }));
            } catch (error) {
                console.error("Failed to fetch centre profile");
            }
        };
        fetchCentreProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await axios.post("/api/anganwadi/generate-mcp", formData, {
                withCredentials: true
            });
            toast.success(`MCP Generated: ${data.mcpId}`);
            navigate("/anganwadi/beneficiaries");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to register beneficiary");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-teal-700 mb-6 transition-colors"
            >
                <ArrowLeft size={20} /> Back
            </button>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="bg-teal-700 p-6 text-white">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <UserPlus className="w-6 h-6" />
                        New Mother Registration & MCP ID
                    </h1>
                    <p className="text-teal-100 text-sm mt-1">
                        Register a new beneficiary. An 8-character MCP ID will be auto-generated.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 grid md:grid-cols-2 gap-6">

                    {/* Basic Info */}
                    <div className="md:col-span-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Personal Details</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name *</label>
                        <input name="name" onChange={handleChange} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Full Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Phone *</label>
                        <input name="motherPhone" onChange={handleChange} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="10-digit Mobile" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Husband's Name *</label>
                        <input name="husbandName" onChange={handleChange} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                        <input name="fatherName" onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2 mt-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Residence / Jurisdiction</h3>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Address *</label>
                        <textarea name="address" onChange={handleChange} required rows="2" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="#House No, Street, Landmark" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                        <textarea name="permanentAddress" onChange={handleChange} rows="2" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="If different from above" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction (Ward/Village)</label>
                        <input name="jurisdiction" onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                        <input name="district" value={formData.district} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50" />
                    </div>

                    {/* Pregnancy */}
                    <div className="md:col-span-2 mt-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Pregnancy Details</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pregnancy Start Date (LMP)</label>
                        <input type="date" name="pregnancyStartDate" onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date (EDD)</label>
                        <input type="date" name="expectedDeliveryDate" onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Risk Category</label>
                        <select name="riskCategory" onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                            <option value="Normal">Normal</option>
                            <option value="High">High Risk</option>
                        </select>
                    </div>


                    {/* Action */}
                    <div className="md:col-span-2 mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
                        >
                            {isLoading ? <Loader className="animate-spin" /> : <Save size={20} />}
                            Generate MCP ID & Register
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AnganwadiGenerateId;
