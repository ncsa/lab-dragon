"use client"
import React, { useContext } from 'react';
import Image from 'next/image';
import { CreationPopupContext } from '@/app/contexts/CreationPopupContext';
import { BookmarkContext } from '@/app/contexts/BookmarkContext';


export default function TopBanner() {

    const { user, setUser } = useContext(CreationPopupContext);
    const { userOptions } = useContext(CreationPopupContext);
    const { onlyShowBookmarked, setOnlyShowBookmarked } = useContext(BookmarkContext);

    const handleBookmarkToggle = () => {
        setOnlyShowBookmarked(!onlyShowBookmarked);
    }

    return (
    <div className="top-banner">
        <a href={"/entities"}>
            <Image src="/images/pfafflab_logo.png" alt="First Image" width="64" height="64"/>
        </a>
        <h1 className="main-title">Lab Notebook</h1>
        <div className="banner-options">
            <div className="user-selection">
                <label htmlFor="user-select">Selected User:</label>
                <select
                    onChange={(e) => setUser(e.target.value)}
                    value={user}>
                    {
                    userOptions && userOptions.map((user, index) => (
                        <option key={index} value={user}>{user}</option>
                    ))}
                </select>
            </div>
                <div className="bookmark-toggle">
                    <label>Only Bookmarked</label>
                    <button onClick={handleBookmarkToggle}>
                            {onlyShowBookmarked ? <i className="bookmark-toggle bi bi-toggle-on" /> : <i className="bookmark-toggle bi bi-toggle-off" />}
                    </button>
                </div>
        </div>
    </div>
    )
}
