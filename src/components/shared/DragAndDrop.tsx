import { DragHandleIcon } from '@chakra-ui/icons';
import { Box, SystemStyleObject } from '@chakra-ui/react';
import { DragDropContext, DragUpdate, Draggable, Droppable } from '@hello-pangea/dnd';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { Rankable } from '../../types/Rankable.ts';

export function DragAndDrop<K extends Rankable>({
  entities,
  renderEntity,
  onEntitiesUpdated,
  styleOnDomNodeChange,
}: {
  entities: K[];
  renderEntity: (entity: K, dragHandle: ReactElement) => ReactNode;
  onEntitiesUpdated: (value: K[]) => void;
  styleOnDomNodeChange?: (isOverflow: boolean) => SystemStyleObject;
}) {
  const [reordered, setReordered] = useState(entities);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    setReordered(entities);
  }, [entities]);

  function reorder(startIndex: number, endIndex: number) {
    const result = [...entities];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  function onDragEnd(result: DragUpdate) {
    if (!result.destination) {
      return;
    }
    const updated = reorder(result.source.index, result.destination.index);
    updated.forEach((entity, index) => {
      entity.rank = updated.length - index;
    });
    onEntitiesUpdated(updated);
    setReordered(updated);
  }

  const handleDomNodeChange = (domNode: HTMLDivElement | null) => {
    if (domNode) {
      setIsOverflow(domNode?.scrollHeight > document.documentElement.clientHeight);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <Box {...provided.droppableProps} ref={provided.innerRef} sx={styleOnDomNodeChange?.(isOverflow)}>
            <Box ref={handleDomNodeChange}>
              {reordered.map((entity, index) => (
                <Draggable key={entity.id} draggableId={entity.id} index={index}>
                  {(provided, snapshot) => {
                    const dragHandle = (
                      <div {...provided.dragHandleProps}>
                        <DragHandleIcon color="gray.300" mr="2" />
                      </div>
                    );
                    return (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          padding: '1px',
                        }}
                        bg={snapshot.isDragging ? 'gray.100' : ''}
                      >
                        {renderEntity(entity, dragHandle)}
                      </Box>
                    );
                  }}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
}
