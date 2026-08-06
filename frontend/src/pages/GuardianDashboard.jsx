import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Activity,
    Calendar,
    LogOut,
    Bell,
    RefreshCcw,
    Menu,
    X
} from "lucide-react";
import toast from "react-hot-toast";
import LinkPatient from "../components/LinkPatient";
import PatientStats from "../components/PatientStats";
import MedicineScheduler from "../components/MedicineScheduler";
import MedicineScheduleList from "../components/MedicineScheduleList";
import MedicineRecordList from "../components/MedicineRecordList";
import DateNavigation from "../components/DateNavigation";
import HeartRateStats from "../components/HeartRateStats";
import SleepStats from "../components/SleepStats";

const GuardianDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const fetchPatientData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/guardian/patient-info", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (data.success) {
                setPatient(data.data);
            } else {
                // toast.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching patient", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatientData();
        const interval = setInterval(fetchPatientData, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [fetchPatientData]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    md:relative md:translate-x-0
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="p-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                            SEWA
                        </h1>
                        <p className="text-xs font-medium text-gray-500 tracking-wider uppercase mt-1">Guardian Portal</p>
                    </div>
                    <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button
                        onClick={() => { setActiveTab("overview"); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === "overview" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        <Activity className="w-5 h-5" />
                        <span className="font-medium">Overview</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab("patients"); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === "patients" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        <span className="font-medium">My Patient</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab("schedule"); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === "schedule" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">Medicine Schedule</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto w-full relative">
                <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm p-4 md:p-8 flex justify-between items-center border-b border-gray-800 md:border-none">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 -ml-2 rounded-lg text-gray-400 hover:bg-gray-800 md:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">
                                {activeTab === "overview" && "Dashboard Overview"}
                                {activeTab === "patients" && "Patient Details"}
                                {activeTab === "schedule" && "Medicine Scheduler"}
                            </h2>
                            <p className="hidden md:block text-gray-400 text-sm mt-1">Manage your patient's well-being</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button
                            onClick={fetchPatientData}
                            title="Refresh Data"
                            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        >
                            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors relative hidden sm:block">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-800"></span>
                        </button>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg text-sm md:text-base">
                            G
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in-up pb-20 md:pb-8">
                    {!patient && !loading ? (
                        <div className="max-w-md mx-auto mt-10 md:mt-20 px-4">
                            <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 mb-6 text-center">
                                No patient linked yet. Please link a patient to view data.
                            </div>
                            <LinkPatient onLinkSuccess={fetchPatientData} />
                        </div>
                    ) : loading && !patient ? (
                        <div className="flex justify-center mt-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === "overview" && (
                                <>
                                    {/* Top Row: Medicines and Activity */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col">
                                            <h3 className="text-lg font-bold text-white mb-4">Upcoming Medicines</h3>
                                            <MedicineScheduleList schedule={patient?.medicineSchedule?.slice(0, 3)} />
                                        </div>
                                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col">
                                            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                                            <MedicineRecordList records={patient?.medicineRecord} />
                                        </div>
                                    </div>

                                    {/* Date Navigation */}
                                    <DateNavigation selectedDate={selectedDate} onDateChange={setSelectedDate} />

                                    {/* Health Stats Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Heart Rate Section */}
                                        <div className="h-full">
                                            <HeartRateStats />
                                        </div>

                                        {/* Sleep Stats Section */}
                                        <div className="h-full">
                                            <SleepStats />
                                        </div>
                                    </div>

                                    {/* Extra Stats below if needed */}
                                    <div className="mt-8">
                                        <PatientStats stats={patient?.stats} />
                                    </div>
                                </>
                            )}

                            {activeTab === "patients" && (
                                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                    <div className="h-24 md:h-32 bg-gradient-to-r from-blue-600 to-emerald-600"></div>
                                    <div className="px-6 md:px-8 pb-8">
                                        <div className="relative -mt-12 md:-mt-16 mb-4">
                                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gray-800 bg-gray-700 flex items-center justify-center text-3xl md:text-4xl font-bold">
                                                {patient.name.charAt(0)}
                                            </div>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-bold text-white">{patient.name}</h3>
                                        <p className="text-gray-400">{patient.email}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                            <div>
                                                <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Personal Information</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Phone</span>
                                                        <span>{patient.phone}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Emergency Contact</span>
                                                        <span>{patient.emergencyContacts?.[0]?.phone || "N/A"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Medical Profile</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Preferred Hospital</span>
                                                        <span>{patient.preferredHospital?.name || "Not set"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "schedule" && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <MedicineScheduler onScheduleAdded={fetchPatientData} />
                                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                        <h3 className="text-xl font-bold text-white mb-4">Complete Schedule</h3>
                                        <MedicineScheduleList schedule={patient?.medicineSchedule} />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GuardianDashboard;
