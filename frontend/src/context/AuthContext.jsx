import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('chatapp')) || null;
        } catch (error) {
            console.error("Error parsing localStorage data:", error);
            return null;
        }
    });

    return (
        <AuthContext.Provider value={{ authUser, setAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};