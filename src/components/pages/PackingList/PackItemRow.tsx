import { Box, Checkbox, Flex, useDisclosure } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/styled-system';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PackItemMenu } from '~/components/pages/PackingList/PackItemMenu.tsx';
import { DragHandle } from '~/components/shared/DragHandle.tsx';
import { MultiCheckbox } from '~/components/shared/MultiCheckbox.tsx';
import { PLInput } from '~/components/shared/PLInput.tsx';
import { RadioCheckbox } from '~/components/shared/RadioCheckbox.tsx';
import { RenameSyncDialog } from '~/components/shared/RenameSyncDialog.tsx';
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
  const { members, filter, packingLists } = useDatabase();
  const { newPackItemRowId, setNewPackItemRowId, inputRef } = useNewPackItemRowId();
  const { isSelectMode, toggleItemSelection, isItemSelected } = useSelectMode();
  const { getSyncDecision, getMatchingItemsForSync, isTemplateList, refreshTemplateItems, templateList } =
    useTemplate();
  const { packingList } = usePackingList();
  const { scheduleVersionSave } = useVersion();
  const syncDialog = useDisclosure();
  const [pendingRename, setPendingRename] = useState<{
    oldName: string;
    newName: string;
  } | null>(null);
  const [matchingItems, setMatchingItems] = useState<PackItem[]>([]);

  const isCurrentListTemplate = isTemplateList(packingList.id);

  const memberRows = useMemo(() => {
    return getMemberRows(packItem.members, filteredMembers, members, filter?.showTheseStates || []);
  }, [packItem.members, filteredMembers, members, filter?.showTheseStates, packItem]);

  const loadMatchingItems = useCallback(async () => {
    const items = await getMatchingItemsForSync(packItem);
    setMatchingItems(items);
  }, [getMatchingItemsForSync, packItem]);

  useEffect(() => {
    loadMatchingItems();
  }, [loadMatchingItems]);

  function getListNamesForMatchingItems(): string[] {
    const listIds = [...new Set(matchingItems.map((item) => item.packingList))];
    return listIds
      .map((id) => {
        if (templateList && id === templateList.id) {
          return templateList.name;
        }
        return packingLists.find((list) => list.id === id)?.name ?? 'Unknown';
      })
      .sort();
  }

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

    const decision = getSyncDecision('rename');
    if (decision !== null) {
      packItem.name = newName;
      await onUpdate(packItem);
      if (decision) {
        await syncRename(oldName, newName);
      }
      return;
    }

    if (matchingItems.length > 0) {
      setPendingRename({ oldName, newName });
      syncDialog.onOpen();
    } else {
      packItem.name = newName;
      await onUpdate(packItem);
    }
  }

  async function syncRename(oldName: string, newName: string) {
    const items = await getMatchingItemsForSync({
      ...packItem,
      name: oldName,
    });
    if (items.length > 0) {
      const batch = writeDb.initBatch();
      for (const item of items) {
        writeDb.updatePackItemBatch({ ...item, name: newName }, batch);
      }
      await batch.commit();
      if (isTemplateList(packItem.packingList)) {
        await refreshTemplateItems();
      }
    }
  }

  async function handleSyncConfirm(shouldSync: boolean) {
    if (pendingRename) {
      packItem.name = pendingRename.newName;
      await onUpdate(packItem);
      if (shouldSync) {
        await syncRename(pendingRename.oldName, pendingRename.newName);
      }
    }
    setPendingRename(null);
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

      <RenameSyncDialog
        isOpen={syncDialog.isOpen}
        onClose={syncDialog.onClose}
        isTemplateChange={isTemplateList(packItem.packingList)}
        oldName={pendingRename?.oldName ?? packItem.name}
        newName={pendingRename?.newName ?? ''}
        listNames={getListNamesForMatchingItems()}
        onConfirm={handleSyncConfirm}
      />
    </Box>
  );
}
