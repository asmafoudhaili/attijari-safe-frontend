import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

interface HeadLabel {
  id: string;
  label: string;
  align?: 'center' | 'left' | 'right';
}

interface ReclamationTableHeadProps {
  order: 'asc' | 'desc';
  orderBy: string;
  rowCount: number;
  headLabel: HeadLabel[];
  numSelected: number;
  onSort: (id: string) => void;
  onSelectAllRows: (checked: boolean, newSelecteds: string[]) => void;
}

export default function ReclamationTableHead({
  order,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onSort,
  onSelectAllRows,
}: ReclamationTableHeadProps) {
  const visuallyHidden = {
    border: 0,
    margin: -1,
    padding: 0,
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    clip: 'rect(0 0 0 0)',
  } as const;

  return (
    <TableHead>
      <TableRow>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={() => onSort(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHidden }}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

ReclamationTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  headLabel: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(['center', 'left', 'right']),
    })
  ).isRequired,
  numSelected: PropTypes.number.isRequired,
  onSort: PropTypes.func.isRequired,
  onSelectAllRows: PropTypes.func.isRequired,
};