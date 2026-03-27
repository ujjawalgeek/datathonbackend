import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const hasBearer = authHeader.startsWith("Bearer ");

    if (hasBearer) {
      const token = authHeader.slice(7).trim();
      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY || "fallback-secret-key"
      );

      req.user = {
        _id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        year: decoded.year,
      };

      return next();
    }

    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // directly get from session
    req.user = req.session.user;

    next();

  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.status(500).json({ message: err.message });
  }
};