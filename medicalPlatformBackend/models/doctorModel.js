// models/DoctorModel.js
import { executeQuery } from "../config/snowflake.js";

export const insertDoctor = async (doctorData) => {
  const {
    DOCTOR_LICENCE,
    EMAIL,
    PASSWORD,
    NAME,
    SPECIALTY,
    IS_PASSWORD_TEMPORARY,
    STATUS,
    FEES,
    ADRESS_1,
    ADRESS_2,
    DEGREE,
    EXPERIENCE,
    ABOUT,
    CREATED_AT,
    CREATED_BY,
    IMAGE,
    HOSPITAL_ID, // Ajout du HOSPITAL_ID
  } = doctorData;

  const query = `
        INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS 
        (DOCTOR_LICENCE, EMAIL, PASSWORD, NAME, SPECIALTY, IS_PASSWORD_TEMPORARY, STATUS, FEES, ADRESS_1, 
        ADRESS_2, DEGREE, EXPERIENCE, ABOUT, CREATED_AT, CREATED_BY, IMAGE, HOSPITAL_ID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

  const values = [
    DOCTOR_LICENCE,
    EMAIL,
    PASSWORD,
    NAME,
    SPECIALTY,
    IS_PASSWORD_TEMPORARY ?? true, // Par défaut TRUE si non fourni
    STATUS ?? true, // Par défaut TRUE si non fourni
    FEES ?? null, // Null si non fourni
    ADRESS_1 ?? null,
    ADRESS_2 ?? null,
    DEGREE ?? null,
    EXPERIENCE ?? 0, // Par défaut 0 si non fourni
    ABOUT ?? null, // Null si non fourni
    CREATED_AT ?? new Date(), // Utilise l'heure actuelle si non fourni
    CREATED_BY ?? null,
    IMAGE ?? null,
    HOSPITAL_ID ?? null, // Ajout du HOSPITAL_ID aux valeurs
  ];

  try {
    await executeQuery(query, values);
    console.log("Doctor added successfully");
  } catch (err) {
    console.error("Error inserting doctor:", err);
    throw err;
  }
};

export const deleteDoctor = async (DOCTOR_ID) => {
  const query = `
    DELETE FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
    WHERE DOCTOR_ID = ?
  `;

  try {
    const result = await executeQuery(query, [DOCTOR_ID]);
    if (result.affectedRows === 0) {
      throw new Error("Doctor not found");
    }
    return result;
  } catch (error) {
    console.error("Error deleting doctor:", error);
    throw error;
  }
};

// Mise à jour pour filtrer par HOSPITAL_ID
export const getDoctorsWithoutPassword = async (HOSPITAL_ID) => {
  const query = `
        SELECT 
        DOCTOR_ID, DOCTOR_LICENCE, EMAIL, NAME, SPECIALTY, IS_PASSWORD_TEMPORARY, 
        STATUS, FEES, ADRESS_1, ADRESS_2, DEGREE, EXPERIENCE, ABOUT, 
        CREATED_AT, CREATED_BY, IMAGE, HOSPITAL_ID
        FROM 
          MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
        WHERE 
          HOSPITAL_ID = ?;
    `;

  try {
    const doctors = await executeQuery(query, [HOSPITAL_ID]);
    return doctors;
  } catch (err) {
    console.error("Error retrieving doctors:", err);
    throw err;
  }
};

// Version sans filtrage par hôpital (pour la compatibilité avec le code existant)
export const getAllDoctorsWithoutPassword = async () => {
  const query = `
        SELECT 
        DOCTOR_ID, DOCTOR_LICENCE, EMAIL, NAME, SPECIALTY, IS_PASSWORD_TEMPORARY, 
        STATUS, FEES, ADRESS_1, ADRESS_2, DEGREE, EXPERIENCE, ABOUT, 
        CREATED_AT, CREATED_BY, IMAGE, HOSPITAL_ID
        FROM 
          MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS;
    `;

  try {
    const doctors = await executeQuery(query);
    return doctors;
  } catch (err) {
    console.error("Error retrieving all doctors:", err);
    throw err;
  }
};

export const getDoctorStatus = async (DOCTOR_LICENCE) => {
  const query = `
    SELECT STATUS
    FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
    WHERE DOCTOR_LICENCE = ?;
  `;

  try {
    const result = await executeQuery(query, [DOCTOR_LICENCE]);
    return result;
  } catch (error) {
    console.error("Error retrieving doctor status:", error);
    throw error;
  }
};

// Mettre à jour le statut du médecin
export const updateDoctorStatus = async (DOCTOR_LICENCE) => {
  // D'abord, obtenez le statut actuel
  const currentStatus = await getDoctorStatus(DOCTOR_LICENCE);
  if (!currentStatus || currentStatus.length === 0) {
    throw new Error("Doctor not found");
  }

  // Inversez le statut actuel
  const newStatus = !currentStatus[0].STATUS;

  const query = `
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
    SET STATUS = ?
    WHERE DOCTOR_LICENCE = ?;
  `;

  try {
    await executeQuery(query, [newStatus, DOCTOR_LICENCE]);
    return newStatus;
  } catch (error) {
    console.error("Error updating doctor status:", error);
    throw error;
  }
};

export const findAvailableDoctor = async (DOCTOR_ID) => {
  const query = `
    SELECT 
      DOCTOR_ID,
      NAME,
      SPECIALTY,
      STATUS,
      FEES
    FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
    WHERE DOCTOR_ID = ? AND STATUS = TRUE;
  `;

  try {
    const result = await executeQuery(query, [DOCTOR_ID]);
    return result[0] || null; // Retourne le premier médecin trouvé ou null si non trouvé
  } catch (error) {
    console.error("Error in findAvailableDoctor:", error);
    throw error;
  }
};

// Récupérer tous les docteurs d'un hôpital spécifique
export const getDoctorsByHospital = async (HOSPITAL_ID) => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
    WHERE HOSPITAL_ID = ?;
  `;
  try {
    const result = await executeQuery(query, [HOSPITAL_ID]);
    return result;
  } catch (error) {
    console.error(
      `Error retrieving doctors for hospital ${HOSPITAL_ID}:`,
      error
    );
    throw error;
  }
};

