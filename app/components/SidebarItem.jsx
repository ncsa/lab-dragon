'use client'
import { useState } from 'react';
import Link from 'next/link';

const BASE_URL = 'http://localhost:3000/entities/';


export default function SidebarItem({item}) {
    const name = item.name;
    const type = item.type;
    const id = item.id;

    const [open, setOpen] = useState(false);
        if (item.children.length > 0){
        return (
            <div className={open ? "sidebar-item open": "sidebar-item"}>
                <div className="sidebar-item-title">
                    <span>
                        <Link href={ BASE_URL + id || "#"} className="sidebar-item plain">
                            {name}
                        </Link>
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
                        <Link href={ BASE_URL + id || "#"} className="sidebar-item plain">
                            {name}
                        </Link>
                    </span>
                </div>
            </div>
        )
    }
}