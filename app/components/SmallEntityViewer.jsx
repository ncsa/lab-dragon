import Link from 'next/link';
import { useState, useEffect} from 'react';
import Comment from './Comment';
import CommentCreator from './CommentCreator';


export async function getInfo(id) {
    /// gets the number of children and rank
    let response = await fetch("/api/entities/" + id + "/info", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

export async function getTree(id) {
    let response = await fetch("/api/entities/" + id + "/tree", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

export async function getComments(id) {
    let response = await fetch("/api/entities/" + id, {
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
    let response = await fetch("/api/entities/" + id + "/toggle_bookmark", {
        method: 'POST',
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return response;
}


export default function SmallEntityViewer({entity,
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
            { Object.keys(comments).map((key) => {
                return (<Comment key={comments[key].ID} 
                    comment={comments[key]} 
                    entID={entity.ID}
                    onClickHandler={onClickHandler}
                    isSelected={selectedComment == comments[key].ID}
                    onDoubleClickHandler={onDoubleClickHandler}
                    isActivated={activatedComment == comments[key].ID}
                    deactivateAllComments={deactivateAllComments}
                    isHovered={isHovered == comments[key].ID}
                    onHoverHandler={onHoverHandler}
                    OnHoverLeaveHandler={OnHoverLeaveHandler}
                    entType={entity.type} />)
            })}

            {activatedComment == entity.ID && 
            <div>
                <CommentCreator className="comment-creator" entID={entity.ID} reloader={reloadComments}/>
            </div>
            }

        </div>
    )

}

