"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommentViewer from "./CommentViewer";
import Comment from './Comment';
import SmallEntityViewer from './SmallEntityViewer';

export const BASE_API = "http://localhost:8000/api/";
export const BASE_URL = 'http://localhost:3000/entities/';

export async function getEntityName(id) {
    let response = await fetch(BASE_API+"entities/" + id + "?name_only=true", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

export default function EntityViewer({ entity, children}) {
    const [parentName, setParentName] = useState(null);
    const [childrenNames, setChildrenNames] = useState(null);
    let combinedArray = null;

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

    if (entity !== null && children !== null) {
        combinedArray = [...entity.comments, ...children];
        combinedArray.sort((a, b) => {
            const timeA = a.created ? new Date(a.created) : new Date(a.start_time);
            const timeB = b.created ? new Date(b.created) : new Date(b.start_time);
            return timeA - timeB;
        });
    }

    return (
        <div>
            <h1 className="entity-tittle">{entity.name}</h1>

            <h2 className="entity-header">
                { entity.parent && <p><b>Parent</b>: <Link className="entity-link" href={ BASE_URL + entity.parent }> {parentName} </Link></p>}
                <p><b>Type</b>: {entity.type}</p>
                <p><b>User</b>: {entity.user}</p>
            </h2>

            <div className="Content">
                {
                    combinedArray === null ? <CommentViewer comments={entity.comments} entID={entity.ID}/> : combinedArray.map(item => {
                        return item.com_type ? <Comment comment={item} entID={entity.ID}/> : <SmallEntityViewer entity={item} />
                    })

                }
            </div>


            <h2 className="entity-footer">
                <p><b><u>CONTINUE</u></b></p>
                { entity.children && entity.children.map((child, index) => <p key={child.ID}><Link className="entity-link" href={ BASE_URL + child }> {childrenNames ? childrenNames[index] : ''} </Link></p>)}
            </h2>
        </div>
    )
}