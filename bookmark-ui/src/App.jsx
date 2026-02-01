import { useEffect } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { BookmarkGrid } from './components/BookmarkGrid';
import { useBookmarks } from './hooks/useBookmarks';
import { exportToCSV, parseCSV } from './utils/csv';
import './App.css';

function App() {
  const {
    bookmarks,
    filteredBookmarks,
    loading,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    deleteBookmark,
    importBookmarks
  } = useBookmarks();

  // Set initial theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('yt-bookmark-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleExport = () => {
    exportToCSV(bookmarks);
  };

  const handleImport = async (file) => {
    try {
      const newBookmarks = await parseCSV(file);
      const result = await importBookmarks(newBookmarks);
      alert(result.message);
    } catch (error) {
      alert('Error importing CSV: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={handleExport}
        onImport={handleImport}
      />

      <main className="main-content">
        <StatsBar
          total={bookmarks.length}
          showing={filteredBookmarks.length}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />

        <BookmarkGrid
          bookmarks={filteredBookmarks}
          onDelete={deleteBookmark}
        />
      </main>
    </div>
  );
}

export default App;
