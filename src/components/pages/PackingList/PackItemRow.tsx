import { Box, Checkbox, Flex } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/styled-system';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useMemo } from 'react';
import { PackItemMenu } from '~/components/pages/PackingList/PackItemMenu.tsx';
import { DragHandle } from '~/components/shared/DragHandle.tsx';
import { MultiCheckbox } from '~/components/shared/MultiCheckbox.tsx';
import { PLInput } from '~/components/shared/PLInput.tsx';
import { RadioCheckbox } from '~/components/shared/RadioCheckbox.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useNewPackItemRowId } from '~/providers/NewPackItemRowIdContext.ts';
import { usePackingList } from '~/providers/PackingListContext.ts';
import { useSelectMode } from '~/providers/SelectModeContext.ts';
import { useTemplate } from '~/providers/TemplateContext.ts';
import { useVersion } from '~/providers/VersionContext.ts';
import { writeDb } from '~/services/database.ts';
import { PackItem } from '~/types/PackItem.ts';
import { MemberPackItemRow } from './MemberPackItemRow.tsx';
import { NewPackItemRow } from './NewPackItemRow.tsx';
import { PackItemRowWrapper } from './PackItemRowWrapper.tsx';
import { getMemberRows } from './packingListUtils.ts';

export function PackItemRow({
  packItem,
  filteredMembers,
  dragHandleProps,
  sx,
  isLastItemInCategory,
  isFirstItemInCategory,
}: {
  packItem: PackItem;
  filteredMembers: string[];
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  sx?: SystemStyleObject;
  isLastItemInCategory: boolean;
  isFirstItemInCategory?: boolean;
}) {
  const { members, filter } = useDatabase();
  const { newPackItemRowId, setNewPackItemRowId, inputRef } = useNewPackItemRowId();
  const { isSelectMode, toggleItemSelection, isItemSelected } = useSelectMode();
  const { isTemplateList } = useTemplate();
  const { packingList } = usePackingList();
  const { scheduleVersionSave } = useVersion();

  const isCurrentListTemplate = isTemplateList(packingList.id);

  const memberRows = useMemo(() => {
    return getMemberRows(packItem.members, filteredMembers, members, filter?.showTheseStates || []);
  }, [packItem.members, filteredMembers, members, filter?.showTheseStates, packItem]);

  async function toggleItem() {
    packItem.checked = !packItem.checked;
    await onUpdate(packItem);
    scheduleVersionSave('Before checking/unchecking item');
  }

  async function onUpdate(packItem: PackItem) {
    await writeDb.updatePackItem(packItem);
  }

  async function onChangeText(newName: string) {
    const oldName = packItem.name;
    if (oldName === newName) {
      return;
    }
    scheduleVersionSave('Before renaming item');
    packItem.name = newName;
    await onUpdate(packItem);
  }

  function handleSelect() {
    toggleItemSelection(packItem);
  }

  return (
    <Box
      sx={sx}
      borderBottomRadius={isLastItemInCategory ? '2xl' : ''}
      pb={isLastItemInCategory ? '2' : ''}
      borderTopRadius={isFirstItemInCategory ? '2xl' : ''}
    >
      <PackItemRowWrapper>
        <Flex gap="3" align="center">
          <DragHandle dragHandleProps={dragHandleProps} disabled={isSelectMode} />

          {isSelectMode ? (
            <RadioCheckbox isChecked={isItemSelected(packItem)} onChange={handleSelect} colorScheme="blue" />
          ) : packItem.members.length > 1 ? (
            <MultiCheckbox packItem={packItem} onUpdate={onUpdate} disabled={isCurrentListTemplate} />
          ) : (
            <Checkbox isChecked={packItem.checked} onChange={toggleItem} isDisabled={isCurrentListTemplate} />
          )}

          <Flex alignItems="center" grow="1" overflow="hidden">
            <PLInput
              value={packItem.name}
              onUpdate={onChangeText}
              strike={packItem.checked && !isCurrentListTemplate}
              onEnter={() => setNewPackItemRowId(packItem.id)}
              focusOnEnterRef={inputRef}
            />
          </Flex>
          {!isSelectMode && <PackItemMenu packItem={packItem} />}
        </Flex>

        {!isSelectMode &&
          memberRows.map(({ memberItem, member }) => (
            <MemberPackItemRow
              memberItem={memberItem}
              parent={packItem}
              key={memberItem.id + member.name}
              member={member}
            />
          ))}
      </PackItemRowWrapper>

      {!isSelectMode && newPackItemRowId === packItem.id && (
        <NewPackItemRow
          categoryId={packItem.category}
          onHide={() => setNewPackItemRowId()}
          packItemToPlaceNewItemAfter={packItem}
        />
      )}
    </Box>
  );
}
