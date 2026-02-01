import { SortDropdown } from './SortDropdown';
import './StatsBar.css';

export function StatsBar({ total, showing, sortOption, onSortChange, selectionMode, onToggleSelectionMode }) {
    return (
        <div className="stats-bar">
            <div className="stats-left">
                <span className="stat">
                    Total Bookmarks: <span className="stat-value">{total}</span>
                </span>
                <span className="stat">
                    Showing: <span className="stat-value">{showing} results</span>
                </span>
            </div>
            <div className="stats-right">
                <button
                    className={`select-btn ${selectionMode ? 'active' : ''}`}
                    onClick={onToggleSelectionMode}
                >
                    {selectionMode ? 'Cancel' : 'Select'}
                </button>
                <SortDropdown value={sortOption} onChange={onSortChange} />
            </div>
        </div>
    );
}
