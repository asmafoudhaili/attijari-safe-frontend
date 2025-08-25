// src/routes/hooks/use-table.tsx
import { useState } from 'react';

export type UseTableReturn = {
  page: number;
  order: 'asc' | 'desc';
  orderBy: string;
  selected: string[];
  rowsPerPage: number;
  onSort: (id: string) => void;
  onSelectRow: (inputValue: string) => void;
  onResetPage: () => void;
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectAllRows: (checked: boolean, newSelecteds: string[]) => void;
  filterName: string;
  onFilterName: (value: string) => void;
};

export function useTable({ defaultOrder, defaultOrderBy, defaultRowsPerPage, defaultFilterName }: {
  defaultOrder?: 'asc' | 'desc';
  defaultOrderBy?: string;
  defaultRowsPerPage?: number;
  defaultFilterName?: string;
} = {}): UseTableReturn {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>(defaultOrder || 'asc');
  const [orderBy, setOrderBy] = useState(defaultOrderBy || '');
  const [selected, setSelected] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage || 5);
  const [filterName, setFilterName] = useState(defaultFilterName || '');

  const onSort = (id: string) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  const onSelectRow = (inputValue: string) => {
    const selectedIndex = selected.indexOf(inputValue);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, inputValue];
    } else if (selectedIndex === 0) {
      newSelected = selected.slice(1);
    } else if (selectedIndex === selected.length - 1) {
      newSelected = selected.slice(0, -1);
    } else if (selectedIndex > 0) {
      newSelected = [...selected.slice(0, selectedIndex), ...selected.slice(selectedIndex + 1)];
    }

    setSelected(newSelected);
  };

  const onResetPage = () => {
    setPage(0);
  };

  const onChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const onChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onSelectAllRows = (checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const onFilterName = (value: string) => {
    setFilterName(value);
  };

  return {
    page,
    order,
    orderBy,
    selected,
    rowsPerPage,
    onSort,
    onSelectRow,
    onResetPage,
    onChangePage,
    onChangeRowsPerPage,
    onSelectAllRows,
    filterName,
    onFilterName,
  };
}