import 'bulma/css/bulma.min.css';

import PackingList from './components/PackingList.tsx';
import Members from './components/Members.tsx';

import { Provider } from './components/Provider.tsx';
import React from 'react';
import NavButton from './components/NavButton.tsx';

export default function App() {
  const [page, setPage] = React.useState('Home');

  return (
    <Provider>
      <div className="content p-5">
        <h1>Packing List</h1>
        <div className="buttons">
          <NavButton name={'Home'} page={page} setPage={setPage}></NavButton>
          <NavButton name={'Members'} page={page} setPage={setPage}></NavButton>
        </div>
        {page === 'Home' && <PackingList></PackingList>}
        {page === 'Members' && <Members></Members>}
      </div>
    </Provider>
  );
}

