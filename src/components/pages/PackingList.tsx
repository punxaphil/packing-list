import { useState } from 'react';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../../services/contexts.ts';
import { Box, Card, CardBody, Flex, Text, Image } from '@chakra-ui/react';
import { AddOrEditPackItem } from '../packing-list/AddOrEditPackItem.tsx';
import { groupByCategories } from '../../services/utils.ts';
import { PackItemRow } from '../packing-list/PackItemRow.tsx';

export function PackingList() {
  const [selectedItem, setSelectedItem] = useState<PackItem>();

  const images = useFirebase().images;
  const packItems = useFirebase().packItems;
  const categories = useFirebase().categories;
  const grouped = groupByCategories(packItems);

  function getCategoryImage(typeId: string) {
    const image = images.find((t) => t.type === 'categories' && t.typeId === typeId);
    return image?.url;
  }

  return (
    <Box mt="5" maxWidth="600px" mx="auto">
      {packItems.length ? (
        <Card>
          <CardBody>
            {Object.entries(grouped).map(([groupCategory, packItems]) => (
              <Box key={groupCategory}>
                {groupCategory && (
                  <Flex gap="3" alignItems="center" mt="5">
                    {getCategoryImage(groupCategory) && (
                      <Image borderRadius="full" boxSize="30px" src={getCategoryImage(groupCategory)}></Image>
                    )}

                    <Box>
                      <Text as="b">{categories.find((cat) => cat.id === groupCategory)?.name ?? ''}</Text>
                    </Box>
                  </Flex>
                )}
                {packItems.map((packItem) => (
                  <PackItemRow
                    packItem={packItem}
                    key={packItem.id}
                    onEdit={setSelectedItem}
                    indent={!!groupCategory}
                  />
                ))}
              </Box>
            ))}
          </CardBody>
        </Card>
      ) : (
        <Flex justifyContent="center" minWidth="max-content">
          <Text>No items yet.</Text>
        </Flex>
      )}
      {/* </Flex> */}
      <Card mt="5">
        <CardBody>
          <AddOrEditPackItem
            packItem={selectedItem}
            key={selectedItem?.id ?? Date.now()}
            done={() => setSelectedItem(undefined)}
          />
        </CardBody>
      </Card>
    </Box>
  );
}
