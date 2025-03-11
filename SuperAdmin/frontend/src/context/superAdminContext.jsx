import { createContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";



export const superAdminContext = createContext();

const SuperAdminContextProvider = (props) => {
    // Récupération du token depuis localStorage à l'initialisation
    const [saToken, setSAToken] = useState('');
    const [hospitals, setHospitals] = useState([]);
    const navigate = useNavigate();

    
    // Définition de l'URL backend
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Charger le token depuis localStorage au chargement du composant
    useEffect(() => {
        const token = localStorage.getItem('saToken');
        if (token) {
            setSAToken(token);
            console.log("Token chargé depuis localStorage:", token);
        }
    }, []);

    // Fonction pour gérer la connexion et le stockage du token
    const loginSuperAdmin = (token) => {
        console.log("Définition du token dans le contexte:", token);
        setSAToken(token);
        localStorage.setItem('saToken', token);
    };

    // Fonction pour gérer la déconnexion
    const logoutSuperAdmin = () => {
        setSAToken('');
        localStorage.removeItem('saToken');
    };

    // Valeurs fournies par le contexte
    const value = {
        saToken,
        setSAToken,
        backendUrl,
        hospitals,
        setHospitals,
        loginSuperAdmin,
        logoutSuperAdmin
    };

    return (
        <superAdminContext.Provider value={value}>
            {props.children}
        </superAdminContext.Provider>
    );
};

export default SuperAdminContextProvider;