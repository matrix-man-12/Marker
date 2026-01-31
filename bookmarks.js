/**
 * Bookmarks management page script
 * Handles search, filter, sort, CRUD operations, and CSV import/export
 */

let allBookmarks = [];
let filteredBookmarks = [];

// Load all bookmarks
async function loadBookmarks() {
    const result = await chrome.storage.local.get('bookmarks');
    allBookmarks = result.bookmarks || [];
    filteredBookmarks = [...allBookmarks];

    updateStats();
    renderBookmarks();
}

// Update statistics
function updateStats() {
    document.getElementById('totalCount').textContent = allBookmarks.length;
    document.getElementById('showingCount').textContent = filteredBookmarks.length;
}

// Render bookmarks to the grid
function renderBookmarks() {
    const grid = document.getElementById('bookmarksGrid');

    if (filteredBookmarks.length === 0) {
        grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-text">No bookmarks found</div>
        <div class="empty-state-hint">Try adjusting your search or add bookmarks on YouTube with Ctrl+Shift+L</div>
      </div>
    `;
        return;
    }

    grid.innerHTML = filteredBookmarks.map(b => `
    <div class="bookmark-card ${b.watched ? 'watched' : ''}" data-id="${b.id}">
      <input type="checkbox" class="bookmark-checkbox" data-id="${b.id}">
      <div class="thumbnail">
        <img src="https://i.ytimg.com/vi/${b.video_id}/mqdefault.jpg" alt="${escapeHtml(b.video_title)}">
      </div>
      <div class="title">${escapeHtml(b.video_title)}</div>
      <div class="meta">📺 ${escapeHtml(b.channel_name)}</div>
      <div class="meta">📅 ${formatDate(b.created_at)}</div>
      <div class="timestamp-badge">⏱️ ${b.timestamp_hh_mm_ss}</div>
      <button class="watch-toggle-btn ${b.watched ? 'watched' : ''}" data-id="${b.id}" title="${b.watched ? 'Mark as unwatched' : 'Mark as watched'}">
        ${b.watched ? '✓' : '👁️'}
      </button>
      <button class="delete-btn" data-id="${b.id}">Delete</button>
    </div>
  `).join('');

    // Add click handlers for opening videos
    document.querySelectorAll('.bookmark-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't open if clicking checkbox, buttons
            if (e.target.classList.contains('bookmark-checkbox') ||
                e.target.classList.contains('delete-btn') ||
                e.target.classList.contains('watch-toggle-btn')) {
                return;
            }
            const bookmark = filteredBookmarks.find(b => b.id === card.dataset.id);
            if (bookmark) {
                window.open(bookmark.video_url, '_blank');
            }
        });
    });

    // Add delete handlers
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('Delete this bookmark?')) {
                await deleteBookmark(id);
            }
        });
    });

    // Add watch toggle handlers
    document.querySelectorAll('.watch-toggle-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            await toggleWatched(id);
        });
    });

    // Add checkbox change handlers
    document.querySelectorAll('.bookmark-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCount);
    });
}

// Delete a bookmark
async function deleteBookmark(id) {
    allBookmarks = allBookmarks.filter(b => b.id !== id);
    await chrome.storage.local.set({ bookmarks: allBookmarks });
    await loadBookmarks();
    applyFilters();
}

// Toggle watched status
async function toggleWatched(id) {
    const bookmark = allBookmarks.find(b => b.id === id);
    if (bookmark) {
        bookmark.watched = !bookmark.watched;
        await chrome.storage.local.set({ bookmarks: allBookmarks });
        await loadBookmarks();
        applyFilters();
    }
}

// Update selected count
function updateSelectedCount() {
    const selectedCheckboxes = document.querySelectorAll('.bookmark-checkbox:checked');
    const count = selectedCheckboxes.length;
    document.getElementById('selectedCount').textContent = count;

    // Show/hide bulk actions bar
    const bulkActionsBar = document.getElementById('bulkActions');
    bulkActionsBar.style.display = count > 0 ? 'flex' : 'none';
}

// Get selected bookmark IDs
function getSelectedIds() {
    const selectedCheckboxes = document.querySelectorAll('.bookmark-checkbox:checked');
    return Array.from(selectedCheckboxes).map(cb => cb.dataset.id);
}

// Bulk mark as watched
async function bulkMarkWatched() {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;

    selectedIds.forEach(id => {
        const bookmark = allBookmarks.find(b => b.id === id);
        if (bookmark) bookmark.watched = true;
    });

    await chrome.storage.local.set({ bookmarks: allBookmarks });
    await loadBookmarks();
    applyFilters();
}

// Bulk mark as unwatched
async function bulkMarkUnwatched() {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;

    selectedIds.forEach(id => {
        const bookmark = allBookmarks.find(b => b.id === id);
        if (bookmark) bookmark.watched = false;
    });

    await chrome.storage.local.set({ bookmarks: allBookmarks });
    await loadBookmarks();
    applyFilters();
}

// Bulk delete
async function bulkDelete() {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;

    if (!confirm(`Delete ${selectedIds.length} selected bookmarks?`)) {
        return;
    }

    allBookmarks = allBookmarks.filter(b => !selectedIds.includes(b.id));
    await chrome.storage.local.set({ bookmarks: allBookmarks });
    await loadBookmarks();
    applyFilters();
}

// Search and filter bookmarks
function applyFilters() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();

    filteredBookmarks = allBookmarks.filter(b => {
        if (!searchTerm) return true;

        return (
            b.video_title.toLowerCase().includes(searchTerm) ||
            b.channel_name.toLowerCase().includes(searchTerm) ||
            b.video_id.toLowerCase().includes(searchTerm)
        );
    });

    applySorting();
    updateStats();
    renderBookmarks();
}

// Apply sorting
function applySorting() {
    const sortBy = document.getElementById('sortBy').value;

    filteredBookmarks.sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'date-asc':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'title':
                return a.video_title.localeCompare(b.video_title);
            case 'channel':
                return a.channel_name.localeCompare(b.channel_name);
            default:
                return 0;
        }
    });
}

// Export to CSV
function exportToCSV() {
    if (allBookmarks.length === 0) {
        alert('No bookmarks to export!');
        return;
    }

    let csv = 'video_id,video_title,channel_name,timestamp_seconds,timestamp_hh_mm_ss,video_url,created_at\n';

    allBookmarks.forEach(b => {
        const row = [
            b.video_id,
            `"${b.video_title.replace(/"/g, '""')}"`,
            `"${b.channel_name.replace(/"/g, '""')}"`,
            b.timestamp_seconds,
            b.timestamp_hh_mm_ss,
            b.video_url,
            b.created_at
        ].join(',');
        csv += row + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-bookmarks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Import from CSV
