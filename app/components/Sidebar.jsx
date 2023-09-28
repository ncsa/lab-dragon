"use client"
import { useEffect, useState } from 'react';
import { useState } from 'react';
import SidebarItem from "./SidebarItem";

const BASE_API = "http://localhost:8000/api/";




async function getSidebarItems() {
    const response = await fetch(BASE_API + "entities");
    return await response.json();
}

export default function Sidebar() {
    const [entities, setEntities] = useState([]);

    useEffect(() => {
        getSidebarItems().then(data => {
            setEntities(data);
        });
    }, []);

    return (
        <div className="sidebar">
            {entities.map((item, index) => <SidebarItem key={index} item={item} />)}
            <button className="add-entity-btn">Add Entity</button>
        </div>
    );
}