import { Bell, X, Check, Clock } from "lucide-react";

const MedicineReminderModal = ({ medicine, onAction, language = 'en' }) => {
    if (!medicine) return null;

    const t = {
        en: {
            title: "Medicine Time!",
            scheduledFor: "Scheduled for",
            taken: "Taken",
            snooze: "Snooze",
            no: "No"
        },
        np: {
            title: "औषधी खाने समय!",
            scheduledFor: "समय: ",
            taken: "खाएँ",
            snooze: "पछि",
            no: "छैन"
        }
    }[language];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full border border-gray-700 shadow-2xl animate-bounce-in">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                        <Bell className="w-10 h-10 text-white" />
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{t.title}</h2>
                        <p className="text-xl text-blue-400 font-semibold">{medicine.name}</p>
                        <p className="text-gray-400">{medicine.dosage}</p>
                        <p className="text-gray-500 text-sm mt-1">{t.scheduledFor} {medicine.time}</p>
                    </div>

                    <div className="grid grid-cols-1 w-full gap-3">
                        <button
                            onClick={() => onAction("Taken")}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-transform active:scale-95"
                        >
                            <Check className="w-6 h-6" />
                            <span>{t.taken}</span>
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => onAction("Snooze")}
                                className="py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition-transform active:scale-95"
                            >
                                <Clock className="w-5 h-5" />
                                <span>{t.snooze}</span>
                            </button>
                            <button
                                onClick={() => onAction("Skipped")}
                                className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition-transform active:scale-95"
                            >
                                <X className="w-5 h-5" />
                                <span>{t.no}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicineReminderModal;
