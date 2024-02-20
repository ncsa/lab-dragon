"use client"

import React, { useState, useContext, useEffect } from 'react';
import SplitPane from 'react-split-pane'; // Assuming you have or will install react-split-pane


// components
import Sidebar from './Sidebar';
import EntityInput from './EntityInput';
import { CreationPopupContext } from '../contexts/CreationPopupContext';

async function getSidebarItems() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities`);
    return await response.json();
}

export default function EntityPopupWrapper({ children }) {
    const [entities, setEntities] = useState([]); // The entities that will be displayed in the sidebar
    const { isPopupOpen, setIsPopupOpen, setRootEntity, setName } = useContext(CreationPopupContext);

    const closePopup = () => { setIsPopupOpen(false) }

    function populateSidebarItems() {
        getSidebarItems().then(data => {
            setEntities(data);
            setRootEntity(data[0]);
        });
    }

    useEffect(() => {
        populateSidebarItems();
    }, []);

    return (
        <div>
            {isPopupOpen ? <EntityInput populateSideBar={populateSidebarItems}/> : null}
            <SplitPane split="vertical" defaultSize="50%">
                <Sidebar entities={entities}/>
                <div className="children-wrapper">
                    {children}
                </div>
            </SplitPane>
            <button className="add-entity-button" title="Adds new entity to the notebook" onClick={() => {
                    setName("");
                    setIsPopupOpen(!isPopupOpen);
                }}><i className="bi bi-journal-plus"/></button>
        </div>
    );
}