import { Heart, Thermometer, Footprints, Moon, Activity } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
            <Icon className={`w-8 h-8 ${color.replace("bg-", "text-")}`} />
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const PatientStats = ({ stats }) => {
    if (!stats) return <p className="text-gray-400">No stats available.</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                icon={Heart}
                label="Heart Rate"
                value={`${stats.heartRate || "--"} bpm`}
                color="bg-red-500"
            />
            <StatCard
                icon={Thermometer}
                label="Temperature"
                value={`${stats.temperature || "--"} °C`}
                color="bg-orange-500"
            />
            <StatCard
                icon={Footprints}
                label="Steps Taken"
                value={stats.steps || 0}
                color="bg-emerald-500"
            />
            <StatCard
                icon={Moon}
                label="Sleep"
                value={stats.sleepTime || "--"}
                color="bg-purple-500"
            />
            <StatCard
                icon={Activity}
                label="SPO2"
                value={`${stats.spo2 || "--"} %`}
                color="bg-blue-500"
            />
        </div>
    );
};

export default PatientStats;
