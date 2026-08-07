import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  ClipboardList,
  LogOut,
  RefreshCcw,
  Menu,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import LinkPatientHospital from "../components/LinkPatientHospital";

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [hospital, setHospital] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [noteTexts, setNoteTexts] = useState({});

  const fetchHospitalData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const profileRes = await fetch("http://localhost:8000/api/hospital/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      if (profileData.success) {
        setHospital(profileData.data);
      }

      const patientsRes = await fetch("http://localhost:8000/api/hospital/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const patientsData = await patientsRes.json();
      if (patientsData.success) {
        setPatients(patientsData.patients || []);
      }
    } catch (error) {
      console.error("Error fetching hospital data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitalData();
  }, [fetchHospitalData]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNoteChange = (patientId, value) => {
    setNoteTexts((prev) => ({
      ...prev,
      [patientId]: value,
    }));
  };

  const handleAddNote = async (patientId) => {
    const noteText = noteTexts[patientId]?.trim();
    if (!noteText) {
      toast.error("Please enter a note before submitting.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/hospital/patient-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ patientId, noteText }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Note sent to guardian.");
        setNoteTexts((prev) => ({ ...prev, [patientId]: "" }));
        fetchHospitalData();
      } else {
        toast.error(data.message || "Unable to send note.");
      }
    } catch (error) {
      console.error("Error adding note", error);
      toast.error("Unable to send note. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/sewa.svg" alt="SEWA" className="h-10 w-auto" />
            <div>
              <p className="text-xs font-medium text-gray-500 tracking-wider uppercase">Hospital Portal</p>
            </div>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => { setActiveTab("overview"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === "overview" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
          >
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </button>
          <button
            onClick={() => { setActiveTab("patients"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === "patients" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Linked Patients</span>
          </button>
          <button
            onClick={() => { setActiveTab("link"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === "link" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="font-medium">Link Patient</span>
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
                {activeTab === "overview" && "Hospital Overview"}
                {activeTab === "patients" && "Linked Patients"}
                {activeTab === "link" && "Link Patient"}
              </h2>
              <p className="hidden md:block text-gray-400 text-sm mt-1">Manage your hospital's patient connections</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={fetchHospitalData}
              title="Refresh Data"
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-linear-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg text-sm md:text-base">
              H
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 md:space-y-8 pb-20 md:pb-8">
          {!hospital && !loading ? (
            <div className="max-w-md mx-auto mt-10 md:mt-20 px-4">
              <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 mb-6 text-center">
                No hospital profile found. Please log in again or register.
              </div>
            </div>
          ) : loading && !hospital ? (
            <div className="flex justify-center mt-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-3">Hospital</h3>
                    <p className="text-gray-400">{hospital.name}</p>
                    <p className="text-sm text-gray-500 mt-2">{hospital.email}</p>
                    <p className="text-sm text-gray-500 mt-1">{hospital.phone}</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-3">Address</h3>
                    <p className="text-gray-400">{hospital.address || "Not provided"}</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-3">Linked Patients</h3>
                    <p className="text-4xl font-bold text-white">{patients.length}</p>
                  </div>
                </div>
              )}

              {activeTab === "patients" && (
                <div className="space-y-4">
                  {patients.length === 0 ? (
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-gray-400">
                      No patients linked yet. Use the Link Patient tab to connect a patient.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {patients.map((patient) => (
                        <div key={patient._id} className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-semibold text-white">{patient.name}</h3>
                              <p className="text-gray-400">{patient.email}</p>
                              <p className="text-gray-400 mt-1">{patient.phone}</p>
                            </div>
                            <span className="rounded-full bg-emerald-500/10 text-emerald-200 px-3 py-1 text-sm font-semibold">Linked</span>
                          </div>
                          <div className="mt-6 space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Send note to guardian</label>
                            <textarea
                              rows={4}
                              value={noteTexts[patient._id] || ""}
                              onChange={(e) => handleNoteChange(patient._id, e.target.value)}
                              className="w-full resize-none rounded-2xl border border-gray-700 bg-gray-900 p-3 text-sm text-gray-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              placeholder="Add information for the guardian..."
                            />
                            <button
                              onClick={() => handleAddNote(patient._id)}
                              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                            >
                              Send Note
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "link" && (
                <div className="grid grid-cols-1 lg:grid-cols-[0.65fr_0.35fr] gap-6">
                  <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-4">Link a Patient</h2>
                    <p className="text-gray-400 mb-6">
                      Enter the email of a registered patient to connect them with your hospital.
                    </p>
                    <LinkPatientHospital onLinkSuccess={fetchHospitalData} />
                  </div>
                  <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-3">Hospital Linking</h3>
                    <p className="text-gray-400">
                      Once linked, patient emergency alerts will include this hospital as the preferred contact.
                    </p>
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

export default HospitalDashboard;
