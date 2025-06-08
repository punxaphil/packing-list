import { CloseIcon } from '@chakra-ui/icons';
import { IconButton, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { PLIconButton } from '~/components/shared/PLIconButton.tsx';

export function Search({
  onToggle,
  isOpen,
}: {
  onToggle: () => void;
  isOpen: boolean;
}) {
  return (
    <PLIconButton
      aria-label="Search items"
      icon={<AiOutlineSearch />}
      onClick={onToggle}
      mr={2}
      colorScheme={isOpen ? 'blue' : undefined}
    />
  );
}

export function SearchInput({
  onSearch,
  onClose,
}: {
  onSearch: (searchText: string) => void;
  onClose?: () => void;
}) {
  const [searchText, setSearchText] = useState('');
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  function handleSearch(value: string) {
    setSearchText(value);
  }

  function handleClearSearch() {
    setSearchText('');
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape' && onClose) {
      onClose();
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchRef.current(searchText);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  useEffect(() => {
    const input = document.getElementById('search-input');
    if (input) {
      input.focus();
    }
  }, []);

  return (
    <InputGroup>
      <Input
        id="search-input"
        placeholder="Search items by name..."
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        size="md"
        autoComplete="off"
      />
      {searchText && (
        <InputRightElement>
          <IconButton
            aria-label="Clear search"
            icon={<CloseIcon />}
            size="xs"
            variant="ghost"
            onClick={handleClearSearch}
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
}
