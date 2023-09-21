"use client"
import {Image} from 'next/image'

export const BASE_API = "http://localhost:8000/api/"

function Comment({comment, entID}) {
    const content = comment.content
    const type = comment.com_type
    const comID = comment.ID

    return (
        <div className="comment">
            { (type[0] == 4 || type[0] == 5) ? <img src={BASE_API+"entities/"+entID+"/"+comID} alt="Image is loading" /> : <p>{content[0]}</p> }
        </div>
    )
}


export default function CommentViewer({comments, entID}) {

    return (
        <div>
            { Object.keys(comments).map((key) => {
                return (<Comment comment={comments[key]} entID={entID} />)
            })}
        </div>
    )
}


