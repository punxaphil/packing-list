import { Flex, Image, Link, Spacer } from '@chakra-ui/react';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';
import { InlineEdit } from '../shared/InlineEdit.tsx';

export function Category({
  categoryId,
}: {
  categoryId: string;
}) {
  const images = useFirebase().images;
  const categories = useFirebase().categories;
  const categoryName = categories.find((cat) => cat.id === categoryId)?.name;
  if (!categoryName) {
    throw new Error(`Category with id ${categoryId} not found`);
  }

  async function onChangeCategory(name: string) {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) {
      throw new Error(`Category with id ${categoryId} not found`);
    }
    category.name = name;
    await firebase.updateCategories(category);
  }

  function getCategoryImage(typeId: string) {
    const image = images.find((t) => t.type === 'categories' && t.typeId === typeId);
    return image?.url;
  }

  async function addItem() {
    await firebase.addPackItem(`New ${categoryName} item`, [], categoryId);
  }

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

  const categoryImage = getCategoryImage(categoryId);
  return (
    <Flex gap="1" alignItems="center">
      {categoryImage && <Image borderRadius="full" boxSize="30px" src={categoryImage} mr="2" />}
      <InlineEdit as="b" value={categoryName} onUpdate={onChangeCategory} />
      <Spacer />
      <Flex gap="4">
        <Link color="teal.500" onClick={addItem} variant="outline">
          + pack item
        </Link>
        <Link color="teal.500" onClick={addCategory} variant="outline">
          + category
        </Link>
      </Flex>
    </Flex>
  );
}
