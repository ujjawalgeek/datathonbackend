import nodemailer from "nodemailer";
import { Student } from "../model/student.js";
import { Team } from "../model/team.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Dataset } from "../model/dataset.js";


// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // ✅ use ENV (IMPORTANT)
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });




// // ================= SEND OTP =================
// export const sendOTP = asyncHandler(async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     throw new ApiError(400, "Email is required");
//   }

//   const user = await Student.findOne({ email });

//   if (!user) {
//     throw new ApiError(400, "Entered email is not registered");
//   }

//   const existedLeader = await Team.findOne({ _id: user._id });

//   if (existedLeader) {
//     throw new ApiError(400, "Leader has already registered");
//   }

//   const otp = generateOTP();

//   // store session
//   req.session.otp = otp;
//   req.session.user = user;

//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Your Login OTP",
//     text: `Your OTP is ${otp}`,
//   });
//   console.log(req.session);

//   return res
//     .status(200)
//     .json(new ApiResponse(200, null, "OTP sent successfully"));
// });


// export const verifyOTP = async (req, res) => {
//   try {
//     const { otp } = req.body;

//     if (!req.session.otp) {
//       return res.status(400).json({ message: "Session expired" });
//     }

//     if (req.session.otp !== otp) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     // OTP clear
//     req.session.otp = null;

//     // User fetch
//     const user = await Student.findById(req.session.user._id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Session me store
//     req.user = user;

//     res.status(200).json({
//       message: "Login successful",
//       user,
//     });

//   } catch (err) {
//     console.log(err)
//     res.status(500).json({ error: err.message });
//   }
//   };


export const verifyLeader = asyncHandler(async (req, res) => {

  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // find student
  const student = await Student.findOne({ email });

  if (!student) {
    throw new ApiError(404, "Student not registered for the event");
  }

  // store session
  req.session.user = student;
  await new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

  // check if leader already has a team
  const existingTeam = await Team.findOne({
    members: student._id
  })
    .populate("teamLeader", "name email")
    .populate("members", "name email")
    .populate("dataset");

  // if team exists return full team data
  if (existingTeam) {
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
          team: existingTeam
        },
        "Leader already has a team"
      )
    );
  }

  // if team does not exist
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
        team: null
      },
      "Leader verified successfully"
    )
  );

});


export const createTeam = asyncHandler(async (req, res) => {

const leader = req.session.user;

const { teamName, memberEmail } = req.body;

if (!teamName || !memberEmail) {
throw new ApiError(400, "Team name and member email required");
}

const leaderTeam = await Team.findOne({
members: leader._id
});

// 🔥 TEAM ALREADY EXISTS
if (leaderTeam) {

if (leaderTeam.dataset) {
throw new ApiError(400, "Leader already created a team");
}

// allow dataset step
return res.status(200).json(
new ApiResponse(
200,
leaderTeam,
"Team already exists, proceed to dataset selection"
)
);
}

// continue normal team creation
const member = await Student.findOne({ email: memberEmail });

if (!member) {
throw new ApiError(404, "Member not found");
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

  const normalizedTheme = String(theme).trim().toLowerCase();

  // ✅ prevent duplicate dataset
  if (team.dataset) {
    throw new ApiError(400, "Dataset already assigned to this team");
  }

  // ✅ create dataset (according to schema)
  const dataset = await Dataset.create({
    team: teamId,
    year: team.teamYear, // 🔥 auto from team
    link: null,
    theme: normalizedTheme,
  });

  // ✅ link dataset to team
  team.dataset = dataset._id;
  await team.save();

  // ✅ populated response
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
          year: team.teamYear,
        },
      },
      "Dataset assigned to team successfully"
    )
  );
});