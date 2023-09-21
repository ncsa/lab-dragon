"use client"
import { useState, useEffect } from 'react';
import EntityViewer from "@/app/components/EntityViewer";

export const BASE_API = "http://localhost:8000/api/";

export async function getEntity(id, only_name = false) {
    console.log("about to search for: " + id + " only_name: " + only_name)

    let response = await fetch(BASE_API+"entities/" + id, {
        cache: 'no-store'
    })

    return response.json()
}

function parseEntity(entity) {
    const parsedEnt = JSON.parse(entity)
    const parsedComments = parsedEnt.comments.map(comment => JSON.parse(comment))
    parsedEnt.comments = parsedComments
    return parsedEnt
}

export default function Entities( {params} ) {
    const id = params.id;
    const [entity, setEntity] = useState(null);
    const [children, setChildren] = useState(null);

    useEffect(() => {
        getEntity(id).then(data => {
            setEntity(parseEntity(data));
        });
    }, [id]);

    console.log('HERE COMES THE PARSED ENTITY:')
    console.log(entity)

    useEffect(() => {
        // The children === null avoids an infinite loop
        if (entity && entity.children && children === null) {
            Promise.all(entity.children.map(childId => getEntity(childId))).then(childEntities => setChildren(childEntities.map(childEnt => parseEntity(childEnt))));
        }
    }, [entity, children]);

    if (!entity) {
        return <div>Loading...</div>;
    }

    console.log("HERE COME THE BIG AN IMPORTANT CHILDREN BABY")
    console.log(children)

    return (
        <div>
            <EntityViewer entity={entity} />
        </div>
    )
}