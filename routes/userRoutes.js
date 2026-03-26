import { Router } from "express";
import { createTeam ,saveDatasetToTeam,verifyLeader} from "../controller/user.js"
import { isAuthenticated } from "../middleware/authentic.js";

const userRouter=Router();

userRouter.route("/create").post(isAuthenticated,createTeam)

// userRouter.route("/sendotp").post(sendOTP)
// userRouter.route("/verifyotp").get(verifyOTP)
userRouter.post("/verify-leader", verifyLeader);
userRouter.route("/getDataSet/:teamId").post(isAuthenticated,saveDatasetToTeam);

export default userRouter