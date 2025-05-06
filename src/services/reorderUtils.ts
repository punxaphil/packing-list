import { DropResult } from '@hello-pangea/dnd';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { reorderArray } from './utils'; // Import the generic reorderArray function

export async function reorderAndSave(
  dropResult: DropResult,
  saveToDb: (toUpdate: NamedEntity[] | NamedEntity) => Promise<void>,
  namedEntities: NamedEntity[],
  callback: (reordered: NamedEntity[]) => void
) {
  if (!dropResult.destination) {
    return;
  }
  // Use the generic reorderArray function from utils.ts
  const reordered = reorderArray(namedEntities, dropResult.source.index, dropResult.destination.index);
  reordered.forEach((entity, index) => {
    entity.rank = reordered.length - index;
  });
  callback(reordered);
  await saveToDb(reordered);
}
