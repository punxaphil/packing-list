import { FaTrash } from '@react-icons/all-files/fa/FaTrash';
import { ChangeEvent } from 'react';
import { useCategoriesDispatch } from '../../services/contexts.ts';
import { ActionType } from '../../types/Action.tsx';
import { Category } from '../../types/Category.tsx';

export default function CategoryRow({ category }: { category: Category }) {
  const dispatch = useCategoriesDispatch();

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    dispatch({
      type: ActionType.Changed,
      category,
      newName: event.target.value,
    });
  }

  function onRemove() {
    dispatch({
      type: ActionType.Deleted,
      category,
    });
  }

  return (
    <div className="is-flex my-1">
      <input
        type="text"
        value={category.name}
        onChange={handleOnChange}
        className="input"
      ></input>
      <button onClick={onRemove} className="button is-ghost has-text-current">
        <FaTrash className="is-small mx-1" />
      </button>
    </div>
  );
}
