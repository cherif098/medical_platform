import { createContext, useState } from "react";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const [aToken,setAToken] = useState(localStorage.getItem('aToken')?localStorage.getItem('aToken'):'');

    const backendurl = import.meta.env.VITE_BACKEND_URL

    return (
        <AdminContext.Provider value={{aToken,setAToken,backendurl}}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;