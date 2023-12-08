"use client"

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Tiptap from './editor/Tiptap';
import { CreationPopupContext } from '../contexts/CreationPopupContext';

const BASE_API = "http://localhost:8000/api/"

export default function CommentCreator({entID, reloader, initialContent}) {
    const router = useRouter();
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(CreationPopupContext)

    const handleContentChange = (content) => {
        setContent(content);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const newComment = {
            content, 
        }

        let response = await fetch(BASE_API + "entities/" + entID + "?HTML=True" + "&username=" + user, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newComment),
        });

        if (response.status === 201) {
            reloader();
            setContent("");
            setIsLoading(false);
        } else {
            alert ("Something went wrong, please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div className="CommentCreator">
            <h2>Add a comment</h2>
            <form onSubmit={handleSubmit}>
                <Tiptap onContentChange={handleContentChange}
                 entID={entID}
                 initialContent={initialContent}
                 />
                {isLoading && <p>Loading...</p>}
                {!isLoading && <button type="submit" className="submitButton">Submit</button>}
            </form>
        </div>
    )
}

