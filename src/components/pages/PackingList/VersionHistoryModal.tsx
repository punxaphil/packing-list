import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { AiOutlineDelete, AiOutlineRollback } from 'react-icons/ai';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { usePackingList } from '~/providers/PackingListContext.ts';
import { writeDb } from '~/services/database.ts';
import { PackingListVersion } from '~/types/PackingListVersion.ts';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VersionHistoryModal({ isOpen, onClose }: VersionHistoryModalProps) {
  const { packingList } = usePackingList();
  const { packItems } = useDatabase();
  const [versions, setVersions] = useState<PackingListVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<PackingListVersion | null>(null);
  const restoreDialog = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null) as RefObject<HTMLButtonElement>;
  const toast = useToast();

  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    const loadedVersions = await writeDb.getVersions(packingList.id);
    setVersions(loadedVersions);
    setIsLoading(false);
  }, [packingList.id]);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, loadVersions]);

  function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    }
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
    if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getVersionDescription(version: PackingListVersion, index: number) {
    if (version.name) {
      return version.name;
    }
    const prev = versions[index + 1];
    if (!prev) {
      return 'Initial version';
    }
    const itemDiff = version.itemCount - prev.itemCount;
    if (itemDiff > 0) {
      return `Added ${itemDiff} item${itemDiff === 1 ? '' : 's'}`;
    }
    if (itemDiff < 0) {
      return `Removed ${Math.abs(itemDiff)} item${Math.abs(itemDiff) === 1 ? '' : 's'}`;
    }
    return 'Items updated';
  }

  function handleRestoreClick(version: PackingListVersion) {
    setSelectedVersion(version);
    restoreDialog.onOpen();
  }

  async function confirmRestore() {
    if (!selectedVersion) {
      return;
    }
    await writeDb.saveVersion(packingList.id, packItems, 'Before restore');
    await writeDb.restoreVersion(selectedVersion);
    toast({
      title: 'Version restored',
      description: 'Your packing list has been restored to the selected version.',
      status: 'success',
      duration: 3000,
    });
    restoreDialog.onClose();
    onClose();
  }

  async function handleDelete(version: PackingListVersion) {
    await writeDb.deleteVersion(version.id);
    setVersions(versions.filter((v) => v.id !== version.id));
    toast({
      title: 'Version deleted',
      status: 'info',
      duration: 2000,
    });
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Version History</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {isLoading ? (
              <Flex justify="center" py={8}>
                <Spinner />
              </Flex>
            ) : versions.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No versions saved yet. Versions are created automatically when you delete items or use text mode.
              </Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {versions.map((version, index) => (
                  <Box
                    key={version.id}
                    p={3}
                    borderWidth={1}
                    borderRadius="md"
                    bg={index === 0 ? 'blue.50' : undefined}
                  >
                    <Flex justify="space-between" align="start">
                      <Box flex={1}>
                        <HStack>
                          <Text fontWeight="medium">{getVersionDescription(version, index)}</Text>
                          {index === 0 && (
                            <Badge colorScheme="blue" fontSize="xs">
                              Latest
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {formatDate(version.timestamp)}
                        </Text>
                        <HStack mt={1} spacing={4}>
                          <Text fontSize="xs" color="gray.400">
                            {version.itemCount} item{version.itemCount === 1 ? '' : 's'}
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            {version.checkedCount} checked
                          </Text>
                        </HStack>
                      </Box>
                      <HStack>
                        <IconButton
                          aria-label="Restore version"
                          icon={<AiOutlineRollback />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRestoreClick(version)}
                        />
                        <IconButton
                          aria-label="Delete version"
                          icon={<AiOutlineDelete />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(version)}
                        />
                      </HStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={restoreDialog.isOpen} leastDestructiveRef={cancelRef} onClose={restoreDialog.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Restore Version?</AlertDialogHeader>
            <AlertDialogBody>
              This will replace your current packing list with this version. A backup of your current list will be saved
              first.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={restoreDialog.onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={confirmRestore} ml={3}>
                Restore
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
