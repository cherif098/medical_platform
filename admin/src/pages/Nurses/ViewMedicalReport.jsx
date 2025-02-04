import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { NurseContext } from "../../context/NurseContext";
import { toast } from "react-toastify";
import { FileText, Download, Edit, Mic, StopCircle, Trash2} from "lucide-react";
import axios from "axios";
import { ReactMic } from "react-mic";

const InfoSection = ({ title, icon, children }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <span className="text-blue-600">{icon}</span>
      {title}
    </h2>
    {children}
  </div>
);

const Field = ({ label, value }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-500">{label}</label>
    <div className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded-md">
      {value || "Not specified"}
    </div>
  </div>
);

const ViewMedicalReport = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { getReportDetails, getNurseNote, addNurseNote, updateNurseNote, downloadNurseReportPDF, transcribeSpeech , deleteNurseNote} =
    useContext(NurseContext);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nurseNote, setNurseNote] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [editing, setEditing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribing, setTranscribing] = useState(false); 

  const nurseObsRef = useRef(null);
  const location = useLocation();

  

  const nToken = localStorage.getItem("nToken");

  useEffect(() => {

    const fetchReport = async () => {
      try {
        const data = await getReportDetails(reportId);
        if (data) {
          setReport(data);
        } else {
          toast.error("Report not found");
          navigate("/medicalreports-list");
        }
      } catch (error) {
        toast.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    const fetchNurseNote = async () => {
      const noteData = await getNurseNote(reportId, nToken);
      if (noteData && noteData.NOTE_TEXT) {
        setNurseNote(noteData);
        setNoteText(noteData.NOTE_TEXT);
      }
    };

    fetchReport();
    fetchNurseNote();
  }, [reportId, getReportDetails, getNurseNote, navigate, nToken]);

  useEffect(() => {
    let scrollToSection = location.state?.scrollTo || sessionStorage.getItem("scrollTo");
    console.log("Location State:", location.state);
    console.log("Session Storage ScrollTo:", sessionStorage.getItem("scrollTo"));
  
    sessionStorage.removeItem("scrollTo"); 
  
    if (scrollToSection === "nurseObservations") {
      setTimeout(() => {
        if (nurseObsRef.current) {
          console.log("Défilement vers Nurse Observations...");
          nurseObsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          console.warn("nurseObsRef est NULL !");
        }
      }, 500);
    }
  }, [location]);
  
  
  
  

  const handleSaveNote = async () => {
    try {
      if (!noteText.trim()) {
        toast.error("Note cannot be empty");
        return;
      }

      if (nurseNote) {
        await updateNurseNote(reportId, noteText, nToken);
        toast.success("Note updated successfully!");
      } else {
        await addNurseNote(reportId, noteText, nToken);
        toast.success("Note added successfully!");
      }

      setEditing(false);
      setNurseNote({ NOTE_TEXT: noteText });
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note.");
    }
  };
  const handleDeleteNote = async (reportId) => {
    try {
      await deleteNurseNote(reportId, nToken); 
      toast.success("Note deleted successfully!");
      setNurseNote(null); 
    } catch (error) {
      toast.error("Failed to delete note.");
    }
  };
  

  const formatDate = (date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: {
        className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        label: "Draft",
      },
      COMPLETED: {
        className: "bg-green-100 text-green-800 border border-green-200",
        label: "Completed",
      },
    };
    return (
      statusConfig[status] || {
        className: "bg-gray-100 text-gray-800",
        label: status,
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Loading report data...</span>
      </div>
    );
  }
  const { className: statusClassName, label: statusLabel } = getStatusBadge(
    report.STATUS
  );

  

const onStop = (recordedBlob) => {
  console.log("Type du blob:", recordedBlob.blob.type);
  console.log("Taille du blob:", recordedBlob.blob.size);
  handleTranscribe(recordedBlob.blob);
};

const handleTranscribe = async (audioData) => {
  const audioToSend = audioData || audioBlob;
  if (!audioToSend) {
    toast.error("No audio recorded!");
    return;
  }
  setTranscribing(true);
  try {
    const transcript = await transcribeSpeech(audioToSend);
    setNoteText((prevText) => prevText + " " + transcript);
    toast.success("Transcription successful!");
    setAudioBlob(null);
  } catch (error) {
    console.error("Transcription error:", error);
    toast.error("Failed to transcribe the speech.");
  } finally {
    setTranscribing(false);
  }
};

const startRecording = () => {
  setIsRecording(true);
  setAudioBlob(null); 
};


const stopRecording = () => {
  setIsRecording(false);
};






  return (
    <div className="flex-1 h-screen flex flex-col bg-gray-50">
      <div className="p-8 pb-0">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-gray-700" />
              Medical Report
            </h1>
            <p className="text-sm text-gray-600">Created on {formatDate(report.CREATED_AT)}</p>
            <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClassName}`}
        >
          {statusLabel}
        </span>

          </div>

          <button
            onClick={() => downloadNurseReportPDF(report.REPORT_ID, report.PATIENT_NAME)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Doctor Information */}
          <InfoSection title="Doctor Information" icon="👨‍⚕️">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Name" value={report.DOCTOR_NAME} />
              <Field label="Specialty" value={report.SPECIALTY} />
            </div>
          </InfoSection>

          {/* Patient Information */}
          <InfoSection title="Patient Information" icon="👤">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Name" value={report.PATIENT_NAME} />
              <Field label="Gender" value={report.GENDER} />
              <Field label="Date of Birth" value={formatDate(report.DATE_OF_BIRTH)} />
              <Field label="Email" value={report.EMAIL} />
              <Field label="Phone" value={report.PHONE} />
            </div>
          </InfoSection>
           {/* Consultation Details */}
           <InfoSection title="Consultation Details" icon="📅">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Date"
                value={formatDate(report.CONSULTATION_DATE)}
              />
              <Field
                label="Duration"
                value={`${report.CONSULTATION_DURATION} minutes`}
              />
              <Field
                label="Reason"
                value={report.CONSULTATION_REASON}
                className="md:col-span-2"
              />
            </div>
          </InfoSection>

          {/* Complaints and History */}
          <InfoSection title="Complaints and History" icon="🔍">
            <Field label="Main Complaint" value={report.MAIN_COMPLAINT} />
            <Field
              label="Current Illness History"
              value={report.CURRENT_ILLNESS_HISTORY}
            />
          </InfoSection>

          {/* Vital Signs */}
          <InfoSection title="Vital Signs" icon="❤️">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field
                label="Temperature"
                value={report.TEMPERATURE && `${report.TEMPERATURE}°C`}
              />
              <Field label="Blood Pressure" value={report.BLOOD_PRESSURE} />
              <Field
                label="Heart Rate"
                value={report.HEART_RATE && `${report.HEART_RATE} bpm`}
              />
              <Field
                label="Respiratory Rate"
                value={
                  report.RESPIRATORY_RATE && `${report.RESPIRATORY_RATE}/min`
                }
              />
              <Field
                label="Oxygen Saturation"
                value={
                  report.OXYGEN_SATURATION && `${report.OXYGEN_SATURATION}%`
                }
              />
              <Field
                label="Weight"
                value={report.WEIGHT && `${report.WEIGHT} kg`}
              />
              <Field
                label="Height"
                value={report.HEIGHT && `${report.HEIGHT} cm`}
              />
              <Field label="BMI" value={report.BMI} />
            </div>
          </InfoSection>

          {/* Medical History */}
          <InfoSection title="Medical History" icon="📚">
            <Field label="Personal History" value={report.PERSONAL_HISTORY} />
            <Field label="Family History" value={report.FAMILY_HISTORY} />
            <Field label="Lifestyle Habits" value={report.LIFESTYLE_HABITS} />
          </InfoSection>

          {/* Examination and Tests */}
          <InfoSection title="Examination and Tests" icon="🔬">
            <Field
              label="Physical Examination"
              value={report.PHYSICAL_EXAMINATION}
            />
            <Field label="Tests Performed" value={report.TESTS_PERFORMED} />
            <Field label="Test Results" value={report.TEST_RESULTS} />
          </InfoSection>

          {/* Diagnosis */}
          <InfoSection title="Diagnosis" icon="🏥">
            <Field label="Primary Diagnosis" value={report.PRIMARY_DIAGNOSIS} />
            <Field
              label="Differential Diagnosis"
              value={report.DIFFERENTIAL_DIAGNOSIS}
            />
            <Field label="Evolution Notes" value={report.EVOLUTION_NOTES} />
          </InfoSection>

          {/* Treatment Plan */}
          <InfoSection title="Treatment Plan" icon="💊">
            <Field label="Prescriptions" value={report.PRESCRIPTIONS} />
            <Field label="Other Treatments" value={report.OTHER_TREATMENTS} />
            <Field label="Recommendations" value={report.RECOMMENDATIONS} />
            <Field
              label="Next Appointment"
              value={formatDate(report.NEXT_APPOINTMENT)}
            />
          </InfoSection>

          {/* Disability Assessment */}
          <InfoSection title="Disability Assessment" icon="⚕️">
            <Field
              label="Disability Evaluation"
              value={report.DISABILITY_EVALUATION}
            />
            <Field
              label="Duration"
              value={
                report.DISABILITY_DURATION &&
                `${report.DISABILITY_DURATION} days`
              }
            />
            <Field
              label="Work Return Recommendations"
              value={report.WORK_RETURN_RECOMMENDATIONS}
            />
          </InfoSection>

          
        {/* Nurse Observations */}
<div ref={nurseObsRef}>
<InfoSection
  title="Nurse Observations"
  icon={<Edit className="w-6 h-6 text-gray-700" />}
>
  {nurseNote && !editing ? (
    <div className="mt-4 bg-gray-100 p-4 rounded-lg flex justify-between items-center">
      <p className="text-gray-800 whitespace-pre-wrap">{nurseNote.NOTE_TEXT}</p>
      <div className="flex gap-3">
        

        <button
          onClick={() => setEditing(true)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title="Edit Note"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
    onClick={() => deleteNurseNote(reportId, nToken, setNurseNote, setNoteText)}
    className="text-red-600 hover:text-red-800 transition-colors"
>
    <Trash2 className="w-5 h-5" />
</button>


      </div>
    </div>
  ) : (
    <div className="mt-4 flex flex-col gap-3">
      <textarea
        className="flex-1 p-3 border rounded-md min-h-[120px] resize-none"
        rows="5"
        placeholder="Write your note..."
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
      ></textarea>

      <div className="flex justify-end gap-3">
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-md flex items-center gap-1"
          >
            <StopCircle className="w-5 h-5" />
            Stop
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md flex items-center gap-1"
          >
            <Mic className="w-5 h-5" />
            Record
          </button>
        )}
        <button
          onClick={handleSaveNote}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>

      <div style={{ display: "none" }}>
        <ReactMic record={isRecording} onStop={onStop} mimeType="audio/wav" />
      </div>
    </div>
  )}
</InfoSection>

</div>



        </div>
      </div>

      <div className="p-8 pt-4 bg-gray-50">
        <div className="max-w-4xl mx-auto flex justify-end">
          <button
            onClick={() => navigate("/medicalreports-list")}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
          >
            Back to Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMedicalReport;
