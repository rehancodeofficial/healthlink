const express = require("express");
const { verifyToken, requireRole } = require("../middleware/rbac.js");

const prisma = require('../prisma/prismaClient');
const emailService = require('../services/emailService');
const router = express.Router();

// Apply RBAC to all doctor routes
router.use(verifyToken);
router.use(requireRole(["DOCTOR", "SUPERADMIN", "ADMIN"]));

/**
 * GET /api/doctor/waiting-patients?doctorId=<User.id>
 * Returns patients currently waiting or checked in.
 */
router.get("/waiting-patients", async (req, res) => {
  try {
    const doctorUserId = req.query.doctorId || req.user?.id;
    if (!doctorUserId) return res.status(400).json({ error: "doctorId is required" });

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      select: { id: true },
    });
    if (!doctorProfile) return res.json([]);

    const waiting = await prisma.appointment.findMany({
      where: {
        doctorId: doctorProfile.id,
        status: { in: ["CHECKED_IN", "WAITING"] },
      },
      include: {
        patient: { include: { user: true } },
      },
      orderBy: { appointmentDate: "asc" },
    });

    return res.json(waiting);
  } catch (err) {
    console.error("waiting-patients error:", err);
    return res.status(500).json({ error: "Failed to fetch waiting patients" });
  }
});

/**
 * GET /api/doctor/stats?doctorId=<User.id>
 * Returns dashboard stats for a doctor.
 */
router.get("/stats", async (req, res) => {
  try {
    const doctorUserId = req.query.doctorId || req.user?.id;
    if (!doctorUserId) {
      return res.status(400).json({ error: "doctorId (User.id) is required" });
    }

    // Resolve the DoctorProfile (most relations use DoctorProfile.id)
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      select: { id: true },
    });

    // If no profile, return zeroed stats (prevents 500s on new accounts)
    if (!doctorProfile) {
      return res.json({
        totalAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
        totalPrescriptions: 0,
        totalMessages: await prisma.message.count({
          where: {
            OR: [{ senderId: doctorUserId }, { receiverId: doctorUserId }],
          },
        }),
        activePatients: 0,
      });
    }

    const dpId = doctorProfile.id;

    // Queries in parallel for speed
    const [
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      totalPrescriptions,
      totalMessages,
      distinctPatients,
    ] = await Promise.all([
      prisma.appointment.count({
        where: { doctorId: dpId },
      }),
      prisma.appointment.count({
        where: { doctorId: dpId, status: "COMPLETED" },
      }),
      prisma.appointment.count({
        where: { doctorId: dpId, status: "PENDING" },
      }),
      prisma.prescription.count({
        where: { doctorId: dpId },
      }),
      prisma.message.count({
        where: {
          OR: [{ senderId: doctorUserId }, { receiverId: doctorUserId }],
        },
      }),
      // Distinct patients this doctor has appointments with
      prisma.appointment.findMany({
        where: { doctorId: dpId },
        distinct: ["patientId"],
        select: { patientId: true },
      }),
    ]);

    const activePatients = distinctPatients.length;

    // Enhanced stats for Clinical Desk
    const [urgentLabs, unsignedNotes, lateAppointments] = await Promise.all([
      prisma.labOrder.count({
        where: { doctorId: dpId, status: "ORDERED" },
      }),
      prisma.clinicalEncounter.count({
        where: { doctorId: dpId, status: "DRAFT" },
      }),
      prisma.appointment.count({
        where: {
          doctorId: dpId,
          status: { in: ["WAITING", "CHECKED_IN"] },
          appointmentDate: { lt: new Date() },
        },
      }),
    ]);

    return res.json({
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      totalPrescriptions,
      totalMessages,
      activePatients,
      urgentFlags: {
        urgentLabs,
        unsignedNotes,
        lateAppointments,
      }
    });
  } catch (err) {
    console.error("❌ /api/doctor/stats error:", err);
    return res.status(500).json({ error: "Failed to fetch doctor stats" });
  }
});

/*================================================================
// ✅ GET /api/doctor/profile?userId=xxxx
==================================================================*/

