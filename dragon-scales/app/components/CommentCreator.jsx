"use client"

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Tiptap from './editor/Tiptap';
import { CreationPopupContext } from '../contexts/CreationPopupContext';

export default function CommentCreator({entID, reloader, standbyContent,}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [reloadEditor, setReloadEditor] = useState(false);
    const { user } = useContext(CreationPopupContext)

    const handleContentChange = (content) => {
        standbyContent.current = content;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

            let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + entID + "?HTML=True" + "&username=" + user, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(standbyContent.current),
        });

        if (response.status === 201) {
            reloader();
            standbyContent.current = "";
            setIsLoading(false);
            setReloadEditor(prev => prev+1);
            
        } else {
            alert ("Something went wrong, please try again.")
            setIsLoading(false)
        }
    }

    if (!standbyContent) {
        return null;
    }

    return (
        <div className="comment-creator">
            <h2>Add a comment</h2>
            <form onSubmit={handleSubmit}>
                <Tiptap onContentChange={handleContentChange}
                 entID={entID}
                 initialContent={standbyContent.current}
                 reloadEditor={reloadEditor}
                 />
                {isLoading && <p>Loading...</p>}
                {!isLoading && <button type="submit">Submit</button>}
            </form>
        </div>
    )
}

