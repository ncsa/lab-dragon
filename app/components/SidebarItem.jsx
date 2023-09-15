'use client'
import { useState } from 'react';


export default function SidebarItem({item}) {
    const name = item.name;
    const type = item.type;

    const [open, setOpen] = useState(false);
        if (item.children.length > 0){
        return (
            <div className={open ? "sidebar-item open": "sidebar-item"}>
                <div className="sidebar-item-title">
                    <span>
                        <i className={type}></i>
                        {name}
                    </span>
                    <i
                        className="bi-chevron-down toggle-btn"
                        onClick={() => setOpen(!open)}></i>
                </div>
                <div className="sidebar-item-content">
                    { item.children.map((child, index) => <SidebarItem key={index} item={child} />)}
                </div>
            </div>
        )
    }else{

        return (
            <div className="sidebar-item">
                <div className="sidebar-item-title">
                    <span>
                        <i className={type}></i>
                        {name}
                    </span>
                </div>
            </div>
        )
    }
}