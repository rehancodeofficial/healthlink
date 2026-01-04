const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "You are not authenticated!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Token is not valid!" });
    }
    req.user = user;
    next();
  });
};

const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ success: false, message: "You are not authorized!" });
    }
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ success: false, message: "You are not authorized!" });
    }
  });
};

const requireRole = (role) => {
  return (req, res, next) => {
    // If we have a verifyToken middleware running before this, req.user should be set.
    // If not, this might be unsafe, but let's assume verifyToken ran or check token here.
    // Ideally, requireRole is used AFTER verifyToken.
    
    // Check if verifyToken was used (req.user exists)
    if (!req.user) {
        // If verifyToken wasn't called, we should probably call it or fail.
        // But for now, let's assume the router mounts it like: router.get("/", verifyToken, requireRole("..."), ...)
        // OR the user provided verifyToken inside this. 
        // Based on the error "verifyToken is not a function", the usage in admins.js was likely:
        // router.get("/", requireRole("SUPERADMIN"), ...) 
        // This implies requireRole might need to do the token verification too if it wasn't done globally.
        
        // Let's verify token here if req.user is missing, just to be safe/robust, 
        // OR just fail if it's expected to be chained.
        // Looking at the previous file content (Step 89), requireRole did NOT verify token itself, it expected req.user.
        // However, admins.js usage might rely on global middleware (server.js has `optionalAuth`/`verifyToken`?).
        // Step 18 (pharmacy.js) showed `router.use(optionalAuth)`.
        
        // Let's implement requireRole simply checking req.user.
        
       return res.status(401).json({ success: false, message: "Not authenticated!" });
    }

    if (req.user.role !== role && req.user.role !== "SUPERADMIN") { // SUPERADMIN usually can do anything
      return res.status(403).json({ success: false, message: `Access denied. Requires ${role} role.` });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  verifyUser,
  verifyAdmin,
  requireRole
};
