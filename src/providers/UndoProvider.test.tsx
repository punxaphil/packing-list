import { act, render, screen, waitFor } from '@testing-library/react';
import { WriteBatch } from 'firebase/firestore';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { writeDb } from '~/services/database.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';
import { DatabaseContext } from './DatabaseContext.ts';
import { PackingListContext } from './PackingListContext.ts';
import { useUndo } from './UndoContext.ts';
import { UndoProvider } from './UndoProvider.tsx';

const mockToast = vi.fn();

vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));
vi.mock('~/services/database.ts', () => ({
  writeDb: {
    initBatch: vi.fn(),
    addPackItemBatch: vi.fn(),
    addPackingListBatch: vi.fn(),
    updatePackItemBatch: vi.fn(),
  },
}));

const mockWriteBatch = {
  commit: vi.fn(),
} as unknown as WriteBatch;

const mockPackItem: PackItem = {
  id: 'item-1',
  name: 'Test Item',
  checked: false,
  members: [],
  category: 'category-1',
  packingList: 'packing-list-1',
  rank: 1,
};

const mockPackingList: NamedEntity = {
  id: 'packing-list-1',
  name: 'Test Packing List',
  rank: 1,
};

const mockDatabaseContext = {
  members: [],
  packItems: [mockPackItem],
  categories: [],
  images: [],
  packingLists: [],
  groupedPackItems: [],
  columns: [],
  nbrOfColumns: 1 as const,
  categoriesInPackingList: [],
  membersInPackingList: [],
  isLoadingPackItems: false,
  isFilterTransitioning: false,
  addLocalPackItem: vi.fn(),
  savePendingItems: vi.fn(),
  filter: null,
  setFilter: vi.fn(),
};

const mockPackingListContext = {
  packingList: mockPackingList,
  setPackingListId: vi.fn(),
};

function TestComponent() {
  const { canUndo, undoHistory, nextAction, addUndoAction, performUndo, getUndoDescription } = useUndo();

  return (
    <div>
      <div data-testid="can-undo">{canUndo().toString()}</div>
      <div data-testid="history-length">{undoHistory.length}</div>
      <div data-testid="next-action">{nextAction() ? nextAction()?.description : 'none'}</div>
      <div data-testid="undo-description">{getUndoDescription() || 'none'}</div>
      <button
        type="button"
        data-testid="add-delete-items"
        onClick={() =>
          addUndoAction({
            type: 'delete-items',
            description: 'Delete items',
            data: { items: [mockPackItem] },
          })
        }
      >
        Add Delete Items Action
      </button>
      <button
        type="button"
        data-testid="add-delete-checked-items"
        onClick={() =>
          addUndoAction({
            type: 'delete-checked-items',
            description: 'Delete checked items',
            data: { items: [mockPackItem] },
          })
        }
      >
        Add Delete Checked Items Action
      </button>
      <button
        type="button"
        data-testid="add-delete-packing-list"
        onClick={() =>
          addUndoAction({
            type: 'delete-packing-list',
            description: 'Delete packing list',
            data: {
              packingList: mockPackingList,
              items: [mockPackItem],
            },
          })
        }
      >
        Add Delete Packing List Action
      </button>
      <button
        type="button"
        data-testid="add-reorder-items"
        onClick={() =>
          addUndoAction({
            type: 'reorder-items',
            description: 'Reorder items',
            data: {
              originalOrder: [{ id: 'item-1', rank: 1, category: 'category-1' }],
            },
          })
        }
      >
        Add Reorder Items Action
      </button>
      <button type="button" data-testid="perform-undo" onClick={() => performUndo()}>
        Perform Undo
      </button>
    </div>
  );
}

function renderWithProviders() {
  return render(
    <DatabaseContext.Provider value={mockDatabaseContext}>
      <PackingListContext.Provider value={mockPackingListContext}>
        <UndoProvider>
          <TestComponent />
        </UndoProvider>
      </PackingListContext.Provider>
    </DatabaseContext.Provider>
  );
}

