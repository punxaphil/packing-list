import { Box, Card, CardBody, Flex, Link, Text, useMediaQuery } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { groupByCategories } from '../../services/utils.ts';
import { GroupedPackItem } from '../../types/GroupedPackItem.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { PackItemsTextMode } from '../packing-list/PackItemsTextMode.tsx';
import { PackingListColumns } from '../packing-list/PackingListColumns.tsx';
import { PackingListControls } from '../packing-list/PackingListControls.tsx';
import { MEDIA_QUERIES } from '../packing-list/packingListUtils.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';

export function PackingList() {
  const categories = useFirebase().categories;
  const packItems = useFirebase().packItems;
  const [filteredMembers, setFilteredMembers] = useState<string[]>([]);
  const [textMode, setTextMode] = useState(false);
  const [grouped, setGrouped] = useState<GroupedPackItem[]>([]);
  const { packingListId } = usePackingListId();

  useMemo(() => {
    onUpdate(packItems, categories);
  }, [packItems, categories]);

  function onUpdate(packItems: PackItem[], categories: NamedEntity[]) {
    const grouped = groupByCategories(packItems, categories);
    setGrouped(grouped);
  }

  async function addFirstPackItem() {
    await firebase.addPackItem('Toothbrush', [], '', packingListId, 0);
  }
  const [isMin800px, isMin1200px] = useMediaQuery(MEDIA_QUERIES);

  return (
    <Box mx="auto" width={isMin1200px ? '1200px' : isMin800px ? '800px' : '400px'}>
      {!textMode && (
        <PackingListControls
          onPackItemsFilter={(p) => onUpdate(p, categories)}
          onTextMode={() => setTextMode(!textMode)}
          onMemberFilter={setFilteredMembers}
        />
      )}
      <Card mb="5">
        <CardBody>
          {textMode && <PackItemsTextMode grouped={grouped} onDone={() => setTextMode(false)} />}
          {!textMode && (
            <>
              {grouped.length && <PackingListColumns grouped={grouped} filteredMembers={filteredMembers} />}
              {!grouped.length && (
                <Flex justifyContent="center" minWidth="max-content">
                  <Text>
                    No items yet. <Link onClick={addFirstPackItem}>Click here to add one!</Link>
                  </Text>
                </Flex>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
