import SidebarItem from "./SidebarItem";

async function getSidebarItems() {
    const response = await fetch("http://localhost:8000/api/entities" , {
            next: {
                revalidate: 0
            }
        })

    return response.json()
}


export default async function Sidebar() {
    const entities = await getSidebarItems()

    return (
        <div className="sidebar">
            { entities.map((item, index) => <SidebarItem key={index} item={item} />)}
        </div>

    )
}