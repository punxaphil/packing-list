import { MenuItem } from '@chakra-ui/icons';
import { useDisclosure, useToast } from '@chakra-ui/react';
import type { WriteBatch } from 'firebase/firestore';
import { AiOutlineCopy, AiOutlineDelete } from 'react-icons/ai';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { TbCategoryPlus, TbSortAscending } from 'react-icons/tb';
import { DeleteDialog } from '~/components/shared/DeleteDialog.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useNewPackItemRowId } from '~/providers/NewPackItemRowIdContext.ts';
import { useUndo } from '~/providers/UndoContext.ts';
import { writeDb } from '~/services/database.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';
import { ColorPicker } from './ColorPicker.tsx';
import { ContextMenu } from './ContextMenu.tsx';
import { CopyToOtherListModal } from './CopyToOtherListModal.tsx';

export function CategoryMenu({
  packItemsInCat,
  category,
}: {
  packItemsInCat: PackItem[];
  category: NamedEntity;
}) {
  const { setNewPackItemRowId } = useNewPackItemRowId();
  const { packingLists } = useDatabase();
  const { addUndoAction } = useUndo();
  const copyDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const colorDisclosure = useDisclosure();
  const toast = useToast();

  function copyToOtherList() {
    copyDisclosure.onOpen();
  }

  async function onConfirmDelete() {
    const itemsToDelete = packItemsInCat.filter((packItem) => packItem.category === category.id);
    const deletedItems = [...itemsToDelete];

    const batch = writeDb.initBatch();
    for (const packItem of packItemsInCat) {
      if (packItem.category === category.id) {
        writeDb.deletePackItemBatch(packItem.id, batch);
      }
    }
    await batch.commit();

    addUndoAction({
      type: 'delete-category-items',
      description: `Deleted ${deletedItems.length} items in category ${category.name}`,
      data: { items: deletedItems },
    });

    toast({
      title: `Deleted ${deletedItems.length} items in category ${category.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }

  function getSortedItems(items: PackItem[]) {
    return [...items].sort((a, b) => a.name.localeCompare(b.name, 'sv-SE', { numeric: true, caseFirst: 'lower' }));
  }

  function updateItemsWithRanks(sortedItems: PackItem[], batch: WriteBatch) {
    let rank = sortedItems.length;
    for (const item of sortedItems) {
      const updatedItem = { ...item, rank };
      writeDb.updatePackItemBatch(updatedItem, batch);
      rank--;
    }
  }

  async function sortAlphabetically() {
    const itemsToSort = packItemsInCat.filter((packItem) => packItem.category === category.id);

    if (itemsToSort.length <= 1) {
      return;
    }

    const sortedItems = getSortedItems(itemsToSort);
    const batch = writeDb.initBatch();

    updateItemsWithRanks(sortedItems, batch);
    await batch.commit();

    toast({
      title: `Sorted ${sortedItems.length} items alphabetically in ${category.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }

  return (
    <ContextMenu title="Category actions">
      <MenuItem key="add" onClick={() => setNewPackItemRowId(category.id)} icon={<TbCategoryPlus />}>
        Add new pack item
      </MenuItem>
      {packingLists.length > 1 && (
        <MenuItem key="copy" onClick={copyToOtherList} icon={<AiOutlineCopy />}>
          Copy items to another list
        </MenuItem>
      )}
      <MenuItem key="delete" icon={<AiOutlineDelete />} onClick={deleteDisclosure.onOpen}>
        Remove items
      </MenuItem>
      <MenuItem key="color" icon={<IoColorPaletteOutline />} onClick={colorDisclosure.onOpen}>
        Set color
      </MenuItem>
      <MenuItem key="sort" icon={<TbSortAscending />} onClick={sortAlphabetically}>
        Sort alphabetically
      </MenuItem>

      <CopyToOtherListModal
        isOpen={copyDisclosure.isOpen}
        onClose={copyDisclosure.onClose}
        packItemsInCat={packItemsInCat}
        category={category}
      />
      <DeleteDialog
        text={`items in category ${category.name}`}
        onConfirm={onConfirmDelete}
        onClose={deleteDisclosure.onClose}
        isOpen={deleteDisclosure.isOpen}
      />
      <ColorPicker category={category} isOpen={colorDisclosure.isOpen} onClose={colorDisclosure.onClose} />
    </ContextMenu>
  );
}
