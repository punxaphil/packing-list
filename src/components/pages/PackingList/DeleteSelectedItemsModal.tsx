import { useSelectMode } from '~/providers/SelectModeContext.ts';
import { DeleteItemsModal } from './DeleteItemsModal.tsx';

export function DeleteSelectedItemsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { selectedItems, clearSelection } = useSelectMode();

  function handleAfterDelete() {
    clearSelection();
  }

  return (
    <DeleteItemsModal
      isOpen={isOpen}
      onClose={onClose}
      items={selectedItems}
      itemType="selected"
      onAfterDelete={handleAfterDelete}
    />
  );
}
