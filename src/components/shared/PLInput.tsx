import { Input, Tooltip } from '@chakra-ui/react';
import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { handleEnter } from '../../services/utils.ts';

export function PLInput({
  value,
  onUpdate,
  strike,
  bold,
  onEnter,
  onFocus,
  disabled,
}: {
  value: string;
  onUpdate: (value: string) => void;
  strike?: boolean;
  bold?: boolean;
  onEnter?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState(value);
  const [overflowActive, setOverflowActive] = useState(false);
  const textRef = useRef<HTMLInputElement>(null);

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    handleEnter(e, () => {
      onUpdate(text);
      onEnter?.();
    });
  }

  const isOverflowActive = useCallback((event: HTMLInputElement) => {
    return event.offsetHeight < event.scrollHeight || event.offsetWidth < event.scrollWidth;
  }, []);

  useEffect(() => {
    if (textRef?.current && isOverflowActive(textRef.current)) {
      setOverflowActive(true);
      return;
    }

    setOverflowActive(false);
  }, [isOverflowActive]);

  return (
    <Tooltip label={overflowActive && text}>
      <Input
        fontWeight={bold ? 'bold' : 'normal'}
        overflow="hidden"
        textDecoration={strike ? 'line-through' : 'none'}
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        value={text}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={() => onUpdate(text)}
        variant="unstyled"
        height="32px"
        onFocus={onFocus}
        ref={textRef}
        disabled={disabled}
        fontStyle={disabled ? 'italic' : 'normal'}
        color={disabled ? 'gray.500' : 'inherit'}
      />
    </Tooltip>
  );
}
