import { getDoctorStatus, updateDoctorStatus } from "../models/doctorModel.js";
import { getDoctorsWithoutPassword } from "../models/doctorModel.js";


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

export const doctorList = async (req, res) => {
    try {
      const doctors = await getDoctorsWithoutPassword();
      res.json({success:true,doctors})
    } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
    }
};