function importFromCSV(file) {
    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');

            // Skip header
            const dataLines = lines.slice(1).filter(line => line.trim());

            const imported = dataLines.map(line => {
                const [video_id, video_title, channel_name, timestamp_seconds, timestamp_hh_mm_ss, video_url, created_at] = parseCSVLine(line);

                return {
                    id: generateUUID(),
                    video_id,
                    video_title: video_title.replace(/^"|"$/g, '').replace(/""/g, '"'),
                    channel_name: channel_name.replace(/^"|"$/g, '').replace(/""/g, '"'),
                    timestamp_seconds: parseInt(timestamp_seconds),
                    timestamp_hh_mm_ss,
                    video_url,
                    created_at
                };
            });

            // Merge with existing, avoiding duplicates
            const existing = new Set(
                allBookmarks.map(b => `${b.video_id}:${b.timestamp_seconds}`)
            );

            const newBookmarks = imported.filter(b =>
                !existing.has(`${b.video_id}:${b.timestamp_seconds}`)
            );

            if (newBookmarks.length === 0) {
                alert('No new bookmarks to import (all are duplicates)');
                return;
            }

            allBookmarks = [...allBookmarks, ...newBookmarks];
            await chrome.storage.local.set({ bookmarks: allBookmarks });

            alert(`Imported ${newBookmarks.length} new bookmarks!`);
            await loadBookmarks();
            applyFilters();

        } catch (error) {
            alert('Error importing CSV: ' + error.message);
        }
    };

    reader.readAsText(file);
}

// Parse CSV line (simple parser)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    return result;
}

// Clear all bookmarks
async function clearAll() {
    if (!confirm('Are you sure you want to delete ALL bookmarks? This cannot be undone!')) {
        return;
    }

    if (!confirm('Really delete everything? Consider exporting first!')) {
        return;
    }

    await chrome.storage.local.set({ bookmarks: [] });
    await loadBookmarks();
    applyFilters();
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Event listeners
document.getElementById('searchBox').addEventListener('input', applyFilters);
document.getElementById('sortBy').addEventListener('change', applyFilters);
document.getElementById('exportBtn').addEventListener('click', exportToCSV);
document.getElementById('clearAllBtn').addEventListener('click', clearAll);
document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        importFromCSV(file);
    }
});

// Select all checkbox
document.getElementById('selectAll').addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('.bookmark-checkbox');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
    updateSelectedCount();
});

// Bulk action buttons
document.getElementById('markWatchedBtn').addEventListener('click', bulkMarkWatched);
document.getElementById('markUnwatchedBtn').addEventListener('click', bulkMarkUnwatched);
document.getElementById('bulkDeleteBtn').addEventListener('click', bulkDelete);

// Listen for storage changes (real-time sync across tabs)
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.bookmarks) {
        console.log('[YT Bookmarker] Bookmarks updated in another tab, reloading...');
        loadBookmarks().then(() => {
            applyFilters();
        });
    }
});

// Load bookmarks on page load
loadBookmarks();
