import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const currencySymbol = '$'
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):false)
    const [patientData, setPatientData] = useState(false)



    const getDoctorsData = async () => {
        try {
            const {data} = await axios.get(backendUrl+ '/api/doctor/list')
            if(data.success){
                setDoctors(data.doctors)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)

        }
    };

    const loadPatientData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/patient/get-profile', { headers: { token } });
            console.log(data);
            
            setPatientData(data.patientData);
            console.log(patientData);
           
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const value = {
        doctors,
        currencySymbol,
        token,setToken,
        backendUrl,
        patientData,setPatientData,
        loadPatientData
    }
    
    useEffect(() => {
        getDoctorsData();
    }, [])

    useEffect(() => {
        if(token){
            loadPatientData();
        }else{
            setPatientData(false)
        }
    }, [token])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;