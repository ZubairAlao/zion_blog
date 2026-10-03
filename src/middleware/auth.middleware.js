import jwt from "jsonwebtoken"

export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: "Authentication Required" });
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ success: false, message: "Invalid Authorization Header" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = { id: payload.sub, role: payload.role };
        return next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token Expired" });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid Token" });
        }
        return next(err); // let the error middleware handle unknown errors, don't swallow as 500 here
    }
};