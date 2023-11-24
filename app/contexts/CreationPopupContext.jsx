'use client'

import { useState, createContext } from 'react';

export const CreationPopupContext = createContext();

export default function CreationPopupProvider({ children }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);


    const value = {
        isPopupOpen,
        setIsPopupOpen,
    };

    return (
        <CreationPopupContext.Provider value={value}>
            {children}
        </CreationPopupContext.Provider>
    );
};


