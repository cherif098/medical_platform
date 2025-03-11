import React, { useContext, useEffect, useState } from "react";
import { NurseContext } from "../../context/NurseContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Users,
  FileText,
  Activity,
  Clock,
  Calendar,
  Clipboard,
  CheckCircle,
  AlertCircle,
  PieChart,
  TrendingUp,
  Heart,
  Thermometer,
  Droplet,
  Wind,
  Percent,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const NurseDashboard = () => {
  const { nToken, profileData, fetchNurseProfile, patients, fetchPatientsList } = useContext(NurseContext);
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    totalReports: 0,
    recentReports: [],
    patientsByGender: { male: 0, female: 0, other: 0 },
    vitalSignsTrends: [],
    activePatients: [],
    activityLog: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (nToken) {
      loadDashboardData();
    }
  }, [nToken]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await fetchNurseProfile();
      await fetchPatientsList();
      
      // Fetch additional dashboard data
      await fetchReports();
      await generateMockData(); // For demonstration, we'll use mock data for some charts
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      // This would typically be an API call to get reports data
      // For now, we'll set some sample data
      const recentReports = [
        {
          id: 1,
          patientName: "Alice Johnson",
          date: "2025-03-08",
          status: "COMPLETED",
          diagnosis: "Mild Hypertension"
        },
        {
          id: 2,
          patientName: "Robert Smith",
          date: "2025-03-07",
          status: "PENDING",
          diagnosis: "Regular Checkup"
        },
        {
          id: 3,
          patientName: "Emma Davis",
          date: "2025-03-06",
          status: "COMPLETED",
          diagnosis: "Viral Infection"
        }
      ];

      setDashboardData(prev => ({
        ...prev,
        recentReports,
        totalReports: patients.length * 2, // Rough estimate for demo purposes
      }));
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const generateMockData = () => {
    // Mock data for charts
    const vitalSignsTrends = [
      { date: 'Mar 04', bodyTemp: 37.1, heartRate: 72, respRate: 14, oxygenSat: 98 },
      { date: 'Mar 05', bodyTemp: 37.2, heartRate: 75, respRate: 15, oxygenSat: 97 },
      { date: 'Mar 06', bodyTemp: 37.0, heartRate: 71, respRate: 14, oxygenSat: 99 },
      { date: 'Mar 07', bodyTemp: 36.9, heartRate: 70, respRate: 13, oxygenSat: 98 },
      { date: 'Mar 08', bodyTemp: 37.3, heartRate: 73, respRate: 15, oxygenSat: 97 },
      { date: 'Mar 09', bodyTemp: 37.1, heartRate: 72, respRate: 14, oxygenSat: 98 },
      { date: 'Mar 10', bodyTemp: 36.8, heartRate: 68, respRate: 13, oxygenSat: 99 },
    ];

    // Calculate gender distribution
    let maleCount = 0;
    let femaleCount = 0;
    let otherCount = 0;

    patients.forEach(patient => {
      if (patient.GENDER && patient.GENDER.toLowerCase() === 'male') {
        maleCount++;
      } else if (patient.GENDER && patient.GENDER.toLowerCase() === 'female') {
        femaleCount++;
      } else {
        otherCount++;
      }
    });

    // Generate activity log
    const activityLog = [
      { time: "09:15 AM", action: "Updated vital signs for patient Emma Davis", date: "Today" },
      { time: "10:30 AM", action: "Added nurse notes to report #24601", date: "Today" },
      { time: "11:45 AM", action: "Checked medication for patient Robert Smith", date: "Today" },
      { time: "02:30 PM", action: "Updated patient Alice Johnson's chart", date: "Yesterday" },
      { time: "04:15 PM", action: "Assisted Dr. Thompson with examination", date: "Yesterday" }
    ];

    setDashboardData(prev => ({
      ...prev,
      vitalSignsTrends,
      patientsByGender: { male: maleCount, female: femaleCount, other: otherCount },
      totalPatients: patients.length,
      activePatients: patients.slice(0, 5), // Just take the first 5 patients for display
      activityLog
    }));
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className={`p-6 rounded-xl shadow-sm border border-gray-100 bg-white hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>
      <h3 className="text-2xl font-bold mt-4">{value}</h3>
      <p className="text-gray-600 text-sm mt-1">{title}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nurse Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {profileData?.NAME}! Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={Users} 
          title="Total Patients"
          value={dashboardData.totalPatients}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard 
          icon={FileText} 
          title="Medical Reports"
          value={dashboardData.totalReports}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard 
          icon={CheckCircle} 
          title="Completed Reports"
          value={Math.floor(dashboardData.totalReports * 0.7)}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard 
          icon={Activity} 
          title="Today's Tasks"
          value={5}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Middle Row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Patient Gender Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Patients by Gender</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Male', value: dashboardData.patientsByGender.male, fill: '#4F46E5' },
                { name: 'Female', value: dashboardData.patientsByGender.female, fill: '#EC4899' },
                { name: 'Other', value: dashboardData.patientsByGender.other, fill: '#10B981' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" nameKey="name" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vital Signs Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Vital Signs Trends (7-Day Average)</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.vitalSignsTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="bodyTemp" 
                  name="Body Temp (°C)" 
                  stroke="#ef4444" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="heartRate" 
                  name="Heart Rate (bpm)" 
                  stroke="#8b5cf6" 
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="respRate" 
                  name="Resp. Rate (/min)" 
                  stroke="#10b981" 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="oxygenSat" 
                  name="O2 Saturation (%)" 
                  stroke="#3b82f6" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Recent Medical Reports</h2>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="divide-y">
            {dashboardData.recentReports.map((report) => (
              <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{report.patientName}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {report.date}
                      <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                      {report.diagnosis}
                    </div>
                  </div>
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
              <Clipboard className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="divide-y max-h-[350px] overflow-y-auto">
            {dashboardData.activityLog.map((activity, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                      <span className="text-xs text-gray-500">{activity.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vital Signs Quick Access */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Vital Signs Reference</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <Thermometer className="w-5 h-5" />
              <h3 className="font-medium">Body Temperature</h3>
            </div>
            <p className="text-sm text-gray-700">Normal: 36.5-37.5°C</p>
            <p className="text-sm text-gray-700">Fever: >38.0°C</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Heart className="w-5 h-5" />
              <h3 className="font-medium">Heart Rate</h3>
            </div>
            <p className="text-sm text-gray-700">Adult: 60-100 bpm</p>
            <p className="text-sm text-gray-700">Athletic: 40-60 bpm</p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Droplet className="w-5 h-5" />
              <h3 className="font-medium">Blood Pressure</h3>
            </div>
            <p className="text-sm text-gray-700">Normal: ≤120/80 mmHg</p>
            <p className="text-sm text-gray-700">High: ≥130/80 mmHg</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Percent className="w-5 h-5" />
              <h3 className="font-medium">O2 Saturation</h3>
            </div>
            <p className="text-sm text-gray-700">Normal: 95-100%</p>
            <p className="text-sm text-gray-700">Low: <95%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;