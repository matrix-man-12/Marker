import { BookmarkCard } from './BookmarkCard';
import './BookmarkGrid.css';

export function BookmarkGrid({ bookmarks, onDelete }) {
    if (bookmarks.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <h3 className="empty-title">No bookmarks found</h3>
                <p className="empty-text">
                    Try adjusting your search or add bookmarks on YouTube with <kbd>Ctrl+Shift+L</kbd>
                </p>
            </div>
        );
    }

    return (
        <div className="bookmark-grid">
            {bookmarks.map(bookmark => (
                <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
