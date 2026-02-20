import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, PieChart, Download } from "lucide-react";

const AnganwadiReports = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("/api/anganwadi/reports", { withCredentials: true });
                setData(res.data);
            } catch (error) {
                console.error("Error fetching reports");
            }
        };
        fetchData();
    }, []);

    if (!data) return <div className="p-8">Loading Reports...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">National Health Reports</h1>
                <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">
                    <Download size={16} /> Export JSON
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Linked</h3>
                    <p className="text-3xl font-bold text-teal-700">{data.totalLinkedMoms}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">High Risk</h3>
                    <p className="text-3xl font-bold text-red-600">{data.highRiskCases}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Due This Month</h3>
                    <p className="text-3xl font-bold text-amber-600">{data.dueThisMonth}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-64 flex flex-col justify-center items-center">
                    <p className="text-gray-400">Migration In vs Out Chart (Placeholder)</p>
                    <div className="flex gap-4 mt-4 text-sm font-bold">
                        <span className="text-green-600">In: {data.totalMigratedIn}</span>
                        <span className="text-red-600">Out: {data.totalMigratedOut}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnganwadiReports;
