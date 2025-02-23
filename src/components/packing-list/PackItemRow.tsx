import { Box, Flex } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/styled-system';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useMemo, useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { DragHandle } from '../shared/DragHandle.tsx';
import { MultiCheckbox } from '../shared/MultiCheckbox.tsx';
import { PLCheckbox } from '../shared/PLCheckbox.tsx';
import { PLInput } from '../shared/PLInput.tsx';
import { MemberPackItemRow } from './MemberPackItemRow.tsx';
import { NewPackItemRow } from './NewPackItemRow.tsx';
import { PackItemRowControls } from './PackItemRowControls.tsx';
import { PackItemRowWrapper } from './PackItemRowWrapper.tsx';
import { getMemberRows } from './packingListUtils.ts';

export function PackItemRow({
  packItem,
  filteredMembers,
  dragHandleProps,
  onFocus,
  showControls,
  sx,
  isLastItemInCategory,
}: {
  packItem: PackItem;
  filteredMembers: string[];
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  onFocus: () => void;
  showControls: boolean;
  sx?: SystemStyleObject;
  isLastItemInCategory: boolean;
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
    <Box sx={sx} borderBottomRadius={isLastItemInCategory ? '2xl' : ''} pb={isLastItemInCategory ? '2' : ''}>
      <PackItemRowWrapper>
        <Flex gap="3" align="center">
          <DragHandle dragHandleProps={dragHandleProps} />
          {packItem.members.length > 1 ? (
            <MultiCheckbox packItem={packItem} onUpdate={onUpdate} />
          ) : (
            <PLCheckbox checked={packItem.checked} onClick={toggleItem} />
          )}

          <Flex alignItems="center" grow="1" overflow="hidden">
            <PLInput
              value={packItem.name}
              onUpdate={onChangeText}
              strike={packItem.checked}
              onFocus={onFocus}
              onEnter={() => setAddNewPackItem(true)}
              grow={true}
            />
          </Flex>
          {showControls && <PackItemRowControls packItem={packItem} onUpdate={onUpdate} />}
        </Flex>
        {memberRows.map(({ memberItem, member }) => (
          <MemberPackItemRow
            memberItem={memberItem}
            parent={packItem}
            key={memberItem.id + member.name}
            member={member}
            showControls={showControls}
            onFocus={onFocus}
          />
        ))}
      </PackItemRowWrapper>
      {addNewPackItem && <NewPackItemRow categoryId={packItem.category} onHide={() => setAddNewPackItem(false)} />}
    </Box>
  );
}
