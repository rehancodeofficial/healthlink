/**
 * ============================================
 * COMPREHENSIVE API DOCUMENTATION
 * CureVirtual Backend API Routes
 * ============================================
 */

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================
/**
 * POST /api/auth/register
 * Body: { name, email, password, role? }
 * Returns: { message, user: { id, name, email, role } }
 * Roles: PATIENT (default), DOCTOR
 */

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { token, user: { id, name, role, email, type } }
 * type: "USER" or "ADMIN"
 */

// ==========================================
// 2. MESSAGING ROUTES (UNIFIED)
// ==========================================
/**
 * GET /api/messages/contacts/all
 * Returns all users and admins available for messaging
 * Returns: { data: [{ id, name, role, email, type }] }
 */

/**
 * GET /api/messages/inbox?userId=<ID>&page=1
 * Get inbox messages for a user
 * Returns: { data: [...], page, pageSize, total, totalPages, folder }
 */

/**
 * GET /api/messages/sent?userId=<ID>&page=1
 * Get sent messages for a user
 */

/**
 * GET /api/messages/all?userId=<ID>&page=1
 * Get all messages (sent + received) for a user
 */

/**
 * GET /api/messages/unread-count?userId=<ID>
 * Get count of unread messages
 * Returns: { data: { count } }
 */

/**
 * POST /api/messages/send
 * Send a message to a single user OR broadcast to all users
 *
 * Single message:
 * Body: { senderId, receiverId, content }
 * OR: { senderId, recipient, content }
 *
 * broadcast:
 * Body: { senderId, content, broadcast: true }
 * OR: { senderId, recipient: "ALL", content }
 *
 * Returns: { data: msg } OR { success: true, message: "...", count }
 */

/**
 * POST /api/messages/mark-read
 * Mark multiple messages as read
 * Body: { userId, folder?: "inbox" | "all" }
 * Returns: { success: true, updated: number }
 */

/**
 * PATCH /api/messages/:id/read
 * Mark a single message as read
 * Returns: { data: { id, readAt } }
 */

// ==========================================
// 3. DOCTOR ROUTES
// ==========================================
/**
 * GET /api/doctor/stats
 * Get doctor statistics
 */

/**
 * GET /api/doctor/profile
 * Get current doctor's profile
 */

/**
 * PUT /api/doctor/profile
 * Update doctor's profile
 */

/**
 * GET /api/doctor/list
 * Get list of all doctors
 */

/**
 * GET /api/doctor/my-patients
 * Get doctor's patients list
 */

/**
 * GET /api/doctor/patient/:id
 * Get specific patient details
 */

/**
 * GET /api/doctor/video
 * Get video consultation routes
 */

/**
 * POST /api/doctor/video/token
 * Get Twilio video token
 */

// ==========================================
// 4. PATIENT ROUTES
// ==========================================
/**
 * GET /api/patient/stats
 * Get patient statistics
 */

/**
 * GET /api/patient/all
 * Get all doctors available for patient
 */

/**
 * GET /api/patient/appointments
 * Get patient's appointments
 */

/**
 * POST /api/patient/appointments
 * Book an appointment
 */

/**
 * PATCH /api/patient/appointments/:id/cancel
 * Cancel an appointment
 */

/**
 * GET /api/patient/prescriptions
 * Get patient's prescriptions
 */

/**
 * GET /api/patient/video-calls
 * Get patient's video consultations
 */

/**
 * GET /api/patient/subscription
 * Get patient's subscription status
 */

/**
 * POST /api/patient/subscription/checkout/paystack
 * Paystack payment checkout
 */

/**
 * GET /api/patient/subscription/verify/paystack
 * Verify Paystack payment
 */

/**
 * POST /api/patient/subscription/checkout/stripe
 * Stripe payment checkout
 */

/**
 * GET /api/patient/subscription/verify/stripe
 * Verify Stripe payment
 */

/**
 * POST /api/patient/subscription/cancel
 * Cancel subscription
 */

/**
 * GET /api/patient/profile/:id
 * Get patient profile by ID
 */

/**
 * GET /api/patient/profile
 * Get current patient's profile
 */

/**
 * PUT /api/patient/profile
 * Update patient profile
 */

/**
 * PATCH /api/patient/select-pharmacy
 * Select pharmacy
 */

// ==========================================
// 5. ADMIN ROUTES
// ==========================================
/**
 * GET /api/admin/users
 * Get all users (admin dashboard)
 */

/**
 * POST /api/admin/users
 * Create a new user
 */

/**
 * PATCH /api/admin/users/:id/suspend
 * Suspend a user
 */

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */

/**
 * GET /api/admin/messages/contacts/all
 * Get all contacts for messaging
 */

/**
 * GET /api/admin/messages/inbox
 * Get admin inbox
 */

/**
 * POST /api/admin/messages/send
 * Send message from admin
 */

/**
 * GET /api/admins
 * Get all admins (superadmin only)
 */

/**
 * POST /api/admins
 * Create new admin (superadmin only)
 */

/**
 * PUT /api/admins/:id
 * Update admin (superadmin only)
 */

/**
 * PATCH /api/admins/:id/suspend
 * Suspend admin (superadmin only)
 */

/**
 * DELETE /api/admins/:id
 * Delete admin (superadmin only)
 */

// ==========================================
// 6. SUPERADMIN ROUTES
// ==========================================
/**
 * GET /api/superadmin/stats
 * Get superadmin dashboard statistics
 */

