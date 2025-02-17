import { Flex, Image, Link, Text } from '@chakra-ui/react';
import { ReactElement, useState } from 'react';
import { TbCategoryPlus } from 'react-icons/tb';
import { firebase } from '../../services/firebase.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { InlineEdit } from '../shared/InlineEdit.tsx';
import { NewPackItemRow } from './NewPackItemRow.tsx';

export function Category({
  category,
  dragHandle,
  onFocus,
  selected,
}: {
  category: NamedEntity;
  dragHandle?: ReactElement;
  onFocus?: () => void;
  selected?: boolean;
}) {
  const images = useFirebase().images;
  const [addNewPackItem, setAddNewPackItem] = useState(false);
  const [hideIcon, setHideIcon] = useState(false);

  async function onChangeCategory(name: string) {
    setHideIcon(false);
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
      <Flex gap="1" alignItems="center" bgColor={selected ? 'gray.100' : 'white'}>
        {dragHandle}
        {categoryImage && <Image borderRadius="full" boxSize="30px" src={categoryImage} mr="2" />}
        {category.id ? (
          <InlineEdit
            as="b"
            value={category.name}
            onUpdate={onChangeCategory}
            onFocus={() => {
              setHideIcon(true);
              onFocus?.();
            }}
          />
        ) : (
          <Text as="i" fontSize="sm" color="gray.500">
            Uncategorized
          </Text>
        )}
        <Link onClick={() => setAddNewPackItem(true)} variant="outline" ml="1" hidden={hideIcon}>
          <TbCategoryPlus />
        </Link>
      </Flex>
      {addNewPackItem && <NewPackItemRow categoryId={category.id} onHide={() => setAddNewPackItem(false)} />}
    </>
  );
}
