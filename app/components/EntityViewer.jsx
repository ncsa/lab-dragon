"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommentViewer from "@/app/components/CommentViewer";

export const BASE_API = "http://localhost:8000/api/";
export const BASE_URL = 'http://localhost:3000/entities/';

export async function getEntityName(id) {
    let response = await fetch(BASE_API+"entities/" + id + "?name_only=true", {
        cache: 'no-store'
    })
    if (!response.ok) {
        console.log("ERROR")
        throw new Error(response.statusText)
    }

    const data = await response.json()
    return data
}

export default function EntityViewer({ entity }) {
    console.log("I am getting entity right now right here")
    console.log(entity)
    const [parentName, setParentName] = useState(null);
    const [childrenNames, setChildrenNames] = useState(null);

    useEffect(() => {
        if (entity.parent) {
            getEntityName(entity.parent).then(data => {
                setParentName(data);
            });
        }

        if (entity.children) {
            Promise.all(entity.children.map(child => getEntityName(child))).then(data => {
                setChildrenNames(data);
            });
        }
    }, [entity.parent, entity.children]);

    return (
        <div>
            <h1 className="entity-tittle">{entity.name}</h1>

            <h2 className="entity-header">
                { entity.parent && <p><b>Parent</b>: <Link className="entity-link" href={ BASE_URL + entity.parent }> {parentName} </Link></p>}
                <p><b>Type</b>: {entity.type}</p>
                <p><b>User</b>: {entity.user}</p>
            </h2>

            <CommentViewer comments={entity.comments} entID={entity.ID}/>

            <h2 className="entity-footer">
                <p><b><u>CONTINUE</u></b></p>
                { entity.children && entity.children.map((child, index) => <p key={index}><Link className="entity-link" href={ BASE_URL + child }> {childrenNames ? childrenNames[index] : ''} </Link></p>)}
            </h2>
        </div>
    )
}