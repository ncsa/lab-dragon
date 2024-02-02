"use client"
import { useState, useEffect, useContext } from 'react';
import EntityViewer from "@/app/components/EntityViewer";
import CommentCreator from "@/app/components/CommentCreator";
import InstanceViewer from "@/app/components/InstanceViewer";
import {CreationPopupContext} from "@/app/contexts/CreationPopupContext";

export async function getEntity(id, only_name = false) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + id, {
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
    const [shouldReloadChildren, setShouldReloadChildren] = useState(false);
    const { setParent, parentsOptions } = useContext(CreationPopupContext);

    async function reloadEntityComments() {
        const data = await getEntity(id);
        const updatedEntity = parseEntity(data);
        setEntity(updatedEntity);
        setShouldReloadChildren(true); 
        return updatedEntity;
    }

    function reloadEntityChildren() {
        if (entity !== null && shouldReloadChildren) { // only reload if shouldReloadChildren is true
            Promise.all(entity.children.map(childId => getEntity(childId)))
                .then(childEntities => {
                    const parsedChildren = childEntities.map(childEnt => parseEntity(childEnt));
                    if (JSON.stringify(children) !== JSON.stringify(parsedChildren)) {
                        setChildren(parsedChildren);
                        setShouldReloadChildren(false); // set to false after updating children
                    }
                });
        }
    }

    useEffect(() => {
        reloadEntityComments();
    }, [id]);

    useEffect(() => {
        reloadEntityChildren()
    }, [entity, shouldReloadChildren]); // using children as the dependency causes infinite loop

    // sets the current default option for newly created entities to this page
    useEffect(() => {
        if (parentsOptions && parentsOptions.hasOwnProperty(id)) {
            setParent(id);
        }
    }, [parentsOptions])

    if (!entity) {
        return <div><h1>Loading...</h1></div>;
    }

    if (entity.type === "Instance") {
        return (
            <InstanceViewer entity={entity}/>
        )
    }

    return (
        <div>
            <div>
                <EntityViewer entity={entity} displayChildren={children}/>
            </div>
            <div className="addition-section">
                <CommentCreator className="comment-creator" entID={entity.ID} reloader={reloadEntityComments}/>
            </div>
        </div>
    )
}