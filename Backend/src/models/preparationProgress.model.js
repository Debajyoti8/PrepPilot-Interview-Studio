const mongoose = require("mongoose")

const preparationProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true, index: true },
    interviewReport: { type: mongoose.Schema.Types.ObjectId, ref: "InterviewReport", required: true, index: true },
    completedTasks: { type: [String], default: [] }
}, { timestamps: true })

preparationProgressSchema.index({ user: 1, interviewReport: 1 }, { unique: true })

module.exports = mongoose.model("PreparationProgress", preparationProgressSchema)
