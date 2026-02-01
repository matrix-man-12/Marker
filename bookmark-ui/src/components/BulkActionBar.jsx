import './BulkActionBar.css';

export function BulkActionBar({ selectedCount, onMarkWatched, onMarkUnwatched, onDelete, onCancel }) {
    if (selectedCount === 0) {
        return null;
    }

    const handleDelete = () => {
        if (window.confirm(`Delete ${selectedCount} bookmark${selectedCount > 1 ? 's' : ''}?`)) {
            onDelete();
        }
    };

    return (
        <div className="bulk-action-bar">
            <div className="bulk-action-info">
                <span className="selected-count">{selectedCount} selected</span>
            </div>

            <div className="bulk-action-buttons">
                <button className="bulk-btn bulk-btn-watched" onClick={onMarkWatched}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Mark Watched
                </button>

                <button className="bulk-btn bulk-btn-unwatched" onClick={onMarkUnwatched}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94C16.28 19.19 14.23 20 12 20c-7 0-11-8-11-8a21.3 21.3 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a21.3 21.3 0 0 1-2.16 3.19"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                    Mark Unwatched
                </button>

                <button className="bulk-btn bulk-btn-delete" onClick={handleDelete}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                </button>

                <button className="bulk-btn bulk-btn-cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
