import './TabBar.css';

const TABS = [
    { key: 'unwatched', label: 'Unwatched' },
    { key: 'watched', label: 'Watched' },
];

export function TabBar({ activeTab, onTabChange, counts }) {
    return (
        <div className="tab-bar">
            <div className="tab-bar-inner">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.key)}
                    >
                        <span className="tab-label">{tab.label}</span>
                        <span className="tab-count">{counts[tab.key] ?? 0}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
