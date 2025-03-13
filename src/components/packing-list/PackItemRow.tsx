import { Box, Checkbox, Flex } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/styled-system';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useMemo, useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { DragHandle } from '../shared/DragHandle.tsx';
import { MultiCheckbox } from '../shared/MultiCheckbox.tsx';
import { PLInput } from '../shared/PLInput.tsx';
import { PackItemMenu } from '../shared/PackItemMenu.tsx';
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
  const members = useFirebase().members;
  const [addNewPackItem, setAddNewPackItem] = useState(false);

  const memberRows = useMemo(() => {
    return getMemberRows(packItem.members, filteredMembers, members);
  }, [packItem.members, filteredMembers, members, packItem]);

  async function toggleItem() {
    packItem.checked = !packItem.checked;
    await onUpdate(packItem);
  }

  async function onUpdate(packItem: PackItem) {
    await firebase.updatePackItem(packItem);
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
              onEnter={() => setAddNewPackItem(true)}
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
      {addNewPackItem && (
        <NewPackItemRow
          categoryId={packItem.category}
          onHide={() => setAddNewPackItem(false)}
          packItemToPlaceNewItemAfter={packItem}
        />
      )}
    </Box>
  );
}
