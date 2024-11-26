import { createContext } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const currency = '$'

    const calculateAge = (DATE_OF_BIRTH) => {
        const today = new Date();
        const birthDate = new Date(DATE_OF_BIRTH);

        let age = today.getFullYear() - birthDate.getFullYear();
        return age;
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const slotDateFormat = (SLOT_DATE) => {
        const dateArray = SLOT_DATE.split("-");
        return dateArray[0] + " " + months[parseInt(dateArray[1]) - 1] + " " + dateArray[2];
    }
    const convertTimeToAmPm = (time) => {
        const [hours, minutes] = time.split(":").map(Number); // Décompose l'heure et les minutes
        const ampm = hours >= 12 ? 'p.m.' : 'a.m.'; 
        const hour12 = hours % 12 || 12; // Si l'heure est 0 (minuit), il faut afficher 12
        return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
      };

    const value = {
        calculateAge,
        slotDateFormat,
        convertTimeToAmPm,
        currency
    };
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;