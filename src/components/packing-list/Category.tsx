import { AddIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Image } from '@chakra-ui/react';
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

  const categoryImage = getCategoryImage(categoryId);
  return (
    <Flex gap="1" alignItems="center" mt="5">
      {categoryImage && <Image borderRadius="full" boxSize="30px" src={categoryImage} mr="2" />}

      <InlineEdit as="b" value={categoryName} onUpdate={onChangeCategory} />
      <IconButton
        size="xs"
        borderRadius="full"
        onClick={addItem}
        variant="ghost"
        icon={<AddIcon />}
        aria-label="Add item"
      />
    </Flex>
  );
}
