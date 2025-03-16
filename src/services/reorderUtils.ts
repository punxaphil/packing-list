import { DropResult } from '@hello-pangea/dnd';
import { NamedEntity } from '../types/NamedEntity.ts';

export async function reorderAndSave(
  dropResult: DropResult,
  saveToDb: (toUpdate: NamedEntity[] | NamedEntity) => Promise<void>,
  namedEntities: NamedEntity[],
  callback: (reordered: NamedEntity[]) => void
) {
  if (!dropResult.destination) {
    return;
  }
  const reordered = reorder(dropResult.source.index, dropResult.destination.index, namedEntities);
  reordered.forEach((entity, index) => {
    entity.rank = reordered.length - index;
  });
  callback(reordered);
  await saveToDb(reordered);
}

function reorder(startIndex: number, endIndex: number, namedEntities: NamedEntity[]) {
  const result = [...namedEntities];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}