/**
 * GET /api/superadmin/settings
 * Get system settings
 */

/**
 * PUT /api/superadmin/settings
 * Update system settings
 */

/**
 * GET /api/superadmin/reports/summary
 * Get system reports summary
 */

/**
 * GET /api/superadmin/logs
 * Get activity logs
 */

/**
 * POST /api/superadmin/logs
 * Create activity log
 */

/**
 * GET /api/superadmin/activity-logs
 * Get activity logs with filtering
 */

/**
 * GET /api/superadmin/activity-logs/actor/:id
 * Get activity logs by actor
 */

/**
 * GET /api/messages/contacts/all (when logged in as superadmin)
 * Get all users and admins for broadcasting
 */

/**
 * GET /api/messages/inbox (when logged in as superadmin)
 * Get superadmin inbox
 */

/**
 * POST /api/messages/send (with broadcast flag)
 * Send message or broadcast to all users
 */

// ==========================================
// 7. PHARMACY ROUTES
// ==========================================
/**
 * GET /api/pharmacy/profile
 * Get pharmacy profile
 */

/**
 * PUT /api/pharmacy/profile
 * Update pharmacy profile
 */

/**
 * GET /api/pharmacy/prescriptions
 * Get prescriptions assigned to pharmacy
 */

/**
 * PATCH /api/pharmacy/prescriptions/:id/status
 * Update prescription dispatch status
 */

/**
 * DELETE /api/pharmacy/prescriptions/:id
 * Delete prescription
 */

/**
 * PUT /api/pharmacy/prescriptions/:id
 * Update prescription
 */

/**
 * GET /api/pharmacy/list
 * Get list of all pharmacies
 */

/**
 * GET /api/pharmacy/nearby
 * Get nearby pharmacies (location-based)
 */

/**
 * POST /api/pharmacy/select
 * Select/assign pharmacy
 */

// ==========================================
// 8. VIDEO CONSULTATION ROUTES
// ==========================================
/**
 * POST /api/doctor/video/token
 * Get Twilio video token
 */

/**
 * POST /api/doctor/video/doctor/video-consultations
 * Create video consultation
 */

/**
 * GET /api/doctor/video/doctor/video-consultations
 * Get doctor's video consultations
 */

/**
 * PATCH /api/doctor/video/doctor/video-consultations/:id/cancel
 * Cancel video consultation
 */

/**
 * PATCH /api/doctor/video/doctor/video-consultations/:id/complete
 * Complete video consultation
 */

/**
 * POST /api/videocall/create
 * Create video call
 */

/**
 * GET /api/videocall/list
 * List video calls
 */

/**
 * POST /api/videocall/token
 * Get video token
 */

/**
 * PUT /api/videocall/status/:id
 * Update video call status
 */

/**
 * PATCH /api/videocall/cancel/:id
 * Cancel video call
 */

/**
 * PATCH /api/videocall/reschedule/:id
 * Reschedule video call
 */

// ==========================================
// 9. SUBSCRIPTION ROUTES
// ==========================================
/**
 * GET /api/subscribers/stats
 * Get subscription statistics
 */

/**
 * GET /api/subscribers/list
 * Get list of subscribers
 */

/**
 * GET /api/admin/subscription-prices
 * Get subscription prices
 */

/**
 * PUT /api/admin/subscription-prices
 * Update subscription prices
 */

/**
 * GET /api/admin/subscribers
 * Get all subscribers (admin)
 */

/**
 * PUT /api/admin/subscribers/:userId/deactivate
 * Deactivate user subscription
 */

// ==========================================
// 10. SUPPORT / TICKETS ROUTES
// ==========================================
/**
 * POST /api/support/tickets
 * Create support ticket
 */

/**
 * GET /api/support/tickets/my
 * Get my support tickets (patient)
 */

/**
 * GET /api/support/tickets/:id
 * Get ticket details
 */

/**
 * POST /api/support/tickets/:id/replies
 * Add reply to ticket
 */

/**
 * PUT /api/support/tickets/:id/status
 * Update ticket status
 */

/**
 * GET /api/support/tickets
 * Get all tickets (admin/support)
 */

// ==========================================
// 11. NOTIFICATIONS ROUTES
// ==========================================
/**
 * GET /api/notifications/count/:userId
 * Get unread notification count
 */

// ==========================================
// 12. PATIENT-DOCTOR LINKING
// ==========================================
/**
 * GET /api/patient/doctors/all
 * Get all available doctors for patient
 */

/**
 * GET /api/patient/doctors
 * Get patient's assigned doctors
 */

/**
 * POST /api/patient/doctors/assign
 * Assign doctor to patient
 */

/**
 * DELETE /api/patient/doctors/assign/:doctorProfileId
 * Remove doctor assignment
 */

/**
 * GET /api/doctor/patients
 * Get doctor's patients
 */

// ==========================================
// 13. UTILITY ROUTES
// ==========================================
/**
 * GET /api/health
 * Health check endpoint
 * Returns: { ok: true }
 */

/**
 * GET /api/test
 * Test endpoint
 * Returns: { message: "API is working!" }
 */

/**
 * GET /api/doctor/test
 * Doctor API test
 * Returns: { message: "Doctor routes are working!" }
 */

/**
 * POST /api/token
 * Get Twilio token (Twilio endpoints)
 */

module.exports = {};
