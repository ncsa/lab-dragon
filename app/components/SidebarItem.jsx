'use client'
import { useState } from 'react';
import Link from 'next/link';
import { getEntityTypeIcon } from './utils';


export default function SidebarItem({item, level=0}) {
    const name = item.name;
    const type = item.type;
    const id = item.id;

    const indentationStyle = { paddingLeft: `${level * 10}px` }

    const [open, setOpen] = useState(false);


        if (item.children.length > 0){
        return (
            <div className={open ? "sidebar-item open": "sidebar-item"} style={indentationStyle}>
                <div className="sidebar-item-title">
                    <i
                        className={(open ? "bi bi-chevron-down" : "bi bi-chevron-right") + " toggle-btn"}
                        onClick={() => setOpen(!open)}></i>
                    <i className={getEntityTypeIcon(type) + " sidebar-type-icon"}></i>
                    <span>
                        <Link href={`/entities/${id}`} className="sidebar-item plain">
                            {name}
                        </Link>
                    </span>
                </div>
                <div className="sidebar-item-content">
                    { item.children.map((child, index) => <SidebarItem key={index} item={child} level={level+1} />)}
                </div>
            </div>
        )
    }else{

        return (
            <div className="sidebar-item" style={indentationStyle}>
                <div className="sidebar-item-title">
                    <i className={getEntityTypeIcon(type) + " sidebar-type-icon"}></i>
                    <span>
                        <Link href={`/entities/${id}`} className="sidebar-item plain">
                            {name}
                        </Link>
                    </span>
                </div>
            </div>
        )
    }
}