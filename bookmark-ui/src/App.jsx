import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { BookmarkGrid } from './components/BookmarkGrid';
import { BulkActionBar } from './components/BulkActionBar';
import { ConfirmModal } from './components/ConfirmModal';
import { InfoModal } from './components/InfoModal';
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
    importBookmarks,
    bulkSetWatched,
    bulkDelete
  } = useBookmarks();

  // Selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: null,
    variant: 'danger'
  });

  // Info modal state (for import results)
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'success'
  });

  // Set initial theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('yt-bookmark-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Clear selection when exiting selection mode
  const handleToggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedIds(new Set());
    }
    setSelectionMode(!selectionMode);
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkMarkWatched = async () => {
    await bulkSetWatched(Array.from(selectedIds), true);
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleBulkMarkUnwatched = async () => {
    await bulkSetWatched(Array.from(selectedIds), false);
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleBulkDeleteRequest = () => {
    const count = selectedIds.size;
    setModalConfig({
      isOpen: true,
      title: 'Delete Bookmarks',
      message: `Are you sure you want to delete ${count} bookmark${count > 1 ? 's' : ''}? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        await bulkDelete(Array.from(selectedIds));
        setSelectedIds(new Set());
        setSelectionMode(false);
        closeModal();
      }
    });
  };

  const handleSingleDeleteRequest = (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Bookmark',
      message: 'Are you sure you want to delete this bookmark? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        await deleteBookmark(id);
        closeModal();
      }
    });
  };

  const handleCancelSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleExport = () => {
    exportToCSV(bookmarks);
  };

  const handleImport = async (file) => {
    try {
      const newBookmarks = await parseCSV(file);
      const result = await importBookmarks(newBookmarks);
      setInfoModal({
        isOpen: true,
        title: 'Import Successful',
        message: result.message,
        variant: 'success'
      });
    } catch (error) {
      setInfoModal({
        isOpen: true,
        title: 'Import Failed',
        message: 'Error importing CSV: ' + error.message,
        variant: 'danger'
      });
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
          selectionMode={selectionMode}
          onToggleSelectionMode={handleToggleSelectionMode}
        />

        <BookmarkGrid
          bookmarks={filteredBookmarks}
          onDelete={handleSingleDeleteRequest}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onSelect={handleSelect}
        />
      </main>

      {selectionMode && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          onMarkWatched={handleBulkMarkWatched}
          onMarkUnwatched={handleBulkMarkUnwatched}
          onDelete={handleBulkDeleteRequest}
          onCancel={handleCancelSelection}
        />
      )}

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        variant={modalConfig.variant}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
      />

      <InfoModal
        isOpen={infoModal.isOpen}
        title={infoModal.title}
        message={infoModal.message}
        variant={infoModal.variant}
        onClose={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default App;
