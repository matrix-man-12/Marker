import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
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

  // Tab state
  const [activeTab, setActiveTab] = useState('unwatched');

  // Group by date toggle
  const [groupByDate, setGroupByDate] = useState(false);

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

  // Tab counts (computed from filtered bookmarks, i.e. after search)
  const tabCounts = useMemo(() => {
    const watched = filteredBookmarks.filter(b => b.watched).length;
    const unwatched = filteredBookmarks.filter(b => !b.watched).length;
    return {
      all: filteredBookmarks.length,
      watched,
      unwatched,
    };
  }, [filteredBookmarks]);

  // Bookmarks to display based on active tab
  const displayedBookmarks = useMemo(() => {
    if (activeTab === 'watched') return filteredBookmarks.filter(b => b.watched);
    if (activeTab === 'unwatched') return filteredBookmarks.filter(b => !b.watched);
    return filteredBookmarks;
  }, [filteredBookmarks, activeTab]);

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

  const handleSelectAll = () => {
    const allIds = new Set(displayedBookmarks.map(b => b.id));
    setSelectedIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
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
        <div className="toolbar-row">
          <TabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={tabCounts}
          />
          <StatsBar
            sortOption={sortOption}
            onSortChange={setSortOption}
            selectionMode={selectionMode}
            onToggleSelectionMode={handleToggleSelectionMode}
            groupByDate={groupByDate}
            onToggleGroupByDate={() => setGroupByDate(!groupByDate)}
          />
        </div>


        <BookmarkGrid
          bookmarks={displayedBookmarks}
          onDelete={handleSingleDeleteRequest}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          groupByDate={groupByDate}
        />
      </main>

      {selectionMode && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          totalCount={displayedBookmarks.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
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
