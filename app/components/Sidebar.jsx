"use client"
import SidebarItem from "./SidebarItem";


export default function Sidebar( {entities} ) {
    return (
        <div className="sidebar">
            <div className="sidebar-content">
                {entities.map((item, index) => <SidebarItem key={index} item={item} />)}
            </div>
        </div>
    );
}
