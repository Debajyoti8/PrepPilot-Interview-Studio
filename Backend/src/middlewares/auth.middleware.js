const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")



async function authUser(req, res, next) {
    const token = req.cookies?.token

    if (!token) {
        return res.status(401).json({ message: "Token not provided." })
    }

    try {
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token })

        if (isTokenBlacklisted) {
            return res.status(401).json({ message: "Token is invalid." })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        return next()
    } catch (err) {
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Invalid token." })
        }

        console.error("Authentication middleware failed:", err)
        return res.status(500).json({ message: "Unable to verify authentication right now." })
    }
}


module.exports = { authUser }