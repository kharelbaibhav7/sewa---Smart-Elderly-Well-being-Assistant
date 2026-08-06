import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    Pill,
    User,
    LogOut,
    ChevronLeft,
    Languages
} from "lucide-react";
import toast from "react-hot-toast";
import MedicineScheduleList from "../components/MedicineScheduleList";
import MedicineReminderModal from "../components/MedicineReminderModal";

const translations = {
    en: {
        sos: "SOS",
        emergencyAlert: "Emergency Alert",
        medicines: "Medicines",
        profile: "Profile",
        back: "Back",
        myMedicines: "My Medicines",
        phone: "Phone",
        preferredHospital: "Preferred Hospital",
        notSet: "Not Set",
        sosSent: "SOS Sent! Help is arriving.",
        sosError: "Error sending alert.",
        snoozed: "Reminder snoozed for 5 minutes.",
        markedAs: "Marked as",
        medicineTime: "Medicine Time!",
        itIsTime: "It's time to take your",
        logout: "Logout",
        language: "नेपाली"
    },
    np: {
        sos: "SOS",
        emergencyAlert: "आपत्कालीन सेवा",
        medicines: "औषधी",
        profile: "विवरण",
        back: "फर्कनुहोस्",
        myMedicines: "मेरो औषधीहरू",
        phone: "फोन नम्बर",
        preferredHospital: "प्राथमिक अस्पताल",
        notSet: "सेट गरिएको छैन",
        sosSent: "SOS पठाइयो! मद्दत आउँदैछ।",
        sosError: "अलर्ट पठाउन समस्या भयो।",
        snoozed: "रिमाइन्डर ५ मिनेटको लागि स्थगित गरियो।",
        markedAs: "चिन्ह लगाइयो:",
        medicineTime: "औषधी खाने समय!",
        itIsTime: "तपाइँको औषधी खाने समय भयो",
        logout: "लगआउट",
        language: "English"
    }
};

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [view, setView] = useState("home"); // home, medicine, profile
    const [patient, setPatient] = useState(null);
    const [reminderMedicine, setReminderMedicine] = useState(null);
    const [processedReminders, setProcessedReminders] = useState(new Set()); // Keep track of alerted medicines for the day -> "name-time"
    const [language, setLanguage] = useState("en");

    const t = translations[language];

    // Audio for alerts
    const [audio] = useState(new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg"));

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8000/api/patient/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (data.success) {
                    setPatient(data.data);
                }
            } catch (error) {
                console.error("Error fetching patient", error);
            }
        };
        fetchProfile();

        // Request Notification Permission
        if ("Notification" in window) {
            Notification.requestPermission();
        }
    }, []);

    // Reminder Logic
    useEffect(() => {
        if (!patient?.medicineSchedule) return;

        const checkReminders = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const currentTime = `${hours}:${minutes}`;

            patient.medicineSchedule.forEach(med => {
                const medKey = `${med.name}-${med.time}`;

                if (med.time === currentTime && !processedReminders.has(medKey) && !reminderMedicine) {
                    setReminderMedicine(med);

                    // Play Sound
                    audio.loop = true;
                    audio.play().catch(e => console.log("Audio play failed:", e));

                    // Show Browser Notification
                    if (Notification.permission === "granted") {
                        const title = language === 'np' ? translations.np.medicineTime : translations.en.medicineTime;
                        const body = language === 'np'
                            ? `${translations.np.itIsTime} ${med.name} (${med.dosage})`
                            : `${translations.en.itIsTime} ${med.name} (${med.dosage})`;

                        new Notification(title, {
                            body: body,
                            icon: "/vite.svg" // default vite icon as placeholder
                        });
                    }
                }
            });
        };

        const interval = setInterval(checkReminders, 10000); // Check every 10 sec
        return () => clearInterval(interval);
    }, [patient, processedReminders, reminderMedicine, audio, language]);

    const handleReminderAction = async (action) => {
        // action: "Taken", "Skipped", "Snooze"

        // Stop Audio
        audio.pause();
        audio.currentTime = 0;

        if (action === "Snooze") {
            toast(t.snoozed, { icon: "💤" });
            setReminderMedicine(null);

            setTimeout(() => {
                // Re-trigger (this will trigger the effect again which plays audio)
                // However, we need to ensure processedReminders doesn't block it.
                // Actually, if we setReminderMedicine, the effect won't trigger 'new' one,
                // but we need to re-play audio.
                // Current logic: setReminderMedicine triggers re-render, but effect checks processedReminders.
                // Ideally, we just re-raise the state.
                setReminderMedicine(reminderMedicine);
                audio.play().catch(e => console.log("Audio play failed:", e));
            }, 300000); // 5 minutes real snooze (300000ms)
            return;
        }

        const medKey = `${reminderMedicine.name}-${reminderMedicine.time}`;
        setProcessedReminders(prev => new Set(prev).add(medKey));

        try {
            const token = localStorage.getItem("token");
            await fetch("http://localhost:8000/api/patient/medicine-record", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: reminderMedicine.name,
                    dosage: reminderMedicine.dosage,
                    time: reminderMedicine.time,
                    taken: action === "Taken",
                    date: new Date()
                })
            });
            toast.success(`${t.markedAs} ${action}`);
        } catch (e) {
            console.error(e);
        }
        setReminderMedicine(null);
    };


    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === "en" ? "np" : "en");
    };

    const handleEmergency = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/patient/emergency", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            const data = await response.json();
            if (data.success) {
                toast.success(t.sosSent, {
                    duration: 5000,
                    icon: '🚨',
                    style: {
                        borderRadius: '10px',
                        background: '#ef4444',
                        color: '#fff',
                    },
                });
            }
        } catch (e) {
            toast.error(t.sosError);
        }
    };

    if (view === "medicine") {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
                <button onClick={() => setView("home")} className="flex items-center text-gray-400 mb-6 hover:text-white transition-colors">
                    <ChevronLeft className="w-6 h-6 mr-1" /> {t.back}
                </button>
                <h2 className="text-2xl font-bold mb-6">{t.myMedicines}</h2>
                <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700">
                    <MedicineScheduleList schedule={patient?.medicineSchedule} language={language} />
                </div>
            </div>
        );
    }

    if (view === "profile") {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
                <button onClick={() => setView("home")} className="flex items-center text-gray-400 mb-6 hover:text-white transition-colors">
                    <ChevronLeft className="w-6 h-6 mr-1" /> {t.back}
                </button>
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="h-24 bg-linear-to-r from-emerald-500 to-teal-500"></div>
                    <div className="p-6">
                        <div className="relative -mt-16 mb-4">
                            <div className="w-24 h-24 rounded-full border-4 border-gray-800 bg-gray-700 flex items-center justify-center text-3xl font-bold">
                                {patient?.name?.charAt(0)}
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold">{patient?.name}</h2>
                        <p className="text-gray-400">{patient?.email}</p>
                        <div className="mt-6 space-y-4">
                            <div className="p-4 bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-400">{t.phone}</p>
                                <p className="text-lg">{patient?.phone}</p>
                            </div>
                            <div className="p-4 bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-400">{t.preferredHospital}</p>
                                <p className="text-lg">{patient?.preferredHospital?.name || t.notSet}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center">
            <MedicineReminderModal
                medicine={reminderMedicine}
                onAction={handleReminderAction}
                language={language}
            />
            {/* Header */}
            <header className="w-full p-4 md:p-6 bg-gray-800 border-b border-gray-700 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-3xl font-bold bg-linear-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                    SEWA
                </h1>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-white transition-colors border border-gray-600"
                    >
                        <Languages className="w-5 h-5" />
                        <span className="text-sm font-medium">{t.language}</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-white transition-colors"
                        title={t.logout}
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Main Grid */}
            <main className="flex-1 p-4 md:p-6 w-full max-w-lg flex flex-col space-y-4 md:space-y-6 justify-center">
                {/* BIG EMERGENCY BUTTON */}
                <button
                    onClick={handleEmergency}
                    className="w-full aspect-square max-h-80 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center space-y-2 md:space-y-4 shadow-2xl shadow-red-900/50 transition-transform active:scale-95"
                >
                    <AlertTriangle className="w-24 h-24 md:w-32 md:h-32 text-white animate-pulse" />
                    <span className="text-3xl md:text-5xl font-extrabold text-white uppercase tracking-widest leading-tight text-center">
                        {t.sos}
                    </span>
                    <span className="text-red-200 text-base md:text-xl font-medium">{t.emergencyAlert}</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {/* Medicine Reminders */}
                    <button
                        onClick={() => setView("medicine")}
                        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center space-y-2 md:space-y-3 shadow-lg transition-transform active:scale-95 h-32 md:h-40"
                    >
                        <Pill className="w-10 h-10 md:w-12 md:h-12 text-white" />
                        <span className="text-lg md:text-2xl font-bold text-white">{t.medicines}</span>
                    </button>

                    {/* Profile */}
                    <button
                        onClick={() => setView("profile")}
                        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center space-y-2 md:space-y-3 shadow-lg transition-transform active:scale-95 h-32 md:h-40"
                    >
                        <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
                        <span className="text-lg md:text-2xl font-bold text-white">{t.profile}</span>
                    </button>

                </div>
            </main>
        </div>
    );
};

export default PatientDashboard;
