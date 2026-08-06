import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  guardians: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guardian",
    },
  ],
  stats: {
    sleepTime: { type: String, default: "7h 30m" }, // Dummy
    sleepQuality: { type: String, default: "Good" }, // Dummy
    steps: { type: Number, default: 4500 }, // Dummy
    spo2: { type: Number, default: 98 }, // Dummy
    heartRate: { type: Number, default: 72 }, // Dummy
    temperature: { type: Number, default: 36.6 }, // Dummy
  },
  checkupHistory: [
    {
      date: Date,
      doctor: String,
      hospital: String,
      diagnosis: String,
      prescription: String,
    },
  ],
  medicineRecord: [
    {
      name: String,
      dosage: String,
      time: String,
      taken: Boolean,
      date: { type: Date, default: Date.now },
    },
  ],
  medicineSchedule: [
    {
      name: String,
      dosage: String,
      time: String, // e.g., "08:00 AM"
    },
  ],
  emergencyContacts: [
    {
      name: String,
      phone: String,
      relation: String,
    },
  ],
  location: {
    lat: { type: Number, default: 27.7172 }, // Dummy: Kathmandu
    lng: { type: Number, default: 85.324 },
  },
  preferredHospital: {
    name: String,
    address: String,
    contact: String,
  },
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
