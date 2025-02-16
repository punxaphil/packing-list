import { DragHandleIcon } from '@chakra-ui/icons';
import { Flex, Image, Link, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { TbCategoryPlus } from 'react-icons/tb';
import { firebase } from '../../services/firebase.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { InlineEdit } from '../shared/InlineEdit.tsx';
import { NewPackItemRow } from './NewPackItemRow.tsx';

export function Category({
  category,
}: {
  category: NamedEntity;
}) {
  const images = useFirebase().images;
  const [addNewPackItem, setAddNewPackItem] = useState(false);

  async function onChangeCategory(name: string) {
    category.name = name;
    await firebase.updateCategories(category);
  }

  function getCategoryImage() {
    if (category.id) {
      const image = images.find((t) => t.type === 'categories' && t.typeId === category.id);
      return image?.url;
    }
  }

  const categoryImage = getCategoryImage();
  return (
    <>
      <Flex gap="1" alignItems="center">
        {!!category.id && <DragHandleIcon color="gray.300" mr="2" />}
        {categoryImage && <Image borderRadius="full" boxSize="30px" src={categoryImage} mr="2" />}
        {category.id ? (
          <InlineEdit as="b" value={category.name} onUpdate={onChangeCategory} />
        ) : (
          <Text as="i" fontSize="sm" color="gray.500">
            Uncategorized
          </Text>
        )}
        <Link onClick={() => setAddNewPackItem(true)} variant="outline" ml="1">
          <TbCategoryPlus />
        </Link>
      </Flex>
      {addNewPackItem && <NewPackItemRow categoryId={category.id} onHide={() => setAddNewPackItem(false)} />}
    </>
  );
}
