import { DragHandleIcon, Icon } from '@chakra-ui/icons';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import * as React from 'react';

export function DragHandle({
  dragHandleProps,
  onMouseDown,
}: {
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  onMouseDown?: React.MouseEventHandler<SVGElement> | undefined;
}) {
  return (
    <div {...dragHandleProps}>
      <Icon as={DragHandleIcon} color="gray.300" mr="2" onMouseDown={onMouseDown} boxSize="3" />
    </div>
  );
}
