import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique:true,
      minlength: [2, "Name must be at least 3 characters long"],
      maxlength: 50,
      match: [
      /^[A-Za-z\s]+$/,
      "Name must contain only letters and spaces",
  ],
    },

    studentNo: {
      type: String,
      required: true,
      unique:true,
      match: [
  /^(25|24)\d{5,8}$/,
  "Student number must start with 24 or 25 and be 7–10 digits long",
],

    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique:true,
      match: [
        /^[a-zA-Z0-9._%+-]+@akgec\.ac\.in$/,
        "Email must be a valid AKGEC email (ending with @akgec.ac.in)",
      ],
    },

    gender: {
      type: String,
      required: true,
      lowercase: true,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be male, female, or other",
      },
    },

    branch: {
      type: String,
      required: true,
      enum: {
        values: [
          "CSE",
      "CSE AIML",
      "CSE DS",
      "AIML",
      "CS",
      "CS(H)",
      "IT",
      "CSIT",
      "ECE",
      "EN",
      "ME",
      "CIVIL",
        ],
        message: "Provide a valid branch",
      },
    },

    phoneNo: {
      type: String,
      required: true,
      match: [
        /^[6-9]\d{9}$/,
        "Phone number must be a valid 10-digit Indian mobile number",
      ],
    },

    residence: {
      type: String,
      required: true,
      enum: {
        values: ["Day Scholar", "Hosteller"],
        message: "Provide residence (DayScholar or Hostler)",
      },
    },
    year:{
        type: Number,
        required: true,
        enum:{
          values:[1,2],
          message:["Only 1st and 2nd year is allowed"]
        }
    }
        
    },
  { timestamps: true }
);

export const Student = mongoose.model("Student", studentSchema);
