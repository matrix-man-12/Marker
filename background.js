/**
 * Background service worker for YouTube Bookmarker
 * Handles bookmark storage using chrome.storage.local
 */

// Import utilities
importScripts('utils.js');

/**
 * Initialize the extension
 */
async function initialize() {
    console.log('[YT Bookmarker] Extension initialized');
}

/**
 * Save bookmark to chrome.storage.local
 * @param {Object} bookmarkData - Bookmark data from content script
 * @returns {Promise<Object>} - Result object
 */
async function saveBookmark(bookmarkData) {
    try {
        // Create bookmark with unique ID
        const bookmark = {
            id: generateUUID(),
            watched: false,  // Track watched status
            ...bookmarkData
        };

        // Get existing bookmarks
        const result = await chrome.storage.local.get('bookmarks');
        const bookmarks = result.bookmarks || [];

        // Check for duplicate (same video + timestamp)
        const isDuplicate = bookmarks.some(b =>
            b.video_id === bookmark.video_id &&
            b.timestamp_seconds === bookmark.timestamp_seconds
        );

        if (isDuplicate) {
            console.log('[YT Bookmarker] Duplicate bookmark ignored');
            return { success: true, duplicate: true };
        }

        // Add new bookmark
        bookmarks.push(bookmark);

        // Save to storage
        await chrome.storage.local.set({ bookmarks });

        console.log('[YT Bookmarker] Bookmark saved:', bookmark.video_title);
        return { success: true };

    } catch (error) {
        console.error('[YT Bookmarker] Error saving bookmark:', error);
        return { success: false, error: error.message };
    }
}
/**
 * Remove bookmark(s) for a specific video ID
 * @param {string} videoId - Video ID to remove bookmarks for
 * @returns {Promise<Object>} - Result object
 */
async function removeBookmarkByVideoId(videoId) {
    try {
        const result = await chrome.storage.local.get('bookmarks');
        const bookmarks = result.bookmarks || [];

        const originalCount = bookmarks.length;
        const newBookmarks = bookmarks.filter(b => b.video_id !== videoId);
        const removedCount = originalCount - newBookmarks.length;

        if (removedCount === 0) {
            console.log('[YT Bookmarker] No bookmarks found for this video');
            return { success: true, removed: 0 };
        }

        await chrome.storage.local.set({ bookmarks: newBookmarks });
        console.log(`[YT Bookmarker] Removed ${removedCount} bookmark(s) for video: ${videoId}`);
        return { success: true, removed: removedCount };

    } catch (error) {
        console.error('[YT Bookmarker] Error removing bookmark:', error);
        return { success: false, error: error.message };
    }
}

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.includes('youtube.com')) {
        console.log('[YT Bookmarker] Not on YouTube page');
        return;
    }

    if (command === 'bookmark-video') {
        console.log('[YT Bookmarker] Bookmark shortcut triggered');
        try {
            await chrome.tabs.sendMessage(tab.id, { action: 'trigger-bookmark' });
        } catch (error) {
            console.error('[YT Bookmarker] Error sending message to content script:', error);
        }
    } else if (command === 'remove-bookmark') {
        console.log('[YT Bookmarker] Remove bookmark shortcut triggered');
        try {
            await chrome.tabs.sendMessage(tab.id, { action: 'trigger-remove-bookmark' });
        } catch (error) {
            console.error('[YT Bookmarker] Error sending message to content script:', error);
        }
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'bookmark') {
        // Handle bookmark request
        saveBookmark(message.data).then(sendResponse);
        return true; // Keep channel open for async response
    }

    if (message.action === 'remove-bookmark') {
        // Handle remove bookmark request
        removeBookmarkByVideoId(message.videoId).then(sendResponse);
        return true;
    }

    return false;
});

// Initialize on install/update
chrome.runtime.onInstalled.addListener(() => {
    console.log('[YT Bookmarker] Extension installed/updated');
    initialize();
});

// Initialize on startup
initialize();

console.log('[YT Bookmarker] Background service worker loaded');
