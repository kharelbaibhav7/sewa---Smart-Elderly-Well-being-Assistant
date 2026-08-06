import Guardian from "../schema/guardian.js";
import Patient from "../schema/patient.js";
import Hospital from "../schema/hospital.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { secretKey } from "../constant/constant.js";

const generateToken = (payload) => {
  return jwt.sign(payload, secretKey, { expiresIn: "30d" });
};

export const registerGuardian = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    let guardian = await Guardian.findOne({ email });
    if (guardian) {
      const error = new Error("Guardian already exists.");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    guardian = await Guardian.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    const token = generateToken({
      id: guardian._id,
      role: "guardian",
    });

    res.status(201).json({
      success: true,
      message: "Guardian registered successfully.",
      token,
      data: {
        id: guardian._id,
        name: guardian.name,
        email: guardian.email,
        role: "guardian",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const registerPatient = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    let patient = await Patient.findOne({ email });
    if (patient) {
      const error = new Error("Patient already exists.");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    patient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    const token = generateToken({
      id: patient._id,
      role: "patient",
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully.",
      token,
      data: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        role: "patient",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const registerHospital = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    let hospital = await Hospital.findOne({ email });
    if (hospital) {
      const error = new Error("Hospital already exists.");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    hospital = await Hospital.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address: address || "",
    });

    const token = generateToken({
      id: hospital._id,
      role: "hospital",
    });

    res.status(201).json({
      success: true,
      message: "Hospital registered successfully.",
      token,
      data: {
        id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        role: "hospital",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body; // Role is required to know which collection to query

    if (!role || (role !== "guardian" && role !== "patient" && role !== "hospital")) {
      const error = new Error("Invalid or missing role.");
      error.statusCode = 400;
      throw error;
    }

    let user;
    if (role === "guardian") {
      user = await Guardian.findOne({ email });
    } else if (role === "patient") {
      user = await Patient.findOne({ email });
    } else {
      user = await Hospital.findOne({ email });
    }

    if (!user) {
      const error = new Error("Invalid credentials.");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid credentials.");
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({
      id: user._id,
      role: role,
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
      },
    });
  } catch (error) {
    next(error);
  }
};
