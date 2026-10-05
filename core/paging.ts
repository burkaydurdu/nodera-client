/** A page of a cursor-paged list; a null cursor means the list ends here. */
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface CursorQuery {
  /** The `nextCursor` of the page before; omitted for the first page. */
  cursor?: string;
}
