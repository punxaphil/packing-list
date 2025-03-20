import { Box, Checkbox, Flex } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/styled-system';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useMemo } from 'react';
import { PackItemMenu } from '~/components/pages/PackingList/PackItemMenu.tsx';
import { DragHandle } from '~/components/shared/DragHandle.tsx';
import { MultiCheckbox } from '~/components/shared/MultiCheckbox.tsx';
import { PLInput } from '~/components/shared/PLInput.tsx';
import { useApi } from '~/providers/ApiContext.ts';
import { useModel } from '~/providers/ModelContext.ts';
import { useNewPackItemRowId } from '~/providers/NewPackItemRowIdContext.ts';
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
  const { members } = useModel();
  const { api } = useApi();
  const { newPackItemRowId, setNewPackItemRowId } = useNewPackItemRowId();

  const memberRows = useMemo(() => {
    return getMemberRows(packItem.members, filteredMembers, members);
  }, [packItem.members, filteredMembers, members, packItem]);

  async function toggleItem() {
    packItem.checked = !packItem.checked;
    await onUpdate(packItem);
  }

  async function onUpdate(packItem: PackItem) {
    await api.updatePackItem(packItem);
  }

  async function onChangeText(name: string) {
    packItem.name = name;
    await onUpdate(packItem);
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
          <DragHandle dragHandleProps={dragHandleProps} />
          {packItem.members.length > 1 ? (
            <MultiCheckbox packItem={packItem} onUpdate={onUpdate} />
          ) : (
            <Checkbox isChecked={packItem.checked} onChange={toggleItem} />
          )}

          <Flex alignItems="center" grow="1" overflow="hidden">
            <PLInput
              value={packItem.name}
              onUpdate={onChangeText}
              strike={packItem.checked}
              onEnter={() => setNewPackItemRowId(packItem.id)}
            />
          </Flex>
          <PackItemMenu packItem={packItem} />
        </Flex>
        {memberRows.map(({ memberItem, member }) => (
          <MemberPackItemRow
            memberItem={memberItem}
            parent={packItem}
            key={memberItem.id + member.name}
            member={member}
          />
        ))}
      </PackItemRowWrapper>
      {newPackItemRowId === packItem.id && (
        <NewPackItemRow
          categoryId={packItem.category}
          onHide={() => setNewPackItemRowId()}
          packItemToPlaceNewItemAfter={packItem}
        />
      )}
    </Box>
  );
}
