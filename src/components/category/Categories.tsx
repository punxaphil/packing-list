import { ChangeEvent, useState, KeyboardEvent } from 'react';
import { useCategories, useCategoriesDispatch } from '../../services/contexts';
import { ActionType } from '../../types/Action';
import CategoryRow from './CategoryRow';

export default function Categories() {
  const categories = useCategories();
  const dispatch = useCategoriesDispatch();

  const [newName, setNewName] = useState<string>('');

  function handleAdd() {
    dispatch({
      type: ActionType.Added,
      name: newName,
    });
    setNewName('');
  }

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    setNewName(event.target.value);
  }

  function handleEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleAdd();
    }
  }

  return (
    <div className="card p-3">
      {categories.map((item, index) => (
        <CategoryRow category={item} key={index} />
      ))}
      <div className="mt-4 is-flex">
        <input
          type="text"
          value={newName}
          onChange={handleOnChange}
          onKeyDown={handleEnter}
          className="input"
        ></input>
        <button onClick={handleAdd} className="button is-light is-success mx-2">
          Add category
        </button>
      </div>
    </div>
  );
}
