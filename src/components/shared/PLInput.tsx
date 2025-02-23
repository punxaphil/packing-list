import { Input } from '@chakra-ui/react';
import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { handleEnter } from '../../services/utils.ts';

export function PLInput({
  value,
  onUpdate,
  strike,
  bold,
  onEnter,
  onFocus,
}: {
  value: string;
  onUpdate: (value: string) => void;
  strike?: boolean;
  bold?: boolean;
  onEnter?: () => void;
  onFocus?: () => void;
}) {
  const [text, setText] = useState(value);

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    handleEnter(e, () => {
      onUpdate(text);
      onEnter?.();
    });
  }
  return (
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
    />
  );
}
