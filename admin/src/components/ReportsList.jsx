import React, { useContext, useState } from "react";
import { DoctorContext } from "../context/DoctorContext";
import { toast } from "react-toastify";

const ReportsList = ({ reports, patientId, navigate, hideCreateButton, onDownloadPDF, userRole }) => {
  const { deleteReport, downloadReportPDF, getPatientReports } =
    useContext(DoctorContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No Reports Found</h3>
        <p className="mt-1 text-gray-500">
          No medical reports have been created for this patient yet.
        </p>
        {/* Bouton caché pour les infirmiers */}
        {!hideCreateButton && (
          <button
            onClick={() => navigate(`/medical-reports/create/${patientId}`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create First Report
          </button>
        )}
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: {
        className: "bg-yellow-100 text-yellow-800",
        label: "Draft",
      },
      COMPLETED: {
        className: "bg-green-100 text-green-800",
        label: "Completed",
      },
      PENDING: {
        className: "bg-blue-100 text-blue-800",
        label: "Pending",
      },
    };
    return (
      statusConfig[status] || {
        className: "bg-gray-100 text-gray-800",
        label: status,
      }
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (reportId) => {
    if (isDeleting) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report? This action cannot be undone."
    );

    if (confirmDelete) {
      setIsDeleting(true);
      try {
        const success = await deleteReport(reportId);
        if (success) {
          await getPatientReports(patientId);
          toast.success("Report deleted successfully");
        }
      } catch (error) {
        toast.error("Failed to delete report");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDownloadPDF = async (reportId) => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      await downloadReportPDF(reportId);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Reason
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => {
              const { className, label } = getStatusBadge(report.STATUS);
              return (
                <tr key={report.REPORT_ID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(report.CONSULTATION_DATE)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(report.CONSULTATION_DATE)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md truncate">
                      {report.CONSULTATION_REASON || "No reason provided"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}
                    >
                      {label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          navigate(`/medical-reports/view/${report.REPORT_ID}`)
                        }
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        title="View Report"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/medical-reports/edit/${report.REPORT_ID}`)
                        }
                        className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        title="Edit Report"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
  onClick={() => onDownloadPDF ? onDownloadPDF(report.REPORT_ID) : downloadReportPDF(report.REPORT_ID)}
  disabled={isDownloading}
  className="text-purple-600 hover:text-purple-900 flex items-center gap-1 download-pdf-btn"
  title="Download PDF"
>
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
    />
  </svg>
  PDF
</button>

                      <button
                        onClick={() => handleDelete(report.REPORT_ID)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        title="Delete Report"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                      {userRole === "Nurse" && (
  <button
  onClick={() => {
    sessionStorage.setItem("scrollTo", "nurseObservations");
    console.log("ScrollTo saved:", sessionStorage.getItem("scrollTo"));
    navigate(`/view-report/${report.REPORT_ID}`);
  }}
  className="text-green-500 hover:text-green-700 flex items-center gap-1"
  title="Add Notes"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
  </svg>
  Add Notes
</button>
)}

{userRole === "Nurse" && (
  <button
  onClick={() => {
    sessionStorage.setItem("scrollTo", "VitalSigns");
    console.log("ScrollTo saved:", sessionStorage.getItem("scrollTo"));
    navigate(`/view-report/${report.REPORT_ID}`);
  }}
  className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
  title="Vital Signs"
>
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
  Vital Signs
</button>
)}


                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsList;
