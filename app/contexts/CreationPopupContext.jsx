'use client'

import { useState, createContext } from 'react';

export const CreationPopupContext = createContext();

export default function CreationPopupProvider({ children }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);


    // Variables holding the form values
    const [name, setName] = useState(null);
    const [user, setUser] = useState(null);
    const [type, setType] = useState(null);
    const [parent, setParent] = useState(null);

    const value = {
        isPopupOpen,
        setIsPopupOpen,
        name,
        setName,
        user,
        setUser,
        type,
        setType,
        parent,
        setParent,
    };

    return (
        <CreationPopupContext.Provider value={value}>
            {children}
        </CreationPopupContext.Provider>
    );
};