describe('UndoProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('12345678-1234-1234-1234-123456789012');
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);

    // Setup database mocks
    vi.mocked(writeDb.initBatch).mockReturnValue(mockWriteBatch);
    vi.mocked(writeDb.addPackingListBatch).mockReturnValue('new-packing-list-id');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should render with initial empty state', () => {
      renderWithProviders();

      expect(screen.getByTestId('can-undo')).toHaveTextContent('false');
      expect(screen.getByTestId('history-length')).toHaveTextContent('0');
      expect(screen.getByTestId('next-action')).toHaveTextContent('none');
      expect(screen.getByTestId('undo-description')).toHaveTextContent('none');
    });
  });

  describe('addUndoAction', () => {
    it('should add undo action to history', () => {
      renderWithProviders();

      act(() => {
        screen.getByTestId('add-delete-items').click();
      });

      expect(screen.getByTestId('can-undo')).toHaveTextContent('true');
      expect(screen.getByTestId('history-length')).toHaveTextContent('1');
      expect(screen.getByTestId('next-action')).toHaveTextContent('Delete items');
      expect(screen.getByTestId('undo-description')).toHaveTextContent('Delete items');
    });

    it('should add id and timestamp to undo action', () => {
      renderWithProviders();

      act(() => {
        screen.getByTestId('add-delete-items').click();
      });

      expect(crypto.randomUUID).toHaveBeenCalled();
      expect(Date.now).toHaveBeenCalled();
    });

    it('should limit history to MAX_UNDO_HISTORY actions', () => {
      renderWithProviders();

      // Add 22 actions (more than MAX_UNDO_HISTORY = 20)
      act(() => {
        for (let i = 0; i < 22; i++) {
          screen.getByTestId('add-delete-items').click();
        }
      });

      expect(screen.getByTestId('history-length')).toHaveTextContent('20');
    });
  });

  describe('performUndo', () => {
    it('should do nothing when no actions in history', async () => {
      renderWithProviders();

      act(() => {
        screen.getByTestId('perform-undo').click();
      });

      expect(mockToast).not.toHaveBeenCalled();
      expect(writeDb.initBatch).not.toHaveBeenCalled();
    });

    describe('delete-items action', () => {
      it('should restore deleted items', async () => {
        renderWithProviders();

        act(() => {
          screen.getByTestId('add-delete-items').click();
        });

        act(() => {
          screen.getByTestId('perform-undo').click();
        });

        await waitFor(() => {
          expect(writeDb.initBatch).toHaveBeenCalled();
          expect(writeDb.addPackItemBatch).toHaveBeenCalledWith(
            mockWriteBatch,
            mockPackItem.name,
            mockPackItem.members,
            mockPackItem.category,
            mockPackItem.rank,
            mockPackItem.packingList,
            mockPackItem.checked
          );
          expect(mockWriteBatch.commit).toHaveBeenCalled();
        });

        expect(mockToast).toHaveBeenCalledWith({
          title: 'Undone',
          description: 'Delete items has been undone',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        expect(screen.getByTestId('history-length')).toHaveTextContent('0');
      });
    });

    describe('delete-checked-items action', () => {
      it('should restore deleted checked items', async () => {
        renderWithProviders();

        act(() => {
          screen.getByTestId('add-delete-checked-items').click();
        });

        act(() => {
          screen.getByTestId('perform-undo').click();
        });

        await waitFor(() => {
          expect(writeDb.addPackItemBatch).toHaveBeenCalled();
          expect(mockWriteBatch.commit).toHaveBeenCalled();
        });
      });
    });

    describe('delete-packing-list action', () => {
      it('should restore deleted packing list and items', async () => {
        renderWithProviders();

        act(() => {
          screen.getByTestId('add-delete-packing-list').click();
        });

        act(() => {
          screen.getByTestId('perform-undo').click();
        });

        await waitFor(() => {
          expect(writeDb.initBatch).toHaveBeenCalled();
          expect(writeDb.addPackingListBatch).toHaveBeenCalledWith(
            mockPackingList.name,
            mockWriteBatch,
            mockPackingList.rank
          );
          expect(writeDb.addPackItemBatch).toHaveBeenCalledWith(
            mockWriteBatch,
            mockPackItem.name,
            mockPackItem.members,
            mockPackItem.category,
            mockPackItem.rank,
            'new-packing-list-id',
            mockPackItem.checked
          );
          expect(mockWriteBatch.commit).toHaveBeenCalled();
        });

        expect(mockPackingListContext.setPackingListId).toHaveBeenCalledWith('new-packing-list-id');
      });
    });

    describe('reorder-items action', () => {
      it('should restore item order', async () => {
        renderWithProviders();

        act(() => {
          screen.getByTestId('add-reorder-items').click();
        });

        act(() => {
          screen.getByTestId('perform-undo').click();
        });

        await waitFor(() => {
          expect(writeDb.initBatch).toHaveBeenCalled();
          expect(writeDb.updatePackItemBatch).toHaveBeenCalledWith(
            {
              ...mockPackItem,
              rank: 1,
              category: 'category-1',
            },
            mockWriteBatch
          );
          expect(mockWriteBatch.commit).toHaveBeenCalled();
        });
      });

      it('should skip items not found in current pack items', async () => {
        const customDatabaseContext = {
          ...mockDatabaseContext,
          packItems: [], // No items in current context
        };

        render(
          <DatabaseContext.Provider value={customDatabaseContext}>
            <PackingListContext.Provider value={mockPackingListContext}>
              <UndoProvider>
                <TestComponent />
              </UndoProvider>
            </PackingListContext.Provider>
          </DatabaseContext.Provider>
        );

        act(() => {
          screen.getByTestId('add-reorder-items').click();
        });

        act(() => {
          screen.getByTestId('perform-undo').click();
        });

        await waitFor(() => {
          expect(writeDb.initBatch).toHaveBeenCalled();
          expect(writeDb.updatePackItemBatch).not.toHaveBeenCalled();
          expect(mockWriteBatch.commit).toHaveBeenCalled();
        });
      });
    });

    describe('move-items action', () => {
      it('should restore item order for move action', async () => {
        renderWithProviders();

        // Add a move-items action
        act(() => {
          screen.getByTestId('add-reorder-items').click();
        });

        act(() => {
          screen.getByTestId('perform-undo').click();
        });

        await waitFor(() => {
          expect(writeDb.updatePackItemBatch).toHaveBeenCalled();
        });
      });
    });

    it('should handle errors during undo', async () => {
      vi.mocked(mockWriteBatch.commit).mockRejectedValueOnce(new Error('Database error'));

      renderWithProviders();

      act(() => {
        screen.getByTestId('add-delete-items').click();
      });

      act(() => {
        screen.getByTestId('perform-undo').click();
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Undo failed',
          description: 'Unable to undo the last action',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });

      // History should not be modified on error
      expect(screen.getByTestId('history-length')).toHaveTextContent('1');
    });

    describe('action types without required data', () => {
      it('should handle delete action without items', async () => {
        renderWithProviders();

        // Add action and undo it
        act(() => {
          screen.getByTestId('add-delete-items').click();
        });

        act(() => {
          screen.getByTestId('perform-undo').click();
        });

        await waitFor(() => {
          expect(mockToast).toHaveBeenCalledWith({
            title: 'Undone',
            description: 'Delete items has been undone',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        });
      });
    });
  });

  describe('getUndoDescription', () => {
    it('should return null when no actions in history', () => {
      renderWithProviders();

      expect(screen.getByTestId('undo-description')).toHaveTextContent('none');
    });

    it('should return description of last action', () => {
      renderWithProviders();

      act(() => {
        screen.getByTestId('add-delete-items').click();
      });

      expect(screen.getByTestId('undo-description')).toHaveTextContent('Delete items');
    });
  });

  describe('edge cases', () => {
    it('should handle all delete action types', async () => {
      renderWithProviders();

      const actionTypes = ['delete-checked-items', 'delete-category-items', 'delete-pack-item'];

      for (let i = 0; i < actionTypes.length; i++) {
        act(() => {
          screen.getByTestId('add-delete-items').click();
        });

        act(() => {
          screen.getByTestId('perform-undo').click();
        });

        await waitFor(() => {
          expect(writeDb.addPackItemBatch).toHaveBeenCalled();
        });

        vi.clearAllMocks();
      }
    });

    it('should handle empty items array in restore', async () => {
      renderWithProviders();

      act(() => {
        screen.getByTestId('add-delete-items').click();
      });

      act(() => {
        screen.getByTestId('perform-undo').click();
      });

      await waitFor(() => {
        expect(writeDb.initBatch).toHaveBeenCalled();
        expect(mockWriteBatch.commit).toHaveBeenCalled();
      });
    });
  });
});
