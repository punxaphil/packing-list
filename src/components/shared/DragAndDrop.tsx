import { Box } from '@chakra-ui/react';
import { DragDropContext, DragUpdate, Draggable, Droppable } from '@hello-pangea/dnd';
import { ReactNode, useEffect, useState } from 'react';
import { Rankable } from '../../types/Rankable.ts';

export function DragAndDrop<K extends Rankable>({
  entities,
  renderEntity,
  onEntitiesUpdated,
}: {
  entities: K[];
  renderEntity: (entity: K, isDragging: boolean) => ReactNode;
  onEntitiesUpdated: (value: K[]) => void;
}) {
  const [reordered, setReordered] = useState(entities);

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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {reordered.map((entity, index) => (
              <Draggable key={entity.id} draggableId={entity.id} index={index}>
                {(provided, snapshot) => {
                  return (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        padding: '1px',
                      }}
                    >
                      {renderEntity(entity, snapshot.isDragging)}
                    </Box>
                  );
                }}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