// Version existante, maintenue pour compatibilité
export const getAllDoctors = async () => {
  const query = `SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS;`;
  try {
    const result = await executeQuery(query);
    return result;
  } catch (error) {
    console.error("Error retrieving all doctors:", error);
    throw error;
  }
};

export const getDoctorByEmail = async (EMAIL) => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
      WHERE EMAIL = ?
    `;
  try {
    const result = await executeQuery(query, [EMAIL]);
    return result[0];
  } catch (error) {
    console.error("Error fetching doctor by email:", error);
    throw error;
  }
};

export const updateDoctorOnlineStatus = async (doctorId, isOnline) => {
  const query = `
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
    SET IS_ONLINE = ?
    WHERE DOCTOR_ID = ?;
  `;
  const values = [isOnline, doctorId];

  try {
    await executeQuery(query, values);
    console.log(`Doctor ${doctorId} online status updated to ${isOnline}`);
  } catch (error) {
    console.error("Error updating doctor's online status:", error);
    throw error;
  }
};

export const getDoctorAppointmentsQuery = async (DOCTOR_ID) => {
  try {
    if (!DOCTOR_ID) {
      console.error("DOCTOR_ID is undefined");
      return [];
    }

    const query = `
      SELECT 
        A.APPOINTMENT_ID,
        A.USER_ID,
        A.DOCTOR_ID,
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

    console.log("Executing query with DOCTOR_ID:", DOCTOR_ID); // Debug log

    const appointments = await executeQuery(query, [DOCTOR_ID]);

    console.log("Raw appointments data:", appointments); // Debug log

    if (!appointments || appointments.length === 0) {
      console.log("No appointments found for doctor:", DOCTOR_ID); // Debug log
      return [];
    }

    // Formater les dates et heures avec vérification des valeurs nulles
    const formattedAppointments = appointments
      .map((appointment) => {
        if (!appointment) return null;

        const formattedDate = appointment.SLOT_DATE
          ? new Date(appointment.SLOT_DATE).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Date non définie";

        const formattedTime = appointment.SLOT_TIME
          ? appointment.SLOT_TIME.slice(0, 5)
          : "Heure non définie";

        return {
          ...appointment,
          SLOT_DATE: formattedDate,
          SLOT_TIME: formattedTime,
        };
      })
      .filter(Boolean); // Enlever les éléments null

    console.log("Formatted appointments:", formattedAppointments); // Debug log
    return formattedAppointments;
  } catch (error) {
    console.error("Error in getDoctorAppointmentsQuery:", error);
    throw error;
  }
};

