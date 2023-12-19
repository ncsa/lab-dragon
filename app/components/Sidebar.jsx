"use client"
import { useEffect, useState, useContext } from 'react';
import SidebarItem from "./SidebarItem";
import EntityInput from './EntityInput';
import { CreationPopupContext } from '@/app/contexts/CreationPopupContext';

// TODO: Get the router in this page and add the parent when the button gets pressed.
export default function Sidebar( {entities} ) {
    const { isPopupOpen, setIsPopupOpen, setName } = useContext(CreationPopupContext);

    return (
        <div className="sidebar">
            <div className="sidebar-content">
                {entities.map((item, index) => <SidebarItem key={index} item={item} />)}
            </div>
        </div>
    );
}
