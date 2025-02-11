import { Box } from '@chakra-ui/react';
import { GroupedPackItem } from '../../types/GroupedPackItem.ts';
import { Category } from './Category.tsx';
import { PackItemRow } from './PackItemRow.tsx';

export function PackItemRows({
  grouped,
  hidden,
}: {
  grouped: GroupedPackItem[];
  hidden?: boolean;
}) {
  return (
    <>
      {!hidden &&
        grouped.map(({ categoryId: groupCategory, packItems }) => {
          return (
            <Box key={groupCategory}>
              <Category categoryId={groupCategory} />
              {packItems.map((packItem) => (
                <PackItemRow packItem={packItem} key={packItem.id} indent={!!groupCategory} />
              ))}
            </Box>
          );
        })}
    </>
  );
}
