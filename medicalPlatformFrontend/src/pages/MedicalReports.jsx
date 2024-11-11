import React from 'react';
import { useNavigate } from 'react-router-dom';
import {reports} from '../assets/assets'

const MedicalReports = () => {
  const navigate = useNavigate();

  const report  = reports[0];


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Patient Medical Reports</h1>
      <div className="space-y-4">
        {reports.map((report, index) => (
          <div key={index} className="p-4 border rounded-lg shadow-md">
            <div className="flex justify-between">
              <span className="text-lg font-medium">{report.reportSummary}</span>
              <span className="text-sm text-gray-500">{new Date(report.date).toLocaleDateString()}</span>
            </div>
            <button
              onClick={() => navigate(`/report-details/${report.id}`)}
              className="text-white bg-blue-500 hover:bg-blue-600 mt-2 px-4 py-2 rounded"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalReports;
