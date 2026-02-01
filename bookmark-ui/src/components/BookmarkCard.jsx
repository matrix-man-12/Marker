import './BookmarkCard.css';

/**
 * Format relative time (e.g., "2 days ago", "3 hours ago")
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths > 0) {
        // Show formatted date for older items
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (diffWeeks > 0) {
        return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    } else if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

/**
 * Get video duration from timestamp (mock - we don't have actual duration)
 */
function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function BookmarkCard({ bookmark, onDelete, selectionMode, isSelected, onSelect }) {
    const thumbnailUrl = `https://i.ytimg.com/vi/${bookmark.video_id}/mqdefault.jpg`;

    // URL without timestamp - starts video from beginning
    const videoUrlFromStart = `https://www.youtube.com/watch?v=${bookmark.video_id}`;

    // URL with timestamp - starts video at bookmarked time
    const videoUrlWithTimestamp = bookmark.video_url;

    const handleTimestampClick = (e) => {
        e.stopPropagation();
        if (!selectionMode) {
            window.open(videoUrlWithTimestamp, '_blank');
        }
    };

    const handleCardClick = () => {
        if (selectionMode) {
            onSelect?.(bookmark.id);
        } else {
            window.open(videoUrlFromStart, '_blank');
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('Delete this bookmark?')) {
            onDelete?.(bookmark.id);
        }
    };

    const handleCheckboxClick = (e) => {
        e.stopPropagation();
        onSelect?.(bookmark.id);
    };

    // Duration to show on thumbnail - use video duration if available, otherwise use bookmark timestamp
    const thumbnailDuration = bookmark.video_duration_seconds || bookmark.timestamp_seconds;

    const cardClasses = [
        'bookmark-card',
        selectionMode && 'selection-mode',
        isSelected && 'selected',
        bookmark.watched && 'watched'
    ].filter(Boolean).join(' ');

    return (
        <article className={cardClasses} onClick={handleCardClick}>
            {/* Selection Checkbox */}
            {selectionMode && (
                <div className="card-checkbox" onClick={handleCheckboxClick}>
                    <div className={`checkbox ${isSelected ? 'checked' : ''}`}>
                        {isSelected && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        )}
                    </div>
                </div>
            )}

            {/* Thumbnail */}
            <div className="card-thumbnail">
                <img src={thumbnailUrl} alt={bookmark.video_title} loading="lazy" />
                <span className="duration-badge">{formatDuration(thumbnailDuration)}</span>
                {bookmark.watched && (
                    <span className="watched-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        Watched
                    </span>
                )}
            </div>

            {/* Channel Info */}
            <div className="card-channel">
                <div className="channel-avatar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                </div>
                <span className="channel-name">{bookmark.channel_name}</span>
                <span className="channel-separator">•</span>
                <span className="card-date">{formatRelativeTime(bookmark.created_at)}</span>
            </div>

            {/* Title */}
            <h3 className="card-title">{bookmark.video_title}</h3>

            {/* Footer */}
            <div className="card-footer">
                <button className="timestamp-badge" onClick={handleTimestampClick} title="Jump to timestamp">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {bookmark.timestamp_hh_mm_ss}
                </button>

                {!selectionMode && (
                    <button className="delete-btn" onClick={handleDelete} title="Delete bookmark">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                )}
            </div>
        </article>
    );
}
