import { Flex, Image, Link, Text } from '@chakra-ui/react';
import { TbCategoryPlus } from 'react-icons/tb';
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
  const categoryName = categories.find((cat) => cat.id === categoryId)?.name || 'uncategorized';

  async function onChangeCategory(name: string) {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) {
      throw new Error(`Category with id ${categoryId} not found`);
    }
    category.name = name;
    await firebase.updateCategories(category);
  }

  function getCategoryImage() {
    if (categoryId) {
      const image = images.find((t) => t.type === 'categories' && t.typeId === categoryId);
      return image?.url;
    }
  }

  async function addItem() {
    await firebase.addPackItem(`New ${categoryName} item`, [], categoryId);
  }

  const categoryImage = getCategoryImage();
  return (
    <Flex gap="1" alignItems="center">
      {categoryImage && <Image borderRadius="full" boxSize="30px" src={categoryImage} mr="2" />}
      {categoryId ? (
        <InlineEdit as="b" value={categoryName} onUpdate={onChangeCategory} />
      ) : (
        <Text as="i" fontSize="sm" color="gray.500">
          Uncategorized
        </Text>
      )}
      <Link onClick={addItem} variant="outline" ml="1">
        <TbCategoryPlus />
      </Link>
    </Flex>
  );
}
