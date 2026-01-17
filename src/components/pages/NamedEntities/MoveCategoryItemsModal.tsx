import { Box, Button, Divider, Flex, HStack, Switch, Text, useToast, VStack } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { BaseModal } from '~/components/shared/BaseModal.tsx';
import { CategoryButton } from '~/components/shared/CategoryButton.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { writeDb } from '~/services/database.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';

const CATEGORY_SORT_KEY = 'categorySortByAlpha';

function getSavedSortPreference(): boolean {
  const saved = localStorage.getItem(CATEGORY_SORT_KEY);
  return saved === null ? true : saved === 'true';
}

interface MoveCategoryItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceCategory: NamedEntity;
  onItemsMoved?: () => void;
}

export function MoveCategoryItemsModal({ isOpen, onClose, sourceCategory, onItemsMoved }: MoveCategoryItemsModalProps) {
  const { categories } = useDatabase();
  const toast = useToast();
  const [sortByAlpha, setSortByAlpha] = useState(getSavedSortPreference);
  const [selectedTargetCategory, setSelectedTargetCategory] = useState<NamedEntity | null>(null);
  const [allPackItems, setAllPackItems] = useState<PackItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      writeDb.getPackItemsForAllPackingLists().then(setAllPackItems);
    }
  }, [isOpen]);

  const affectedItems = useMemo(
    () => allPackItems.filter((item) => item.category === sourceCategory.id),
    [allPackItems, sourceCategory.id]
  );

  const availableCategories = useMemo(() => {
    const filtered = categories.filter((c) => c.id !== sourceCategory.id);
    if (sortByAlpha) {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name, navigator.language));
    }
    return filtered;
  }, [categories, sourceCategory.id, sortByAlpha]);

  function toggleSortOrder() {
    const newValue = !sortByAlpha;
    setSortByAlpha(newValue);
    localStorage.setItem(CATEGORY_SORT_KEY, String(newValue));
  }

  function getBottomRank(categoryId: string): number {
    const itemsInCategory = allPackItems.filter((item) => item.category === categoryId);
    return itemsInCategory.length === 0 ? 0 : Math.min(...itemsInCategory.map((item) => item.rank)) - 1;
  }

  async function handleMove() {
    if (!selectedTargetCategory || affectedItems.length === 0) {
      return;
    }

    const batch = writeDb.initBatch();
    let currentRank = getBottomRank(selectedTargetCategory.id);

    for (const item of affectedItems) {
      const updatedItem = {
        ...item,
        category: selectedTargetCategory.id,
        rank: currentRank,
      };
      writeDb.updatePackItemBatch(updatedItem, batch);
      currentRank--;
    }

    await batch.commit();

    toast({
      title: `Moved ${affectedItems.length} items from ${sourceCategory.name} to ${selectedTargetCategory.name}`,
      status: 'success',
    });

    setSelectedTargetCategory(null);
    onItemsMoved?.();
    onClose();
  }

  function handleClose() {
    setSelectedTargetCategory(null);
    onClose();
  }

  if (affectedItems.length === 0) {
    return (
      <BaseModal isOpen={isOpen} onClose={handleClose} title="Move Items">
        <Text>No items in category "{sourceCategory.name}"</Text>
      </BaseModal>
    );
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Move Items">
      <VStack align="stretch" spacing={3}>
        <Text fontWeight="medium">
          Move all items from "{sourceCategory.name}" ({affectedItems.length} items):
        </Text>

        <Box maxH="150px" overflowY="auto" borderWidth={1} borderRadius="md" p={2}>
          {affectedItems.map((item) => (
            <Text key={item.id} fontSize="sm" py={0.5}>
              • {item.name}
            </Text>
          ))}
        </Box>

        <Divider />

        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium">
            Select target category:
          </Text>
          <HStack>
            <Text fontSize="xs" color="gray.500">
              {sortByAlpha ? 'A-Z' : 'Rank'}
            </Text>
            <Switch size="sm" isChecked={sortByAlpha} onChange={toggleSortOrder} />
          </HStack>
        </HStack>

        <Flex wrap="wrap" justify="center">
          {availableCategories.map((category, index) => (
            <CategoryButton
              key={category.id}
              category={category}
              index={sortByAlpha ? index : categories.indexOf(category)}
              onClick={(c) => setSelectedTargetCategory(c)}
              borderWidth={selectedTargetCategory?.id === category.id ? 3 : 1}
              borderColor={selectedTargetCategory?.id === category.id ? 'blue.500' : 'transparent'}
            />
          ))}
        </Flex>

        {availableCategories.length === 0 && (
          <Text fontSize="sm" color="gray.500" textAlign="center">
            No other categories available
          </Text>
        )}

        <Divider />

        <Button colorScheme="blue" onClick={handleMove} isDisabled={!selectedTargetCategory} width="100%">
          {selectedTargetCategory ? `Move to ${selectedTargetCategory.name}` : 'Select a category'}
        </Button>
      </VStack>
    </BaseModal>
  );
}
