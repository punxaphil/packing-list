import { Box, HStack, useMediaQuery } from '@chakra-ui/react';
import { DragDropContext, DragUpdate } from '@hello-pangea/dnd';
import { useMemo, useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { UNCATEGORIZED } from '../../services/utils.ts';
import { COLUMN_COLORS, ColumnList, PackingListRow } from '../../types/Column.ts';
import { GroupedPackItem } from '../../types/GroupedPackItem.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { PackingListCategory } from './PackingListCategory.tsx';
import { PackingListColumn } from './PackingListColumn.tsx';
import { MEDIA_QUERIES, createColumns, flattenGroupedPackItems, reorder } from './packingListUtils.ts';

export function PackingListColumns({
  grouped,
  filteredMembers,
}: {
  grouped: GroupedPackItem[];
  filteredMembers: string[];
}) {
  const [selectedRow, setSelectedRow] = useState('');
  const [columns, setColumns] = useState<ColumnList[]>([]);
  const [isMin800px, isMin1200px] = useMediaQuery(MEDIA_QUERIES);
  const nbrOfColumns = isMin1200px ? 3 : isMin800px ? 2 : 1;
  const categories = useFirebase().categories;
  const packItems = useFirebase().packItems;

  useMemo(() => {
    const flattened = flattenGroupedPackItems(grouped);
    const columns = createColumns(flattened, nbrOfColumns);
    setColumns(columns);
  }, [grouped, nbrOfColumns]);
  const usedCategories = useMemo(() => {
    return categories
      .filter((c) => {
        return packItems.some((p) => p.category === c.id);
      })
      .map((c) => c.id);
  }, [categories, packItems]);

  async function saveReorderedList(rows: PackingListRow[]) {
    const batch = firebase.initBatch();
    let currentCategory = '';
    for (const [index, row] of rows.entries()) {
      row.setRank(rows.length - index);
      if (row.packItem) {
        row.packItem.category = currentCategory;
        firebase.updatePackItemBatch(row.packItem, batch);
      } else if (row.category) {
        if (row.category.id) {
          firebase.updateCategoryBatch(row.category, batch);
        }
        currentCategory = row.category.id;
      }
    }
    await batch.commit();
  }

  async function onDragEnd(result: DragUpdate) {
    const [reordered, newColumns] = reorder(result, columns, nbrOfColumns);
    if (reordered) {
      await saveReorderedList(reordered);
      setColumns(newColumns);
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <HStack alignItems="start" justifyContent="center">
        {columns.map(({ key, rows }) => {
          const packItem = rows[0].packItem;
          return (
            <Box key={key}>
              {key === columns[0].key && packItem && !packItem.category && (
                <PackingListCategory category={UNCATEGORIZED} sx={{ background: COLUMN_COLORS[0] }} />
              )}
              <PackingListColumn
                id={key}
                rows={rows}
                setSelectedRow={setSelectedRow}
                selectedRow={selectedRow}
                filteredMembers={filteredMembers}
                usedCategories={usedCategories}
              />
            </Box>
          );
        })}
      </HStack>
    </DragDropContext>
  );
}
