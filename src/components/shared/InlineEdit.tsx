import { Editable, EditableInput, EditablePreview } from '@chakra-ui/icons';
import { Input } from '@chakra-ui/react';
import { ChangeEvent, ElementType, KeyboardEvent, useState } from 'react';
import { handleEnter } from '../../services/utils.ts';

export function InlineEdit({
  value,
  onUpdate,
  strike,
  as,
  onEnter,
  onFocus,
  grow,
}: {
  value: string;
  onUpdate: (value: string) => void;
  strike?: boolean;
  as?: ElementType;
  onEnter?: () => void;
  onFocus?: () => void;
  grow?: boolean;
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
    <Editable
      defaultValue={text}
      as={as}
      flexGrow={grow ? 1 : 0}
      display="flex"
      overflow="hidden"
      onEdit={onFocus}
      selectAllOnFocus={false}
      startWithEditView={true}
    >
      <EditablePreview
        textDecoration={strike ? 'line-through' : 'none'}
        flexGrow={grow ? 1 : 0}
        textOverflow="ellipsis"
        overflow="hidden"
        whiteSpace="nowrap"
        display="inline-block"
      />
      <Input as={EditableInput} value={text} onChange={onChange} onKeyDown={onKeyDown} onBlur={() => onUpdate(text)} />
    </Editable>
  );
}
