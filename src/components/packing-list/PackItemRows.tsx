import { Box, Flex, Link, Spacer } from '@chakra-ui/react';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';
import { PackItem } from '../../types/PackItem.ts';
import { Category } from './Category.tsx';
import { PackItemRow } from './PackItemRow.tsx';

export function PackItemRows({
  grouped,
  setSelectedItem,
  hidden,
}: {
  grouped: Record<string, PackItem[]>;
  setSelectedItem: (value: PackItem) => void;
  hidden?: boolean;
}) {
  const categories = useFirebase().categories;

  async function addCategory() {
    const batch = firebase.initBatch();
    const id = firebase.addCategoryBatch('My Category', batch);
    firebase.addPackItemBatch(batch, 'My Item', [], id);
    firebase.updateCategoryBatch(id, { rank: 0 }, batch);
    for (const category of categories) {
      firebase.updateCategoryBatch(category.id, { rank: (category.rank ?? 0) + 1 }, batch);
    }
    await batch.commit();
  }

  return (
    <>
      <Flex>
        <Spacer />
        <Link color="teal.500" onClick={addCategory} variant="outline">
          + add category
        </Link>
      </Flex>
      {!hidden &&
        Object.entries(grouped).map(([groupCategory, packItems]) => (
          <Box key={groupCategory}>
            {groupCategory && <Category categoryId={groupCategory} />}
            {packItems.map((packItem) => (
              <PackItemRow packItem={packItem} key={packItem.id} onEdit={setSelectedItem} indent={!!groupCategory} />
            ))}
          </Box>
        ))}
    </>
  );
}
