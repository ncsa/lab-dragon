"use client"

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Tiptap from './editor/Tiptap';
import { CreationPopupContext } from '@/app/contexts/CreationPopupContext';


export default function CommentEditor({entID, comment, refresh}) {

    const router = useRouter();
    const [content, setContent] = useState(comment.content);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(CreationPopupContext);

    const handleContentChange = (content) => {
        setContent(content);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // FIXME: This is a dirty a way of fixing the issue of the content being a string or an array. I should probably make content always a string directly.
        const editedComment = typeof content === 'string' ? content : content[0];

        let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + entID + "/" + comment.ID + "?HTML=True&username=" + user, {
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
                 initialContent={comment.content[comment.content.length - 1]}
                 />
                {isLoading && <p>Loading...</p>}
                {!isLoading && <button type="submit" className="submitButton">Submit</button>}
            </form>
        </div>
    )
}
    



