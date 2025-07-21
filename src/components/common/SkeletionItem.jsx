import React from 'react'
import './Skeletion.css'
export default function SkeletionItem() {
    return (
        <div className="skeleton-music-card">
            <div className="skeleton-img" />
            <div className="skeleton-line short" />
            <div className="skeleton-line long" />
        </div>

    )
}
