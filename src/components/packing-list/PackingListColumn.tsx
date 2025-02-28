import { Box } from '@chakra-ui/react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { UNCATEGORIZED } from '../../services/utils.ts';
import { PackingListRow } from '../../types/Column.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { PackItemRow } from './PackItemRow.tsx';
import { PackingListCategory } from './PackingListCategory.tsx';

export function PackingListColumn({
  rows,
  id,
  setSelectedRow,
  selectedRow,
  filteredMembers,
}: {
  rows: PackingListRow[];
  id: string;
  setSelectedRow: (id: string) => void;
  selectedRow?: string;
  filteredMembers: string[];
}) {
  const categoriesInPackingList = useFirebase().categoriesInPackingList;
  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <Box {...provided.droppableProps} ref={provided.innerRef}>
          {rows.map((row, index) => {
            const rowStyle = { background: row.getColor(categoriesInPackingList) };
            if (row.category === UNCATEGORIZED) {
              return <PackingListCategory key={UNCATEGORIZED.name} category={row.category} sx={rowStyle} />;
            }
            return (
              <Draggable key={row.id} draggableId={row.id} index={index}>
                {(provided) => {
                  return (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                      }}
                    >
                      {row.category && (
                        <PackingListCategory
                          category={row.category}
                          dragHandleProps={provided.dragHandleProps}
                          onFocus={() => setSelectedRow(row.id)}
                          sx={{ ...rowStyle, marginTop: index === 0 ? '0' : '1' }}
                        />
                      )}
                      {row.packItem && (
                        <PackItemRow
                          packItem={row.packItem}
                          filteredMembers={filteredMembers}
                          dragHandleProps={provided.dragHandleProps}
                          onFocus={() => setSelectedRow(row.id)}
                          showControls={selectedRow === row.packItem.id}
                          unSelect={() => setSelectedRow('')}
                          sx={rowStyle}
                          isLastItemInCategory={!rows[index + 1] || !!rows[index + 1].category}
                        />
                      )}
                    </Box>
                  );
                }}
              </Draggable>
            );
          })}
          {provided.placeholder}
        </Box>
      )}
    </Droppable>
  );
}
