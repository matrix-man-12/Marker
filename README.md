# YouTube Bookmarker 📚

A privacy-focused Chrome extension to bookmark YouTube videos at specific timestamps with a simple keyboard shortcut.

## Features ✨

- **⌨️ Keyboard Shortcut**: Press `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac) to instantly bookmark any YouTube video at the current timestamp
- **🔍 Search & Filter**: Powerful search across titles, channels, and video IDs
- **📊 Sort Options**: Sort by date, title, or channel name
- **🗑️ Easy Management**: Delete individual bookmarks or clear all
- **📥 Export to CSV**: Download all bookmarks as a standard CSV file
- **📤 Import from CSV**: Import bookmarks from CSV files
- **🎨 Beautiful UI**: Modern, gradient-based design with smooth animations
- **🖼️ YouTube Thumbnails**: Visual preview of bookmarked videos
- **🔒 Privacy-First**: All data stored locally in your browser (chrome.storage.local)
- **⚡ Instant Access**: No file picker prompts, no permission hassles

## Installation 🚀

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension folder

## Usage 📖

### Creating Bookmarks

1. Navigate to any YouTube video
2. Play to the timestamp you want to bookmark
3. Press `Ctrl+Shift+L` (Windows/Linux) or `Cmd+Shift+L` (Mac)
4. Bookmark saved! ✅

### Viewing Bookmarks

**Quick Access (Popup):**
- Click the extension icon in your Chrome toolbar
- See total bookmark count and recent 5 bookmarks
- Click any bookmark to open the video at that timestamp

**Full Management:**
- Click "View All" in the popup, or
- Right-click the extension icon → Options
- Access the full bookmarks management page with:
  - Search functionality
  - Sort options
  - Delete individual bookmarks
  - Export/import CSV

### Exporting Data

1. Click the extension icon
2. Click "Export CSV" button
3. Choose where to save the file
4. Open in Excel, Google Sheets, or any CSV editor

### Importing Data

1. Open the bookmarks management page
2. Click "Import CSV" button
3. Select your CSV file
4. Duplicates are automatically detected and skipped

## Data Format 📄

The extension uses chrome.storage.local with the following structure:

```javascript
{
  bookmarks: [
    {
      id: "uuid-here",
      video_id: "dQw4w9WgXcQ",
      video_title: "Video Title",
      channel_name: "Channel Name",
      timestamp_seconds: 42,
      timestamp_hh_mm_ss: "00:00:42",
      video_url: "https://youtube.com/watch?v=...",
      created_at: "2026-02-01T00:20:34+05:30"
    }
  ]
}
```

CSV export format:
```csv
video_id,video_title,channel_name,timestamp_seconds,timestamp_hh_mm_ss,video_url,created_at
```

## Storage Information 💾

- **Storage Type**: chrome.storage.local (unlimited quota with Chrome extension storage)
- **Capacity**: Practically unlimited (~60% of available disk space)
- **Single Bookmark Size**: ~250 bytes
- **10 MB can store**: ~40,000 bookmarks (10+ years of daily use)
- **Data Location**: Chrome's internal database (local to your computer)
- **Privacy**: 100% local, no sync, no cloud, no sharing

## Keyboard Shortcuts ⌨️

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Bookmark Video | `Ctrl+Shift+L` | `Cmd+Shift+L` |

You can customize this shortcut in `chrome://extensions/shortcuts`

## Permissions Requested 🔐

- **activeTab**: To detect YouTube pages and extract video metadata
- **storage**: To save bookmarks locally
- **host_permissions** (`youtube.com`): To run content script on YouTube pages

## Privacy & Security 🛡️

- ✅ **100% Local**: All data stays on your computer
- ✅ **No Tracking**: Zero analytics or telemetry
- ✅ **No Network**: Extension never makes external requests
- ✅ **No Cloud Sync**: Your data is yours alone
- ✅ **Open Source**: Review the code yourself!

## Development 🛠️

### Project Structure

```
YT-Bookmark/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (bookmark storage logic)
├── content.js             # YouTube page integration
├── utils.js               # Utility functions (CSV, timestamps, UUID)
├── popup.html/js          # Extension icon popup
├── bookmarks.html/js      # Full bookmark management page
└── icons/                 # Extension icons
```

### Tech Stack

- **Manifest V3**: Latest Chrome extension format
- **Vanilla JavaScript**: No frameworks, pure performance
- **chrome.storage.local**: For reliable local storage
- **File System Access API**: For CSV export/import
- **Gradient CSS**: Modern, beautiful UI

## Changelog 📝

### Version 2.0.0 (Current)
- **MAJOR REFACTOR**: Switched from File System Access API to chrome.storage.local
- ✅ Removed file picker prompts (now instant saves)
- ✅ Added popup UI with stats and recent bookmarks
- ✅ Added full bookmark management page
- ✅ Added search and filter functionality
- ✅ Added sort options (date, title, channel)
- ✅ Added delete individual bookmarks
- ✅ Added CSV export/import
- ✅ Added YouTube thumbnail previews
- ✅ Simplified codebase (350 lines → 110 lines for core logic)
- ✅ Better UX with no permission issues

### Version 1.0.0
- Initial MVP with File System Access API
- Keyboard shortcut bookmarking
- Direct CSV file writes
- Duplicate detection

## Troubleshooting 🔧

**Shortcut not working?**
- Make sure you're on a YouTube video page
- Check `chrome://extensions/shortcuts` to verify the shortcut isn't conflicting
- Reload the extension

**Bookmarks not showing?**
- Click the extension icon to verify bookmark count
- Check browser console for errors (F12)

**CSV import failed?**
- Ensure CSV follows the correct format (see Data Format section)
- Check for special characters in quotes

## Contributing 🤝

This is an MVP project. Feel free to:
- Report issues
- Suggest features
- Submit pull requests

## License 📜

MIT License - Feel free to use, modify, and distribute!

## Credits 👏

Built with ❤️ for YouTube power users who want control over their data.

---

**Enjoy bookmarking!** 🎉
