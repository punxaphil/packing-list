import { Box, Checkbox, CheckboxProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

/**
 * A component that functions like a checkbox but has a radio button appearance
 */
export const RadioCheckbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  const { colorScheme = 'blue', ...rest } = props;

  return (
    <Checkbox
      ref={ref}
      {...rest}
      icon={<RadioIcon />}
      sx={{
        // Target the span that contains the "box" part of the checkbox
        '& > span:first-of-type': {
          borderRadius: '50%', // Make the checkbox round like a radio button
          borderWidth: '2px', // Slightly thicker border for radio-like appearance
          bg: 'transparent', // Ensure background is transparent when checked

          // When checked, don't fill the entire circle with color
          _checked: {
            bg: 'white', // Keep background white when checked
            borderColor: `${colorScheme}.500`, // Colored border
            color: `${colorScheme}.500`, // Color for the inner dot
          },
        },
      }}
    />
  );
});

// Custom icon component that creates a dot in the center rather than filling the whole checkbox
function RadioIcon() {
  return (
    <Box
      w="8px"
      h="8px"
      bg="currentColor"
      borderRadius="50%"
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
    />
  );
}
