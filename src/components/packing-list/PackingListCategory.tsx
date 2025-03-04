import { Checkbox, Flex, Image, useDisclosure, useToast } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/styled-system';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useMemo, useState } from 'react';
import { AiOutlineCopy, AiOutlineDelete } from 'react-icons/ai';
import { TbCategoryPlus } from 'react-icons/tb';
import { firebase } from '../../services/firebase.ts';
import { UNCATEGORIZED, getPackItemGroup } from '../../services/utils.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';
import { ColorPicker } from '../shared/ColorPicker.tsx';
import { DeleteDialog } from '../shared/DeleteDialog.tsx';
import { DragHandle } from '../shared/DragHandle.tsx';
import { IconSelect } from '../shared/IconSelect.tsx';
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
  const { images, groupedPackItems, packingLists } = useFirebase();
  const [addNewPackItem, setAddNewPackItem] = useState(false);
  const [hideIcons, setHideIcons] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [packItems, setPackItems] = useState<PackItem[]>([]);
  const { packingListId } = usePackingListId();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    setPackItems(packItems);
    setChecked(allPackItemsChecked);
    setIsIndeterminate(!allPackItemsChecked && somePackItemsChecked);
  }, [groupedPackItems, category]);

  async function onChangeCategory(name: string) {
    setHideIcons(false);
    category.name = name;
    await firebase.updateCategories(category);
  }

  async function toggleItem() {
    const newState = !checked;
    const batch = firebase.initBatch();
    for (const t of packItems) {
      if (t.checked !== newState) {
        t.checked = newState;
        for (const member of t.members) {
          member.checked = newState;
        }
        firebase.updatePackItemBatch(t, batch);
      }
    }
    await batch.commit();
    setChecked(newState);
  }

  async function copyToOtherList(id: string, name: string) {
    const batch = firebase.initBatch();
    for (const packItem of packItems) {
      if (packItem.category === category.id) {
        firebase.addPackItemBatch(batch, packItem.name, packItem.members, packItem.category, packItem.rank, id);
      }
    }
    await batch.commit();
    toast({
      title: `Category ${category.name} copied to ${name}`,
      status: 'success',
    });
  }

  async function onConfirmDelete() {
    const batch = firebase.initBatch();
    for (const packItem of packItems) {
      if (packItem.category === category.id) {
        firebase.deletePackItemBatch(packItem.id, batch);
      }
    }
    await batch.commit();
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
          disabled={category === UNCATEGORIZED}
        />
        {!hideIcons && (
          <>
            <PLIconButton
              aria-label="Add new pack item to category"
              icon={<TbCategoryPlus />}
              onClick={() => setAddNewPackItem(true)}
              ml="1"
            />
            <IconSelect
              label="Copy to other list"
              icon={<AiOutlineCopy />}
              items={packingLists.filter((l) => l.id !== packingListId)}
              onClick={copyToOtherList}
              size="sm"
            />
            <PLIconButton onClick={onOpen} icon={<AiOutlineDelete />} aria-label="Delete items in category" />
            {category.id && <ColorPicker category={category} />}
          </>
        )}
      </Flex>
      <DeleteDialog text={`category ${category.name}`} onConfirm={onConfirmDelete} onClose={onClose} isOpen={isOpen} />
      {addNewPackItem && <NewPackItemRow categoryId={category.id} onHide={() => setAddNewPackItem(false)} />}
    </>
  );
}
