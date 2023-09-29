"use client"
import { useEffect, useState } from 'react';
import SidebarItem from "./SidebarItem";
import EntityInput from './EntityInput';

const BASE_API = "http://localhost:8000/api/";

async function getSidebarItems() {
    const response = await fetch(BASE_API + "entities");
    return await response.json();
}

export default function Sidebar() {
    const [entities, setEntities] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const closePopup = () => {setIsPopupOpen(false)}

    function populateSidebarItems() {
        getSidebarItems().then(data => {
            setEntities(data);
        });
    }

    useEffect(() => {
        populateSidebarItems();
    }, []);

    return (
        <div className="sidebar">
            {entities.map((item, index) => <SidebarItem key={index} item={item} />)}
            <button className="add-entity-btn" onClick={() => setIsPopupOpen(!isPopupOpen)}>Add Entity</button>
            {isPopupOpen && (
                <EntityInput closeFunction={closePopup} populateSideBar={populateSidebarItems}/>
            )}
        </div>
    );
}