export const getAppointmentById = async (APPOINTMENT_ID) => {
  try {
    // Requête SQL pour récupérer les informations du rendez-vous
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
        P.GENDER as PATIENT_GENDER
      FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS A
      JOIN MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS P ON A.USER_ID = P.PATIENT_ID
      WHERE A.APPOINTMENT_ID = ?
    `;

    // Exécution de la requête SQL avec l'ID fourni
    const appointment = await executeQuery(query, [APPOINTMENT_ID]);

    // Si aucun rendez-vous n'est trouvé
    if (!appointment || appointment.length === 0) {
      return null; // Retourne null si le rendez-vous n'existe pas
    }

    // Formater la date et l'heure pour un affichage cohérent
    const formattedAppointment = {
      ...appointment[0],
      SLOT_DATE: new Date(appointment[0].SLOT_DATE).toLocaleDateString(
        "fr-FR",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      ),
      SLOT_TIME: appointment[0].SLOT_TIME.slice(0, 5), // Format HH:mm
    };

    return formattedAppointment;
  } catch (error) {
    console.error("Error retrieving appointmen by ID:", error);
    throw new Error("Unable to retrieve the appointment.");
  }
};

export const updateAppointmentById = async (APPOINTMENT_ID, newStatus) => {
  try {
    if (!APPOINTMENT_ID || !newStatus) {
      throw new Error("APPOINTMENT_ID and status are required");
    }

    const query = `
      UPDATE MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS
      SET STATUS = ?
      WHERE APPOINTMENT_ID = ?
    `;

    const result = await executeQuery(query, [newStatus, APPOINTMENT_ID]);

    return {
      success: true,
      message: "Appointment status updated successfully",
      affectedRows: result.affectedRows,
    };
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
};

export const getDoctorById = async (DOCTOR_ID) => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
    WHERE DOCTOR_ID = ?
  `;
  try {
    const result = await executeQuery(query, [DOCTOR_ID]);
    return result[0];
  } catch (error) {
    console.error("Error fetching doctor by ID:", error);
    throw error;
  }
};

export const updateDoctorProfileModel = async (DOCTOR_ID, updatedData) => {
  const allowedFields = [
    "NAME",
    "SPECIALTY",
    "FEES",
    "ADRESS_1",
    "ADRESS_2",
    "DEGREE",
    "EXPERIENCE",
    "ABOUT",
    "IMAGE",
    "STATUS",
    "HOSPITAL_ID", // Ajout de HOSPITAL_ID comme champ autorisé pour la mise à jour
  ];

  const updates = Object.entries(updatedData)
    .filter(([key]) => allowedFields.includes(key))
    .map(([key, value]) => `${key} = ?`)
    .join(", ");

  const values = Object.entries(updatedData)
    .filter(([key]) => allowedFields.includes(key))
    .map(([_, value]) => value);

  const query = `
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
    SET ${updates}
    WHERE DOCTOR_ID = ?;
  `;

  try {
    const result = await executeQuery(query, [...values, DOCTOR_ID]);

    if (result.affectedRows === 0) {
      throw new Error("Doctor not found or no changes made");
    }

    return result;
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    throw error;
  }
};
