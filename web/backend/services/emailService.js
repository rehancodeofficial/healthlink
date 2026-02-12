const nodemailer = require('nodemailer');

const emailService = {
  transporter: null,

  init() {
    if (this.transporter) return;

    if (process.env.EMAIL_SERVICE === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // App Password
        },
      });
    } else if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      console.warn("⚠️ Email service not configured (EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS variables missing). Emails will be logged to console only.");
    }
  },

  async sendEmail({ to, subject, html, text }) {
    this.init();

    if (!this.transporter) {
      console.log("==================================================");
      console.log(`📧 [MOCK EMAIL] To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${text || html}`);
      console.log("==================================================");
      return { success: true, mock: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"CureVirtual" <no-reply@curevirtual.com>',
        to,
        subject,
        text,
        html,
      });
      console.log(`✅ Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      return { success: false, error };
    }
  },

  async sendProfileUpdateConfirmation(user, role) {
    const subject = `CureVirtual - ${role} Profile Updated`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Profile Updated Successfully</h2>
        <p>Hello ${user.firstName},</p>
        <p>Your ${role.toLowerCase()} profile details have been successfully updated.</p>
        <p>If you did not make this change, please contact support immediately.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>The CureVirtual Team</strong></p>
      </div>
    `;
    return this.sendEmail({ to: user.email, subject, html });
  },

  async sendAppointmentBookingConfirmation(appointment, patient, doctor) {
    const subject = "CureVirtual - Appointment Confirmed";
    const date = new Date(appointment.appointmentDate).toLocaleString();
    
    // Email to Patient
    const patientHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Appointment Confirmed</h2>
        <p>Hello ${patient.firstName},</p>
        <p>Your appointment with Dr. ${doctor.lastName} has been confirmed.</p>
        <p><strong>Date & Time:</strong> ${date}</p>
        <p><strong>Reason:</strong> ${appointment.reason || 'General Consultation'}</p>
        <br>
        <p>Best regards,</p>
        <p><strong>The CureVirtual Team</strong></p>
      </div>
    `;
    await this.sendEmail({ to: patient.email, subject, html: patientHtml });

    // Email to Doctor
    const doctorHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>New Appointment Notification</h2>
        <p>Hello Dr. ${doctor.lastName},</p>
        <p>You have a new appointment with ${patient.firstName} ${patient.lastName}.</p>
        <p><strong>Date & Time:</strong> ${date}</p>
        <p><strong>Reason:</strong> ${appointment.reason || 'General Consultation'}</p>
        <br>
        <p>Best regards,</p>
        <p><strong>The CureVirtual Team</strong></p>
      </div>
    `;
    await this.sendEmail({ to: doctor.email, subject: "CureVirtual - New Appointment", html: doctorHtml });
  },
  
  async sendAppointmentStatusChange(appointment, patient, doctor, status) {
    const subject = `CureVirtual - Appointment ${status}`;
    const date = new Date(appointment.appointmentDate).toLocaleString();
    
    // Email to Patient
    const patientHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Appointment ${status}</h2>
        <p>Hello ${patient.firstName},</p>
        <p>Your appointment with Dr. ${doctor.lastName} scheduled for ${date} has been <strong>${status}</strong>.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>The CureVirtual Team</strong></p>
      </div>
    `;
    await this.sendEmail({ to: patient.email, subject, html: patientHtml });
  },

  async sendVideoConsultationConfirmation(consultation, patient, doctor) {
    const subject = "CureVirtual - Video Consultation Scheduled";
    const date = new Date(consultation.scheduledAt).toLocaleString();
    
    const patientHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Video Consultation Scheduled</h2>
        <p>Hello ${patient.firstName},</p>
        <p>Your video consultation with Dr. ${doctor.lastName} has been scheduled.</p>
        <p><strong>Date & Time:</strong> ${date}</p>
        <p><strong>Title:</strong> ${consultation.title || 'General Consultation'}</p>
        <br>
        <p>Please log in to the portal at the scheduled time to join the call.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>The CureVirtual Team</strong></p>
      </div>
    `;
    await this.sendEmail({ to: patient.email, subject, html: patientHtml });

    const doctorHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Video Consultation Scheduled</h2>
        <p>Hello Dr. ${doctor.lastName},</p>
        <p>You have scheduled a video consultation with ${patient.firstName} ${patient.lastName}.</p>
        <p><strong>Date & Time:</strong> ${date}</p>
        <p><strong>Title:</strong> ${consultation.title || 'General Consultation'}</p>
        <br>
        <p>Best regards,</p>
        <p><strong>The CureVirtual Team</strong></p>
      </div>
    `;
    await this.sendEmail({ to: doctor.email, subject, html: doctorHtml });
  }
};

module.exports = emailService;
