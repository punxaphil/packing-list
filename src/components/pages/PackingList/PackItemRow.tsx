import { Box, Checkbox, Flex, Icon, Text } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/styled-system';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useMemo } from 'react';
import { HiUsers } from 'react-icons/hi';
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
  }, [packItem.members, packItem.members.length, filteredMembers, members, filter?.showTheseStates]);

  const hasSingleMember = memberRows.length === 1;

  const memberSuffix = useMemo(() => {
    if (hasSingleMember) {
      return `(${memberRows[0].member.name})`;
    }
    return '';
  }, [hasSingleMember, memberRows]);

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

  function handleSelect(event: React.MouseEvent) {
    event.preventDefault();
    toggleItemSelection(packItem, event.shiftKey);
  }

  return (
    <Box
      sx={sx}
      borderBottomRadius={isLastItemInCategory ? '2xl' : ''}
      pb={isLastItemInCategory ? '2' : ''}
      borderTopRadius={isFirstItemInCategory ? '2xl' : ''}
      userSelect={isSelectMode ? 'none' : 'auto'}
    >
      <PackItemRowWrapper>
        <Flex gap="3" align="center">
          <DragHandle dragHandleProps={dragHandleProps} disabled={isSelectMode} />

          {isSelectMode ? (
            <Box onClick={handleSelect} cursor="pointer">
              <RadioCheckbox isChecked={isItemSelected(packItem)} pointerEvents="none" colorScheme="blue" />
            </Box>
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
            {memberSuffix && (
              <Text flexShrink={0} color="gray.500" ml={1}>
                {memberSuffix}
              </Text>
            )}
            {isSelectMode && packItem.members.length > 1 && <Icon as={HiUsers} color="gray.500" boxSize={4} ml={1} />}
          </Flex>
          {!isSelectMode && <PackItemMenu packItem={packItem} />}
        </Flex>

        {!isSelectMode &&
          !hasSingleMember &&
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
