const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const preparationProgressModel = require("../models/preparationProgress.model")
const mongoose = require("mongoose")
const { parseTaskKey } = require("../utils/preparationTask")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    const selfDescription = typeof req.body.selfDescription === "string" ? req.body.selfDescription : ""
    const jobDescription = typeof req.body.jobDescription === "string" ? req.body.jobDescription : ""
    const requestedDays = Number(req.body.preparationDays)
    const preparationDays = [3, 7, 14].includes(requestedDays) ? requestedDays : 7

    if (!req.file && !selfDescription.trim()) {
        return res.status(400).json({ message: "Please upload a PDF resume or provide a self-description." })
    }

    if (!String(jobDescription).trim()) {
        return res.status(400).json({ message: "Please provide a job description." })
    }

    if (jobDescription.length > 5000 || selfDescription.length > 5000) {
        return res.status(400).json({ message: "The job description or self-description is too long." })
    }

    let resumeText = ""
    if (req.file) {
        const parsedResume = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
        resumeText = parsedResume.text || ""
        if (!resumeText.trim()) return res.status(400).json({ message: "The uploaded PDF contains no extractable text. Try a text-based PDF or add a self-description." })
    }

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription,
        preparationDays
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeText,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findOne({
        _id: interviewReportId,
        user: req.user.id
    })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

async function getPreparationProgressController(req, res) {
    const { interviewReportId } = req.params
    if (!mongoose.isValidObjectId(interviewReportId)) return res.status(400).json({ message: "Invalid interview report ID." })
    const report = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id }).select("_id")
    if (!report) return res.status(404).json({ message: "Interview report not found." })
    const progress = await preparationProgressModel.findOne({ user: req.user.id, interviewReport: interviewReportId }).lean()
    return res.status(200).json({ completedTasks: progress?.completedTasks || [] })
}

async function updatePreparationProgressController(req, res) {
    const { interviewReportId } = req.params
    const { taskKey, completed } = req.body || {}
    if (!mongoose.isValidObjectId(interviewReportId)) return res.status(400).json({ message: "Invalid interview report ID." })
    if (typeof taskKey !== "string" || !/^\d{1,3}:\d{1,3}$/.test(taskKey) || typeof completed !== "boolean") {
        return res.status(400).json({ message: "Provide a valid taskKey and completed boolean." })
    }
    const report = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id }).select("preparationPlan _id")
    if (!report) return res.status(404).json({ message: "Interview report not found." })
    const parsedTask = parseTaskKey(taskKey, report.preparationPlan)
    if (!parsedTask) return res.status(400).json({ message: "Task does not exist in this preparation plan." })
    const update = completed
        ? { $addToSet: { completedTasks: taskKey } }
        : { $pull: { completedTasks: taskKey } }
    const progress = await preparationProgressModel.findOneAndUpdate(
        { user: req.user.id, interviewReport: interviewReportId },
        { $setOnInsert: { user: req.user.id, interviewReport: interviewReportId }, ...update },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean()
    return res.status(200).json({ completedTasks: progress.completedTasks || [] })
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController, getPreparationProgressController, updatePreparationProgressController }