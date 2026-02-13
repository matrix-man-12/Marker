/**
 * Popup script for Marker
 * Displays bookmark stats and recent bookmarks
 */

// Load bookmarks and update UI
async function loadBookmarks() {
    const result = await chrome.storage.local.get('bookmarks');
    const bookmarks = result.bookmarks || [];

    // Update count
    document.getElementById('bookmarkCount').textContent = bookmarks.length;

    // Show recent 5 bookmarks (sorted by created_at desc)
    const recent = bookmarks
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

    const recentList = document.getElementById('recentList');

    if (recent.length === 0) {
        recentList.innerHTML = '<div class="empty-state">No bookmarks yet!<br>Press Ctrl+Shift+L on a YouTube video</div>';
        return;
    }

    recentList.innerHTML = recent.map(b => `
    <div class="bookmark-item" data-url="${b.video_url}">
      <div class="bookmark-title">${escapeHtml(b.video_title)}</div>
      <div class="bookmark-meta">${b.channel_name} • ${b.timestamp_hh_mm_ss}</div>
    </div>
  `).join('');

    // Add click handlers
    document.querySelectorAll('.bookmark-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = item.dataset.url;
            chrome.tabs.create({ url });
        });
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// View all bookmarks
document.getElementById('viewAllBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('bookmarks-page/index.html') });
});

// Export to CSV
document.getElementById('exportBtn').addEventListener('click', async () => {
    const result = await chrome.storage.local.get('bookmarks');
    const bookmarks = result.bookmarks || [];

    if (bookmarks.length === 0) {
        alert('No bookmarks to export!');
        return;
    }

    // Create CSV content (load utils for this)
    let csv = 'video_id,video_title,channel_name,timestamp_seconds,timestamp_hh_mm_ss,video_url,created_at,watched\n';

    bookmarks.forEach(b => {
        const row = [
            b.video_id,
            `"${b.video_title.replace(/"/g, '""')}"`,
            `"${b.channel_name.replace(/"/g, '""')}"`,
            b.timestamp_seconds,
            b.timestamp_hh_mm_ss,
            b.video_url,
            b.created_at,
            b.watched ? 'true' : 'false'
        ].join(',');
        csv += row + '\n';
    });

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-bookmarks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
});

// Listen for storage changes (real-time updates)
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.bookmarks) {
        console.log('[Marker] Bookmarks updated, refreshing popup...');
        loadBookmarks();
    }
});

// Load bookmarks on popup open
loadBookmarks();
