'use client'

import { useState, useEffect, createContext } from 'react';


function isUUID(str) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(str);
  }

export const CreationPopupContext = createContext();

export default function CreationPopupProvider({ children }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);


    // Variables used to hold the different options that the fields can have
    const [userOptions, setUserOptions] = useState([]);
    const [typesOptions, setTypesOptions] = useState([]);
    const [parentsOptions, setParentsOptions] = useState([]);

    // Variables holding the form values
    const [name, setName] = useState("");
    const [user, setUser] = useState("");
    const [type, setType] = useState("");
    const [parent, setParent] = useState("");

    // Variable holding the ID of the entity that needs to update
    const [updatingID, setUpdatingID] = useState("");

    // Holds the root entity for the logo to find the correct URL
    const [rootEntity, setRootEntity] = useState({"ID": ""});

    async function getUsers() {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties/users`);
        return await response.json();
    }
    
    async function getTypes() {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties/types`);
        return await response.json();
    }
    
    async function getParents() {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties/parents`);
        return await response.json();
    }
    
    useEffect(() => {
        getUsers().then(data => {
            const parsed = JSON.parse(data);
            setUserOptions(parsed);
        });
    }, []);

    useEffect(() => {
        getTypes().then(data => {
            const parsed = JSON.parse(data);
            setTypesOptions(parsed);
        });
    }, []); 

    useEffect(() => {
        getParents().then(data => {
            setParentsOptions(JSON.parse(data));
        });
    }, [updatingID]);


    useEffect(() => {
        if ((user === undefined || user === null || user === "") && userOptions.length > 0) {
            setUser(userOptions[0]);
        }
    }, [userOptions]);

    useEffect(() => {
        if ((type === undefined || type === null || type === "") && typesOptions.length > 0) {
            setType(typesOptions[0]);
        }
    }, [typesOptions]);

    useEffect(() => {
        if ((parent === undefined || parent === null || parent === "") && Object.keys(parentsOptions).length > 0) {
            setParent(Object.keys(parentsOptions)[0]);
        }
    }, [parentsOptions]);

    const value = {
        isPopupOpen,
        setIsPopupOpen,
        name,
        setName,
        user,
        setUser,
        userOptions,
        setUserOptions,
        type,
        setType,
        typesOptions,
        setTypesOptions,
        parent,
        setParent,
        parentsOptions,
        setParentsOptions,
        updatingID,
        setUpdatingID,
        rootEntity,
        setRootEntity
    };

    return (
        <CreationPopupContext.Provider value={value}>
            {children}
        </CreationPopupContext.Provider>
    );
};


