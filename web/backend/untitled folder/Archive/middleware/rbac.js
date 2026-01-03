/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Hierarchy: SUPERADMIN > ADMIN > DOCTOR/PATIENT/PHARMACY/SUPPORT
 * 
 * Usage:
 *   router.get("/superadmin/users", requireRole("SUPERADMIN"), handler)
 *   router.get("/admin/reports", requireRole(["SUPERADMIN", "ADMIN"]), handler)
 */

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

/**
 * Verify JWT token and attach user to req
 */
const verifyToken = (req, res, next) => {
  let token;
  
  // Try to get token from Authorization header first
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.slice(7); // Remove "Bearer " prefix
  }
  // Fall back to cookies if available
  else if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // user contains id, role, email, etc.
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Forbidden: Invalid token" });
  }
};

/**
 * Check if user has one or more allowed roles
 * @param {string|string[]} allowedRoles - Single role or array of roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure verifyToken ran first
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized: Token not verified" });
    }

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: This action requires one of: ${rolesArray.join(", ")}. You have ${req.user.role}` 
      });
    }

    next();
  };
};

/**
 * Hierarchical permission check: SUPERADMIN > ADMIN > Others
 * SUPERADMIN can access everything
 * ADMIN can access everything except superadmin-only endpoints
 * Others access only their own resources
 */
const requireHierarchy = (minRole) => {
  const hierarchy = {
    "SUPERADMIN": 5,
    "ADMIN": 4,
    "DOCTOR": 3,
    "PATIENT": 2,
    "PHARMACY": 2,
    "SUPPORT": 1,
  };

  const minLevel = hierarchy[minRole] || 0;

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized: Token not verified" });
    }

    const userLevel = hierarchy[req.user.role] || 0;

    if (userLevel < minLevel) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Insufficient permissions (requires ${minRole})`
      });
    }

    next();
  };
};

/**
 * Owner verification - user can only access their own resources
 * Use for endpoints like /api/patient/profile/:patientId
 */
const verifyOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const resourceId = req.params.userId || req.params.patientId || req.params.doctorId;
  const isOwner = req.user.id === resourceId;
  const isAdmin = ["ADMIN", "SUPERADMIN"].includes(req.user.role);

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Cannot access other users' resources"
    });
  }

  next();
};

/**
 * Permission matrix for common operations
 */
const permissions = {
  // Superadmin can do anything
  SUPERADMIN: {
    viewAllUsers: true,
    viewAllDoctors: true,
    viewAllPatients: true,
    manageAdmins: true,
    manageSystemSettings: true,
    viewAllMessages: true,
    viewAllTickets: true,
    sendBroadcast: true,
    viewReports: true,
    managePharma: true,
  },

  // Admin can manage users and system, but not other admins
  ADMIN: {
    viewAllUsers: true,
    viewAllDoctors: true,
    viewAllPatients: true,
    manageAdmins: false, // Can't manage other admins
    manageSystemSettings: true,
    viewAllMessages: true,
    viewAllTickets: true,
    sendBroadcast: true,
    viewReports: true,
    managePharma: true,
  },

  // Doctor can manage own patients and prescriptions
  DOCTOR: {
    viewOwnPatients: true,
    createPrescriptions: true,
    editOwnPrescriptions: true,
    deleteOwnPrescriptions: true,
    scheduleConsultations: true,
    viewOwnMessages: true,
  },

  // Patient can view own data and appointments
  PATIENT: {
    viewOwnProfile: true,
    viewOwnAppointments: true,
    viewOwnPrescriptions: true,
    viewOwnMessages: true,
    viewPharmacies: true,
    manageSubscription: true,
  },

  // Pharmacy can manage own listings and orders
  PHARMACY: {
    viewOwnProfile: true,
    managePrescriptions: true,
    viewCustomers: true,
  },

  // Support can view tickets and communicate
  SUPPORT: {
    viewTickets: true,
    respondToTickets: true,
    viewAllMessages: false, // Only own conversations
  },
};

/**
 * Check specific permission
 * @param {string} permission - Permission key like "viewAllUsers"
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const rolePerms = permissions[req.user.role] || {};

    if (!rolePerms[permission]) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Permission '${permission}' denied for ${req.user.role}`
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
  requireHierarchy,
  verifyOwnerOrAdmin,
  checkPermission,
  permissions,
};
