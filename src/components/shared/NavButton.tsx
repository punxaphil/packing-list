import { Button } from '@radix-ui/themes';

export default function NavButton({
  name,
  page,
  setPage,
}: {
  name: string;
  page: string;
  setPage: (name: string) => void;
}) {
  return (
    <Button onClick={() => setPage(name)} variant={page === name ? undefined : 'soft'}>
      {name}
    </Button>
  );
}
