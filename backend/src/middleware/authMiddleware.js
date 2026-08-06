import jwt from "jsonwebtoken";
import { secretKey } from "../constant/constant.js";

export const verifyToken = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    const error = new Error("Access denied. No token provided.");
    error.statusCode = 401;
    return next(error);
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    const error = new Error("Invalid token.");
    error.statusCode = 400;
    next(error);
  }
};

export const isGuardian = (req, res, next) => {
  if (req.user && req.user.role === "guardian") {
    next();
  } else {
    const error = new Error("Access denied. Guardians only.");
    error.statusCode = 403;
    next(error);
  }
};

export const isPatient = (req, res, next) => {
  if (req.user && req.user.role === "patient") {
    next();
  } else {
    const error = new Error("Access denied. Patients only.");
    error.statusCode = 403;
    next(error);
  }
};
