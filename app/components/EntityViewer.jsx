"use client"
import {useContext, useEffect, useState} from 'react';
import Link from 'next/link';

import { BookmarkContext } from '@/app/contexts/BookmarkContext';
import { CreationPopupContext } from "@/app/contexts/CreationPopupContext";

import Comment from './Comment';
import SmallEntityViewer from './SmallEntityViewer';
import InstanceViewer from './InstanceViewer';
import { sortAndFilterChildren, getEntity, getComments } from './utils';
import CommentCreator from "@/app/components/CommentCreator";


export async function getEntityName(id) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + id + "?name_only=true", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

export default function EntityViewer({ entityID }) {
    const [entity, setEntity] = useState({"name": "Loading...", "type": "Loading...", "user": "Loading..." });
    const [parentName, setParentName] = useState(null);
    const [entityChildren, setEntityChildren] = useState([{}]);
    const [orderedChildrenAndComments, setOrderedChildrenAndComments] = useState(null); // Combined array with the comments and children that is sorted for displaying
    // Used to track what comment or entity should be editable/comment creator on
    const [activatedCommentOrChildID, setActivatedCommentOrChildID] = useState(null);

    const { onlyShowBookmarked } = useContext(BookmarkContext);
    const { updatingID, setUpdatingID } = useContext(CreationPopupContext);

    const ID = entityID;

    const reloadComments = () => {
        getComments(ID).then(data => {
            setEntity({...entity, comments: data})
        });
    }

    // Loads the currently shown entity
    useEffect(() => {
        getEntity(ID).then(data => {
            setEntity(data);
        });
    }, [entityID]);

    // The parent of the entity is stored as the ID, so we need to get the name of it.
    useEffect(() => {
        if (entity.parent) {
            getEntityName(entity.parent).then(data => {
                setParentName(data);
            });
        }

    }, [entity.parent]);

    // Loads the children of the entity.
    // This is done in the parent of the entity because the times are needed to order them with the comments.
    useEffect(() => {
        if (entity.children) {
            Promise.all(entity.children.map(childId => getEntity(childId)))
                .then(childEntities => {
                    setEntityChildren(childEntities);
                });
        }
    }, [entity.children]);

    // Sorts and filters the comments and children entities by time and bookmark status.
    useEffect(() => {
        if (entity && entityChildren && entity.comments) {
            const sortedAndFiltered = sortAndFilterChildren(entity, entityChildren, onlyShowBookmarked);
            setOrderedChildrenAndComments(sortedAndFiltered);
        }
    }, [entity, entityChildren, onlyShowBookmarked]);

    // Checks if this is the entity that needs an update for new children.
    useEffect(() => {
        if (entity && updatingID === entity.ID) {
            getEntity(entity.ID).then(data => {
                setEntity(data);
            });
            setUpdatingID("");
        }
    }, [entity, updatingID, setUpdatingID])

    if (entity.type && entity.type === "Instance") {
        return <InstanceViewer entity={entity} />
    }

    return (
        <div>
            <h1 className="tittle">{entity.name}</h1>

            <h2 className="entity-header">
                { entity.parent && <p><b>Parent</b>: <Link className="entity-link" href={ entity.parent }> {parentName} </Link></p>}
                <p><b>Type</b>: {entity.type}</p>
                <p><b>User</b>: {entity.user}</p>
            </h2>
            <div className="Content">
                {
                    orderedChildrenAndComments && orderedChildrenAndComments.length > 0 &&
                    orderedChildrenAndComments.map(item => (
                        item.obj.com_type ? 
                            <Comment key={`comment-${item.obj.ID}`} entID={entity.ID} com={item.obj} activatedCommentOrChildID={activatedCommentOrChildID} setActivatedCommentOrChildID={setActivatedCommentOrChildID}/> :
                            <SmallEntityViewer key={`entity-${item.obj.ID}`} ent={item.obj} activatedCommentOrChildID={activatedCommentOrChildID} setActivatedCommentOrChildID={setActivatedCommentOrChildID}/>
                    ))
                }
            </div>
            <div className="addition-section">
                <CommentCreator className="comment-creator" entID={ID} reloader={reloadComments} />
            </div>
        </div>
    )
}