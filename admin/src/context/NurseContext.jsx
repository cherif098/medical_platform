import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const NurseContext = createContext();

const NurseContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [nToken, setNToken] = useState(
    localStorage.getItem("nToken") ? localStorage.getItem("nToken") : ""
  );
  //console.log("Token récupéré dans le state:", nToken);
  const [dashData, setDashData] = useState(false); 
  const [profileData, setProfileData] = useState(false); 
  const [patients, setPatients] = useState([]);
  const [patientReports, setPatientReports] = useState([]); 


  // récupérer le profil de l'infirmier
  const fetchNurseProfile = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/nurse/profile", {
        headers: { ntoken: nToken },
      });
  
      if (data.success) {
       // console.log("Données du profil :", data.data); 
        setProfileData(data.data);
      } else {
        toast.error(data.message || "Échec de la récupération du profil");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil :", error);
      toast.error(error.message || "Une erreur s'est produite");
    }
  };
  
  

  const updateNurseProfile = async (updatedData) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/nurse/update-profile`,
        updatedData,
        {
          headers: { ntoken: nToken },
        }
      );
  
      const { data } = response;
  
      if (data.success) {
        return data; 
      } else {
        throw new Error(data.message || "Échec de la mise à jour du profil");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
      throw error;
    }

  };

  
  const fetchPatientsList = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/nurse/patients`, {
        headers: { ntoken: nToken },
      });
  
      if (data.success) {
        setPatients(data.data);
      } else {
        toast.error(data.message || "Impossible de récupérer la liste des patients.");
        setPatients([]); 
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des patients :", error);
      toast.error("Erreur réseau ou serveur.");
      setPatients([]); 
    }
  };


  
   // récupérer les rapports d'un patient
   const getPatientReports = async (patientId) => {
    try {
      console.log(`Fetching reports for patient ID: ${patientId}`); 
  
      const { data } = await axios.get(
        `${backendUrl}/api/reports/nurse/patients/${patientId}/reports`, 
        {
          headers: { ntoken: nToken },
        }
      );
  
      console.log("API Response:", data); 
  
      if (data.success && data.data.length > 0) {
        setPatientReports(data.data);
        toast.success("Reports retrieved successfully.");
      } else {
        setPatientReports([]); 
        toast.info(data.message || "No reports found for this patient.");
      }
    } catch (error) {
      console.error("Error fetching patient reports:", error); 
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };
  

  // récupérer les détails d’un rapport spécifique
  const getReportDetails = async (reportId) => {
    try {
      console.log(`Fetching details for report ID: ${reportId}`);
      
      const { data } = await axios.get(
        `${backendUrl}/api/reports/nurse/${reportId}`,
        { headers: { ntoken: nToken } }
      );
  
      console.log("API Response:", data);
  
      if (data.success) {
        return data.data; 
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching report details:", error);
      return null;
    }
  };


//telecharger le rapport en PDF
  const downloadNurseReportPDF = async (reportId, patientName) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/reports/nurse/${reportId}/pdf`,
        {
          headers: { ntoken: nToken },
          responseType: "blob",
        }
      );
  
      console.log("API Response:", response); 
      console.log("Patient Name:", patientName);
      const formattedName = patientName ? patientName.replace(/\s+/g, "_") : "inconnu";
      const fileName = `rapport-${formattedName}.pdf`;
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading nurse report PDF:", error);
      toast.error("Erreur lors du téléchargement du rapport PDF");
    }
  };
  

  const getNurseNote = async (reportId, nToken) => {
    try {
      const response = await axios.get(`${backendUrl}/api/nurse/nurse-note/${reportId}`, {
        headers: { ntoken: nToken },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching nurse note:", error);
      return null; 
    }
  };
  
  const addNurseNote = async (reportId, noteText, nToken) => {
    try {
      await axios.post(
        `${backendUrl}/api/nurse/nurse-note`,
        { reportId, noteText },
        { headers: { ntoken: nToken } }
      );
    } catch (error) {
      console.error("Error adding nurse note:", error);
      throw error;
    }
  };
  
  const updateNurseNote = async (reportId, noteText, nToken) => {
    try {
      await axios.put(
        `${backendUrl}/api/nurse/update-note/${reportId}`,
        { noteText },
        { headers: { ntoken: nToken } }
      );
    } catch (error) {
      console.error("Error updating nurse note:", error);
      throw error;
    }
  };

  const deleteNurseNote = async (reportId,  nToken, setNurseNote, setNoteText) => {
    try {
      await axios.delete(
        `${backendUrl}/api/nurse/delete-note/${reportId}`,
        { headers: { ntoken: nToken } }
      );
      setNurseNote(null);
      setNoteText(""); 
    } catch (error) {
      console.error("Error updating nurse note:", error);
      throw error;
    }
  };


  const transcribeSpeech = async (audioBlob) => {
    try {
      const formData = new FormData();
      const audioFile = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });
      formData.append("file", audioFile);

      const response = await axios.post(
        "http://localhost:3000/api/nurse/speech/transcribe",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data.transcript;
    } catch (error) {
      console.error("Error transcribing audio in context:", error);
      throw error;
    }
  };

  const updateVitalSigns = async (reportId, vitalSigns, nToken) => {
    try {
      const url = `${backendUrl}/api/reports/nurse/${reportId}/vital-signs`;
      console.log("PUT request to:", url);
  
      const response = await axios.put(
        url,
        vitalSigns,
        { headers: { ntoken: nToken } }
      );
  
      console.log("Response:", response.status, response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating vital signs:", error.response || error);
      throw error;
    }
  };
  


  
  
  

 
  useEffect(() => {
    if (nToken) {
      fetchNurseProfile();
    }
  }, [nToken]);

  return (
    <NurseContext.Provider
      value={{
        nToken,
        setNToken,
        dashData,
        profileData,
        patients,
        fetchNurseProfile,
        updateNurseProfile,
        fetchPatientsList,
        getPatientReports,
        patientReports,
        getReportDetails,
        downloadNurseReportPDF,
        getNurseNote,
        addNurseNote,
        updateNurseNote,
        transcribeSpeech,
        deleteNurseNote,
        updateVitalSigns,
      
      }}
    >
      {props.children}
    </NurseContext.Provider>
  );
};

export default NurseContextProvider;
