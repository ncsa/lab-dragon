"use client"
import React, {useContext} from 'react';
import Image from 'next/image';
import { CreationPopupContext } from '@/app/contexts/CreationPopupContext';
import { BookmarkContext } from '@/app/contexts/BookmarkContext';


export async function resetServer() {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reset`, {
        method: 'POST',
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }
    window.location.reload();
}

export default function TopBanner() {

    const { user, setUser } = useContext(CreationPopupContext);
    const { userOptions } = useContext(CreationPopupContext);
    const { onlyShowBookmarked, setOnlyShowBookmarked } = useContext(BookmarkContext);
    const { rootEntity } = useContext(CreationPopupContext);

    const handleBookmarkToggle = () => {
        setOnlyShowBookmarked(!onlyShowBookmarked);
    }

    if (!rootEntity) {
        return <div>Loading...</div>
    }

    return (
    <div className="top-banner">
        <a href={"/entities/" + rootEntity.id}>
            <Image className="logo-image" src="/images/dragon_logo.jpeg" alt="First Image" width="2000" height="2000"/>
        </a>
        <h1 className="main-title">Lab Dragon </h1>
        <div className="banner-right">
            <button onClick={resetServer} className="reset-button" title="Refresh the notebook server">
                <i className="bi bi-arrow-clockwise"></i>
            </button>
            <div className="banner-options">
                <div className="user-selection">
                    <label htmlFor="user-select">Selected User:</label>
                    <select
                        id="user-select"
                        onChange={(e) => setUser(e.target.value)}
                        value={user}>
                        {
                        userOptions && userOptions.map((user, index) => (
                            <option key={index} value={user}>{user}</option>
                        ))}
                    </select>
                </div>
                    <div className="bookmark-toggle">
                        <label htmlFor="bookmark-toggle">Only Bookmarked</label>
                        <button onClick={handleBookmarkToggle} id="bookmark-toggle">
                                {onlyShowBookmarked ? <i className="bookmark-toggle bi bi-toggle-on" /> : <i className="bookmark-toggle bi bi-toggle-off" />}
                        </button>
                    </div>
            </div>
        </div>
    </div>
    )
}
