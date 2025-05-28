import { Box, HStack } from '@chakra-ui/react';
import { DragDropContext, DragUpdate } from '@hello-pangea/dnd';
import { useMemo } from 'react';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { NewPackItemRowIdProvider } from '~/providers/NewPackItemRowIdProvider.tsx';
import { useUndo } from '~/providers/UndoContext.ts';
import { writeDb } from '~/services/database.ts';
import { UNCATEGORIZED } from '~/services/utils.ts';
import { PackingListRow } from '~/types/Column.ts';
import { PackingListColumn } from './PackingListColumn.tsx';
import { reorder } from './packingListUtils.ts';

export function PackingListColumns({
  filteredMembers,
}: {
  filteredMembers: string[];
}) {
  const { columns: initialColumns, nbrOfColumns } = useDatabase();
  const { addUndoAction } = useUndo();
  const columns = useMemo(() => initialColumns, [initialColumns]);

  function captureOriginalOrder(rows: PackingListRow[]) {
    return rows
      .filter((row) => row.packItem)
      .map((row) => {
        const packItem = row.packItem;
        if (!packItem) {
          throw new Error('PackItem should be defined after filter');
        }
        return {
          id: packItem.id,
          rank: packItem.rank,
          category: packItem.category,
        };
      });
  }

  async function saveReorderedList(
    rows: PackingListRow[],
    originalOrder: Array<{ id: string; rank: number; category: string }>
  ) {
    const batch = writeDb.initBatch();
    let currentCategory = '';
    for (const [index, row] of rows.entries()) {
      row.setRank(rows.length - index);
      if (row.packItem) {
        row.packItem.category = currentCategory;
        writeDb.updatePackItemBatch(row.packItem, batch);
      } else if (row.category && row.category !== UNCATEGORIZED) {
        writeDb.updateCategoryBatch(row.category, batch);
        currentCategory = row.category.id;
      }
    }
    await batch.commit();

    addUndoAction({
      type: 'reorder-items',
      description: 'Reordered items',
      data: { originalOrder },
    });
  }

  async function onDragEnd(result: DragUpdate) {
    const originalOrder = captureOriginalOrder(columns.flatMap((col) => col.rows));
    const [reordered] = reorder(result, columns, nbrOfColumns);
    if (reordered) {
      await saveReorderedList(reordered, originalOrder);
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <HStack alignItems="start" justifyContent="center">
        <NewPackItemRowIdProvider>
          {columns.map(({ key, rows }) => {
            return (
              <Box key={key}>
                <PackingListColumn id={key} rows={rows} filteredMembers={filteredMembers} />
              </Box>
            );
          })}
        </NewPackItemRowIdProvider>
      </HStack>
    </DragDropContext>
  );
}
