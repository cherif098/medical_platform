import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Clock,
  Users,
  ActivitySquare,
  TrendingUp,
  Check,
  Clock3,
} from "lucide-react";

const DoctorDashboard = () => {
  const { dToken, dashData, setDashData, getDashData } =
    useContext(DoctorContext);
  const { currency, slotDateFormat, convertTimeToAmPm } =
    useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken]);

  const revenueData = [
    { month: "Jan", revenue: 2400 },
    { month: "Feb", revenue: 3600 },
    { month: "Mar", revenue: 3200 },
    { month: "Apr", revenue: 4500 },
    { month: "May", revenue: 3800 },
    { month: "Jun", revenue: 5000 },
  ];

  return (
    dashData && (
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue sur votre espace de gestion</p>
        </div>

        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {dashData.earnings}
                  {currency}
                </p>
                <p className="text-gray-500">Revenus totaux</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {dashData.appointments}
                </p>
                <p className="text-gray-500">Rendez-vous</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {dashData.patients}
                </p>
                <p className="text-gray-500">Patients</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphique des revenus */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Évolution des revenus
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4F46E5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Liste des derniers rendez-vous */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <ActivitySquare className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Derniers rendez-vous
              </h2>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {dashData.latestAppointments.map((item, index) => (
              <div
                key={index}
                className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <img
                  src={item.PATIENT_IMAGE}
                  alt={item.PATIENT_NAME}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />

                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.PATIENT_NAME}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{slotDateFormat(item.SLOT_DATE)}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{convertTimeToAmPm(item.SLOT_TIME)}</span>
                  </div>
                </div>

                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    item.STATUS === "COMPLETED"
                      ? "bg-green-50 text-green-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {item.STATUS === "COMPLETED" ? (
                    <div className="flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      <span>Terminé</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Clock3 className="w-4 h-4" />
                      <span>Planifié</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorDashboard;
