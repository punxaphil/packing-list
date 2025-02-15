import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { GroupedPackItem } from '../../types/GroupedPackItem.ts';
import { Category } from './Category.tsx';
import { NewPackItemRow } from './NewPackItemRow.tsx';
import { PackItemRow } from './PackItemRow.tsx';

export function PackItemRows({
  grouped,
  hidden,
  filteredMembers,
}: {
  grouped: GroupedPackItem[];
  hidden?: boolean;
  filteredMembers: string[];
}) {
  const [newRowAfterId, setNewRowAfterId] = useState<string | null>(null);
  const [addAfterCategory, setAddAfterCategory] = useState<string | undefined>(undefined);

  return (
    <>
      {!hidden &&
        grouped.map(({ categoryId: groupCategory, packItems }) => {
          return (
            <Box key={groupCategory}>
              <Category categoryId={groupCategory} onAddPackItem={setAddAfterCategory} />
              {addAfterCategory === groupCategory && (
                <NewPackItemRow categoryId={groupCategory} onHide={() => setAddAfterCategory(undefined)} />
              )}
              {packItems.map((packItem) => (
                <Box key={packItem.id}>
                  <PackItemRow
                    packItem={packItem}
                    indent={!!groupCategory}
                    filteredMembers={filteredMembers}
                    onEnter={setNewRowAfterId}
                  />
                  {packItem.id === newRowAfterId && (
                    <NewPackItemRow categoryId={groupCategory} onHide={() => setNewRowAfterId(null)} />
                  )}
                </Box>
              ))}
            </Box>
          );
        })}
    </>
  );
}
