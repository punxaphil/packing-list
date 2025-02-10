import { Editable, EditableInput, EditablePreview } from '@chakra-ui/icons';
import { ChangeEvent, ElementType, KeyboardEvent, useState } from 'react';
import { handleEnter } from '../../services/utils.ts';

export function InlineEdit({
  value,
  onUpdate,
  strike,
  as,
}: {
  value: string;
  onUpdate: (value: string) => void;
  strike?: boolean;
  as?: ElementType;
}) {
  const [text, setText] = useState(value);

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
  }

  function onEnter(e: KeyboardEvent<HTMLInputElement>) {
    handleEnter(e, () => onUpdate(text));
  }
  return (
    <Editable defaultValue={text} as={as}>
      <EditablePreview textDecoration={strike ? 'line-through' : 'none'} />
      <EditableInput value={text} onChange={onChange} onKeyDown={onEnter} onBlur={() => onUpdate(text)} />
    </Editable>
  );
}
