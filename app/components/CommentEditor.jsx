"use client"

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Tiptap from './editor/Tiptap';
import { CreationPopupContext } from '@/app/contexts/CreationPopupContext';


export default function CommentEditor({entID, comment, standbyContent, refresh, editorRef}) {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(CreationPopupContext);

    const handleContentChange = (content) => {
        standbyContent.current = content;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const editedComment = standbyContent.current;
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
        // editorRef is used to detect if the user clicks outside the editor to close it.
        <div className="comment-creator editor" ref={editorRef}>
            <form onSubmit={handleSubmit}>
                <Tiptap onContentChange={handleContentChange}
                 entID={entID}
                 initialContent={standbyContent.current}
                 />
                {isLoading && <p>Loading...</p>}
                {!isLoading && <button type="submit">Submit</button>}
            </form>
        </div>
    )
}
    



