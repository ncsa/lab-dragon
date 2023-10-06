import Link from 'next/link';
import { useState, useEffect} from 'react';

import CommentViewer from "@/app/components/CommentViewer";

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

export default function SmallEntityViewer({entity}) {

    const [numChildren, setNumChildren] = useState(null);
    const [rank, setRank] = useState(null);

    useEffect(() => {
        getInfo(entity.ID).then(data => {
            setNumChildren(data.num_children);
            setRank(data.rank);
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
            <div className='small-entity-tittle'>
                <h3>
                    <i className={icon}/>
                    <Link className={"Link-text"} href={BASE_URL + entity.ID}>{entity.name}</Link>
                    <div className="small-entity-options">
                        <span>{numChildren}</span>
                        <span>{rank}</span>
                    </div>
                </h3>
            </div>
            <CommentViewer comments={entity.comments} entID={entity.ID}/>
        </div>
    )

}

