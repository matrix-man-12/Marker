/**
 * CSV utility functions for bookmark import/export
 */

/**
 * Escape a value for CSV format (RFC 4180 compliant)
 */
function escapeCSV(value) {
    if (value == null) return '';
    const stringValue = String(value);

    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }

    return stringValue;
}

/**
 * Parse a CSV line handling quoted fields
 */
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

/**
 * Export bookmarks to CSV and trigger download
 */
export function exportToCSV(bookmarks) {
    if (bookmarks.length === 0) {
        alert('No bookmarks to export!');
        return;
    }

    const header = 'video_id,video_title,channel_name,timestamp_seconds,timestamp_hh_mm_ss,video_url,created_at,video_duration_seconds';

    const rows = bookmarks.map(b => {
        return [
            escapeCSV(b.video_id),
            escapeCSV(b.video_title),
            escapeCSV(b.channel_name),
            escapeCSV(b.timestamp_seconds),
            escapeCSV(b.timestamp_hh_mm_ss),
            escapeCSV(b.video_url),
            escapeCSV(b.created_at),
            escapeCSV(b.video_duration_seconds || '')
        ].join(',');
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-bookmarks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
}

/**
 * Generate a simple UUID v4
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Parse CSV file and return bookmarks array
 */
export function parseCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const dataLines = lines.slice(1).filter(line => line.trim());

                const bookmarks = dataLines.map(line => {
                    const [video_id, video_title, channel_name, timestamp_seconds, timestamp_hh_mm_ss, video_url, created_at, video_duration_seconds] = parseCSVLine(line);

                    return {
                        id: generateUUID(),
                        video_id,
                        video_title: video_title.replace(/^"|"$/g, '').replace(/""/g, '"'),
                        channel_name: channel_name.replace(/^"|"$/g, '').replace(/""/g, '"'),
                        timestamp_seconds: parseInt(timestamp_seconds) || 0,
                        timestamp_hh_mm_ss,
                        video_url,
                        created_at,
                        video_duration_seconds: video_duration_seconds ? parseInt(video_duration_seconds) : null
                    };
                });

                resolve(bookmarks);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
