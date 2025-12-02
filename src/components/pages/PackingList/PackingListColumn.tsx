import { Box, BoxProps, usePrefersReducedMotion } from '@chakra-ui/react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { motion, type Transition } from 'framer-motion';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { UNCATEGORIZED } from '~/services/utils.ts';
import { PackingListRow } from '~/types/Column.ts';
import { PackItemRow } from './PackItemRow.tsx';
import { PackingListCategory } from './PackingListCategory.tsx';

const MotionBox = motion<BoxProps>(Box);

const SPRING_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 480,
  damping: 38,
  mass: 0.6,
};
const INSTANT_TRANSITION: Transition = { duration: 0 };

type RowStyle = {
  background?: string;
};

export function PackingListColumn({
  rows,
  id,
  filteredMembers,
}: {
  rows: PackingListRow[];
  id: string;
  filteredMembers: string[];
}) {
  const categoriesInPackingList = useDatabase().categoriesInPackingList;
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableLayoutAnimation = !prefersReducedMotion;
  const transition = enableLayoutAnimation ? SPRING_TRANSITION : INSTANT_TRANSITION;

  function getRowStyle(row: PackingListRow): RowStyle {
    return { background: row.getColor(categoriesInPackingList) };
  }

  function renderUncategorizedRow(row: PackingListRow, rowStyle: RowStyle) {
    return (
      <MotionBox
        key={row.id || `uncategorized-${id}`}
        layout={enableLayoutAnimation ? 'position' : undefined}
        transition={transition}
        style={{ width: '100%' }}
      >
        <PackingListCategory category={row.category ?? UNCATEGORIZED} sx={rowStyle} />
      </MotionBox>
    );
  }

  function renderDraggableRow(row: PackingListRow, index: number, rowStyle: RowStyle) {
    return (
      <Draggable key={row.id} draggableId={row.id} index={index}>
        {(draggableProvided, snapshot) => {
          const shouldAnimate = enableLayoutAnimation && !snapshot.isDragging;
          const motionStyle = {
            ...(draggableProvided.draggableProps.style ?? {}),
            width: '100%',
          };

          return (
            <MotionBox
              ref={draggableProvided.innerRef}
              {...draggableProvided.draggableProps}
              layout={shouldAnimate ? 'position' : undefined}
              transition={shouldAnimate ? transition : INSTANT_TRANSITION}
              style={motionStyle}
            >
              {row.category && (
                <PackingListCategory
                  category={row.category}
                  dragHandleProps={draggableProvided.dragHandleProps}
                  sx={{ ...rowStyle, marginTop: index === 0 ? '0' : '1' }}
                />
              )}
              {row.packItem && (
                <PackItemRow
                  packItem={row.packItem}
                  filteredMembers={filteredMembers}
                  dragHandleProps={draggableProvided.dragHandleProps}
                  sx={rowStyle}
                  isFirstItemInCategory={index === 0}
                  isLastItemInCategory={!rows[index + 1] || !!rows[index + 1].category}
                />
              )}
            </MotionBox>
          );
        }}
      </Draggable>
    );
  }

  function renderRow(row: PackingListRow, index: number) {
    const rowStyle = getRowStyle(row);
    if (row.category === UNCATEGORIZED) {
      return renderUncategorizedRow(row, rowStyle);
    }
    return renderDraggableRow(row, index, rowStyle);
  }

  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <Box {...provided.droppableProps} ref={provided.innerRef} w="300px" minW="300px" maxW="300px">
          {rows.map((row, index) => renderRow(row, index))}
          {provided.placeholder}
        </Box>
      )}
    </Droppable>
  );
}
