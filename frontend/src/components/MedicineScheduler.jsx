import { useState } from "react";
import toast from "react-hot-toast";

const MedicineScheduler = ({ onScheduleAdded }) => {
    const [name, setName] = useState("");
    const [dosage, setDosage] = useState("");
    const [time, setTime] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/guardian/schedule-medicine", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, dosage, time }),
            });
            const data = await response.json();

            if (data.success) {
                toast.success("Medicine scheduled!");
                setName("");
                setDosage("");
                setTime("");
                if (onScheduleAdded) onScheduleAdded();
            } else {
                toast.error(data.message || "Failed to schedule");
            }
        } catch (error) {
            toast.error("Error scheduling medicine");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-lg">
            <h3 className="text-xl font-bold text-white mb-4">Schedule Medicine</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Medicine Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full mt-1 p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500"
                        placeholder="e.g. Paracetamol"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Dosage</label>
                        <input
                            type="text"
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                            className="w-full mt-1 p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500"
                            placeholder="e.g. 500mg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Time</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full mt-1 p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500"
                            required
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg font-bold transition-all transform hover:scale-[1.02]"
                >
                    {loading ? "Scheduling..." : "Add Schedule"}
                </button>
            </form>
        </div>
    );
};

export default MedicineScheduler;
