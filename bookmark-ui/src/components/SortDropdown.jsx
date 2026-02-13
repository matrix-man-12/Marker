import { useState, useRef, useEffect } from 'react';
import './SortDropdown.css';

const SORT_OPTIONS = [
    { value: 'date-desc', label: 'Latest' },
    { value: 'date-asc', label: 'Oldest' },
    { value: 'channel', label: 'Channel' },
    { value: 'title', label: 'Title' },
];

export function SortDropdown({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedLabel = SORT_OPTIONS.find(o => o.value === value)?.label ?? 'Sort';

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="sort-dropdown" ref={dropdownRef}>
            <button
                className={`sort-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <span className="sort-trigger-label">Sort by:</span>
                <span className="sort-trigger-value">{selectedLabel}</span>
                <svg className="sort-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {isOpen && (
                <div className="sort-menu">
                    {SORT_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            className={`sort-menu-item ${option.value === value ? 'active' : ''}`}
                            onClick={() => handleSelect(option.value)}
                            type="button"
                        >
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
