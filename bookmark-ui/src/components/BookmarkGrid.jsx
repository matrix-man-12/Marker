import { BookmarkCard } from './BookmarkCard';
import './BookmarkGrid.css';

/**
 * Group bookmarks by date (Today, Yesterday, or formatted date)
 */
function groupBookmarksByDate(bookmarks) {
    const groups = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    bookmarks.forEach(bookmark => {
        const date = new Date(bookmark.created_at);
        const bookmarkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        let label;
        if (bookmarkDate.getTime() === today.getTime()) {
            label = 'Today';
        } else if (bookmarkDate.getTime() === yesterday.getTime()) {
            label = 'Yesterday';
        } else {
            label = bookmarkDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: bookmarkDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }

        if (!groups[label]) {
            groups[label] = [];
        }
        groups[label].push(bookmark);
    });

    return Object.entries(groups);
}

export function BookmarkGrid({ bookmarks, onDelete, selectionMode, selectedIds, onSelect, groupByDate }) {
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

    if (groupByDate) {
        const groups = groupBookmarksByDate(bookmarks);
        return (
            <div className="bookmark-grid-grouped">
                {groups.map(([dateLabel, groupBookmarks]) => (
                    <div key={dateLabel} className="date-group">
                        <div className="date-separator">
                            <span className="date-label">{dateLabel}</span>
                            <span className="date-count">{groupBookmarks.length}</span>
                        </div>
                        <div className="bookmark-grid">
                            {groupBookmarks.map(bookmark => (
                                <BookmarkCard
                                    key={bookmark.id}
                                    bookmark={bookmark}
                                    onDelete={onDelete}
                                    selectionMode={selectionMode}
                                    isSelected={selectedIds.has(bookmark.id)}
                                    onSelect={onSelect}
                                />
                            ))}
                        </div>
                    </div>
                ))}
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
                    selectionMode={selectionMode}
                    isSelected={selectedIds.has(bookmark.id)}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
