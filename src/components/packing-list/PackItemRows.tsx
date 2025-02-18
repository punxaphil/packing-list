import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { UNCATEGORIZED } from '../../services/utils.ts';
import { GroupedPackItem } from '../../types/GroupedPackItem.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { DragAndDrop } from '../shared/DragAndDrop.tsx';
import { Category } from './Category.tsx';
import { PackItemRow } from './PackItemRow.tsx';

export function PackItemRows({
  grouped,
  hidden,
  filteredMembers,
}: {
  grouped: GroupedPackItem[];
  hidden?: boolean;
  filteredMembers: string[];
}) {
  const [selectedRow, setSelectedRow] = useState('');
  const [flattened, setFlattened] = useState<(PackItem | NamedEntity)[]>([]);

  useEffect(() => {
    const flattened: (PackItem | NamedEntity)[] = [];
    for (const group of grouped) {
      if (group.category) {
        flattened.push(group.category);
      }
      for (const item of group.packItems) {
        flattened.push(item);
      }
    }
    setFlattened(flattened);
  }, [grouped]);

  async function saveReorderedList(orderedList: (NamedEntity | PackItem)[]) {
    const batch = firebase.initBatch();
    let currentCategory = '';
    for (const item of orderedList) {
      const { category, packItem } = getCategoryAndPackItem(item);
      if (packItem) {
        packItem.category = currentCategory;
        firebase.updatePackItemBatch(packItem, batch);
      } else if (category) {
        if (category.id) {
          firebase.updateCategoryBatch(category, batch);
        }
        currentCategory = category.id;
      }
    }
    await batch.commit();
  }

  function getCategoryAndPackItem(entity: NamedEntity | PackItem) {
    const isPackItem = 'members' in entity;
    const category = isPackItem ? undefined : (entity as NamedEntity);
    const packItem = isPackItem ? (entity as PackItem) : undefined;
    return { category, packItem };
  }

  return (
    <>
      {!hidden && (
        <>
          <Category category={UNCATEGORIZED} hidden={!!grouped[0].category?.id} />
          <DragAndDrop
            entities={flattened}
            onEntitiesUpdated={saveReorderedList}
            renderEntity={(entity, dragHandle) => {
              const { category, packItem } = getCategoryAndPackItem(entity);
              return (
                <Box>
                  {category && (
                    <Category
                      category={category}
                      dragHandle={dragHandle}
                      onFocus={() => setSelectedRow(category.id)}
                      selected={selectedRow === category.id}
                    />
                  )}
                  {packItem && (
                    <PackItemRow
                      packItem={packItem}
                      filteredMembers={filteredMembers}
                      dragHandle={dragHandle}
                      onFocus={() => setSelectedRow(packItem.id)}
                      showControls={selectedRow === packItem.id}
                    />
                  )}
                </Box>
              );
            }}
          />
        </>
      )}
    </>
  );
}
