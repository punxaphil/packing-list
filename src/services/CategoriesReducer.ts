import { ActionType, CategoryAction } from '../types/Action.tsx';
import { Category } from '../types/Category.tsx';

const STORAGE_KEY = 'categories';

export function categoriesReducer(
  categories: Category[],
  action: CategoryAction
) {
  let updatedCategories = categories;
  const { Added, Deleted, Changed } = ActionType;
  if (action.type === Added) {
    updatedCategories = action.name
      ? addCategory(categories, action.name)
      : categories;
  } else if (action.type === Changed) {
    if (action.newName != null) {
      updatedCategories = changeCategory(
        categories,
        action.category,
        action.newName
      );
    }
  } else if (action.type === Deleted) {
    updatedCategories = categories.filter((t) => t.id !== action.category?.id);
  } else {
    throw Error(`Unknown action type: ${JSON.stringify(action)}`);
  }
  saveCategories(updatedCategories);
  return updatedCategories;
}

function addCategory(categories: Category[], name: string) {
  const nextAvailableId =
    categories.reduce((max, t) => Math.max(max, t.id), 0) + 1;

  if (categories.find((t) => t.name === name)) {
    return categories;
  }

  return [
    ...categories,
    {
      id: nextAvailableId,
      name,
    },
  ];
}

function changeCategory(
  categories: Category[],
  category?: Category,
  newName?: string
) {
  if (!category || !newName) {
    return categories;
  }
  return categories.map((t) => {
    if (t.id === category.id) {
      return { ...t, name: newName };
    } else {
      return t;
    }
  });
}

function saveCategories(categories: Category[]) {
  categories.sort((a: Category, b: Category) => a.name.localeCompare(b.name));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

export function initialCategories(): Category[] {
  const localCategories = localStorage.getItem(STORAGE_KEY);
  return localCategories ? (JSON.parse(localCategories) as Category[]) : [];
}
