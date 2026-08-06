import mongoose from "mongoose";

const fallEventSchema = new mongoose.Schema(
  {
    fallType: {
      type: String,
      enum: ["ground", "bed"],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    buzzerTriggered: {
      type: Boolean,
      default: false,
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const FallEvent = mongoose.model("FallEvent", fallEventSchema);
export default FallEvent;
