import Patient from "../schema/patient.js";
import Guardian from "../schema/guardian.js";

export const getPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.user.id).populate("guardians");
    if (!patient) {
      const error = new Error("Patient not found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const triggerEmergency = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.user.id).populate("guardians");
    if (!patient) {
      const error = new Error("Patient not found.");
      error.statusCode = 404;
      throw error;
    }

    // Logic to notify guardians and hospital
    // For now, we'll just simulate it
    const guardianNames = patient.guardians.map((g) => g.name).join(", ");
    const hospital = patient.preferredHospital?.name || "Unknown Hospital";

    console.log(`[EMERGENCY] Alert sent to Guardians: ${guardianNames}`);
    console.log(`[EMERGENCY] Hospital Notified: ${hospital}`);

    res.status(200).json({
      success: true,
      message: `Emergency alert sent to ${patient.guardians.length} guardians and ${hospital}.`,
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicineSchedule = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      const error = new Error("Patient not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: patient.medicineSchedule,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    // Prevent updating sensitive fields like password or email via this route if needed
    // For simplicity, allowing updates to passed fields

    const patient = await Patient.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const logMedicineRecord = async (req, res, next) => {
  try {
    const { name, dosage, time, taken, date } = req.body; // status: "Taken" | "Skipped"

    await Patient.findByIdAndUpdate(req.user.id, {
      $push: {
        medicineRecord: {
          name,
          dosage,
          time,
          taken: taken, // taken is already a boolean from frontend
          date: date || new Date(),
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Medicine record updated.",
    });
  } catch (error) {
    next(error);
  }
};
