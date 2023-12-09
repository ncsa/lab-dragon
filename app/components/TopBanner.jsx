"use client"
import React, { useContext } from 'react';
import Image from 'next/image';
import { CreationPopupContext } from '@/app/contexts/CreationPopupContext';

export default function TopBanner() {

    const { user, setUser } = useContext(CreationPopupContext);
    const { userOptions } = useContext(CreationPopupContext);

    return (
    <div className="top-banner">
        <Image src="/images/pfafflab_logo.png" alt="First Image" width="64" height="64"/>
        <h1 className="main-title">Lab Notebook</h1>
        <div className="user-selection">
            <label htmlFor="user-select">Selected User:</label>
            <select
            onChange={(e) => setUser(e.target.value)}
            value={user}
            >
                {
                userOptions && userOptions.map((user, index) => (
                    <option key={index} value={user}>{user}</option>
                ))}
            </select>
        </div>
    </div>
    )
}
