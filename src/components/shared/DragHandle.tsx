import { DragHandleIcon, Icon } from '@chakra-ui/icons';
import { Box } from '@chakra-ui/react';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import * as React from 'react';

export function DragHandle({
  dragHandleProps,
  onMouseDown,
  disabled = false,
  onDisabledMouseDown,
}: {
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  onMouseDown?: React.MouseEventHandler<SVGElement> | undefined;
  disabled?: boolean;
  onDisabledMouseDown?: () => void;
}) {
  function handleMouseDown(e: React.MouseEvent) {
    if (disabled && onDisabledMouseDown) {
      e.preventDefault();
      onDisabledMouseDown();
    }
  }

  return (
    <div {...dragHandleProps}>
      <Box as={disabled ? 'button' : 'span'} onMouseDown={handleMouseDown} display="flex" alignItems="center">
        <Icon
          as={DragHandleIcon}
          color={disabled ? 'gray.100' : 'gray.300'}
          mr="2"
          onMouseDown={disabled ? (e) => e.preventDefault() : onMouseDown}
          boxSize="3"
          cursor={disabled ? 'not-allowed' : 'grab'}
        />
      </Box>
    </div>
  );
}
