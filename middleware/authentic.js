export const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // directly get from session
    req.user = req.session.user;

    next();

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};