import { SortDropdown } from './SortDropdown';
import './StatsBar.css';

export function StatsBar({ sortOption, onSortChange, selectionMode, onToggleSelectionMode, groupByDate, onToggleGroupByDate, filterByPlaylist, onToggleFilterByPlaylist }) {
    return (
        <div className="stats-bar">
            <div className="stats-right">
                <label className="group-toggle" title="Group bookmarks by date">
                    <input
                        type="checkbox"
                        checked={groupByDate}
                        onChange={onToggleGroupByDate}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Group by Date</span>
                </label>
                <label className="group-toggle" title="Show only playlist bookmarks">
                    <input
                        type="checkbox"
                        checked={filterByPlaylist}
                        onChange={onToggleFilterByPlaylist}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Filter By Playlist</span>
                </label>
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
