"use client"
import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import Comment from './Comment';
import SmallEntityViewer from './SmallEntityViewer';
import { BookmarkContext } from '@/app/contexts/BookmarkContext';

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

export default function EntityViewer({ entity, displayChildren, childrenReloader }) {
    // we get the ID, not the name of the parent entity.
    const [parentName, setParentName] = useState(null);
    const [childrenNames, setChildrenNames] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const [activatedComment, setActivatedComment] = useState(null);
    const [isHovered, setIsHovered] = useState(null);
    const { onlyShowBookmarked } = useContext(BookmarkContext);

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

    const handleCommentClick = (id) => {
        setSelectedComment(id);
    }

    const handleCommentDoubleClick = (id) => {
        setActivatedComment(id);
    }

    const handleOnHover = (id) => {
        setIsHovered(id);
    }

    const deactivateAllComments = () => {
        setActivatedComment(null);
    }

    const unselectAllComments = () => {
        setSelectedComment(null);
    }

    const handleOnHoverLeave = (id) => {
        setIsHovered(null);
    }

    if (entity !== null && displayChildren !== null) {
        combinedArray = [...entity.comments, ...displayChildren];
        combinedArray.sort((a, b) => {
            const timeA = a.created ? new Date(a.created) : new Date(a.start_time);
            const timeB = b.created ? new Date(b.created) : new Date(b.start_time);
            return timeA - timeB;
        });
        
        if (onlyShowBookmarked) {
            combinedArray = combinedArray.filter(item => item.com_type || item.bookmarked);
        }
    }

    return (
        <div>
            <h1 className="tittle">{entity.name}</h1>

            <h2 className="entity-header">
                { entity.parent && <p><b>Parent</b>: <Link className="entity-link" href={ BASE_URL + entity.parent }> {parentName} </Link></p>}
                <p><b>Type</b>: {entity.type}</p>
                <p><b>User</b>: {entity.user}</p>
            </h2>

            <div className="Content">
                {
                    combinedArray === null ?  Object.keys(entity.comments).map((key) => {
                        return (<Comment key={entity.comments[key].ID} 
                            comment={entity.comments[key]}
                            entID={entity.ID}
                            isSelected={selectedComment == entity.comments[key].ID}
                            onClickHandler={handleCommentClick}
                            isActivated={activatedComment == entity.comments[key].ID}
                            onDoubleClickHandler={handleCommentDoubleClick}
                            isHovered={isHovered == entity.comments[key].ID}
                            onHoverHandler={handleOnHover}
                            OnHoverLeaveHandler={handleOnHoverLeave}
                            onlyComment={entity.type === "Step" ? true : false}

                        />)

                    }) : combinedArray.map(item => {
                        return item.com_type ? <Comment comment={item} 
                            entID={entity.ID} 
                            isSelected={selectedComment === item.ID}
                            onClickHandler={handleCommentClick}
                            isActivated={activatedComment === item.ID}
                            onDoubleClickHandler={handleCommentDoubleClick}
                            deactivateAllComments={deactivateAllComments}
                            isHovered={isHovered == item.ID}
                            onHoverHandler={handleOnHover}
                            OnHoverLeaveHandler={handleOnHoverLeave}
                            onlyComment={entity.type === "Step" ? true : false} /> : 
                                
                                <SmallEntityViewer entity={item} 
                                    onClickHandler={handleCommentClick}
                                    selectedComment={selectedComment}
                                    onDoubleClickHandler={handleCommentDoubleClick}
                                    activatedComment={activatedComment}
                                    deactivateAllComments={deactivateAllComments} 
                                    reloadEntityComments={childrenReloader}
                                    isHovered={isHovered}
                                    onHoverHandler={handleOnHover}
                                    OnHoverLeaveHandler={handleOnHoverLeave}/>
                    })

                }
            </div>
        </div>
    )
}