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
  return (
    <div {...(disabled ? {} : dragHandleProps)}>
      <Icon 
        as={DragHandleIcon} 
        color={disabled ? "gray.100" : "gray.300"} 
        mr="2" 
        onMouseDown={disabled ? undefined : onMouseDown} 
        boxSize="3" 
        cursor={disabled ? "not-allowed" : "grab"} 
      />
    </div>
  );
}
