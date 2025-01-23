export default function NavButton({ name, page, setPage }: {
  name: string,
  page: string,
  setPage: (name: string) => void
}) {

  return (
    <button onClick={() => setPage(name)} className={`button ${page === name ? 'is-info' : 'is-light'}`}>{name}
    </button>
  );

}

