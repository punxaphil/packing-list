import { Progress, QuestionIcon } from '@chakra-ui/icons';
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
import {
  createTextPackItemsFromText,
  getGroupedAsText,
  updateFirebaseFromTextPackItems,
} from '../../services/textModeUtils.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';

export function PackItemsTextMode({
  onDone,
}: {
  onDone: () => void;
}) {
  const { categories, members, packItems, groupedPackItems } = useFirebase();
  const [groupedAsText, setGroupedAsText] = useState('');
  const [saving, setSaving] = useState(false);
  const packingList = usePackingListId().packingList;

  useEffect(() => {
    const text = getGroupedAsText(groupedPackItems, members);
    setGroupedAsText(text);
  }, [groupedPackItems, members]);

  function onChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setGroupedAsText(e.target.value);
  }

  async function save() {
    setSaving(true);
    const textPackItems = createTextPackItemsFromText(groupedAsText);
    await updateFirebaseFromTextPackItems(packItems, textPackItems, members, categories, packingList.id);
    setSaving(false);
    onDone();
  }
  const { onOpen } = useDisclosure();
  return (
    <Flex direction="column" gap="3">
      {saving && <Progress size="xs" isIndeterminate />}
      <Textarea
        placeholder="Paste your packing list here"
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
