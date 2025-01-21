import 'bulma/css/bulma.min.css';

import PackingList from './components/packing-list/PackingList.tsx';
import Members from './components/member/Members.tsx';

import { Provider } from './components/Provider.tsx';
import { useState } from 'react';
import NavButton from './components/shared/NavButton.tsx';
import Categories from './components/category/Categories.tsx';

export default function App() {
  const [page, setPage] = useState('Home');

  return (
    <Provider>
      <div className="content p-5">
        <h1>Packing List</h1>
        <div className="buttons">
          <NavButton name={'Home'} page={page} setPage={setPage}></NavButton>
          <NavButton name={'Members'} page={page} setPage={setPage}></NavButton>
          <NavButton
            name={'Categories'}
            page={page}
            setPage={setPage}
          ></NavButton>
        </div>
        {page === 'Home' && <PackingList></PackingList>}
        {page === 'Members' && <Members></Members>}
        {page === 'Categories' && <Categories></Categories>}
      </div>
    </Provider>
  );
}
