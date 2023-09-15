
import EntityViewer from "@/app/components/EntityViewer";


async function getEntity(id) {
    console.log("about to search for: " + id)
    const response = await fetch("http://localhost:8000/api/entities/" + id, {
        next: {
            revalidate: 60 // How often nextjs is re caching the data
        }
    })

    return response.json()
}


export default async function Entities( {params} ) {
    const id = params.id
    const entity = await getEntity(id)
    console.log(entity)

    return (
        <div>
            <h1>Entities Pages, I am showing the entity: { id } </h1>
            <EntityViewer entity={entity} />
        </div>
    )
}