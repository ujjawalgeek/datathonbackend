import { Router } from "express";
import { gradeTeam,getAllTeams,getTeamDetails } from "../controller/Admin.controller.js";

const adminRouter=Router();
//routes
adminRouter.route("/grade/:teamId").post(gradeTeam);
adminRouter.route("/getAllTeams").get(getAllTeams)
adminRouter.route("/teamDetails/:teamId").post(getTeamDetails)

export default adminRouter