// GET /api/doctor/profile?userId=...
router.get("/profile", async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    let profile = await prisma.doctorProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!profile && user.role === "DOCTOR") {
      profile = await ensureDefaultProfile(user);
    }

    if (!profile) return res.status(404).json({ error: "Profile not found" });

    return res.json({ data: profile });
  } catch (e) {
    console.error("❌ doctor profile GET error:", e);
    return res.status(500).json({ error: "Failed to load profile" });
  }
});

// PUT /api/doctor/profile (upsert)
router.put("/profile", async (req, res) => {
  try {
    const {
      userId,
      firstName, // ✅ Extract Name
      middleName,
      lastName,  // ✅ Extract Name
      phone,     // ✅ Extract Phone
      specialization,
      customProfession,
      qualifications,
      licenseNumber,
      hospitalAffiliation,
      yearsOfExperience,
      consultationFee,
      availability, // JSON string or object
      bio,
      languages,    // JSON string or array
      emergencyContact,
      emergencyContactName,
      emergencyContactEmail
    } = req.body || {};

    if (!userId) return res.status(400).json({ error: "userId is required" });

    // ✅ Update User fields (Name, Phone)
    const userData = {
      ...(firstName ? { firstName } : {}),
      ...(middleName ? { middleName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(phone ? { phone } : {}),
    };

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userData,
      });
    }

    const updated = await prisma.doctorProfile.upsert({
      where: { userId },
      update: {
        specialization: specialization ?? "General Medicine",
        customProfession: customProfession || undefined,
        qualifications: qualifications ?? "MBBS",
        // only set license if provided in update; otherwise keep existing
        ...(licenseNumber ? { licenseNumber } : {}),
        hospitalAffiliation: hospitalAffiliation ?? "",
        yearsOfExperience: yearsOfExperience ?? 0,
        consultationFee: consultationFee ?? 0,
        availability: typeof availability === "string" ? availability : JSON.stringify(availability || {}),
        bio: bio ?? "",
        languages: Array.isArray(languages) ? JSON.stringify(languages) : (languages ?? JSON.stringify(["English"])),
        emergencyContact: emergencyContact ?? "",
        emergencyContactName: emergencyContactName ?? "",
        emergencyContactEmail: emergencyContactEmail ?? "",
      },
      create: {
        userId,
        specialization: specialization ?? "General Medicine",
        customProfession: customProfession || null,
        qualifications: qualifications ?? "MBBS",
        licenseNumber: licenseNumber || `LIC-${userId.slice(0, 8).toUpperCase()}`,
        hospitalAffiliation: hospitalAffiliation ?? "",
        yearsOfExperience: yearsOfExperience ?? 0,
        consultationFee: consultationFee ?? 0,
        availability: typeof availability === "string" ? availability : JSON.stringify(availability || {}),
        bio: bio ?? "",
        languages: Array.isArray(languages) ? JSON.stringify(languages) : (languages ?? JSON.stringify(["English"])),
        emergencyContact: emergencyContact ?? "",
        emergencyContactName: emergencyContactName ?? "",
        emergencyContactEmail: emergencyContactEmail ?? "",
      },
    });

    // Fetch updated user to get email for notification
    const userForEmail = await prisma.user.findUnique({ where: { id: userId } });
    if (userForEmail) {
        emailService.sendProfileUpdateConfirmation(userForEmail, "Doctor")
            .catch(err => console.error("Failed to send profile update email:", err));
    }

    return res.json({ data: updated });
  } catch (e) {
    console.error("❌ doctor profile PUT error:", e);
    return res.status(500).json({ error: "Failed to save profile" });
  }
});

// router.get("/profile", async (req, res) => {
//   try {
//     const { userId } = req.query;
//     if (!userId) return res.status(400).json({ error: "Missing userId" });

//     const doctorProfile = await prisma.doctorProfile.findUnique({
//       where: { userId },
//       include: {
//         user: { select: { id: true, firstName: true, lastName: true, email: true } },
//       },
//     });

//     if (!doctorProfile)
//       return res.status(404).json({ error: "Doctor profile not found" });

//     res.json(doctorProfile);
//   } catch (error) {
//     console.error("❌ Error fetching doctor profile:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


