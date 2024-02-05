"use client"
import {useContext, useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import Comment from './Comment';
import SmallEntityViewer from './SmallEntityViewer';
import { BookmarkContext } from '@/app/contexts/BookmarkContext';
import { sortAndFilterChildren, fetchChildrenOfChildren} from './utils';

export async function getEntityName(id) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + id + "?name_only=true", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

export default function EntityViewer({ entity, displayChildren }) {
    // we get the ID, not the name of the parent entity.
    const [parentName, setParentName] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const [activatedComment, setActivatedComment] = useState(null);
    const [isHovered, setIsHovered] = useState(null);
    const { onlyShowBookmarked } = useContext(BookmarkContext);
    const [childrenAndComments, setChildrenAndComments] = useState([]);
    const [grandChildren, setGrandChildren] = useState({});


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

    useEffect(() => {
        if (entity.parent) {
            getEntityName(entity.parent).then(data => {
                setParentName(data);
            });
        }

    }, [entity.parent, entity.children]);

    useEffect(() => {
        const sortedAndFiltered = sortAndFilterChildren(entity, displayChildren, onlyShowBookmarked);
        setChildrenAndComments(sortedAndFiltered);
    }, [entity, displayChildren, onlyShowBookmarked]);

    useEffect(() => {
        if (displayChildren) {
             fetchChildrenOfChildren(displayChildren).then(data => {
                setGrandChildren(data);
             });
        }
    }, [displayChildren]);

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
                    childrenAndComments.current === null ?  Object.keys(entity.comments).map((key) => {
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

                    }) : childrenAndComments.map(item => {
                        return item.obj.com_type ? <Comment key={item.obj.ID}
                            comment={item.obj}
                            entID={entity.ID} 
                            isSelected={selectedComment === item.obj.ID}
                            onClickHandler={handleCommentClick}
                            isActivated={activatedComment === item.obj.ID}
                            onDoubleClickHandler={handleCommentDoubleClick}
                            deactivateAllComments={deactivateAllComments}
                            isHovered={isHovered == item.obj.ID}
                            onHoverHandler={handleOnHover}
                            OnHoverLeaveHandler={handleOnHoverLeave}
                            onlyComment={entity.type === "Step" ? true : false} /> : 
                                
                                <SmallEntityViewer key={item.obj.ID}
                                    entity={item.obj}
                                    children_={grandChildren[item.obj.ID] ? grandChildren[item.obj.ID] : []}
                                    onClickHandler={handleCommentClick}
                                    selectedComment={selectedComment}
                                    onDoubleClickHandler={handleCommentDoubleClick}
                                    activatedComment={activatedComment}
                                    deactivateAllComments={deactivateAllComments} 
                                    isHovered={isHovered}
                                    onHoverHandler={handleOnHover}
                                    OnHoverLeaveHandler={handleOnHoverLeave}/>
                    })

                }
            </div>
        </div>
    )
}