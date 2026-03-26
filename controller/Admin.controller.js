import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Team } from "../model/team.js";
import { Score } from "../model/score.js";

const resolveDatasetTheme = (dataset) => {
  return dataset?.theme || "";
};

// ================= GET ALL TEAMS =================


export const getAllTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find()
    .populate("members", "name")
    .populate("dataset");

  const formattedTeams = await Promise.all(
    teams.map(async (team) => {
      const scores = await Score.find({ team: team._id });

      return {
        _id: team._id,
        teamName: team.teamName,
        members: team.members.map((m) => m.name),
        dataset: team.dataset,
        datasetTheme: resolveDatasetTheme(team.dataset),
        scores,
      };
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, formattedTeams, "Teams fetched successfully"));
});


// ================= GET TEAM DETAILS =================
export const getTeamDetails = asyncHandler(async (req, res) => {
  let { teamId } = req.params;

  if (!teamId) {
    throw new ApiError(400, "Team ID is required");
  }

  teamId = teamId.trim();

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new ApiError(400, "Invalid Team ID");
  }

  const team = await Team.findById(teamId)
    .populate("members", "name email")
    .populate("teamLeader", "name email")
    .populate("dataset");

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // ✅ fetch scores separately
  const scores = await Score.find({ team: teamId }).sort({ round: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        team: {
          ...team.toObject(),
          datasetTheme: resolveDatasetTheme(team.dataset),
        },
        scores,
      },
      "Team details fetched successfully"
    )
  );
});


// ================= GRADE TEAM (CREATE + UPDATE) =================

export const gradeTeam = asyncHandler(async (req, res) => {
  let { teamId } = req.params;

  if (!teamId) {
    throw new ApiError(400, "Team ID is required");
  }

  teamId = teamId.trim();

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new ApiError(400, "Invalid Team ID");
  }

  const { round, understanding, approach, result, presentation } = req.body;

  const numericRound = Number(round);

  // ✅ round validation
  if (![1, 2, 3].includes(numericRound)) {
    throw new ApiError(400, "Invalid round (1,2,3 allowed)");
  }

  if (
    [understanding, approach, result, presentation].some(
      (v) => v === undefined || v === null
    )
  ) {
    throw new ApiError(400, "All scoring parameters are required");
  }

  const u = Number(understanding);
  const a = Number(approach);
  const r = Number(result);
  const p = Number(presentation);

  if (
    u < 0 || u > 40 ||
    a < 0 || a > 30 ||
    r < 0 || r > 20 ||
    p < 0 || p > 10
  ) {
    throw new ApiError(400, "Scores exceed allowed limits");
  }

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  const totalScore = u + a + r + p;

  // 🔥 CHECK IF SCORE EXISTS (UPDATE CASE)
  let score = await Score.findOne({
    team: teamId,
    round: numericRound,
  });

  if (score) {
    // UPDATE
    score.understanding = u;
    score.approach = a;
    score.result = r;
    score.presentation = p;
    score.totalScore = totalScore;

    await score.save();
  } else {
    // CREATE
    score = await Score.create({
      team: teamId,
      round: numericRound,
      understanding: u,
      approach: a,
      result: r,
      presentation: p,
      totalScore,
    });
  }

  // return all scores sorted
  const allScores = await Score.find({ team: teamId }).sort({ round: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      allScores,
      `Round ${numericRound} graded successfully`
    )
  );
});