// GET /api/doctor/list
router.get("/list", async (_req, res) => {
  try {
    const list = await prisma.doctorProfile.findMany({
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(list);
  } catch (err) {
    console.error("❌ GET /api/doctor/list error:", err);
    res.status(500).json({ error: "Failed to load doctors" });
  }
});

/**
 * GET /api/doctor/my-patients?doctorId=<User.id>
 * Returns DISTINCT patients for this doctor (based on appointments).
 * Each patient includes User info.
 */
router.get("/my-patients", async (req, res) => {
  try {
    const doctorUserId = req.query.doctorId;
    if (!doctorUserId) {
      return res.status(400).json({ error: "doctorId (User.id) is required" });
    }

    // Resolve the doctor profile (DoctorProfile.id)
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      select: { id: true },
    });

    if (!doctorProfile) {
      return res.json([]); // No profile yet → no patients
    }

    // Distinct patientIds from appointments with this doctor
    const distinct = await prisma.appointment.findMany({
      where: { doctorId: doctorProfile.id },
      distinct: ["patientId"],
      select: { patientId: true },
    });

    const patientIds = distinct.map((d) => d.patientId);
    if (patientIds.length === 0) {
      return res.json([]);
    }

    // Fetch PatientProfile + linked User
    const patients = await prisma.patientProfile.findMany({
      where: { id: { in: patientIds } },
      select: {
        id: true,
        bloodGroup: true,
        height: true,
        weight: true,
        allergies: true,
        medications: true,
        medicalHistory: true,
        address: true,
        emergencyContact: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Shape a simple list for the table
    const result = patients.map((p) => ({
      id: p.id, // PatientProfile.id
      name: `${p.user?.firstName || ""} ${p.user?.lastName || ""}`.trim() || "Unknown",
      email: p.user?.email || "",
      gender: p.user?.gender || null,
      dateOfBirth: p.user?.dateOfBirth || null,
      bloodGroup: p.bloodGroup || null,
      // For modal (we can pass through the entire object)
      profile: p,
    }));

    return res.json(result);
  } catch (err) {
    console.error("❌ /api/doctor/my-patients error:", err);
    return res.status(500).json({ error: err.message, details: err.toString() });
  }
});

/**
 * GET /api/doctor/patient/:id
 * Returns full patient profile (by PatientProfile.id) with linked User.
 */
router.get("/patient/:id", async (req, res) => {
  try {
    const { id } = req.params; // PatientProfile.id
    const patient = await prisma.patientProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, createdAt: true } },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    return res.json(patient);
  } catch (err) {
    console.error("❌ /api/doctor/patient/:id error:", err);
    return res.status(500).json({ error: "Failed to fetch patient" });
  }
});

//======================APPOINTMENTS=============================


// ======================================================
// 1️⃣ POST /api/doctor/appointment — Create Appointment
// ======================================================
router.post("/appointments", async (req, res) => {
  try {
    const { doctorId, patientId, appointmentDate, reason } = req.body;

    if (!doctorId || !patientId || !appointmentDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });
    if (!doctorProfile) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { id: patientId },
    });
    if (!patientProfile) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        doctorId: doctorProfile.id,
        patientId: patientProfile.id,
        appointmentDate: new Date(appointmentDate),
        reason,
      },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    if (newAppointment.doctor?.user && newAppointment.patient?.user) {
        emailService.sendAppointmentBookingConfirmation(newAppointment, newAppointment.patient.user, newAppointment.doctor.user)
            .catch(err => console.error("Failed to send appointment emails:", err));
    }

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// ======================================================
// 2️⃣ PATCH /api/doctor/appointment/:id — Update Appointment
// ======================================================
router.patch("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentDate, reason, status } = req.body;

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(appointmentDate && { appointmentDate: new Date(appointmentDate) }),
        ...(reason && { reason }),
        ...(status && { status }),
      },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    if (status && updatedAppointment.patient?.user && updatedAppointment.doctor?.user) {
        emailService.sendAppointmentStatusChange(
            updatedAppointment, 
            updatedAppointment.patient.user, 
            updatedAppointment.doctor.user, 
            status
        ).catch(err => console.error("Failed to send appointment status email:", err));
    }

    res.json(updatedAppointment);
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

/* ======================================================
   2️⃣  GET /api/doctor/appointments — Fetch All
   ====================================================== */
