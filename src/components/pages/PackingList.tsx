import { Box, Card, CardBody, Flex, Link, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { groupByCategories } from '../../services/utils.ts';
import { GroupedPackItem } from '../../types/GroupedPackItem.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { PackItemRows } from '../packing-list/PackItemRows.tsx';
import { PackItemsTextMode } from '../packing-list/PackItemsTextMode.tsx';
import { PackingListControls } from '../packing-list/PackingListControls.tsx';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';

export function PackingList() {
  const categories = useFirebase().categories;
  const packItems = useFirebase().packItems;
  const [filteredMembers, setFilteredMembers] = useState<string[]>([]);
  const [textMode, setTextMode] = useState(false);
  const [grouped, setGrouped] = useState<GroupedPackItem[]>([]);
  const { packingListId } = usePackingListId();

  useEffect(() => {
    onUpdate(packItems, categories);
  }, [packItems, categories]);

  function onUpdate(packItems: PackItem[], categories: NamedEntity[]) {
    const grouped = groupByCategories(packItems, categories);
    setGrouped(grouped);
  }

  async function addFirstPackItem() {
    await firebase.addPackItem('Toothbrush', [], '', packingListId, 0);
  }

  return (
    <Box maxWidth="600px" mx="auto">
      <PackingListControls
        hidden={textMode}
        onPackItemsFilter={(p) => onUpdate(p, categories)}
        onTextMode={() => setTextMode(!textMode)}
        onMemberFilter={setFilteredMembers}
      />
      <Card mb="5">
        <CardBody>
          <PackItemsTextMode grouped={grouped} onDone={() => setTextMode(false)} hidden={!textMode} />
          <PackItemRows grouped={grouped} filteredMembers={filteredMembers} hidden={textMode || !grouped.length} />
          <Flex justifyContent="center" minWidth="max-content" hidden={textMode || !!grouped.length}>
            <Text>
              No items yet. <Link onClick={addFirstPackItem}>Click here to add one!</Link>
            </Text>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
}
