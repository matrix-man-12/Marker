/**
 * Background service worker for Marker
 * Handles bookmark storage using chrome.storage.local
 */

// Import utilities
importScripts('utils.js');

/**
 * Initialize the extension
 */
async function initialize() {
    console.log('[Marker] Extension initialized');
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
            console.log('[Marker] Duplicate bookmark ignored');
            return { success: true, duplicate: true };
        }

        // Add new bookmark
        bookmarks.push(bookmark);

        // Save to storage
        await chrome.storage.local.set({ bookmarks });

        console.log('[Marker] Bookmark saved:', bookmark.video_title);
        return { success: true };

    } catch (error) {
        console.error('[Marker] Error saving bookmark:', error);
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
            console.log('[Marker] No bookmarks found for this video');
            return { success: true, removed: 0 };
        }

        await chrome.storage.local.set({ bookmarks: newBookmarks });
        console.log(`[Marker] Removed ${removedCount} bookmark(s) for video: ${videoId}`);
        return { success: true, removed: removedCount };

    } catch (error) {
        console.error('[Marker] Error removing bookmark:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sync bookmark timestamp - update the latest bookmark for a video
 * with the current playback position (does NOT create a new bookmark)
 * @param {string} videoId - Video ID
 * @param {number} timestampSeconds - New timestamp in seconds
 * @param {string} timestampFormatted - New timestamp formatted as HH:MM:SS
 * @param {string} videoUrl - New video URL with timestamp
 * @returns {Promise<Object>} - Result object
 */
async function syncBookmarkTimestamp(videoId, timestampSeconds, timestampFormatted, videoUrl) {
    try {
        const result = await chrome.storage.local.get('bookmarks');
        const bookmarks = result.bookmarks || [];

        // Find the latest bookmark for this video (by created_at)
        const videoBookmarks = bookmarks
            .map((b, index) => ({ ...b, _index: index }))
            .filter(b => b.video_id === videoId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (videoBookmarks.length === 0) {
            console.log('[Marker] No bookmark found to sync for this video');
            return { success: false, error: 'No bookmark found for this video' };
        }

        const latestBookmark = videoBookmarks[0];
        const idx = latestBookmark._index;

        // Update timestamp fields in place
        bookmarks[idx] = {
            ...bookmarks[idx],
            timestamp_seconds: timestampSeconds,
            timestamp_hh_mm_ss: timestampFormatted,
            video_url: videoUrl
        };

        await chrome.storage.local.set({ bookmarks });
        console.log(`[Marker] Synced bookmark timestamp to ${timestampFormatted} for video: ${videoId}`);
        return { success: true };

    } catch (error) {
        console.error('[Marker] Error syncing bookmark:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Mark all bookmarks for a video as watched
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} - Result object
 */
async function markVideoWatched(videoId) {
    try {
        const result = await chrome.storage.local.get('bookmarks');
        const bookmarks = result.bookmarks || [];

        let updatedCount = 0;
        const newBookmarks = bookmarks.map(b => {
            if (b.video_id === videoId && !b.watched) {
                updatedCount++;
                return { ...b, watched: true };
            }
            return b;
        });

        if (updatedCount === 0) {
            console.log('[Marker] No unwatched bookmarks found for this video');
            return { success: true, updated: 0 };
        }

        await chrome.storage.local.set({ bookmarks: newBookmarks });
        console.log(`[Marker] Marked ${updatedCount} bookmark(s) as watched for video: ${videoId}`);
        return { success: true, updated: updatedCount };

    } catch (error) {
        console.error('[Marker] Error marking video watched:', error);
        return { success: false, error: error.message };
    }
}

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.includes('youtube.com')) {
        console.log('[Marker] Not on YouTube page');
        return;
    }

    if (command === 'bookmark-video') {
        console.log('[Marker] Bookmark shortcut triggered');
        try {
            await chrome.tabs.sendMessage(tab.id, { action: 'trigger-bookmark' });
        } catch (error) {
            console.error('[Marker] Error sending message to content script:', error);
        }
    } else if (command === 'remove-bookmark') {
        console.log('[Marker] Remove bookmark shortcut triggered');
        try {
            await chrome.tabs.sendMessage(tab.id, { action: 'trigger-remove-bookmark' });
        } catch (error) {
            console.error('[Marker] Error sending message to content script:', error);
        }
    } else if (command === 'sync-bookmark') {
        console.log('[Marker] Sync bookmark shortcut triggered');
        try {
            await chrome.tabs.sendMessage(tab.id, { action: 'trigger-sync-bookmark' });
        } catch (error) {
            console.error('[Marker] Error sending message to content script:', error);
        }
    } else if (command === 'mark-watched') {
        console.log('[Marker] Mark watched shortcut triggered');
        try {
            await chrome.tabs.sendMessage(tab.id, { action: 'trigger-mark-watched' });
        } catch (error) {
            console.error('[Marker] Error sending message to content script:', error);
        }
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'bookmark') {
        saveBookmark(message.data).then(sendResponse);
        return true;
    }

    if (message.action === 'remove-bookmark') {
        removeBookmarkByVideoId(message.videoId).then(sendResponse);
        return true;
    }

    if (message.action === 'sync-bookmark') {
        syncBookmarkTimestamp(
            message.videoId,
            message.timestampSeconds,
            message.timestampFormatted,
            message.videoUrl
        ).then(sendResponse);
        return true;
    }

    if (message.action === 'mark-watched') {
        markVideoWatched(message.videoId).then(sendResponse);
        return true;
    }

    return false;
});

// Initialize on install/update
chrome.runtime.onInstalled.addListener(() => {
    console.log('[Marker] Extension installed/updated');
    initialize();
});

// Initialize on startup
initialize();

console.log('[Marker] Background service worker loaded');
