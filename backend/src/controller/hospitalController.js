import asyncHandler from "express-async-handler";
import Hospital from "../schema/hospital.js";
import Patient from "../schema/patient.js";

export const getHospitalProfile = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.user.id).populate("patients", "name email phone");
  if (!hospital) {
    const error = new Error("Hospital not found.");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: hospital,
  });
});

export const linkPatient = asyncHandler(async (req, res) => {
  const { patientEmail } = req.body;
  const hospitalId = req.user.id;

  const patient = await Patient.findOne({ email: patientEmail });
  if (!patient) {
    const error = new Error("Patient not found with that email.");
    error.statusCode = 404;
    throw error;
  }

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    const error = new Error("Hospital not found.");
    error.statusCode = 404;
    throw error;
  }

  await Hospital.findByIdAndUpdate(hospitalId, {
    $addToSet: { patients: patient._id },
  });

  await Patient.findByIdAndUpdate(patient._id, {
    hospital: hospital._id,
    preferredHospital: {
      name: hospital.name,
      address: hospital.address || "",
      contact: hospital.phone,
    },
  });

  res.status(200).json({
    success: true,
    message: "Patient linked to hospital successfully.",
  });
});

export const getHospitalPatients = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.user.id).populate("patients", "name email phone preferredHospital");
  if (!hospital) {
    const error = new Error("Hospital not found.");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    patients: hospital.patients || [],
  });
});
