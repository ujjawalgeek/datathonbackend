import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    round: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
    },

    understanding: {
      type: Number,
      required: true,
    },

    approach: {
      type: Number,
      required: true,
    },

    result: {
      type: Number,
      required: true,
    },

    presentation: {
      type: Number,
      required: true,
    },

    totalScore: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const Score = mongoose.model("Score", scoreSchema);