router.get("/appointments", async (req, res) => {
  const doctorId = req.query.doctorId || req.user?.id; // doctorId = User.id
  
  console.log("DEBUG: GET /doctor/appointments", { 
      query: req.query, 
      user: req.user, 
      resolvedDoctorId: doctorId 
  });

  if (!doctorId)
    return res.status(400).json({ error: "doctorId (User ID) is required" });

  try {
    // ✅ Find DoctorProfile using userId
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!doctorProfile)
      return res.status(404).json({ error: "Doctor profile not found" });

    // ✅ Fetch all appointments for this doctor
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
      orderBy: { appointmentDate: "desc" },
    });

    res.json(appointments);
  } catch (err) {
    console.error("❌ Error fetching doctor appointments:", err);
    res.status(500).json({ error: "Failed to fetch doctor appointments" });
  }
});


/* ======================================================
   5️⃣  PATCH /api/doctor/appointments/:id/cancel — Cancel
   ====================================================== */
router.patch("/appointments/:id/cancel", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    console.error("❌ Error cancelling appointment:", err);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

/* ======================================================
   🗑️  DELETE /api/doctor/appointment/:id
   ====================================================== */
router.delete("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.appointment.delete({ where: { id } });

    res.json({ message: "Appointment deleted" });
  } catch (error) {
    console.error("❌ Error deleting appointment:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

/* ======================================================
   7️⃣  GET /api/doctor/prescriptions  —  Fetch All
   ====================================================== */
router.get("/prescriptions", async (req, res) => {
  try {
    const { doctorId } = req.query; // userId (UUID)
    if (!doctorId) return res.status(400).json({ error: "Doctor ID required" });

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });
    if (!doctorProfile)
      return res.status(404).json({ error: "Doctor profile not found" });

    const prescriptions = await prisma.prescription.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(prescriptions);
  } catch (err) {
    console.error("❌ Error fetching prescriptions:", err);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});

/* ======================================================
   8️⃣  POST /api/doctor/prescriptions  —  Create New
   ====================================================== */
// routes/doctor.js (or doctorPrescriptions.js)
router.post("/prescriptions", async (req, res) => {
  try {
    const {
      doctorId,            // can be User.id (recommended) OR DoctorProfile.id
      patientId,           // PatientProfile.id
      medication,
      dosage,
      frequency,
      duration,
      notes,
    } = req.body || {};

    // basic validation
    if (!doctorId || !patientId || !medication || !dosage || !frequency || !duration) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Resolve doctor profile:
    // 1) try as userId
    let doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: doctorId } });
    // 2) if not found, try as profile id
    if (!doctorProfile) {
      doctorProfile = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
    }
    if (!doctorProfile) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    // Ensure patient profile exists (patientId is PatientProfile.id)
    const patientProfile = await prisma.patientProfile.findUnique({ where: { id: patientId } });
    if (!patientProfile) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    const created = await prisma.prescription.create({
      data: {
        doctorId: doctorProfile.id,
        patientId: patientProfile.id,
        medication,
        dosage,
        frequency,
        duration,
        notes: notes ?? null,
      },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    // after `created` prescription is saved:
    // Check for selected pharmacy using the new Many-to-Many relation
    const selectedMapping = await prisma.selectedPharmacy.findFirst({
      where: { patientId: patientProfile.id },
      orderBy: [
        { preferred: 'desc' }, // Preferred ones first
        { createdAt: 'desc' }  // Then most recent
      ]
    });

    let finalPrescription = created;

    if (selectedMapping) {
      finalPrescription = await prisma.prescription.update({
        where: { id: created.id },
        data: {
          pharmacyId: selectedMapping.pharmacyId,
          dispatchStatus: "SENT",
          dispatchedAt: new Date(),
        },
        include: {
          doctor: { include: { user: true } },
          patient: { include: { user: true } },
          pharmacy: { include: { user: true } },
        },
      });
    }


    return res.status(201).json(finalPrescription);
  } catch (error) {
    console.error("❌ Error creating prescription:", error);
    return res.status(500).json({ error: "Failed to create prescription" });
  }
});



/* ======================================================
   9️⃣  DELETE /api/doctor/prescriptions/:id  —  Delete
   ====================================================== */
router.delete("/prescriptions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doctorUserId = req.user?.id;
    
    // Verify ownership - prescription must belong to this doctor
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: { doctor: { select: { userId: true } } }
    });

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    // Only doctor who created it (or admin/superadmin) can delete
    if (prescription.doctor.userId !== doctorUserId && !["SUPERADMIN", "ADMIN"].includes(req.user?.role)) {
      return res.status(403).json({ error: "Not authorized to delete this prescription" });
    }

    await prisma.prescription.delete({ where: { id } });
    res.json({ message: "Prescription deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting prescription:", err);
    res.status(500).json({ error: "Failed to delete prescription" });
  }
});

