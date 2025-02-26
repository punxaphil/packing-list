import { Checkbox, Flex, Image } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/styled-system';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useMemo, useState } from 'react';
import { TbCategoryPlus } from 'react-icons/tb';
import { firebase } from '../../services/firebase.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { ColorPicker } from '../shared/ColorPicker.tsx';
import { DragHandle } from '../shared/DragHandle.tsx';
import { PLIconButton } from '../shared/PLIconButton.tsx';
import { PLInput } from '../shared/PLInput.tsx';
import { NewPackItemRow } from './NewPackItemRow.tsx';

export function PackingListCategory({
  category,
  dragHandleProps,
  onFocus,
  sx,
}: {
  category: NamedEntity;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  onFocus?: () => void;
  sx?: SystemStyleObject;
}) {
  const images = useFirebase().images;
  const grouped = useFirebase().groupedPackItems;
  const [addNewPackItem, setAddNewPackItem] = useState(false);
  const [hideIcons, setHideIcons] = useState(false);

  const [checked, setChecked] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);

  useMemo(() => {
    const packItems = grouped?.find((t) => t.category?.id === category.id)?.packItems;
    const allPackItemsChecked = !!packItems?.every((t) => t.checked);
    const somePackItemsChecked = !!packItems?.some((t) => t.checked);
    setChecked(allPackItemsChecked);
    setIsIndeterminate(!allPackItemsChecked && somePackItemsChecked);
  }, [grouped, category]);

  async function onChangeCategory(name: string) {
    setHideIcons(false);
    category.name = name;
    await firebase.updateCategories(category);
  }

  function getCategoryImage() {
    if (category.id) {
      const image = images.find((t) => t.type === 'categories' && t.typeId === category.id);
      return image?.url;
    }
  }

  const categoryImage = getCategoryImage();

  async function toggleItem() {
    const newState = !checked;
    const group = grouped?.find((t) => {
      if (!category.id) {
        return !t.category?.id;
      }
      return t.category?.id === category.id;
    });
    if (!group) {
      return;
    }
    const batch = firebase.initBatch();
    for (const t of group.packItems) {
      if (t.checked === newState) {
        continue;
      }
      t.checked = newState;
      for (const member of t.members) {
        member.checked = t.checked;
      }
      firebase.updatePackItemBatch(t, batch);
    }
    await batch.commit();

    setChecked(newState);
  }

  return (
    <>
      <Flex gap="1" alignItems="center" borderTopRadius="2xl" pt="1" sx={sx} px="2" h="32px">
        {category.id && <DragHandle dragHandleProps={dragHandleProps} />}
        <Checkbox isChecked={checked} isIndeterminate={isIndeterminate} onChange={toggleItem} />
        {categoryImage && <Image borderRadius="full" boxSize="30px" src={categoryImage} mr="2" />}
        <PLInput
          bold={true}
          value={category.name}
          onUpdate={onChangeCategory}
          onFocus={() => {
            setHideIcons(true);
            onFocus?.();
          }}
          disabled={!category.id}
        />
        {!hideIcons && (
          <>
            <PLIconButton
              aria-label="Add new pack item to category"
              icon={<TbCategoryPlus />}
              onClick={() => setAddNewPackItem(true)}
              ml="1"
            />
            {category.id && <ColorPicker category={category} />}
          </>
        )}
      </Flex>
      {addNewPackItem && <NewPackItemRow categoryId={category.id} onHide={() => setAddNewPackItem(false)} />}
    </>
  );
}
