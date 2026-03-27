import { Student } from "../model/student.js";
import { Team } from "../model/team.js";
import { Dataset } from "../model/dataset.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";



/* ================= VERIFY LEADER ================= */

export const verifyLeader = asyncHandler(async (req, res) => {

  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const student = await Student.findOne({ email });

  if (!student) {
    throw new ApiError(404, "Student not registered for the event");
  }

  // store session
  req.session.user = student;

  await new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const existingTeam = await Team.findOne({
    members: student._id
  })
    .populate("teamLeader", "name email")
    .populate("members", "name email")
    .populate("dataset");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        leader: {
          id: student._id,
          name: student.name,
          email: student.email,
          year: student.year
        },
        team: existingTeam || null
      },
      existingTeam
        ? "Leader already has a team"
        : "Leader verified successfully"
    )
  );

});



/* ================= CREATE TEAM ================= */

export const createTeam = asyncHandler(async (req, res) => {

  const leader = req.session.user;

  if (!leader) {
    throw new ApiError(401, "Session expired. Please login again");
  }

  const { teamName, memberEmail } = req.body;

  if (!teamName || !memberEmail) {
    throw new ApiError(400, "Team name and member email required");
  }

  if (leader.email === memberEmail) {
    throw new ApiError(400, "Leader and member must be different");
  }

  const member = await Student.findOne({ email: memberEmail });

  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  if (leader.year !== member.year) {
    throw new ApiError(400, "Both members must be from same year");
  }

  // leader already in team
  const leaderTeam = await Team.findOne({
    members: leader._id
  });

  if (leaderTeam) {

    if (leaderTeam.dataset) {
      throw new ApiError(400, "Leader already created a team");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        leaderTeam,
        "Team already exists, proceed to dataset selection"
      )
    );
  }

  // member already in team
  const memberTeam = await Team.findOne({
    members: member._id
  });

  if (memberTeam) {
    throw new ApiError(400, "Member already in a team");
  }

  // duplicate team name
  const existingTeamName = await Team.findOne({ teamName });

  if (existingTeamName) {
    throw new ApiError(400, "Team name already taken");
  }

  const team = await Team.create({
    teamName,
    teamYear: leader.year,
    teamLeader: leader._id,
    members: [leader._id, member._id],
    dataset: null
  });

  const populatedTeam = await Team.findById(team._id)
    .populate("teamLeader", "name email")
    .populate("members", "name email")
    .populate("dataset");

  return res.status(201).json(
    new ApiResponse(201, populatedTeam, "Team created successfully")
  );

});



/* ================= GET MY TEAM ================= */

export const getMyTeam = asyncHandler(async (req, res) => {

  const leader = req.session.user;

  if (!leader) {
    throw new ApiError(401, "Session expired. Please login again");
  }

  const team = await Team.findOne({
    members: leader._id
  })
    .populate("teamLeader", "name email")
    .populate("members", "name email")
    .populate("dataset");

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      team,
      "Team fetched successfully"
    )
  );

});



/* ================= SAVE DATASET ================= */

export const saveDatasetToTeam = asyncHandler(async (req, res) => {

  const { theme } = req.body;
  const { teamId } = req.params;

  if (!teamId || !theme) {
    throw new ApiError(400, "teamId and theme are required");
  }

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  if (team.dataset) {
    throw new ApiError(400, "Dataset already assigned to this team");
  }

  const normalizedTheme = String(theme).trim().toLowerCase();

  const allowedThemes = [
    "finance",
    "sports",
    "education",
    "healthcare",
    "studentperformance"
  ];

  if (!allowedThemes.includes(normalizedTheme)) {
    throw new ApiError(400, "Invalid dataset theme");
  }

  const dataset = await Dataset.create({
    team: teamId,
    year: team.teamYear,
    theme: normalizedTheme,
    link: null
  });

  team.dataset = dataset._id;
  await team.save();

  const updatedTeam = await Team.findById(teamId)
    .populate("dataset")
    .populate("members", "name email");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        team: updatedTeam,
        dataset,
        assignedDataset: {
          theme: normalizedTheme,
          year: team.teamYear
        }
      },
      "Dataset assigned to team successfully"
    )
  );

});