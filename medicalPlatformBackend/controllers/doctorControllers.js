import {
  getDoctorById,
  getDoctorStatus,
  updateDoctorStatus,
} from "../models/doctorModel.js";
import {
  getDoctorsWithoutPassword,
  getAllDoctorsWithoutPassword,
  getDoctorByEmail,
  getAppointmentById,
  updateAppointmentById,
  getDoctorAppointmentsQuery,
  updateDoctorProfileModel,
  updateDoctorOnlineStatus,
} from "../models/doctorModel.js";
import { deleteAppointmentDoctor } from "../models/appointmentModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { executeQuery } from "../config/snowflake.js";

export const changeAvailability = async (req, res) => {
  const { DOCTOR_LICENCE } = req.body;

  try {
    // Récupérer l'état actuel du médecin
    const doctorData = await getDoctorStatus(DOCTOR_LICENCE);

    if (doctorData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found!" });
    }

    // Inverser le statut actuel
    const newStatus = !doctorData[0].STATUS;

    // Mettre à jour le statut dans la base de données
    await updateDoctorStatus(DOCTOR_LICENCE, newStatus);

    // Retourner une réponse de succès
    res.json({ success: true, message: "Availability changed!" });
  } catch (error) {
    console.error("Error changing availability:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// doctorControllers.js
export const completeAppointment = async (req, res) => {
  try {
    const { APPOINTMENT_ID } = req.body;
    console.log("DEUXIEME FOIS:", APPOINTMENT_ID);
    const DOCTOR_ID = req.user.DOCTOR_ID; // From authDoctor middleware
    console.log("deuxieme fois :", DOCTOR_ID);

    // Vérifier si le rendez-vous existe et appartient au docteur
    const appointment = await getAppointmentById(APPOINTMENT_ID);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Mettre à jour le statut
    const result = await updateAppointmentById(APPOINTMENT_ID, "COMPLETED");

    if (result.success) {
      res.json({
        success: true,
        message: "Appointment marked as completed successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to update appointment status",
      });
    }
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const doctorList = async (req, res) => {
  try {
    const doctors = await getAllDoctorsWithoutPassword();
    res.json({ success: true, doctors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const findAvailableDoctor = async (doctorId) => {
  const doctorQuery = `
      SELECT DOCTOR_ID, STATUS, FEES 
      FROM DOCTORS 
      WHERE DOCTOR_ID = ? AND STATUS = TRUE
  `;
  const [doctor] = await snowflake.execute({
    sqlText: doctorQuery,
    binds: [doctorId],
  });
  return doctor;
};

export const doctorLogin = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { EMAIL, PASSWORD } = req.body;
    if (!EMAIL || !PASSWORD) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const doctor = await getDoctorByEmail(EMAIL);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(PASSWORD, doctor.PASSWORD);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // update statut online à TRUE
    await updateDoctorOnlineStatus(doctor.DOCTOR_ID, true);

    io.emit("userStatusUpdate", {
      userId: doctor.DOCTOR_ID,
      userType: "DOCTOR",
      isOnline: true,
    });

    // Création du token JWT
    const token = jwt.sign(
      { doctorId: doctor.DOCTOR_ID, email: EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// logout
export const doctorLogout = async (req, res) => {
  try {
    const doctorId = req.user.DOCTOR_ID;

    if (!doctorId) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID is missing." });
    }
    await updateDoctorOnlineStatus(doctorId, false);

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Erreur lors du logout médecin:", error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

//APi to get doctor appointments from doctor panel
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.DOCTOR_ID;

    // Requête SQL pour récupérer les rendez-vous avec les informations du patient
    const query = `
      SELECT 
        A.APPOINTMENT_ID,
        A.USER_ID,
        A.SLOT_DATE,
        A.SLOT_TIME,
        A.FEES,
        A.STATUS,
        P.NAME as PATIENT_NAME,
        P.EMAIL as PATIENT_EMAIL,
        P.PHONE as PATIENT_PHONE,
        P.GENDER as PATIENT_GENDER,
        P.IMAGE as PATIENT_IMAGE
      FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS A
      JOIN MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS P ON A.USER_ID = P.PATIENT_ID
      WHERE A.DOCTOR_ID = ?
      ORDER BY A.SLOT_DATE DESC, A.SLOT_TIME DESC
    `;

    // Exécution de la requête
    const appointments = await executeQuery(query, [doctorId]);

    // Si aucun rendez-vous n'est trouvé
    if (!appointments || appointments.length === 0) {
      return res.json({
        success: true,
        message: "No appointments found",
        appointments: [],
      });
    }

    // Formater les dates et heures pour l'affichage
    const formattedAppointments = appointments.map((appointment) => ({
      ...appointment,
      SLOT_DATE: new Date(appointment.SLOT_DATE).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      SLOT_TIME: appointment.SLOT_TIME.slice(0, 5), // Format HH:mm
    }));

    res.json({
      success: true,
      message: "Appointments retrieved successfully",
      appointments: formattedAppointments,
    });
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving appointments",
      error: error.message,
    });
  }
};
//API TO MARK APPOINTMENT COMPLETED FOR DOCTOR PANEL

export const appointmentComplete = async (req, res) => {
  try {
    const { DOCTOR_ID, APPOINTMENT_ID } = req.body;

    console.log("Completing appointment:", { DOCTOR_ID, APPOINTMENT_ID });

    const appointmentData = await getAppointmentById(APPOINTMENT_ID);
    if (appointmentData && appointmentData.DOCTOR_ID === DOCTOR_ID) {
      const updateResult = await updateAppointmentById(
        APPOINTMENT_ID,
        "COMPLETED"
      );
      if (updateResult.success) {
        return res.json({ success: true, message: "Appointment completed" });
      } else {
        return res.json({ success: false, message: updateResult.message });
      }
    } else {
      return res.json({
        success: false,
        message: "Unauthorized or invalid appointment",
      });
    }
  } catch (error) {
    console.error("Error in appointmentComplete:", error.message);
    res.json({
      success: false,
      message: "Failed to complete the appointment.",
    });
  }
};
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.user.DOCTOR_ID;

    await deleteAppointmentDoctor(appointmentId, doctorId);

    return res.json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error cancelling appointment",
    });
  }
};

// doctorControllers.js
export const doctorDashboard = async (req, res) => {
  try {
    if (!req.user || !req.user.DOCTOR_ID) {
      return res.status(401).json({
        success: false,
        message: "Doctor ID not found in request",
      });
    }

    const doctorId = req.user.DOCTOR_ID;
    console.log("Processing dashboard for doctor:", doctorId); // Debug log

    const appointments = await getDoctorAppointmentsQuery(doctorId);
    console.log("Retrieved appointments for dashboard:", appointments); // Debug log

    let earnings = 0;
    let patients = new Set();

    appointments.forEach((item) => {
      if (item && item.STATUS === "COMPLETED") {
        earnings += Number(item.FEES) || 0;
      }
      if (item && item.USER_ID) {
        patients.add(item.USER_ID);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.size,
      latestAppointments: appointments.slice(0, 5),
    };

    console.log("Final dashboard data:", dashData); // Debug log

    return res.json({
      success: true,
      dashData,
    });
  } catch (error) {
    console.error("Error in doctorDashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving dashboard data",
      error: error.message,
    });
  }
};

// API to get doctor profile for doctor panel
export const doctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.DOCTOR_ID;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Identifiant du docteur non trouvé",
      });
    }

    const profileData = await getDoctorById(doctorId);

    if (!profileData) {
      return res.status(404).json({
        success: false,
        message: "Profil du docteur non trouvé",
      });
    }

    const { PASSWORD, ...safeProfile } = profileData;

    return res.status(200).json({
      success: true,
      data: safeProfile,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil du docteur",
    });
  }
};
// API to update doctor profile from doctor panel :

export const updateDoctorProfile = async (req, res) => {
  try {
    const DOCTOR_ID = req.user.DOCTOR_ID;

    if (!DOCTOR_ID) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    // Verify doctor exists before attempting update
    const existingDoctor = await getDoctorById(DOCTOR_ID);
    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Attempt to update the profile
    await updateDoctorProfileModel(DOCTOR_ID, req.body);

    // Fetch and return updated profile
    const updatedDoctor = await getDoctorById(DOCTOR_ID);
    const { PASSWORD, ...safeProfile } = updatedDoctor;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: safeProfile,
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error updating profile",
    });
  }
};
