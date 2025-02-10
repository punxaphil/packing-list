import { EditIcon, Menu, MenuButton, MenuList } from '@chakra-ui/icons';
import {
  Box,
  Card,
  CardBody,
  Flex,
  Link,
  MenuItemOption,
  MenuOptionGroup,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react';
import { IoFilterOutline } from '@react-icons/all-files/io5/IoFilterOutline';
import { useEffect, useState } from 'react';
import { useFirebase } from '../../services/contexts.ts';
import { groupByCategories } from '../../services/utils.ts';
import { PackItem } from '../../types/PackItem.ts';
import { AddOrEditPackItem } from '../packing-list/AddOrEditPackItem.tsx';
import { PackItemRows } from '../packing-list/PackItemRows.tsx';
import { PackItemsTextMode } from '../packing-list/PackItemsTextMode.tsx';

export function PackingList() {
  const categories = useFirebase().categories;

  const [selectedItem, setSelectedItem] = useState<PackItem>();
  const packItems = useFirebase().packItems;
  const [filteredPackItems, setFilteredPackItems] = useState(packItems);
  const [filterCategories, setFilterCategories] = useState<string | string[]>(categories.map((c) => c.id));
  const [textMode, setTextMode] = useState(false);

  const grouped = groupByCategories(filteredPackItems);

  useEffect(() => {
    setFilteredPackItems(packItems);
  }, [packItems]);

  function filterOnCategories(filter: string | string[]) {
    const filterArray = Array.isArray(filter) ? filter : [filter];
    setFilteredPackItems(packItems.filter((packItem) => !packItem.category || filterArray.includes(packItem.category)));
    setFilterCategories(filter);
  }

  return (
    <Box mt="5" maxWidth="600px" mx="auto">
      <>
        {/* Move to a separate component */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Menu closeOnSelect={false}>
            <MenuButton as={Link} m="3" color="teal.500" hidden={textMode}>
              <Flex alignItems="center" gap="1">
                <IoFilterOutline /> Filter categories {filterCategories.length < categories.length && '*'}
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuOptionGroup type="checkbox" value={filterCategories} onChange={filterOnCategories}>
                {categories.map((category) => (
                  <MenuItemOption key={category.id} value={category.id}>
                    {category.name}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          <Spacer />
          <Link color="teal.500" onClick={() => setTextMode(!textMode)} variant="outline" hidden={textMode} m="3">
            <EditIcon /> Text mode
          </Link>
        </Stack>
        {/* ---- */}
        <Card>
          <CardBody>
            <PackItemsTextMode grouped={grouped} onDone={() => setTextMode(false)} hidden={!textMode} />
            <PackItemRows
              grouped={grouped}
              setSelectedItem={setSelectedItem}
              hidden={textMode || !filteredPackItems.length}
            />
            <Flex justifyContent="center" minWidth="max-content" hidden={textMode || !!filteredPackItems.length}>
              <Text>No items yet.</Text>
            </Flex>
          </CardBody>
        </Card>
      </>
      <Card mt="5" hidden={textMode}>
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
