import { useState } from 'react';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../../services/contexts.ts';
import { Box, Card, CardBody, Flex, Text, Image, Stack, Heading } from '@chakra-ui/react';
import { AddOrEditPackItem } from '../packing-list/AddOrEditPackItem.tsx';
import { groupByCategories } from '../../services/utils.ts';
import { PackItemRow } from '../packing-list/PackItemRow.tsx';
import { PLSelect } from '../shared/PLSelect.tsx';

export function PackingList() {
  const [selectedItem, setSelectedItem] = useState<PackItem>();
  const packItems = useFirebase().packItems;
  const [filteredPackItems, setFilteredPackItems] = useState(packItems);
  const images = useFirebase().images;

  const categories = useFirebase().categories;
  const grouped = groupByCategories(filteredPackItems);

  function getCategoryImage(typeId: string) {
    const image = images.find((t) => t.type === 'categories' && t.typeId === typeId);
    return image?.url;
  }

  function filterOnCategory(category: string) {
    setFilteredPackItems(packItems.filter((packItem) => packItem.category === category));
  }

  return (
    <Box mt="5" maxWidth="600px" mx="auto">
      {filteredPackItems.length ? (
        <>
          {/* Move to a seperate component */}
          <Flex mb="3" gap="2" direction="column">
            <Heading as="h2" size="md">
              Filters
            </Heading>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <PLSelect
                setSelection={filterOnCategory}
                selected=""
                placeholder="Select category"
                options={categories}
              />
            </Stack>
          </Flex>
          {/* ---- */}
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
        </>
      ) : (
        <Flex justifyContent="center" minWidth="max-content">
          <Text>No items yet.</Text>
        </Flex>
      )}
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
