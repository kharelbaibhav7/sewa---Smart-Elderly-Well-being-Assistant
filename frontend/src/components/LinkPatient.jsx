import { useState } from "react";
import toast from "react-hot-toast";

const LinkPatient = ({ onLinkSuccess }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLink = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/guardian/link-patient", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ patientEmail: email }),
            });
            const data = await response.json();

            if (data.success) {
                toast.success("Patient linked successfully!");
                onLinkSuccess();
            } else {
                toast.error(data.message || "Failed to link patient");
            }
        } catch (error) {
            toast.error("Error linking patient");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Link a Patient</h3>
            <form onSubmit={handleLink} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Patient Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mt-1 p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500"
                        placeholder="patient@example.com"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    {loading ? "Linking..." : "Link Patient"}
                </button>
            </form>
        </div>
    );
};

export default LinkPatient;
