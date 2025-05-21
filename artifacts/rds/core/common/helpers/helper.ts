export interface Delta {
  added: any[];
  changed: any[];
  deleted: any[];
}

export function computeDeltaArray(localKeyFunc, source: any[], updated: any[]): Delta {
  const delta: Delta = {
    added: [],
    changed: [],
    deleted: [],
  };

  for (const updatedItem of updated) {
    if (
      source.find((sourceItem) => localKeyFunc(sourceItem) === localKeyFunc(updatedItem)) ===
      undefined
    ) {
      delta.added.push(updatedItem);
    }
  }

  for (const sourceItem of source) {
    const toUpdateItem: any = updated.find(
      (updatedItem) => localKeyFunc(updatedItem) === localKeyFunc(sourceItem),
    );
    if (toUpdateItem !== undefined) {
      delta.changed.push([sourceItem, toUpdateItem]);
    } else if (
      updated.find((updatedItem) => localKeyFunc(updatedItem) === localKeyFunc(sourceItem)) ===
      undefined
    ) {
      delta.deleted.push(sourceItem);
    }
  }

  return delta;
}
