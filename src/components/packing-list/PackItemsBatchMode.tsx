import { Button, Textarea } from '@chakra-ui/react';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../../services/contexts.ts';
import { useEffect, useState } from 'react';
import { NamedEntity } from '../../types/NamedEntity.ts';

function getGroupedAsText(grouped: Record<string, PackItem[]>, categories: NamedEntity[], members: NamedEntity[]) {
  return Object.entries(grouped)
    .map(([category, items]) => {
      const categoryName = categories.find((c) => c.id === category)?.name;
      const itemsAsText = items.map((item) => {
        let result = '  ' + item.name;
        if (item.members) {
          result +=
            '\n' +
            item.members
              .map((m) => {
                return '    ' + members.find((t) => t.id === m.id)?.name;
              })
              .join('\n');
        }
        return result;
      });
      return [categoryName ?? '', ...itemsAsText].join('\n');
    })
    .join('\n');
}

export function PackItemsBatchMode({ grouped }: { grouped: Record<string, PackItem[]> }) {
  const categories = useFirebase().categories;
  const members = useFirebase().members;
  const [groupedAsText, setGroupedAsText] = useState('');

  useEffect(() => {
    const text = getGroupedAsText(grouped, categories, members);
    setGroupedAsText(text);
  }, [grouped, categories, members]);

  function onSave() {}

  return (
    <>
      <Textarea placeholder="Paste your list here" value={groupedAsText} readOnly rows={20} fontFamily="monospace" />
      <Button onClick={onSave}>Save</Button>
    </>
  );
}
