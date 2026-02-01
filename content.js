/**
 * Content script for YouTube Bookmarker
 * Injected on YouTube pages to extract video metadata and timestamps
 */

/**
 * Extract video ID from current YouTube URL
 * @returns {string|null} - Video ID or null if not found
 */
function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');

    // Also check for embedded videos or shorts
    if (!videoId) {
        const pathMatch = window.location.pathname.match(/\/(?:embed|shorts)\/([a-zA-Z0-9_-]+)/);
        return pathMatch ? pathMatch[1] : null;
    }

    return videoId;
}

/**
 * Get video title from page
 * @returns {string} - Video title
 */
function getVideoTitle() {
    // Try multiple selectors as YouTube's DOM can vary
    const titleElement =
        document.querySelector('h1.ytd-video-primary-info-renderer yt-formatted-string') ||
        document.querySelector('h1.ytd-watch-metadata yt-formatted-string') ||
        document.querySelector('h1 yt-formatted-string.ytd-watch-metadata') ||
        document.querySelector('ytd-watch-metadata h1 yt-formatted-string');

    return titleElement ? titleElement.textContent.trim() : 'Unknown Title';
}

/**
 * Get channel name from page
 * @returns {string} - Channel name
 */
function getChannelName() {
    // Try multiple selectors
    const channelElement =
        document.querySelector('ytd-channel-name a') ||
        document.querySelector('ytd-video-owner-renderer a') ||
        document.querySelector('#channel-name a');

    return channelElement ? channelElement.textContent.trim() : 'Unknown Channel';
}

/**
 * Get current playback timestamp from video player
 * @returns {number|null} - Current time in seconds, or null if video not found
 */
function getCurrentTimestamp() {
    const video = document.querySelector('video');
    return video ? Math.floor(video.currentTime) : null;
}

/**
 * Get total video duration from video player
 * @returns {number|null} - Duration in seconds, or null if video not found
 */
function getVideoDuration() {
    const video = document.querySelector('video');
    return video && video.duration ? Math.floor(video.duration) : null;
}

/**
 * Extract all video metadata and create bookmark object
 * @returns {Object|null} - Bookmark data or null if extraction fails
 */
function extractVideoMetadata() {
    const videoId = getVideoId();

    if (!videoId) {
        console.error('[YT Bookmarker] Could not extract video ID');
        return null;
    }

    const timestampSeconds = getCurrentTimestamp();

    if (timestampSeconds === null) {
        console.error('[YT Bookmarker] Could not get current timestamp');
        return null;
    }

    const videoTitle = getVideoTitle();
    const channelName = getChannelName();
    const timestampFormatted = formatTimestamp(timestampSeconds);
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}&t=${timestampSeconds}s`;
    const createdAt = formatISODateTime();
    const videoDuration = getVideoDuration();

    return {
        video_id: videoId,
        video_title: videoTitle,
        channel_name: channelName,
        timestamp_seconds: timestampSeconds,
        timestamp_hh_mm_ss: timestampFormatted,
        video_url: videoUrl,
        created_at: createdAt,
        video_duration_seconds: videoDuration
    };
}

/**
 * Send bookmark request to background service worker
 */
function sendBookmark() {
    const bookmarkData = extractVideoMetadata();

    if (!bookmarkData) {
        console.error('[YT Bookmarker] Failed to extract video metadata');
        return;
    }

    console.log('[YT Bookmarker] Sending bookmark:', bookmarkData);

    // Send message to background service worker
    chrome.runtime.sendMessage({
        action: 'bookmark',
        data: bookmarkData
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('[YT Bookmarker] Error sending message:', chrome.runtime.lastError);
            return;
        }

        if (response && response.success) {
            console.log('[YT Bookmarker] Bookmark saved successfully');
            // Optional: Show a subtle visual feedback (e.g., brief icon overlay)
        } else {
            console.error('[YT Bookmarker] Failed to save bookmark:', response?.error);
        }
    });
}

// Listen for keyboard shortcut from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'trigger-bookmark') {
        sendBookmark();
        sendResponse({ success: true });
    }
    return true; // Keep message channel open for async response
});

console.log('[YT Bookmarker] Content script loaded');
