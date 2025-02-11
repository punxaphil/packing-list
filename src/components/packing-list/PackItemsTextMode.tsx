import { QuestionIcon } from '@chakra-ui/icons';
import {
  Button,
  ButtonGroup,
  Code,
  Flex,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spacer,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { ChangeEvent, useEffect, useState } from 'react';
import { useFirebase } from '../../services/contexts.ts';
import {
  createTextPackItemsFromText,
  getGroupedAsText,
  updateFirebaseFromTextPackItems,
} from '../../services/textModeUtils.ts';
import { GroupedPackItem } from '../../types/GroupedPackItem.ts';

export function PackItemsTextMode({
  grouped,
  onDone,
  hidden,
}: {
  grouped: GroupedPackItem[];
  onDone: () => void;
  hidden?: boolean;
}) {
  const categories = useFirebase().categories;
  const members = useFirebase().members;
  const packItems = useFirebase().packItems;
  const [groupedAsText, setGroupedAsText] = useState('');

  useEffect(() => {
    const text = getGroupedAsText(grouped, categories, members);
    setGroupedAsText(text);
  }, [grouped, categories, members]);

  function onChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setGroupedAsText(e.target.value);
  }

  async function save() {
    const textPackItems = createTextPackItemsFromText(groupedAsText);
    await updateFirebaseFromTextPackItems(packItems, textPackItems, members, categories);
    onDone();
  }
  const { onOpen } = useDisclosure();
  return (
    <Flex hidden={hidden} direction="column" gap="3">
      <Textarea
        placeholder="Paste your list here"
        value={groupedAsText}
        rows={20}
        fontFamily="monospace"
        onChange={onChange}
      />
      <Flex>
        <ButtonGroup>
          <Button onClick={save}>Save</Button>
          <Button onClick={onDone} colorScheme="gray">
            Cancel
          </Button>
        </ButtonGroup>
        <Spacer />
        <Popover trigger="hover">
          <PopoverTrigger>
            <IconButton
              onClick={onOpen}
              icon={<QuestionIcon />}
              aria-label="Text mode help"
              borderRadius="full"
              colorScheme="orange"
            />
          </PopoverTrigger>
          <PopoverContent boxShadow="dark-lg" p="6" rounded="md" bg="white" m="3">
            <h3>Example text:</h3>
            <Code colorScheme="gray">Category 1</Code>
            <Code colorScheme="gray">- Item 1</Code>
            <Code colorScheme="gray">-- Member 1</Code>
            <Code colorScheme="gray">- Item 2</Code>
          </PopoverContent>
        </Popover>
      </Flex>
    </Flex>
  );
}
