import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Calendar,
  Mail,
  Phone,
  Users,
  FileText,
  Check,
  X,
  Loader2,
  Clock,
} from "lucide-react";

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [canceling, setCanceling] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const {
    dToken,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        await getAppointments();
      } catch (error) {
        toast.error("Échec du chargement des rendez-vous");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [dToken]);

  const handleCancelAppointment = async (APPOINTMENT_ID) => {
    try {
      setCanceling(APPOINTMENT_ID);
      await cancelAppointment(APPOINTMENT_ID);
    } catch (error) {
      toast.error("Échec de l'annulation du rendez-vous");
    } finally {
      setCanceling(null);
    }
  };

  const handleCompleteAppointment = async (APPOINTMENT_ID) => {
    try {
      setProcessing(APPOINTMENT_ID);
      const success = await completeAppointment(APPOINTMENT_ID);
      if (success) {
        setAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt.APPOINTMENT_ID === APPOINTMENT_ID
              ? { ...apt, STATUS: "COMPLETED" }
              : apt
          )
        );
        toast.success("Rendez-vous marqué comme terminé");
      }
    } catch (error) {
      toast.error("Échec de la validation du rendez-vous");
    } finally {
      setProcessing(null);
    }
  };

  const handleCreateReport = (appointment) => {
    navigate(`/medical-reports/create/${appointment.USER_ID}`);
    toast.info("Création du rapport médical en cours");
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === "ALL") return true;
    return apt.STATUS === filterStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Chargement des rendez-vous...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Rendez-vous</h1>
        <p className="text-gray-600">
          Gérez vos consultations et suivis patients
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center gap-4">
        <span className="text-gray-700 font-medium">Filtrer par statut:</span>
        <div className="flex gap-2">
          {["ALL", "SCHEDULED", "COMPLETED", "CANCELED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  filterStatus === status
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {status === "ALL" ? "Tous" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des rendez-vous */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600 text-sm">
                <th className="py-4 px-6 font-medium">Patient</th>
                <th className="py-4 px-6 font-medium">Contact</th>
                <th className="py-4 px-6 font-medium">Date & Heure</th>
                <th className="py-4 px-6 font-medium">Statut</th>
                <th className="py-4 px-6 font-medium">Honoraires</th>
                <th className="py-4 px-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.map((item) => (
                <tr key={item.APPOINTMENT_ID} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.PATIENT_IMAGE}
                        alt={item.PATIENT_NAME}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.PATIENT_NAME}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.PATIENT_GENDER}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {item.PATIENT_EMAIL}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {item.PATIENT_PHONE}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {item.SLOT_DATE}, {item.SLOT_TIME}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
                      ${
                        item.STATUS === "COMPLETED"
                          ? "bg-green-50 text-green-700"
                          : item.STATUS === "CANCELED"
                          ? "bg-red-50 text-red-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {item.STATUS === "COMPLETED" ? (
                        <Check className="w-4 h-4" />
                      ) : item.STATUS === "CANCELED" ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      {item.STATUS}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">
                      {item.FEES}€
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      {item.STATUS === "COMPLETED" ? (
                        <button
                          onClick={() => handleCreateReport(item)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Rapport
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              handleCancelAppointment(item.APPOINTMENT_ID)
                            }
                            disabled={canceling === item.APPOINTMENT_ID}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {canceling === item.APPOINTMENT_ID ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleCompleteAppointment(item.APPOINTMENT_ID)
                            }
                            disabled={processing === item.APPOINTMENT_ID}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {processing === item.APPOINTMENT_ID ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Check className="w-5 h-5" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
