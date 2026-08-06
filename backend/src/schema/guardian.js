import mongoose from "mongoose";

const guardianSchema = new mongoose.Schema({
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
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  emergencyContacts: [
    {
      name: String,
      phone: String,
      relation: String,
    },
  ],
});

const Guardian = mongoose.model("Guardian", guardianSchema);
export default Guardian;
