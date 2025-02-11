import { Box } from '@chakra-ui/react';
import { PackItem } from '../../types/PackItem.ts';
import { Category } from './Category.tsx';
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
  return (
    <>
      {!hidden &&
        Object.entries(grouped).map(([groupCategory, packItems]) => (
          <Box key={groupCategory}>
            <Category categoryId={groupCategory} />
            {packItems.map((packItem) => (
              <PackItemRow packItem={packItem} key={packItem.id} onEdit={setSelectedItem} indent={!!groupCategory} />
            ))}
          </Box>
        ))}
    </>
  );
}