/* ======================================================
   🔁 PATCH /api/doctor/prescriptions/:id — Edit Prescription
   ====================================================== */
router.patch("/prescriptions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doctorUserId = req.user?.id;
    const { medication, dosage, frequency, duration, notes, patientId } = req.body;
    
    // Verify ownership
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: { doctor: { select: { userId: true } } }
    });

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    // Only doctor who created it (or admin/superadmin) can edit
    if (prescription.doctor.userId !== doctorUserId && !["SUPERADMIN", "ADMIN"].includes(req.user?.role)) {
      return res.status(403).json({ error: "Not authorized to edit this prescription" });
    }

    const updated = await prisma.prescription.update({
      where: { id },
      data: { medication, dosage, frequency, duration, notes, patientId },
    });
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating prescription:", err);
    res.status(500).json({ error: "Failed to update prescription" });
  }
});

//=========================================================================
// ==== Doctor Messages (mirror of patient messages) ==================
/**
 * GET /api/doctor/messages/inbox?doctorId=<User.id>
 * Returns messages received by this doctor (receiverId = doctor’s User.id)
 ========================================================================*/
router.get("/messages/inbox", async (req, res) => {
  try {
    const doctorUserId = String(req.query.doctorId || "").trim();
    if (!doctorUserId) {
      return res.status(400).json({ error: "doctorId is required" });
    }

    // Ensure doctor user exists (optional but nice)
    const doctorUser = await prisma.user.findUnique({
      where: { id: doctorUserId },
      select: { id: true },
    });
    if (!doctorUser) return res.status(404).json({ error: "Doctor user not found" });

    const messages = await prisma.message.findMany({
      where: { receiverId: doctorUserId },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(messages);
  } catch (err) {
    console.error("❌ GET /api/doctor/messages/inbox error:", err);
    return res.status(500).json({ error: "Failed to load inbox" });
  }
});

// PATCH /api/doctor/messages/read/:id  → mark a message as read

router.patch("/messages/read/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const userId = String(req.query.userId || req.user?.id || "");
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const found = await prisma.message.findUnique({
      where: { id },
      select: { id: true, receiverId: true },
    });
    if (!found) return res.status(404).json({ error: "Message not found" });
    if (found.receiverId !== userId) return res.status(403).json({ error: "Not allowed" });

    const updated = await prisma.message.update({
      where: { id },
      data: { readAt: new Date() },
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    console.error("mark read error", e);
    res.status(500).json({ error: "Failed to mark read" });
  }
});


// DELETE /api/doctor/messages/delete/:id  → hard delete a message
// DELETE /api/doctor/messages/delete/:id?userId=<User.id>
router.delete("/messages/delete/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const userId = String(req.query.userId || req.user?.id || "");

    if (!id) return res.status(400).json({ error: "message id is required" });
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const found = await prisma.message.findUnique({
      where: { id },
      select: { id: true, senderId: true, receiverId: true },
    });
    if (!found) return res.status(404).json({ error: "Message not found" });

    if (found.senderId !== userId && found.receiverId !== userId) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await prisma.message.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /doctor/messages/delete/:id error:", err);
    return res.status(500).json({ error: "Failed to delete message" });
  }
});



// Duplicate /patients route removed, handled in doctorPatients.js


/**
 * POST /api/doctor/messages/send
 * Body: { senderId: User.id (doctor), receiverId: User.id (patient), content }
 * NOTE: Accepts ONLY User IDs (mirrors working patient send).
 */
