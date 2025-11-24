import {
  UsePaginationInstanceProps,
  UsePaginationOptions,
  UsePaginationState,
} from 'react-table'

declare module 'react-table' {
  export interface TableOptions<D extends object>
    extends UsePaginationOptions<D>,
      Record<string, any> {}

  export interface TableInstance<D extends object>
    extends UsePaginationInstanceProps<D> {}

  export interface TableState<D extends object> extends UsePaginationState<D> {}
}
