import { Input, Tooltip } from '@chakra-ui/react';
import { type ChangeEvent, type KeyboardEvent, type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { handleEnter } from '~/services/utils.ts';

const enterPressedRef = { current: false };

export function PLInput({
  value,
  onUpdate,
  strike,
  bold,
  onEnter,
  disabled,
  focusOnEnterRef,
}: {
  value: string;
  onUpdate: (value: string) => void;
  strike?: boolean;
  bold?: boolean;
  onEnter?: () => void;
  disabled?: boolean;
  focusOnEnterRef?: RefObject<HTMLInputElement | null>;
}) {
  const [text, setText] = useState(value);
  const [overflowActive, setOverflowActive] = useState(false);
  const textRef = useRef<HTMLInputElement>(null);

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    handleEnter(e, () => {
      enterPressedRef.current = true;
      onUpdate(text.trim());
      if (focusOnEnterRef?.current) {
        focusOnEnterRef.current.focus();
      }
      onEnter?.();
      setTimeout(() => {
        enterPressedRef.current = false;
      }, 0);
    });
  }

  function handleBlur() {
    if (enterPressedRef.current) {
      return;
    }
    onUpdate(text.trim());
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
        onBlur={handleBlur}
        variant="unstyled"
        height="32px"
        ref={textRef}
        disabled={disabled}
        fontStyle={disabled ? 'italic' : 'normal'}
        color={disabled ? 'gray.500' : 'inherit'}
      />
    </Tooltip>
  );
}
