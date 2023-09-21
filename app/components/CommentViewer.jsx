"use client"
import {Image} from 'next/image'
import Comment from './Comment'

export default function CommentViewer({comments, entID}) {

    return (
        <div>
            { Object.keys(comments).map((key) => {
                return (<Comment comment={comments[key]} entID={entID} />)
            })}
        </div>
    )
}


