import { SortDropdown } from './SortDropdown';
import './StatsBar.css';

export function StatsBar({ sortOption, onSortChange, selectionMode, onToggleSelectionMode }) {
    return (
        <div className="stats-bar">
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
