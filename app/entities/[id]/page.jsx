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

export default function Entities( {params} ) {
    const id = params.id;
    const [entity, setEntity] = useState(null);

    useEffect(() => {
        getEntity(id).then(data => {
            setEntity(JSON.parse(data));
        });
    }, [id]);

    if (!entity) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <EntityViewer entity={entity} />
        </div>
    )
}