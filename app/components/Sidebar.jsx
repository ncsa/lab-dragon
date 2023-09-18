
import {getSidebarItems} from "@/app/lib/api_calls";
import SidebarItem from "./SidebarItem";



export default async function Sidebar() {
    const entities = await getSidebarItems()

    return (
        <div className="sidebar">
            { entities.map((item, index) => <SidebarItem key={index} item={item} />)}
        </div>

    )
}