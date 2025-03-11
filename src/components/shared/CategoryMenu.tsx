import { MenuItem } from '@chakra-ui/icons';
import { useDisclosure } from '@chakra-ui/react';
import { AiOutlineCopy, AiOutlineDelete } from 'react-icons/ai';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { TbCategoryPlus } from 'react-icons/tb';
import { firebase } from '../../services/firebase.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { ColorPicker } from './ColorPicker.tsx';
import { ContextMenu } from './ContextMenu.tsx';
import { CopyToOtherListModal } from './CopyToOtherListModal.tsx';
import { DeleteDialog } from './DeleteDialog.tsx';

export function CategoryMenu({
  packItemsInCat,
  category,
  setAddNewPackItem,
}: {
  packItemsInCat: PackItem[];
  category: NamedEntity;
  setAddNewPackItem: (value: boolean) => void;
}) {
  const copyDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const colorDisclosure = useDisclosure();

  function copyToOtherList() {
    copyDisclosure.onOpen();
  }

  async function onConfirmDelete() {
    const batch = firebase.initBatch();
    for (const packItem of packItemsInCat) {
      if (packItem.category === category.id) {
        firebase.deletePackItemBatch(packItem.id, batch);
      }
    }
    await batch.commit();
  }

  return (
    <ContextMenu title="Category actions">
      <MenuItem key="add" onClick={() => setAddNewPackItem(true)} icon={<TbCategoryPlus />}>
        Add new pack item
      </MenuItem>
      <MenuItem key="copy" onClick={copyToOtherList} icon={<AiOutlineCopy />}>
        Copy items to another list
      </MenuItem>
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
