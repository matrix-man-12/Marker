import { useState, useEffect, useCallback } from 'react';
import { useBookmarks } from './hooks/useBookmarks';
import './PopupApp.css';

function PopupApp() {
    const {
        bookmarks,
        loading,
        deleteBookmark,
        toggleWatched
    } = useBookmarks();

    const [currentVideoId, setCurrentVideoId] = useState(null);
    const [currentVideoBookmarks, setCurrentVideoBookmarks] = useState([]);

    // Check current tab and get video ID
    useEffect(() => {
        async function checkCurrentTab() {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab && tab.url) {
                    const url = new URL(tab.url);
                    if (url.hostname.includes('youtube.com')) {
                        const videoId = url.searchParams.get('v');
                        if (videoId) {
                            setCurrentVideoId(videoId);
                        } else {
                            // Check for shorts
                            const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
                            if (shortsMatch) {
                                setCurrentVideoId(shortsMatch[1]);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking current tab:', error);
            }
        }
        checkCurrentTab();
    }, []);

    // Find bookmarks for current video
    useEffect(() => {
        if (currentVideoId && bookmarks.length > 0) {
            const videoBookmarks = bookmarks.filter(b => b.video_id === currentVideoId);
            setCurrentVideoBookmarks(videoBookmarks);
        } else {
            setCurrentVideoBookmarks([]);
        }
    }, [currentVideoId, bookmarks]);

    const isCurrentVideoBookmarked = currentVideoBookmarks.length > 0;
    const isCurrentVideoWatched = currentVideoBookmarks.some(b => b.watched);

    // Add bookmark for current video
    const handleAddBookmark = async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            try {
                await chrome.tabs.sendMessage(tab.id, { action: 'trigger-bookmark' });
            } catch (error) {
                console.error('Error adding bookmark:', error);
            }
        }
    };

    // Remove all bookmarks for current video
    const handleRemoveBookmark = async () => {
        for (const bookmark of currentVideoBookmarks) {
            await deleteBookmark(bookmark.id);
        }
    };

    // Toggle watched status for current video's bookmarks
    const handleToggleWatched = async () => {
        for (const bookmark of currentVideoBookmarks) {
            await toggleWatched(bookmark.id);
        }
    };

    // View all bookmarks
    const handleViewAll = () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('bookmarks-page/index.html') });
    };

    // Open a bookmark
    const handleOpenBookmark = (url) => {
        chrome.tabs.create({ url });
    };

    // Get recent 3 unwatched bookmarks (excluding current video)
    const recentBookmarks = [...bookmarks]
        .filter(b => b.video_id !== currentVideoId && !b.watched)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);

    return (
        <div className="popup-container">
            {/* Header */}
            <header className="popup-header">
                <h1>Marker</h1>
            </header>

            {/* Current Video Section - Only shown on YouTube videos */}
            {currentVideoId && (
                <section className="current-video-section">
                    <h2>Current Video</h2>
                    <div className="current-video-actions">
                        {!isCurrentVideoBookmarked ? (
                            <button className="action-btn add-btn" onClick={handleAddBookmark}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                    <line x1="12" y1="8" x2="12" y2="14"></line>
                                    <line x1="9" y1="11" x2="15" y2="11"></line>
                                </svg>
                                Add Bookmark
                            </button>
                        ) : (
                            <>
                                <button className="action-btn remove-btn" onClick={handleRemoveBookmark}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                    Remove
                                </button>
                                <button
                                    className={`action-btn watched-btn ${isCurrentVideoWatched ? 'is-watched' : ''}`}
                                    onClick={handleToggleWatched}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    {isCurrentVideoWatched ? 'Watched' : 'Mark Watched'}
                                </button>
                            </>
                        )}
                    </div>
                </section>
            )}

            {/* Recent Bookmarks */}
            <section className="recent-section">
                <h2>Recent Bookmarks</h2>
                {loading ? (
                    <div className="empty-state">Loading...</div>
                ) : recentBookmarks.length === 0 ? (
                    <div className="empty-state">
                        {bookmarks.length === 0
                            ? 'No bookmarks yet. Press Ctrl+Shift+L on a YouTube video!'
                            : 'No other recent bookmarks'}
                    </div>
                ) : (
                    <div className="recent-list">
                        {recentBookmarks.map((bookmark) => (
                            <div
                                key={bookmark.id}
                                className={`recent-item ${bookmark.watched ? 'watched' : ''}`}
                                onClick={() => handleOpenBookmark(bookmark.video_url)}
                            >
                                <div className="recent-thumbnail">
                                    <img
                                        src={`https://img.youtube.com/vi/${bookmark.video_id}/mqdefault.jpg`}
                                        alt=""
                                    />
                                    <span className="timestamp-badge">{bookmark.timestamp_hh_mm_ss}</span>
                                </div>
                                <div className="recent-info">
                                    <div className="recent-title">{bookmark.video_title}</div>
                                    <div className="recent-channel">{bookmark.channel_name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* View All Button */}
            <button className="view-all-btn" onClick={handleViewAll}>
                View All Bookmarks
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
    );
}

export default PopupApp;
