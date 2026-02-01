import { SortDropdown } from './SortDropdown';
import './StatsBar.css';

export function StatsBar({ total, showing, sortOption, onSortChange }) {
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
                <SortDropdown value={sortOption} onChange={onSortChange} />
            </div>
        </div>
    );
}
