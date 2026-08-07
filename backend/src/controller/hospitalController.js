import asyncHandler from "express-async-handler";
import Hospital from "../schema/hospital.js";
import Patient from "../schema/patient.js";

export const getHospitalProfile = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.user.id).populate(
    "patients",
    "name email phone",
  );
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
  const hospital = await Hospital.findById(req.user.id).populate(
    "patients",
    "name email phone preferredHospital hospitalNotes",
  );
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

export const addHospitalNote = asyncHandler(async (req, res) => {
  const { patientId, noteText } = req.body;
  const hospitalId = req.user.id;

  if (!patientId || !noteText) {
    const error = new Error("Patient ID and note text are required.");
    error.statusCode = 400;
    throw error;
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    const error = new Error("Patient not found.");
    error.statusCode = 404;
    throw error;
  }

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    const error = new Error("Hospital not found.");
    error.statusCode = 404;
    throw error;
  }

  // Ensure the hospital is linked to the patient before adding a note
  const isLinked = hospital.patients?.some(
    (id) => id.toString() === patientId.toString(),
  );
  if (!isLinked) {
    const error = new Error("Hospital is not linked to this patient.");
    error.statusCode = 403;
    throw error;
  }

  const updatedPatient = await Patient.findByIdAndUpdate(
    patientId,
    {
      $push: {
        hospitalNotes: {
          text: noteText,
          hospital: hospital._id,
          hospitalName: hospital.name,
        },
      },
    },
    { new: true },
  );

  res.status(200).json({
    success: true,
    message: "Note added successfully.",
    data: updatedPatient.hospitalNotes,
  });
});
