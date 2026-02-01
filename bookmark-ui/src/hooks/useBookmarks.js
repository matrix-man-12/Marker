import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing bookmarks with chrome.storage.local
 */
export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState([]);
    const [filteredBookmarks, setFilteredBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('date-desc');

    // Load bookmarks from chrome.storage.local
    const loadBookmarks = useCallback(async () => {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.local.get('bookmarks');
                const loadedBookmarks = result.bookmarks || [];
                setBookmarks(loadedBookmarks);
            } else {
                // Fallback for development outside extension context
                console.warn('Chrome storage not available, using empty bookmarks');
                setBookmarks([]);
            }
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
            setBookmarks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadBookmarks();
    }, [loadBookmarks]);

    // Listen for storage changes (real-time sync across tabs)
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            const handleStorageChange = (changes, areaName) => {
                if (areaName === 'local' && changes.bookmarks) {
                    setBookmarks(changes.bookmarks.newValue || []);
                }
            };

            chrome.storage.onChanged.addListener(handleStorageChange);
            return () => chrome.storage.onChanged.removeListener(handleStorageChange);
        }
    }, []);

    // Filter and sort bookmarks
    useEffect(() => {
        let result = [...bookmarks];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(b =>
                b.video_title?.toLowerCase().includes(query) ||
                b.channel_name?.toLowerCase().includes(query) ||
                b.video_id?.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            switch (sortOption) {
                case 'date-desc':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'date-asc':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'title':
                    return (a.video_title || '').localeCompare(b.video_title || '');
                case 'channel':
                    return (a.channel_name || '').localeCompare(b.channel_name || '');
                default:
                    return 0;
            }
        });

        setFilteredBookmarks(result);
    }, [bookmarks, searchQuery, sortOption]);

    // Save bookmarks to storage
    const saveBookmarks = useCallback(async (newBookmarks) => {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.local.set({ bookmarks: newBookmarks });
            }
            setBookmarks(newBookmarks);
        } catch (error) {
            console.error('Failed to save bookmarks:', error);
        }
    }, []);

    // Delete a bookmark
    const deleteBookmark = useCallback(async (id) => {
        const newBookmarks = bookmarks.filter(b => b.id !== id);
        await saveBookmarks(newBookmarks);
    }, [bookmarks, saveBookmarks]);

    // Toggle watched status
    const toggleWatched = useCallback(async (id) => {
        const newBookmarks = bookmarks.map(b =>
            b.id === id ? { ...b, watched: !b.watched } : b
        );
        await saveBookmarks(newBookmarks);
    }, [bookmarks, saveBookmarks]);

    // Import bookmarks (merge with existing, avoid duplicates)
    const importBookmarks = useCallback(async (newBookmarks) => {
        const existing = new Set(
            bookmarks.map(b => `${b.video_id}:${b.timestamp_seconds}`)
        );

        const uniqueNew = newBookmarks.filter(b =>
            !existing.has(`${b.video_id}:${b.timestamp_seconds}`)
        );

        if (uniqueNew.length === 0) {
            return { imported: 0, message: 'No new bookmarks to import (all are duplicates)' };
        }

        const merged = [...bookmarks, ...uniqueNew];
        await saveBookmarks(merged);

        return { imported: uniqueNew.length, message: `Imported ${uniqueNew.length} new bookmarks!` };
    }, [bookmarks, saveBookmarks]);

    // Bulk set watched status for multiple bookmarks
    const bulkSetWatched = useCallback(async (ids, watched) => {
        const idSet = new Set(ids);
        const newBookmarks = bookmarks.map(b =>
            idSet.has(b.id) ? { ...b, watched } : b
        );
        await saveBookmarks(newBookmarks);
    }, [bookmarks, saveBookmarks]);

    // Bulk delete multiple bookmarks
    const bulkDelete = useCallback(async (ids) => {
        const idSet = new Set(ids);
        const newBookmarks = bookmarks.filter(b => !idSet.has(b.id));
        await saveBookmarks(newBookmarks);
    }, [bookmarks, saveBookmarks]);

    return {
        bookmarks,
        filteredBookmarks,
        loading,
        searchQuery,
        setSearchQuery,
        sortOption,
        setSortOption,
        deleteBookmark,
        toggleWatched,
        importBookmarks,
        bulkSetWatched,
        bulkDelete,
        reload: loadBookmarks
    };
}
