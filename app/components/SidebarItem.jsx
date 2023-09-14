"use client"

import { useState } from 'react';


export default function SidebarItem(props) {
    const text = props.text;
    const icon = props.icon;

    const [open, setOpen] = useState(false);


    return (
        <div className={open ? "sidebar-item open": "sidebar-item"}>
            <div className="sidebar-item-title">
                <span>
                    <i className={icon}></i>
                    {text}
                </span>
                <i
                    className="bi-chevron-down toggle-btn"
                    onClick={() => setOpen(!open)}></i>
            </div>
            <div className="sidebar-item-content">
                Hello I am content
            </div>
        </div>
    )
}