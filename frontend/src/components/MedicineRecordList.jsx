import { CheckCircle, XCircle } from "lucide-react";

const MedicineRecordList = ({ records }) => {
    // Filter for today's records or just show the last few
    // Ideally, the backend should filter or sort.
    // For now, let's show the last 5 records reverse chronologically.

    const recentRecords = records ? [...records].reverse().slice(0, 5) : [];

    if (!recentRecords || recentRecords.length === 0) {
        return <div className="text-gray-400 italic">No records found for today.</div>;
    }

    return (
        <div className="space-y-4">
            {recentRecords.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-3">
                        {record.taken ? (
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                        ) : (
                            <XCircle className="w-6 h-6 text-red-500" />
                        )}
                        <div>
                            <p className="font-semibold text-white">{record.name}</p>
                            <p className="text-sm text-gray-400">Scheduled: {record.time}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.taken ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                            }`}>
                            {record.taken ? "Taken" : "Missed"}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MedicineRecordList;
