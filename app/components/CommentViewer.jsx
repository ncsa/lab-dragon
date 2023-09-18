"use client"
import {Image} from 'next/image'

import {BASE_API} from "@/app/lib/api_calls";

function Comment({comment, entID}) {
    console.log(" HERE COMES ENT ID")
    console.log(entID)

    const content = comment.content
    const type = comment.com_type
    const comID = comment.ID
    console.log("I AM IN THE COMMENT COMPONENT ")
    console.log(comment)



    return (
        <div>
            { (type[0] == 4 || type[0] == 5) ? <img src={BASE_API+"entities/"+entID+"/"+comID} alt="Image is loading" /> : <p>{content[0]}</p> }
        </div>
    )
}


export default function CommentViewer({comments, entID}) {

    console.log("INSIDE OF THE COMMENT VIEWER HERE COMES COMMENTS")
    console.log(comments)
    console.log("INSIDE OF THE COMMENT VIEWER HERE COMES ENT ID")
    console.log(entID)

    let coms = comments.map((comment) => {
        return (JSON.parse(comment))
    })

    console.log("HERE COMES THE COMMENTS")
    console.log(entID)

    return (
        <div>
            { Object.keys(coms).map((key) => {
                return (<Comment comment={coms[key]} entID={entID} />)
            })}
        </div>
    )
}


