import { getEntity } from "@/app/lib/api_calls";
import EntityViewer from "@/app/components/EntityViewer";


export default async function Entities( {params} ) {
    const id = params.id
    let entity = await getEntity(id)
    console.log("In the entity page I got" + entity)
    entity = JSON.parse(entity)
    console.log("In the entity page I got" + JSON.stringify(entity))
    console.log("with type " + typeof entity)

    return (
        <div>
            <EntityViewer entity={entity} />
        </div>
    )
}