import { useMemo } from 'react';
import { useSelectMode } from '~/providers/SelectModeContext.ts';
import { DeleteItemsModal } from './DeleteItemsModal.tsx';

export function DeleteSelectedItemsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { selectedItems, clearSelection } = useSelectMode();

  const itemsToDelete = useMemo(() => {
    return isOpen ? [...selectedItems] : [];
  }, [isOpen, selectedItems]);

  function handleAfterDelete() {
    clearSelection();
  }

  return (
    <DeleteItemsModal
      isOpen={isOpen}
      onClose={onClose}
      items={itemsToDelete}
      itemType="selected"
      onAfterDelete={handleAfterDelete}
    />
  );
}