router.post("/messages/send", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body || {};
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: "senderId, receiverId and content are required" });
    }

    // Verify both users exist (helps catch wrong id issues)
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: String(senderId) }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: String(receiverId) }, select: { id: true } }),
    ]);
    if (!sender || !receiver) {
      return res.status(400).json({ error: "Invalid sender or receiver" });
    }

    const created = await prisma.message.create({
      data: {
        senderId: String(senderId),
        receiverId: String(receiverId),
        content: String(content),
        readAt: null,
      },
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("❌ POST /doctor/messages/send error:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

/**
 * (Optional) GET /api/doctor/messages/inbox?doctorId=<User.id>
 * So the doctor can view received messages.
 */
// router.get("/messages/inbox", async (req, res) => {
//   try {
//     const doctorUserId = req.query.doctorId;
//     if (!doctorUserId) return res.status(400).json({ error: "doctorId is required" });

//     const items = await prisma.message.findMany({
//       where: { receiverId: String(doctorUserId) },
//       include: {
//         sender: { select: { id: true, firstName: true, lastName: true, email: true } },
//         receiver: { select: { id: true, firstName: true, lastName: true, email: true } },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return res.json(items);
//   } catch (err) {
//     console.error("❌ GET /doctor/messages/inbox error:", err);
//     return res.status(500).json({ error: "Failed to fetch inbox" });
//   }
// });

// Redundant /patients route removed



// router.get("/patients", async (req, res) => {
//   try {
//     const patients = await prisma.patientProfile.findMany({
//       include: {
//         user: {
//           select: {
//             id: true,
//             firstName: true, lastName: true,
//             email: true,
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     // Format data for the frontend — ensures id + user info
//     const formatted = patients.map((p) => ({
//       id: p.id,                // ✅ PatientProfile.id (for value)
//       userId: p.user.id,       // optional reference to User table
//       name: p.user.name,       // ✅ Display name
//       email: p.user.email,
//     }));

//     res.json(formatted);
//   } catch (err) {
//     console.error("❌ Error fetching patients:", err);
//     res.status(500).json({ error: "Failed to fetch patients" });
//   }
// });


// Redundant /patients routes removed



/**
 * ===========================================
 *  PRESCRIPTIONS — CRUD for Doctor
 * ===========================================
 */

// ✅ Get all prescriptions for a doctor
router.get("/prescriptions", async (req, res) => {
  const { doctorId } = req.query;
  if (!doctorId) return res.status(400).json({ error: "Doctor ID required" });

  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!doctorProfile)
      return res.status(404).json({ error: "Doctor profile not found" });

    const prescriptions = await prisma.prescription.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        patient: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(prescriptions);
  } catch (err) {
    console.error("❌ Error fetching prescriptions:", err);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});

// ✅ Create new prescription
router.post("/prescriptions", async (req, res) => {
  const { doctorId, patientId, medication, dosage, frequency, duration, notes } =
    req.body;

  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!doctorProfile)
      return res.status(404).json({ error: "Doctor profile not found" });

    const newPrescription = await prisma.prescription.create({
      data: {
        doctorId: doctorProfile.id,
        patientId,
        medication,
        dosage,
        frequency,
        duration,
        notes,
      },
    });

    res.json(newPrescription);
  } catch (err) {
    console.error("❌ Error creating prescription:", err);
    res.status(500).json({ error: "Failed to create prescription" });
  }
});

// ✅ Update existing prescription
router.patch("/prescriptions/:id", async (req, res) => {
  const { id } = req.params;
  const { medication, dosage, frequency, duration, notes } = req.body;

  try {
    const updated = await prisma.prescription.update({
      where: { id },
      data: { medication, dosage, frequency, duration, notes },
    });
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating prescription:", err);
    res.status(500).json({ error: "Failed to update prescription" });
  }
});

// ✅ Delete prescription
router.delete("/prescriptions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.prescription.delete({ where: { id } });
    res.json({ message: "Prescription deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting prescription:", err);
    res.status(500).json({ error: "Failed to delete prescription" });
  }
});

/**
 * ===========================================
 *  GET /api/doctor/prescriptions
 *  Fetch all prescriptions by doctor
 * ===========================================
 */
router.get("/prescriptions", async (req, res) => {
  try {
    const { doctorId } = req.query;
    if (!doctorId) return res.status(400).json({ error: "Doctor ID required" });

    // Find doctor profile by userId
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });
    if (!doctorProfile) return res.status(404).json({ error: "Doctor profile not found" });

    const prescriptions = await prisma.prescription.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        patient: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(prescriptions);
  } catch (err) {
    console.error("❌ Error fetching prescriptions:", err);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});

