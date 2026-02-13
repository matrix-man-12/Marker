import { SortDropdown } from './SortDropdown';
import './StatsBar.css';

export function StatsBar({ sortOption, onSortChange, selectionMode, onToggleSelectionMode, groupByDate, onToggleGroupByDate }) {
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
