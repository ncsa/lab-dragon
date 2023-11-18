import Link from 'next/link';
import { useState, useEffect} from 'react';
import Comment from './Comment';


export const BASE_URL = 'http://localhost:3000/entities/';

export const BASE_API = "http://localhost:8000/api/";


export async function getInfo(id) {
    /// gets the number of children and rank
    let response = await fetch(BASE_API+"entities/" + id + "/info", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

export async function getTree(id) {
    let response = await fetch(BASE_API+"entities/" + id + "/tree", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}


export default function SmallEntityViewer({entity,
                                           onClickHandler,
                                           selectedComment,
                                           onDoubleClickHandler,
                                           activatedComment,
                                           deactivateAllComments,}) {

    const [numChildren, setNumChildren] = useState(null);
    const [rank, setRank] = useState(null);
    const [tree, setTree] = useState(null);
    const [showTree, setShowTree] = useState(false);
    const [hintPosition, setHintPosition] = useState({ x: 0, y: 0 });

    const handleMouseEnter = (event) => {
        setShowTree(true);
        setHintPosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseLeave = () => {
        setShowTree(false);
    };


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
                    <Link className={"Link-text"} href={BASE_URL + entity.ID}>{entity.name}</Link>
                    <div 
                        className="small-entity-options"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        >
                        <span>{numChildren}</span>
                        <span>{rank}</span>
                    </div>
                </h3>
            </div>
            { Object.keys(entity.comments).map((key) => {
                return (<Comment key={entity.comments[key].ID} 
                    comment={entity.comments[key]} 
                    entID={entity.ID}
                    onClickHandler={onClickHandler}
                    isSelected={selectedComment == entity.comments[key].ID}
                    onDoubleClickHandler={onDoubleClickHandler}
                    isActivated={activatedComment == entity.comments[key].ID}
                    deactivateAllComments={deactivateAllComments} />)
            })}
        </div>
    )

}