/**
 * ===========================================
 *  POST /api/doctor/prescriptions
 *  Create a new prescription
 * ===========================================
 */
// ✅ Create new prescription (safe)
router.post("/prescriptions", async (req, res) => {
  try {
    let { doctorId, patientId, medication, dosage, frequency, duration, notes } = req.body;

    if (!doctorId || !patientId || !medication)
      return res.status(400).json({ message: "Missing required fields" });

    // Doctor profile
    let doctorProfile = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
    if (!doctorProfile)
      doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: doctorId } });
    if (!doctorProfile) return res.status(404).json({ message: "Doctor profile not found" });
    doctorId = doctorProfile.id;

    // Patient profile
    let patientProfile = await prisma.patientProfile.findUnique({ where: { id: patientId } });
    if (!patientProfile)
      patientProfile = await prisma.patientProfile.findUnique({ where: { userId: patientId } });
    if (!patientProfile) return res.status(404).json({ message: "Patient profile not found" });
    patientId = patientProfile.id;

    const newPrescription = await prisma.prescription.create({
      data: { doctorId, patientId, medication, dosage, frequency, duration, notes },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    // Inside POST /api/doctor/prescriptions (after you resolved doctorProfileId + patientProfileId)
const created = await prisma.prescription.create({
  data: {
    doctorId: doctorProfile.id,
    patientId: patientProfile.id,
    medication, dosage, frequency, duration, notes: notes || null,
    // pharmacy fields set right after create (once we know patient's selection)
  },
  include: { patient: { include: { user: true } }, doctor: { include: { user: true } } }
});

// ✅ Attach pharmacy if patient selected one
if (patientProfile.selectedPharmacyId) {
  await prisma.prescription.update({
    where: { id: created.id },
    data: {
      pharmacyId: patientProfile.selectedPharmacyId,
      dispatchStatus: "SENT",
      dispatchedAt: new Date(),
    }
  });
}

// (Optional) enqueue a notification/email to pharmacy here
return res.status(201).json(created);


    res.status(201).json(newPrescription);
  } catch (error) {
    console.error("❌ Error creating prescription:", error);
    res.status(500).json({ message: error.message });
  }
});


/**
 * ===========================================
 *  PATCH /api/doctor/prescriptions/:id
 * ===========================================
 */
router.patch("/prescriptions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { medication, dosage, frequency, duration, notes } = req.body;

    const updated = await prisma.prescription.update({
      where: { id },
      data: { medication, dosage, frequency, duration, notes },
    });

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating prescription:", err);
    res.status(500).json({ error: "Failed to update prescription" });
  }
});

/**
 * ===========================================
 *  DELETE /api/doctor/prescriptions/:id
 * ===========================================
 */
router.delete("/prescriptions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.prescription.delete({ where: { id } });
    res.json({ message: "Prescription deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting prescription:", err);
    res.status(500).json({ error: "Failed to delete prescription" });
  }
});

// ---------------------------------------------
// GET /api/doctors — List all doctors
// ---------------------------------------------
router.get("/", async (req, res) => {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      select: {
        id: true,
        specialization: true,
        qualifications: true,
        licenseNumber: true,
        hospitalAffiliation: true,
        yearsOfExperience: true,
        consultationFee: true,
        bio: true,
        user: {
          select: {
            firstName: true, lastName: true,   // ✅ fixed field name
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = doctors.map((doc) => ({
      id: doc.id,
      name: doc.user.name,
      specialization: doc.specialization,
      experience: doc.yearsOfExperience,
      consultationFee: doc.consultationFee,
      hospitalAffiliation: doc.hospitalAffiliation,
      bio: doc.bio,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("❌ Error fetching doctors:", error);
    res.status(500).json({ error: "Failed to load doctors" });
  }
});

//=======================================
// SUBSCRIPTION
//=======================================
// POST /api/subscription/stripe/checkout
// body: { userId, plan: "MONTHLY"|"YEARLY" }
router.post("/subscription/stripe/checkout", async (req, res) => {
  const { userId, plan } = req.body || {};
  // 1) look up prices from SubscriptionSetting
  // 2) create a Stripe Price/Checkout Session with success/cancel URLs
  // 3) create a pending Subscription row (status=PENDING) referencing session id
  // 4) return { url: session.url }
});


module.exports = router;
