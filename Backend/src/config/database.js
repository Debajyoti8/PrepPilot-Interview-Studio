const mongoose = require("mongoose")

async function connectToDB() {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required. Add it to Backend/.env.")
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to Database")
}

module.exports = connectToDB
