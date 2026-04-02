import type { Modifier } from '@dnd-kit/core';

export function createSnapToGridModifier(rowHeight: number): Modifier {
  return ({ transform }) => ({
    ...transform,
    y: Math.round(transform.y / rowHeight) * rowHeight,
  });
}
