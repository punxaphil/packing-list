import { DragHandleIcon, Icon } from '@chakra-ui/icons';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import * as React from 'react';

export function DragHandle({
  dragHandleProps,
  onMouseDown,
  disabled = false,
}: {
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  onMouseDown?: React.MouseEventHandler<SVGElement> | undefined;
  disabled?: boolean;
}) {
  // Always render the div with dragHandleProps to avoid React DND errors
  return (
    <div {...dragHandleProps}>
      <Icon
        as={DragHandleIcon}
        color={disabled ? 'gray.100' : 'gray.300'}
        mr="2"
        onMouseDown={disabled ? (e) => e.preventDefault() : onMouseDown}
        boxSize="3"
        cursor={disabled ? 'not-allowed' : 'grab'}
        pointerEvents={disabled ? 'none' : 'auto'}
      />
    </div>
  );
}
