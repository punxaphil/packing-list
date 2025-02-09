import { Box, Flex, Image, Text } from '@chakra-ui/react';
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
                  <Text as="b">{categories.find((cat) => cat.id === groupCategory)?.name ?? ''}</Text>
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
