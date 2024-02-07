import {useContext, useEffect, useState} from "react";
import Link from "next/link";

import { BookmarkContext } from '@/app/contexts/BookmarkContext';
import { CreationPopupContext } from "@/app/contexts/CreationPopupContext";

import Comment from "@/app/components/Comment";
import CommentCreator from "@/app/components/CommentCreator";
import { getEntity, sortAndFilterChildren, getComments } from "@/app/components/utils";


export async function toggleBookmark(id) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + id + "/toggle_bookmark", {
        method: 'POST',
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return response;
}

export async function deleteEntity(id) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + id, {
        method: 'DELETE',
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return response;
}


export default function SmallEntityViewer({ent, activatedCommentOrChildID, setActivatedCommentOrChildID}) {

    const [entity, setEntity] = useState(ent);
    const [entityChildren, setEntityChildren] = useState([{}]);
    const [bookmarked, setBookmarked] = useState(entity.bookmarked);
    const [orderedChildrenAndComments, setOrderedChildrenAndComments] = useState(null); // Combined array with the comments and children that is sorted for displaying

    const { onlyShowBookmarked } = useContext(BookmarkContext);
    const { updatingID, setUpdatingID } = useContext(CreationPopupContext);

    // selects the icon it will display next to the name of the small entity
    const EntType = entity.type;
    let icon = "bi bi-question-octagon";
    if (EntType === "Project") {
        icon = "bi bi-book"
    } else if (EntType === "Task") {
        icon = "bi bi-clipboard"
    } else if (EntType === "Step") {
        icon = "bi bi-circle"
    }

    const reloadComments = () => {
        getComments(entity.ID).then(data => {
            setEntity({...entity, comments: data})
        });
        setActivatedCommentOrChildID(null);
    }

    // Checks if this is the entity that needs an update for new children.
    useEffect(() => {
        if (entity && updatingID === entity.ID) {
            getEntity(entity.ID).then(data => {
                setEntity(data);
            });
            setUpdatingID("");
        }
    }, [entity, updatingID, setUpdatingID])

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

    if (!entity) {
        return <div>Loading...</div>;
    }
    return (
        <div className={`small-entity ${entity.type}`}>
            <div className={`type-indicator ${entity.type}`}></div>
            <div className='small-entity-tittle'>
                <h3>
                    <i className={icon} title={`${entity.type}`}/>
                    <Link className={"Link-text"} href={`${entity.ID}`}>{entity.name}</Link>
                    <button className="bookmark-button" title={`Toggle book mark for "${entity.name}"`} onClick={() => {toggleBookmark(entity.ID).then(data => {
                        entity.bookmarked = !bookmarked;
                        setBookmarked(!bookmarked);

                    })}}>
                        {bookmarked ? <i className="bookmark filled bi bi-bookmark-fill"/> : <i className="bookmark empty bi bi-bookmark"/>}
                    </button>
                </h3>
                <div className="extra-actions">
                    <button className="delete-button" title={`Delete "${entity.name}"`} onClick={() => {
                            if (window.confirm("Are you sure you want to delete this entity?")) {
                                deleteEntity(entity.ID).then(data => {
                                    setUpdatingID(entity.parent);
                                });
                            }
                        }}>
                        <i className="bi bi-x-circle" />
                    </button>
                    <button className="add-comment-button" title={`Add a comment to "${entity.name}" \n (look at the opened textbox below)`} onClick={() => {setActivatedCommentOrChildID(entity.ID)}}>
                        <i className="bi bi-plus-circle" />
                    </button>
                </div>
            </div>
            {
                orderedChildrenAndComments && orderedChildrenAndComments.length > 0 &&
                orderedChildrenAndComments.map(item => (
                    item.obj.com_type ?
                        <Comment key={`comment-${item.obj.ID}`} entID={entity.ID} com={item.obj} activatedCommentOrChildID={activatedCommentOrChildID} setActivatedCommentOrChildID={setActivatedCommentOrChildID}/> :
                        <SmallEntityViewer key={`entity-${item.obj.ID}`} ent={item.obj} activatedCommentOrChildID={activatedCommentOrChildID} setActivatedCommentOrChildID={setActivatedCommentOrChildID}/>
                ))
            }
            {
                activatedCommentOrChildID === entity.ID &&
                <div>
                    <CommentCreator className="comment-creator" entID={entity.ID} reloader={reloadComments}/>
                </div>
            }
        </div>
    )

}
