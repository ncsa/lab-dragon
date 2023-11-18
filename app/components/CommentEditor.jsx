"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Tiptap from './editor/Tiptap';

const BASE_API = "http://localhost:8000/api/"

export default function CommentEditor({entID, comment, refresh}) {

    const router = useRouter();
    const [content, setContent] = useState(comment.content);
    const [isLoading, setIsLoading] = useState(false);

    const handleContentChange = (content) => {
        setContent(content);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const editedComment = {
            content,
        }

        let response = await fetch(BASE_API + "entities/" + entID + "/" + comment.ID + "?HTML=True", {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editedComment),
        });

        if (response.status === 201) {
            refresh();
        } else {
            alert ("Something went wrong, please try again.")
            setIsLoading(false)
        }

    }

    return (
        <div className="CommentEditor">
            <form onSubmit={handleSubmit}>
                <Tiptap onContentChange={handleContentChange}
                 entID={entID}
                 initialContent={content[0]}
                 />
                {isLoading && <p>Loading...</p>}
                {!isLoading && <button type="submit" className="submitButton">Submit</button>}
            </form>
        </div>
    )
}
    



