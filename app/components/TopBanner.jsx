
import React from 'react';


export default function TopBanner() {
    return (
        <div className="top-banner">
            <div className="top-banner__title">
                <h1>Knowledge Graph</h1>
            </div>
            <div className="top-banner__search">
                <input type="text" placeholder="Search" />
                <button className="btn btn-primary">Search</button>
            </div>
        </div> 
    )
}
