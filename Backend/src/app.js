const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json({ limit: "100kb" }))
app.use(cookieParser())
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
        return callback(new Error("Origin is not allowed by CORS."))
    },
    credentials: true
}))

app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use((err, req, res, next) => {
    if (res.headersSent) return next(err)
    const status = err.statusCode || err.status || 500
    const message = status < 500 ? err.message : "An unexpected server error occurred."
    if (status >= 500) console.error(err)
    return res.status(status).json({ message })
})

module.exports = app