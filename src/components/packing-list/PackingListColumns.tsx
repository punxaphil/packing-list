import { Box, HStack } from '@chakra-ui/react';
import { DragDropContext, DragUpdate } from '@hello-pangea/dnd';
import { useMemo } from 'react';
import { firebase } from '../../services/firebase.ts';
import { UNCATEGORIZED } from '../../services/utils.ts';
import { PackingListRow } from '../../types/Column.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { PackingListColumn } from './PackingListColumn.tsx';
import { reorder } from './packingListUtils.ts';

export function PackingListColumns({
  filteredMembers,
}: {
  filteredMembers: string[];
}) {
  const { columns: initialColumns, nbrOfColumns } = useFirebase();

  const columns = useMemo(() => initialColumns, [initialColumns]);
  async function saveReorderedList(rows: PackingListRow[]) {
    const batch = firebase.initBatch();
    let currentCategory = '';
    for (const [index, row] of rows.entries()) {
      row.setRank(rows.length - index);
      if (row.packItem) {
        row.packItem.category = currentCategory;
        firebase.updatePackItemBatch(row.packItem, batch);
      } else if (row.category && row.category !== UNCATEGORIZED) {
        firebase.updateCategoryBatch(row.category, batch);
        currentCategory = row.category.id;
      }
    }
    await batch.commit();
  }

  async function onDragEnd(result: DragUpdate) {
    const [reordered] = reorder(result, columns, nbrOfColumns);
    if (reordered) {
      await saveReorderedList(reordered);
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <HStack alignItems="start" justifyContent="center">
        {columns.map(({ key, rows }) => {
          return (
            <Box key={key}>
              <PackingListColumn id={key} rows={rows} filteredMembers={filteredMembers} />
            </Box>
          );
        })}
      </HStack>
    </DragDropContext>
  );
}
