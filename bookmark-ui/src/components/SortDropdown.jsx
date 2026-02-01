import './SortDropdown.css';

export function SortDropdown({ value, onChange }) {
    return (
        <div className="sort-dropdown">
            <label htmlFor="sort-select" className="sort-label">Sort by:</label>
            <select
                id="sort-select"
                className="sort-select"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="date-desc">Date Added (Newest)</option>
                <option value="date-asc">Date Added (Oldest)</option>
                <option value="channel">Channel A-Z</option>
                <option value="title">Title A-Z</option>
            </select>
        </div>
    );
}
