import { Pill, Clock } from "lucide-react";

const MedicineScheduleList = ({ schedule, language = 'en' }) => {
    const noMedText = language === 'np' ? "कुनै औषधी तालिका छैन।" : "No medicines scheduled.";

    if (!schedule || schedule.length === 0) {
        return <p className="text-gray-400">{noMedText}</p>;
    }

    return (
        <div className="space-y-4">
            {schedule.map((item, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Pill className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-sm text-gray-400">{item.dosage}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{item.time}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MedicineScheduleList;
