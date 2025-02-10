import { AddIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton, Image, Link, Spacer } from '@chakra-ui/react';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';
import { PackItem } from '../../types/PackItem.ts';
import { InlineEdit } from '../shared/InlineEdit.tsx';
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
  const images = useFirebase().images;
  const categories = useFirebase().categories;

  function getCategoryImage(typeId: string) {
    const image = images.find((t) => t.type === 'categories' && t.typeId === typeId);
    return image?.url;
  }

  function categoryName(catId: string) {
    return categories.find((cat) => cat.id === catId)?.name ?? '';
  }

  async function onChangeCategory(name: string, catId: string) {
    const category = categories.find((cat) => cat.id === catId);
    if (!category) {
      throw new Error(`Category with id ${catId} not found`);
    }
    category.name = name;
    await firebase.updateCategories(category);
  }

  async function addCategory() {
    const batch = firebase.initBatch();
    const id = firebase.addCategoryBatch('New category', batch);
    firebase.addPackItemBatch(batch, 'New item', [], id);
    firebase.updateCategoryBatch(id, { rank: 0 }, batch);
    for (const category of categories) {
      firebase.updateCategoryBatch(category.id, { rank: (category.rank ?? 0) + 1 }, batch);
    }
    await batch.commit();
  }

  async function addItem(catId: string) {
    const categoryName = categories.find((cat) => cat.id === catId)?.name;
    await firebase.addPackItem(`New ${categoryName} item`, [], catId);
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
            {groupCategory && (
              <Flex gap="1" alignItems="center" mt="5">
                {getCategoryImage(groupCategory) && (
                  <Image borderRadius="full" boxSize="30px" src={getCategoryImage(groupCategory)} mr="2" />
                )}

                <InlineEdit
                  as="b"
                  value={categoryName(groupCategory)}
                  onUpdate={(name) => onChangeCategory(name, groupCategory)}
                />
                <IconButton
                  size="xs"
                  borderRadius="full"
                  onClick={() => addItem(groupCategory)}
                  variant="ghost"
                  icon={<AddIcon />}
                  aria-label="Add item"
                />
              </Flex>
            )}
            {packItems.map((packItem) => (
              <PackItemRow packItem={packItem} key={packItem.id} onEdit={setSelectedItem} indent={!!groupCategory} />
            ))}
          </Box>
        ))}
    </>
  );
}
