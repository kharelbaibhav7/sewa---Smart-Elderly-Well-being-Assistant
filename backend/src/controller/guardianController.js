import Guardian from "../schema/guardian.js";
import Patient from "../schema/patient.js";

export const getGuardianProfile = async (req, res, next) => {
  try {
    const guardian = await Guardian.findById(req.user.id).populate("patient");
    if (!guardian) {
      const error = new Error("Guardian not found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      success: true,
      data: guardian,
    });
  } catch (error) {
    next(error);
  }
};

export const linkPatient = async (req, res, next) => {
  try {
    const { patientEmail } = req.body;
    const guardianId = req.user.id;

    const patient = await Patient.findOne({ email: patientEmail });
    if (!patient) {
      const error = new Error("Patient not found with that email.");
      error.statusCode = 404;
      throw error;
    }

    // Link patient to guardian
    await Guardian.findByIdAndUpdate(guardianId, { patient: patient._id });

    // Link guardian to patient
    await Patient.findByIdAndUpdate(patient._id, {
      $addToSet: { guardians: guardianId },
    });

    res.status(200).json({
      success: true,
      message: "Patient linked successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientData = async (req, res, next) => {
  try {
    const guardian = await Guardian.findById(req.user.id);
    if (!guardian || !guardian.patient) {
      const error = new Error("No patient linked to this guardian.");
      error.statusCode = 404;
      throw error;
    }

    const patient = await Patient.findById(guardian.patient);
    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const scheduleMedicine = async (req, res, next) => {
  try {
    const { name, dosage, time } = req.body;
    const guardian = await Guardian.findById(req.user.id);

    if (!guardian || !guardian.patient) {
      const error = new Error("No patient linked.");
      error.statusCode = 400;
      throw error;
    }

    // Update patient's medicine schedule
    const patient = await Patient.findByIdAndUpdate(
      guardian.patient,
      {
        $push: {
          medicineSchedule: { name, dosage, time },
        },
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Medicine scheduled successfully.",
      data: patient.medicineSchedule,
    });
  } catch (error) {
    next(error);
  }
};
