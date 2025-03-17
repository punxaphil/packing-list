import { MenuItem } from '@chakra-ui/icons';
import { useDisclosure } from '@chakra-ui/react';
import { AiOutlineCopy, AiOutlineDelete } from 'react-icons/ai';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { TbCategoryPlus } from 'react-icons/tb';
import { DeleteDialog } from '~/components/shared/DeleteDialog.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useNewPackItemRowId } from '~/providers/NewPackItemRowIdContext.ts';
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
  const { packingLists, dbInvoke } = useDatabase();
  const copyDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const colorDisclosure = useDisclosure();

  function copyToOtherList() {
    copyDisclosure.onOpen();
  }

  async function onConfirmDelete() {
    const batch = dbInvoke.initBatch();
    for (const packItem of packItemsInCat) {
      if (packItem.category === category.id) {
        dbInvoke.deletePackItemBatch(packItem.id, batch);
      }
    }
    await batch.commit();
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
