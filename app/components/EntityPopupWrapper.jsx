"use client"
// You need the wrapper so that the whole screen darkens when the popup is open.


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
    const childrenMinSize = 300;

    const [entities, setEntities] = useState([]); // The entities that will be displayed in the sidebar
    const [maxLeftPaneSize, setMaxLeftPaneSize] = useState(null); // Adjust the size of the left pane based on the window size. We can only specify the max length of the left side of the pane
    const { isPopupOpen, setIsPopupOpen, setRootEntity, setName, shouldUpdateSidebar, setShouldUpdateSidebar } = useContext(CreationPopupContext);

    const closePopup = () => { setIsPopupOpen(false) }

    const updateMaxLeftPaneSize = () => {
        setMaxLeftPaneSize(window.innerWidth - childrenMinSize);
    };

    function populateSidebarItems() {
        getSidebarItems().then(data => {
            setEntities(data);
            setRootEntity(data[0]);
        });
    }

    useEffect(() => {
        window.addEventListener('resize', updateMaxLeftPaneSize);
        return () => window.removeEventListener('resize', updateMaxLeftPaneSize);
    }, []);

    useEffect(() => {
        populateSidebarItems();
    }, []);

    useEffect(() => {
        if (shouldUpdateSidebar) {
            populateSidebarItems();
            setShouldUpdateSidebar(false);
        }
    }, [shouldUpdateSidebar, setShouldUpdateSidebar, populateSidebarItems])

    return (
        <div>
            {isPopupOpen ? <EntityInput populateSideBar={populateSidebarItems}/> : null}
            <SplitPane split="vertical" defaultSize="10%" minSize={80} maxSize={maxLeftPaneSize}>
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