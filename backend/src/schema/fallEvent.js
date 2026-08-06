import mongoose from "mongoose";

const fallEventSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  fallType: {
    type: String,
    enum: ["ground", "bed"],
    required: true,
  },
  confidence: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  buzzerTriggered: {
    type: Boolean,
    default: true,
  },
  acknowledged: {
    type: Boolean,
    default: false,
  },
  acknowledgedAt: {
    type: Date,
  },
});

const FallEvent = mongoose.model("FallEvent", fallEventSchema);
export default FallEvent;
