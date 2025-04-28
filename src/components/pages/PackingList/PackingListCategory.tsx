import { Checkbox, Flex, Image } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/styled-system';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useMemo, useState } from 'react';
import { CategoryMenu } from '~/components/pages/PackingList/CategoryMenu.tsx';
import { DragHandle } from '~/components/shared/DragHandle.tsx';
import { PLInput } from '~/components/shared/PLInput.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useNewPackItemRowId } from '~/providers/NewPackItemRowIdContext.ts';
import { useSelectMode } from '~/providers/SelectModeContext.ts';
import { writeDb } from '~/services/database.ts';
import { UNCATEGORIZED, getPackItemGroup } from '~/services/utils.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';
import { NewPackItemRow } from './NewPackItemRow.tsx';

export function PackingListCategory({
  category,
  dragHandleProps,
  sx,
}: {
  category: NamedEntity;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  sx?: SystemStyleObject;
}) {
  const { images, groupedPackItems } = useDatabase();
  const { newPackItemRowId, setNewPackItemRowId } = useNewPackItemRowId();
  const { isSelectMode } = useSelectMode();
  const [checked, setChecked] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [packItemsInCat, setPackItemsInCat] = useState<PackItem[]>([]);

  const categoryImage = useMemo(() => {
    if (category.id) {
      const image = images.find((t) => t.type === 'categories' && t.typeId === category.id);
      return image?.url;
    }
  }, [category.id, images]);

  useMemo(() => {
    const packItems = getPackItemGroup(groupedPackItems, category).packItems;
    const allPackItemsChecked = packItems.every((t) => t.checked);
    const somePackItemsChecked = packItems.some((t) => t.checked);
    setPackItemsInCat(packItems);
    setChecked(allPackItemsChecked);
    setIsIndeterminate(!allPackItemsChecked && somePackItemsChecked);
  }, [groupedPackItems, category]);

  async function onChangeCategory(name: string) {
    category.name = name;
    await writeDb.updateCategories(category);
  }

  async function toggleItem() {
    const newState = !checked;
    const batch = writeDb.initBatch();
    for (const t of packItemsInCat) {
      if (t.checked !== newState) {
        t.checked = newState;
        for (const member of t.members) {
          member.checked = newState;
        }
        writeDb.updatePackItemBatch(t, batch);
      }
    }
    await batch.commit();
    setChecked(newState);
  }

  return (
    <>
      <Flex gap="1" alignItems="center" borderTopRadius="2xl" pt="1" sx={sx} px="2" h="32px">
        {/* Always show drag handle when category has ID, but disable it in select mode */}
        {category.id && <DragHandle dragHandleProps={isSelectMode ? null : dragHandleProps} />}
        {!isSelectMode && <Checkbox isChecked={checked} isIndeterminate={isIndeterminate} onChange={toggleItem} />}
        {categoryImage && <Image borderRadius="full" boxSize="30px" src={categoryImage} mr="2" />}
        <PLInput bold={true} value={category.name} onUpdate={onChangeCategory} disabled={category === UNCATEGORIZED} />
        {!isSelectMode && <CategoryMenu packItemsInCat={packItemsInCat} category={category} />}
      </Flex>

      {!isSelectMode && newPackItemRowId === category.id && (
        <NewPackItemRow categoryId={category.id} onHide={() => setNewPackItemRowId()} />
      )}
    </>
  );
}
