import SidebarItem from "./SidebarItem";


export default function Sidebar() {
    console.log("Here comes the sidebar")
    return (
        <aside>
            <SidebarItem text="First" icon= "bi-gear-fill"/>
            <SidebarItem text="Second" icon="bi-folder"/>
            <SidebarItem text="Third" icon="bi-journal"/>
        </aside>
    )
}