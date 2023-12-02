"use client"
import { useEffect, useState, useContext } from 'react';
import SidebarItem from "./SidebarItem";
import EntityInput from './EntityInput';
import { CreationPopupContext } from '@/app/contexts/CreationPopupContext';

// TODO: Get the router in this page and add the parent when the button gets pressed.
export default function Sidebar( {entities} ) {
    const { isPopupOpen, setIsPopupOpen } = useContext(CreationPopupContext);

    return (
        <div className="sidebar">
            {entities.map((item, index) => <SidebarItem key={index} item={item} />)}
            <button className="add-entity-btn" onClick={() => setIsPopupOpen(!isPopupOpen)}>Add Entity</button>
        </div>
    );
}
