import React, {useEffect, useState, useRef} from "react"
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
                                }) {

    const [comment, setComment] = useState(com);
    const [isEditing, setIsEditing] = useState(false);
    const standbyContent = useRef(com.content[com.content.length - 1]); // This is used to store the comment that was edited but not submitted.
    const editorRef = useRef(null)

    const refreshComment = () => {
        getComment(entID, comment.ID).then(newComment => {
            const parsed_item = JSON.parse(JSON.parse(newComment)); // FIXME: This means I am over stringifying my object from the server. This should be fixed.
            setComment(parsed_item);
        });
        setIsEditing(false);
    }

    useEffect(() => {
        setComment(com);
    }, [com]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (editorRef.current && !editorRef.current.contains(event.target)) {
                setIsEditing(false);
            }
        };
        if (isEditing) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isEditing]);

    if (isEditing) {
        return <CommentEditor entID={entID} comment={comment} standbyContent={standbyContent} refresh={refreshComment} editorRef={editorRef} />
    }

    if (!comment) {
        return <div>Loading...</div>
    }
    return <div className={`comment`}
                onDoubleClick={() => setIsEditing(true)} >
            <span dangerouslySetInnerHTML={{ __html: comment.content[comment.content.length - 1] }}/>
        </div>

}