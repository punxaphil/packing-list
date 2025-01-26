import 'bulma/css/bulma.min.css';

import PackingList from './components/packing-list/PackingList.tsx';
import Members from './components/member/Members.tsx';

import { Provider } from './components/Provider.tsx';
import { useEffect, useState } from 'react';
import NavButton from './components/shared/NavButton.tsx';
import { Member } from './types/Member.tsx';
import { Item } from './types/Item.tsx';
import { loadData } from './services/api.ts';
import { Category } from './types/Category.tsx';
import Categories from './components/category/Categories.tsx';

export default function App() {
  const [page, setPage] = useState('Home');
  const [loading, setLoading] = useState(true);
  const [initialMembers, setInitialMembers] = useState<Member[]>([]);
  const [initialItems, setInitialItems] = useState<Item[]>([]);
  const [initialCategories, setInitialCategories] = useState<Category[]>([]);

  useEffect(() => loadData(setInitialMembers, setInitialItems, setInitialCategories, setLoading), []);

  return (
    <>
      {loading ? <div>Loading...</div> :
        <Provider initialMembers={initialMembers} initialItems={initialItems} initialCategories={initialCategories}>
          <div className="content p-5">
            <h1>Packing List</h1>
            <div className="buttons">
              <NavButton name={'Home'} page={page} setPage={setPage}></NavButton>
              <NavButton name={'Members'} page={page} setPage={setPage}></NavButton>
              <NavButton name={'Categories'} page={page} setPage={setPage}></NavButton>
            </div>
            {page === 'Home' && <PackingList></PackingList>}
            {page === 'Members' && <Members></Members>}
            {page === 'Categories' && <Categories></Categories>}
          </div>
        </Provider>
      }
    </>
  );
}
