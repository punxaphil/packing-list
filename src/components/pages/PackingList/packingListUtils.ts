import { DragUpdate } from '@hello-pangea/dnd';
import { CHECKED_FILTER_STATE, UNCHECKED_FILTER_STATE } from '~/components/pages/PackingList/Filter.tsx';
import { ColumnList, PackingListRow } from '~/types/Column.ts';
import { GroupedPackItem } from '~/types/GroupedPackItem.ts';
import { MemberPackItem } from '~/types/MemberPackItem.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';

const COLUMN_THRESHOLD = 15;

export function flattenGroupedPackItems(grouped: GroupedPackItem[]) {
  const flattened: PackingListRow[] = [];
  for (const { category, packItems } of grouped) {
    flattened.push(new PackingListRow({ category }));
    for (const packItem of packItems) {
      flattened.push(new PackingListRow({ packItem }));
    }
  }
  return flattened;
}

export function reorder(
  dragUpdate: DragUpdate,
  columns: ColumnList[],
  nbrOfColumns: number
): [PackingListRow[], ColumnList[]] | [null, null] {
  const { source, destination } = dragUpdate;

  const [sourceColumn, destinationColumn] = getSourceAndDestinationColumns(dragUpdate, columns);
  if (!(destination && sourceColumn && destinationColumn)) {
    return [null, null];
  }
  const [removed] = sourceColumn.rows.splice(source.index, 1);
  destinationColumn.rows.splice(destination.index, 0, removed);

  const allRows: PackingListRow[] = [];
  for (const column of columns) {
    allRows.push(...column.rows);
  }
  const newColumns = createColumns(allRows, nbrOfColumns);
  return [allRows, newColumns];
}

export function createColumns(rows: PackingListRow[], nbrOfColumns: number): ColumnList[] {
  let columns: PackingListRow[][] = [];
  if (nbrOfColumns > 1) {
    const arraySize = rows.map((item) => item.getSize()).reduce((a, b) => a + b, 0);
    const numColumns: number =
      arraySize > 2 * COLUMN_THRESHOLD && nbrOfColumns === 3 ? 3 : arraySize > COLUMN_THRESHOLD ? 2 : 1;
    const chunkSize = Math.max(COLUMN_THRESHOLD, Math.ceil(arraySize / numColumns));
    let addedSize = 0;

    for (const entity of rows) {
      addedSize += entity.getSize();
      const arrayToAddTo = Math.ceil(addedSize / chunkSize) - 1;
      if (!columns[arrayToAddTo]) {
        columns[arrayToAddTo] = [];
      }
      columns[arrayToAddTo].push(entity);
    }
  } else {
    columns = [rows];
  }
  moveLastCategoryToNextColumn(columns);
  return columns.map((rows, index) => ({ key: index.toString(), rows }));
}

function moveLastCategoryToNextColumn(columns: PackingListRow[][]) {
  for (let i = 0; i < columns.length - 1; i++) {
    const lastItem = columns[i][columns[i].length - 1];
    if (lastItem.category) {
      columns[i].pop();
      columns[i + 1].unshift(lastItem);
    }
  }
}

export function getMemberRows(
  memberPackItems: MemberPackItem[],
  filteredMembers: string[],
  members: NamedEntity[],
  filteredPackItemStates: string[] = []
) {
  let filtered: MemberPackItem[];
  if (!filteredMembers.length) {
    filtered = memberPackItems;
  } else {
    filtered = memberPackItems.filter(({ id }) => filteredMembers.includes(id));
  }

  // Apply pack item state filtering to individual members
  if (filteredPackItemStates.length > 0) {
    filtered = filtered.filter((memberItem) => {
      return (
        (filteredPackItemStates.includes(CHECKED_FILTER_STATE) && memberItem.checked) ||
        (filteredPackItemStates.includes(UNCHECKED_FILTER_STATE) && !memberItem.checked)
      );
    });
  }

  return (
    filtered.map((m) => {
      const member = members.find((t) => t.id === m.id);
      if (!member) {
        throw new Error(`Member with id ${m.id} not found`);
      }
      return {
        memberItem: m,
        member: member,
      };
    }) ?? []
  );
}

function getSourceAndDestinationColumns({ source, destination }: DragUpdate, columns: ColumnList[]) {
  if (destination && source && (source.index !== destination.index || source.droppableId !== destination.droppableId)) {
    const sourceColumn = columns.find((h) => h.key === source.droppableId);
    const destinationColumn = columns.find((h) => h.key === destination.droppableId);
    if (sourceColumn && destinationColumn) {
      return [sourceColumn, destinationColumn];
    }
  }
  return [null, null];
}
