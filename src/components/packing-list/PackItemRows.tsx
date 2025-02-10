import { Editable, EditableInput, EditablePreview } from '@chakra-ui/icons';
import { Box, Flex, Image } from '@chakra-ui/react';
import { ChangeEvent } from 'react';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';
import { PackItem } from '../../types/PackItem.ts';
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

  async function onChangeCategory(event: ChangeEvent<HTMLInputElement>, catId: string) {
    const category = categories.find((cat) => cat.id === catId);
    if (!category) {
      throw new Error(`Category with id ${catId} not found`);
    }
    category.name = event.target.value;
    await firebase.updateCategories(category);
  }

  return (
    <>
      {!hidden &&
        Object.entries(grouped).map(([groupCategory, packItems]) => (
          <Box key={groupCategory}>
            {groupCategory && (
              <Flex gap="3" alignItems="center" mt="5">
                {getCategoryImage(groupCategory) && (
                  <Image borderRadius="full" boxSize="30px" src={getCategoryImage(groupCategory)} />
                )}

                <Box>
                  <Editable as="b">
                    <EditablePreview />
                    <EditableInput
                      value={categoryName(groupCategory)}
                      onChange={(e) => onChangeCategory(e, groupCategory)}
                    />
                  </Editable>
                </Box>
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
