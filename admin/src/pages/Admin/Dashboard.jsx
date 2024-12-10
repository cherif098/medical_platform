import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CalendarDays,
  Users,
  Stethoscope,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const Dashboard = () => {
  const { aToken, getDashData, dashData } = useContext(AdminContext);
  const { slotDateFormat, convertTimeToAmPm } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  // Données simulées pour le graphique
  const appointmentData = [
    { name: "Mon", appointments: 4 },
    { name: "Tue", appointments: 6 },
    { name: "Wed", appointments: 8 },
    { name: "Thu", appointments: 5 },
    { name: "Fri", appointments: 9 },
    { name: "Sat", appointments: 3 },
    { name: "Sun", appointments: 2 },
  ];

  if (!dashData) return null;

  const StatCard = ({ icon: Icon, title, value, trend, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <span className="flex items-center text-sm font-medium text-green-600">
            <TrendingUp size={16} className="mr-1" />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold mt-4">{value}</h3>
      <p className="text-gray-600 text-sm mt-1">{title}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's what's happening
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            System Online
          </span>
          <Clock size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Stethoscope}
          title="Total Doctors"
          value={dashData.doctors}
          trend="+12%"
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          title="Registered Patients"
          value={dashData.patients}
          trend="+8%"
          color="bg-green-500"
        />
        <StatCard
          icon={CalendarDays}
          title="Total Appointments"
          value={dashData.appointments}
          trend="+15%"
          color="bg-purple-500"
        />
        <StatCard
          icon={CheckCircle2}
          title="Completed Today"
          value={(dashData.appointments * 0.7).toFixed(0)}
          color="bg-indigo-500"
        />
      </div>

      {/* Graphique et Dernières réservations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Weekly Appointments Overview
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appointmentData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dernières réservations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Latest Bookings
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Most recent appointments
            </p>
          </div>

          <div className="divide-y max-h-[400px] overflow-y-auto">
            {dashData.latestAppointments.map((item, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.DOCTORIMAGE}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.DOCTORNAME}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarDays size={14} className="text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {slotDateFormat(item.SLOT_DATE)}
                      </p>
                      <Clock size={14} className="text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {convertTimeToAmPm(item.SLOT_TIME)}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Scheduled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section des statuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Appointment Status</h3>
            <AlertCircle size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-medium">70%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="text-sm font-medium">20%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Cancelled</span>
              </div>
              <span className="text-sm font-medium">10%</span>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              Specialties Distribution
            </h3>
            <Stethoscope size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">General Physician</span>
              <span className="text-sm font-medium">35%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pediatrician</span>
              <span className="text-sm font-medium">25%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Dermatologist</span>
              <span className="text-sm font-medium">20%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Others</span>
              <span className="text-sm font-medium">20%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">System Metrics</h3>
            <TrendingUp size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">System Load</span>
                <span className="text-sm font-medium text-green-600">
                  Normal
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: "45%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium">120ms</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Storage Usage</span>
                <span className="text-sm font-medium">2.1/5 GB</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: "42%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
