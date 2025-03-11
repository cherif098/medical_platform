import React, { useState, useContext } from "react";
import { superAdminContext } from "../context/superAdminContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const LoginSuperAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { backendUrl, loginSuperAdmin } = useContext(superAdminContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Tentative de connexion avec:", { email, password });
      console.log("Utilisation de l'URL backend:", backendUrl);
      
      const response = await axios.post(`${backendUrl}/api/superAdmin/login`, {
        EMAIL: email,
        PASSWORD: password
      });
      
      console.log("Réponse de connexion:", response.data);
      
      if (response.data.success) {
        const token = response.data.saToken;
        console.log("Connexion réussie, token reçu:", token);
        
        // Stockage du token dans le contexte et localStorage
        loginSuperAdmin(token);
        
        toast.success("Connexion réussie !");
        navigate("/dashboard"); // Navigation vers le tableau de bord
      } else {
        toast.error(response.data.message || "Échec de la connexion");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast.error(error.response?.data?.message || "Échec de la connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue</h2>
          <p className="text-gray-600">Accès au panneau d'administration principal</p>
        </div>

        {/* En-tête Super Admin */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-8 text-center">
            <div className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium">
              Super Admin
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="Entrez votre email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="Entrez votre mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-blue-400"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          Besoin d'aide ?{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
            Contactez le support
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginSuperAdmin;