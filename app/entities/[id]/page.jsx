"use client"
import { useState, useEffect } from 'react';
import EntityViewer from "@/app/components/EntityViewer";
import CommentCreator from "@/app/components/CommentCreator";

export const BASE_API = "http://localhost:8000/api/";

export async function getEntity(id, only_name = false) {

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

    function reloadEntity() {
        getEntity(id).then(data => {
            setEntity(parseEntity(data));
        });
    }

    useEffect(() => {
        reloadEntity();
    }, [id]);

    useEffect(() => {
        // The children === null avoids an infinite loop
        if (entity && entity.children && children === null) {
            Promise.all(entity.children.map(childId => getEntity(childId))).then(childEntities => setChildren(childEntities.map(childEnt => parseEntity(childEnt))));
        }
    }, [entity, children]);

    if (!entity) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <EntityViewer entity={entity} children={children} />
        
            <CommentCreator entID={entity.ID} reloader={reloadEntity}/>
        </div>
    )
}