import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      trim: true,
      unique: true, // optional but recommended
    },

    teamYear: {
      type: Number,
      enum: [1, 2],
      required: true,
    },

    teamLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
    ],

    dataset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      default: null, // required hata diya (team create ke time dataset na ho sakta)
    },
  },
  {
    timestamps: true,
  }
);

export const Team = mongoose.model("Team", teamSchema);