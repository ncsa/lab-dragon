import React, {useEffect, useState} from "react"
import CommentEditor from "./CommentEditor"
import process from "next/dist/build/webpack/loaders/resolve-url-loader/lib/postcss";


export async function getComment(entId, commentId) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + entId + "/" + commentId + "?whole_comment=True&HTML=True", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

export default function Comment({com,
                                 entID,
                                 activatedCommentOrChildID,
                                 setActivatedCommentOrChildID,
                                }) {

    const [comment, setComment] = useState(com);

    const refreshComment = () => {
        getComment(entID, comment.ID).then(newComment => {
            const parsed_item = JSON.parse(JSON.parse(newComment)); // FIXME: This means I am over stringifying my object from the server. This should be fixed.
            setComment(parsed_item);
        });
        setActivatedCommentOrChildID(null);
    }

    useEffect(() => {
        setComment(com);
    }, [com]);

    if (comment && activatedCommentOrChildID === comment.ID) {
        return <CommentEditor entID={entID} comment={comment} refresh={refreshComment}/>
    }

    if (!comment) {
        return <div>Loading...</div>
    }
    return <div className={`comment`}
                onDoubleClick={() => setActivatedCommentOrChildID(comment.ID)} >
            <span dangerouslySetInnerHTML={{ __html: comment.content[comment.content.length - 1] }}/>
        </div>

}