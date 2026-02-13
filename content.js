/**
 * Content script for Marker
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
 * Get channel URL from page
 * @returns {string|null} - Channel URL or null if not found
 */
function getChannelUrl() {
    const channelLink =
        document.querySelector('ytd-video-owner-renderer ytd-channel-name a') ||
        document.querySelector('ytd-video-owner-renderer a#avatar') ||
        document.querySelector('#owner ytd-channel-name a') ||
        document.querySelector('#channel-name a');

    return channelLink ? channelLink.href : null;
}

/**
 * Get channel avatar URL from page
 * @returns {string|null} - Channel avatar URL or null if not found
 */
function getChannelAvatarUrl() {
    // Try multiple selectors - YouTube's DOM can vary
    const avatarElement =
        document.querySelector('ytd-video-owner-renderer #avatar img') ||
        document.querySelector('#owner #avatar img') ||
        document.querySelector('ytd-video-owner-renderer a#avatar img') ||
        document.querySelector('ytd-video-owner-renderer yt-img-shadow img') ||
        document.querySelector('#owner yt-img-shadow img');

    return avatarElement ? avatarElement.src : null;
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
        console.error('[Marker] Could not extract video ID');
        return null;
    }

    const timestampSeconds = getCurrentTimestamp();

    if (timestampSeconds === null) {
        console.error('[Marker] Could not get current timestamp');
        return null;
    }

    const videoTitle = getVideoTitle();
    const channelName = getChannelName();
    const channelUrl = getChannelUrl();
    const channelAvatar = getChannelAvatarUrl();
    const timestampFormatted = formatTimestamp(timestampSeconds);
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}&t=${timestampSeconds}s`;
    const createdAt = formatISODateTime();
    const videoDuration = getVideoDuration();

    return {
        video_id: videoId,
        video_title: videoTitle,
        channel_name: channelName,
        channel_url: channelUrl,
        channel_avatar: channelAvatar,
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
        console.error('[Marker] Failed to extract video metadata');
        return;
    }

    console.log('[Marker] Sending bookmark:', bookmarkData);

    // Send message to background service worker
    chrome.runtime.sendMessage({
        action: 'bookmark',
        data: bookmarkData
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('[Marker] Error sending message:', chrome.runtime.lastError);
            return;
        }

        if (response && response.success) {
            console.log('[Marker] Bookmark saved successfully');
            // Optional: Show a subtle visual feedback (e.g., brief icon overlay)
        } else {
            console.error('[Marker] Failed to save bookmark:', response?.error);
        }
    });
}

// Listen for keyboard shortcut from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'trigger-bookmark') {
        sendBookmark();
        sendResponse({ success: true });
    }

    if (message.action === 'trigger-remove-bookmark') {
        const videoId = getVideoId();
        if (videoId) {
            chrome.runtime.sendMessage({
                action: 'remove-bookmark',
                videoId: videoId
            }, (response) => {
                if (response && response.success) {
                    console.log(`[Marker] Removed ${response.removed} bookmark(s)`);
                }
            });
        }
        sendResponse({ success: true });
    }

    if (message.action === 'trigger-sync-bookmark') {
        const videoId = getVideoId();
        const timestampSeconds = getCurrentTimestamp();
        if (videoId && timestampSeconds !== null) {
            const timestampFormatted = formatTimestamp(timestampSeconds);
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}&t=${timestampSeconds}s`;
            chrome.runtime.sendMessage({
                action: 'sync-bookmark',
                videoId: videoId,
                timestampSeconds: timestampSeconds,
                timestampFormatted: timestampFormatted,
                videoUrl: videoUrl
            }, (response) => {
                if (response && response.success) {
                    console.log(`[Marker] Synced bookmark timestamp to ${timestampFormatted}`);
                } else {
                    console.log('[Marker] No bookmark found to sync');
                }
            });
        }
        sendResponse({ success: true });
    }

    if (message.action === 'trigger-mark-watched') {
        const videoId = getVideoId();
        if (videoId) {
            chrome.runtime.sendMessage({
                action: 'mark-watched',
                videoId: videoId
            }, (response) => {
                if (response && response.success) {
                    console.log(`[Marker] Marked video as watched (${response.updated} bookmark(s))`);
                }
            });
        }
        sendResponse({ success: true });
    }

    return true;
});

console.log('[Marker] Content script loaded');
