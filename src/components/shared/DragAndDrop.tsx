import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { DragDropContext, Draggable, DragUpdate, Droppable } from '@hello-pangea/dnd';

export default function DragAndDrop({
  initialEntities,
  renderEntity,
  onEntitiesUpdated,
}: {
  initialEntities: NamedEntity[];
  renderEntity: (namedEntity: NamedEntity, isDragging: boolean) => React.ReactNode;
  onEntitiesUpdated: (value: NamedEntity[]) => void;
}) {
  const [entities, setEntities] = useState<NamedEntity[]>(initialEntities);

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
    const reordered = reorder(result.source.index, result.destination.index);
    reordered.forEach((entity, index) => {
      entity.order = index;
    });
    onEntitiesUpdated(reordered);
    setEntities(reordered);
  }

  entities.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {entities.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
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
                      {renderEntity(item, snapshot.isDragging)}
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
