"use client"

import EntityViewer from "@/app/components/EntityViewer";

export default function Entities( {params} ) {
    const ID = params.id;

    return (
        <EntityViewer entityID={ID}/>
    )
}