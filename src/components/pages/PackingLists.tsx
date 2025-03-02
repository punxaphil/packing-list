import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { firebase } from '../../services/firebase.ts';
import { PackItem } from '../../types/PackItem.ts';
import { useError } from '../providers/ErrorContext.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';

export function PackingLists() {
  const { packingLists } = useFirebase();
  const [items, setItems] = useState<{ [key: string]: PackItem[] } | undefined>();
  const { packingListId, setPackingListId } = usePackingListId();
  const navigate = useNavigate();
  const { setError } = useError();

  useEffect(() => {
    (async () => {
      setItems(await firebase.getTopItemsForPackingLists(packingLists));
    })().catch(setError);
  }, [packingLists, setError]);

  function onListClick(id: string) {
    setPackingListId(id);
    navigate('/');
  }

  return (
    <Flex wrap="wrap" direction="row" justifyContent="center">
      {items &&
        packingLists.map((packingList) => {
          const isCurrentList = packingList.id === packingListId;
          return (
            <Box
              key={packingList.id}
              boxShadow={isCurrentList ? 'lg' : 'md'}
              p={4}
              m={2}
              borderRadius="md"
              width="200px"
              onClick={() => onListClick(packingList.id)}
              cursor="pointer"
              borderWidth={isCurrentList ? '3px' : '1px'}
            >
              <Box fontWeight="bold">{packingList.name}</Box>
              <Box>
                {items[packingList.id].map((item, index) => {
                  return (
                    <Box key={item.id} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {index === 4 ? '...' : item.name}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
    </Flex>
  );
}
