import { Menu, MenuButton, MenuList } from '@chakra-ui/icons';
import { Flex, Link, MenuItemOption, MenuOptionGroup, Spacer, Stack } from '@chakra-ui/react';
import { useState } from 'react';
import { AiOutlineEdit, AiOutlineFilter } from 'react-icons/ai';
import { MdLabelOutline } from 'react-icons/md';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';
import { PackItem } from '../../types/PackItem.ts';

export function PackingListControls({
  hidden,
  onClick,
  onFilterChanged,
}: {
  hidden: boolean;
  onClick: () => void;
  onFilterChanged: (prevState: PackItem[]) => void;
}) {
  const packItems = useFirebase().packItems;
  const categories = useFirebase().categories;
  const [filterCategories, setFilterCategories] = useState<string | string[]>(categories.map((c) => c.id));

  function filterOnCategories(filter: string | string[]) {
    const filterArray = Array.isArray(filter) ? filter : [filter];
    onFilterChanged(packItems.filter((packItem) => !packItem.category || filterArray.includes(packItem.category)));
    setFilterCategories(filter);
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

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" hidden={hidden}>
      <Menu closeOnSelect={false}>
        <MenuButton as={Link} m="3" color="teal">
          <Flex alignItems="center" gap="1">
            <AiOutlineFilter /> Filter categories {filterCategories.length < categories.length && '*'}
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

      <Link color="teal" onClick={addCategory} variant="outline">
        <Flex alignItems="center" gap="1">
          <MdLabelOutline /> Add category
        </Flex>
      </Link>
      <Spacer />
      <Link color="teal" onClick={onClick} variant="outline" m="3">
        <Flex alignItems="center" gap="1">
          <AiOutlineEdit /> Text mode
        </Flex>
      </Link>
    </Stack>
  );
}
