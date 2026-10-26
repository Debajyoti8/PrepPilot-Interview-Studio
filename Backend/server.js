require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

const port = Number(process.env.PORT) || 3000
const requiredEnv = ["MONGO_URI", "GOOGLE_GENAI_API_KEY", "JWT_SECRET"]
const missingEnv = requiredEnv.filter(name => !process.env[name])

if (missingEnv.length) {
    console.error(`Missing required environment variables: ${missingEnv.join(", ")}`)
    process.exit(1)
}

connectToDB().then(() => {
    app.listen(port, () => console.log(`Server is running on port ${port}`))
}).catch(error => {
    console.error("Could not connect to the database. Server was not started.", error)
    process.exitCode = 1
})
