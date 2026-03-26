import mongoose from "mongoose"
export const datasetSchema = new mongoose.Schema(
  {
    team: {   // ✅ FIXED
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    year: {
      type: Number,
      enum: [1, 2],
      required: true, // typo fix (require → required)
    },

    link: {
      type: String,
      default: null,
      trim: true,
    },

    theme: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Dataset = mongoose.model("Dataset", datasetSchema);