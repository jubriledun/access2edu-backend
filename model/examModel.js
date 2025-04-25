import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String], 
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
});

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    questions: [questionSchema], 
  },
  { timestamps: true }
);

const Exam = mongoose.model("Exam", examSchema);

export default Exam;