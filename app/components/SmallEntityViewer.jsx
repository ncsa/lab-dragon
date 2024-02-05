import Link from 'next/link';
import { useState, useEffect, useContext, useRef } from 'react';
import Comment from './Comment';
import CommentCreator from './CommentCreator';
import { BookmarkContext } from '@/app/contexts/BookmarkContext';
import { sortAndFilterChildren, fetchChildrenOfChildren } from './utils';

export async function getInfo(id) {
    /// gets the number of children and rank
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + id + "/info", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

export async function getTree(id) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + id + "/tree", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

export async function getComments(id) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + id, {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    const ent = await response.json()
    const parsedEnt = JSON.parse(ent)
    const parsedComments = parsedEnt.comments.map(comment => JSON.parse(comment))

    return parsedComments
}

export async function toogleBookmark(id) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + id + "/toggle_bookmark", {
        method: 'POST',
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return response;
}


export default function SmallEntityViewer({entity,
                                           children_,
                                           onClickHandler,
                                           selectedComment,
                                           onDoubleClickHandler,
                                           activatedComment,
                                           deactivateAllComments,
                                           isHovered,
                                           onHoverHandler,
                                           OnHoverLeaveHandler
                                        }) {

    const [numChildren, setNumChildren] = useState(null);
    const [rank, setRank] = useState(null);
    const [tree, setTree] = useState(null);
    const [showTree, setShowTree] = useState(false);
    const [hintPosition, setHintPosition] = useState({ x: 0, y: 0 });
    const [comments, setComments] = useState(entity.comments);
    const [isBookmarked, setIsBookmarked] = useState(entity.bookmarked);
    const [loadedChildren, setLoadedChildren] = useState(children_);
    const [childrenAndComments, setChildrenAndComments] = useState([]);
    const [grandChildren, setGrandChildren] = useState({});                                        
    const [isLoading, setIsLoading] = useState(false);


    const { onlyShowBookmarked } = useContext(BookmarkContext);

    const handleMouseEnter = (event) => {
        setShowTree(true);
        setHintPosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseLeave = () => {
        setShowTree(false);
    };

    // also deactivates all comments.
    const reloadComments = () => {
        getComments(entity.ID).then(data => {
            setComments(data);
        });
        deactivateAllComments();
    }

    const handleBookmarkClick = () => {
        toogleBookmark(entity.ID).then(data => {
            entity.bookmarked = !isBookmarked;
            setIsBookmarked(!isBookmarked);
            
        });
    }

    useEffect(() => {
        const sortedAndFiltered = sortAndFilterChildren(entity, loadedChildren, onlyShowBookmarked);
        setChildrenAndComments(sortedAndFiltered);
    }, [entity, loadedChildren, onlyShowBookmarked]);

    useEffect(() => {
        setLoadedChildren(children_);
        // Since we're updating loadedChildren, we need to fetch new grandChildren as well
        setIsLoading(true);
        fetchChildrenOfChildren(children_).then(data => {
            setGrandChildren(data);
            setIsLoading(false);
        }).catch(error => {
            console.error("Failed to fetch children of children:", error);
            setIsLoading(false);
        });
    }, [children_]);// Make sure to include any other dependencies here if necessary


    useEffect(() => {
        getInfo(entity.ID).then(data => {
            setNumChildren(data.num_children);
            setRank(data.rank);
        });
    })

    useEffect(() => {
        getTree(entity.ID).then(data => {
            setTree(data);
        });
    })


    const EntType = entity.type;
    let icon = "bi bi-question-octagon";
    if (EntType === "Project") {
        icon = "bi bi-book"
    } else if (EntType === "Task") {
        icon = "bi bi-clipboard"
    } else if (EntType === "Step") {
        icon = "bi bi-circle"
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className={`small-entity ${entity.type}`}>
            <div className={`type-indicator ${entity.type}`}></div>
            {showTree && <div className="tree" style={{
                position: 'fixed',
                top: hintPosition.y,
                left: hintPosition.x
            }}>
                Number of children: {numChildren}, Rank: {rank} <br/>
                {tree}
            </div>}
            <div className='small-entity-tittle'>
                <h3>
                    <i className={icon}/>
                    <Link className={"Link-text"} href={entity.ID}>{entity.name}</Link>
                    <div 
                        className="small-entity-options"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        >
                        <span>{numChildren}</span>
                        <span>{rank}</span>
                    </div>
                    <button className="bookmark-button" onClick={() => {handleBookmarkClick()}}>
                        {isBookmarked ? <i className="bookmark filled bi bi-bookmark-fill"/> : <i className="bookmark empty bi bi-bookmark"/>}
                    </button>
                </h3>
                <button className="add-comment-button" onClick={() => {onDoubleClickHandler(entity.ID)}}>
                    <i className="bi bi-plus-circle" />
                </button>
            </div>
            {
                childrenAndComments.map(item => {
                    return item.obj.com_type ? <Comment key={item.obj.ID}
                        comment={item.obj}
                        entID={entity.ID} 
                        isSelected={selectedComment === item.obj.ID}
                        onClickHandler={onClickHandler}
                        isActivated={activatedComment === item.obj.ID}
                        onDoubleClickHandler={onDoubleClickHandler}
                        deactivateAllComments={deactivateAllComments}
                        isHovered={isHovered == item.obj.ID}
                        onHoverHandler={onHoverHandler}
                        OnHoverLeaveHandler={OnHoverLeaveHandler}
                        onlyComment={entity.type === "Step" ? true : false} /> : 
                            
                            <SmallEntityViewer key={item.obj.ID}
                                entity={item.obj}
                                children_={grandChildren[item.obj.ID] ? grandChildren[item.obj.ID] : []}
                                onClickHandler={onClickHandler}
                                selectedComment={selectedComment}
                                onDoubleClickHandler={onDoubleClickHandler}
                                activatedComment={activatedComment}
                                deactivateAllComments={deactivateAllComments} 
                                isHovered={isHovered}
                                onHoverHandler={onHoverHandler}
                                OnHoverLeaveHandler={OnHoverLeaveHandler}/>
                })
            }

            {activatedComment == entity.ID && 
            <div>
                <CommentCreator className="comment-creator" entID={entity.ID} reloader={reloadComments}/>
            </div>
            }

        </div>
    )

}

