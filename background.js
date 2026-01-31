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

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'bookmark-video') {
        console.log('[YT Bookmarker] Keyboard shortcut triggered');

        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.url || !tab.url.includes('youtube.com')) {
            console.log('[YT Bookmarker] Not on YouTube page');
            return;
        }

        // Send message to content script to extract metadata
        try {
            await chrome.tabs.sendMessage(tab.id, { action: 'trigger-bookmark' });
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
