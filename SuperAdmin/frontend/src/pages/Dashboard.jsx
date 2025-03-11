import React, { useContext, useState, useEffect } from "react";
import { superAdminContext } from "../context/superAdminContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { saToken, backendUrl } = useContext(superAdminContext);
  const [stats, setStats] = useState({
    totalHospitals: 0,
    activeHospitals: 0,
    pendingHospitals: 0,
    expiredHospitals: 0,
    totalBeds: 0
  });
  const [recentHospitals, setRecentHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      if (!saToken) {
        toast.error("Jeton d'authentification manquant. Veuillez vous reconnecter.");
        return;
      }
      
      // Récupérer la liste des hôpitaux
      const { data } = await axios.get(
        `${backendUrl}/api/superAdmin/get-hospitals`,
        {
          headers: { saToken }
        }
      );

      if (data && data.success && data.hospitals) {
        const hospitals = data.hospitals;
        
        // Calculer les statistiques
        const active = hospitals.filter(h => h.SUBSCRIPTION_STATUS === "Active").length;
        const pending = hospitals.filter(h => h.SUBSCRIPTION_STATUS === "Pending").length;
        const expired = hospitals.filter(h => h.SUBSCRIPTION_STATUS === "Expired" || h.SUBSCRIPTION_STATUS === "Canceled").length;
        const totalBeds = hospitals.reduce((sum, hospital) => sum + parseInt(hospital.TOTAL_BEDS || 0), 0);
        
        setStats({
          totalHospitals: hospitals.length,
          activeHospitals: active,
          pendingHospitals: pending,
          expiredHospitals: expired,
          totalBeds: totalBeds
        });
        
        // Récupérer les 5 derniers hôpitaux ajoutés
        const sortedHospitals = [...hospitals].sort((a, b) => {
          // Trier par ID décroissant (assumant que les IDs plus élevés sont les plus récents)
          // Si vous avez un champ date, utilisez-le à la place
          return b.ID - a.ID;
        });
        
        setRecentHospitals(sortedHospitals.slice(0, 5));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données du tableau de bord:", error);
      toast.error("Échec de la récupération des données du tableau de bord");
    } finally {
      setIsLoading(false);
    }
  };

  const StatusDistribution = () => {
    const total = stats.totalHospitals;
    if (total === 0) return null;
    
    const activePercent = (stats.activeHospitals / total) * 100;
    const pendingPercent = (stats.pendingHospitals / total) * 100;
    const expiredPercent = (stats.expiredHospitals / total) * 100;
    
    return (
      <div className="flex h-4 rounded-full overflow-hidden bg-gray-200">
        <div 
          className="bg-green-500" 
          style={{ width: `${activePercent}%` }}
          title={`Actifs: ${stats.activeHospitals} (${activePercent.toFixed(1)}%)`}
        ></div>
        <div 
          className="bg-yellow-500" 
          style={{ width: `${pendingPercent}%` }}
          title={`En attente: ${stats.pendingHospitals} (${pendingPercent.toFixed(1)}%)`}
        ></div>
        <div 
          className="bg-red-500" 
          style={{ width: `${expiredPercent}%` }}
          title={`Expirés: ${stats.expiredHospitals} (${expiredPercent.toFixed(1)}%)`}
        ></div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h1>
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Total des hôpitaux</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.totalHospitals}</h3>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <Link to="/hospitals" className="text-sm text-indigo-600 hover:underline">Voir tous les hôpitaux</Link>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Hôpitaux actifs</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.activeHospitals}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{stats.totalHospitals > 0 ? ((stats.activeHospitals / stats.totalHospitals) * 100).toFixed(1) : 0}% du total</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <h3 className="text-3xl font-bold text-yellow-500">{stats.pendingHospitals}</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Nécessite approbation</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Total des lits</p>
              <h3 className="text-3xl font-bold text-blue-600">{stats.totalBeds.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Capacité totale</span>
          </div>
        </div>
      </div>
      
      {/* Distribution des statuts */}
      <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribution des hôpitaux par statut</h2>
        <StatusDistribution />
        <div className="flex justify-between mt-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Actifs ({stats.activeHospitals})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>En attente ({stats.pendingHospitals})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Expirés ({stats.expiredHospitals})</span>
          </div>
        </div>
      </div>
      
      {/* Hôpitaux récemment ajoutés */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Hôpitaux récemment ajoutés</h2>
          <Link to="/hospital-list" className="text-sm text-indigo-600 hover:underline">Voir tout</Link>
        </div>
        
        {recentHospitals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lits</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentHospitals.map((hospital, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">
                          {hospital.NAME.charAt(0)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{hospital.NAME}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{hospital.EMAIL}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{hospital.TOTAL_BEDS}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        hospital.SUBSCRIPTION_STATUS === "Active" 
                          ? "bg-green-100 text-green-800" 
                          : hospital.SUBSCRIPTION_STATUS === "Pending" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {hospital.SUBSCRIPTION_STATUS}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Aucun hôpital n'a été ajouté récemment.
          </div>
        )}
      </div>
      
      {/* Actions rapides */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/add-hospital" className="flex items-center p-6 bg-indigo-50 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors">
          <div className="p-3 bg-indigo-100 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-indigo-900">Ajouter un hôpital</h3>
            <p className="text-sm text-indigo-700">Créer un nouvel établissement</p>
          </div>
        </Link>
        
        <Link to="/hospitals" className="flex items-center p-6 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors">
          <div className="p-3 bg-green-100 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-green-900">Gérer les hôpitaux</h3>
            <p className="text-sm text-green-700">Voir et modifier tous les établissements</p>
          </div>
        </Link>
        
        <Link to="/partnership" className="flex items-center p-6 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors">
          <div className="p-3 bg-purple-100 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-purple-900">Partenariats</h3>
            <p className="text-sm text-purple-700">Gérer les partenariats stratégiques</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;