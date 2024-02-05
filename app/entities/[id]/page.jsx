"use client"
import {useContext, useEffect, useState} from 'react';
import EntityViewer from "@/app/components/EntityViewer";
import CommentCreator from "@/app/components/CommentCreator";
import InstanceViewer from "@/app/components/InstanceViewer";
import {CreationPopupContext} from "@/app/contexts/CreationPopupContext";
import {getEntity} from "@/app/components/utils";

export default function Entities( {params} ) {
    const id = params.id;
    const [entity, setEntity] = useState(null);
    const [children, setChildren] = useState(null);
    const [shouldReloadChildren, setShouldReloadChildren] = useState(false);
    const { setParent, parentsOptions, updatingID, setUpdatingID } = useContext(CreationPopupContext);

    async function reloadEntity() {
        const updatedEntity = await getEntity(id);
        setEntity(updatedEntity);
        setShouldReloadChildren(true); 
        return updatedEntity;
    }

    function reloadEntityChildren() {
        if (entity !== null && shouldReloadChildren) { // only reload if shouldReloadChildren is true
            Promise.all(entity.children.map(childId => getEntity(childId)))
                .then(childEntities => {
                    if (JSON.stringify(children) !== JSON.stringify(childEntities)) {
                        setChildren(childEntities);
                        setShouldReloadChildren(false); // set to false after updating children
                    }
                });
        }
    }

    useEffect(() => {
        reloadEntity();
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

    useEffect(() => {
        if (entity && updatingID === entity.ID) {
            reloadEntity();
            setUpdatingID("");
        }
    }, [entity, updatingID])

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
                <CommentCreator className="comment-creator" entID={entity.ID} reloader={reloadEntity}/>
            </div>
        </div>
    )
}