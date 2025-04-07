import { useState, useEffect, useCallback, useRef } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import { useRouter } from 'src/routes/hooks';
import { DashboardContent } from 'src/layouts/dashboard';

import axios from 'src/utils/axios'; // Use the configured axios instance
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';

import { TableNoData } from 'src/sections/user/table-no-data';
import { TableEmptyRows } from 'src/sections/user/table-empty-rows';
import UserTableHeadComponent from 'src/sections/user/user-table-head';
import { emptyRows, applyFilter, getComparator } from 'src/sections/user/utils';
import { useTable } from 'src/routes/hooks/use-table';

// ----------------------------------------------------------------------

interface Log {
  id: number;
  url: string;
  type: string;
  isSafe: boolean;
  timestamp: string;
}

// SVG Component for Safe (Green Checkmark)
function SafeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
      <path
        fill="#75d35a"
        fillRule="evenodd"
        d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20m10.742-26.33a1 1 0 1 0-1.483-1.34L21.28 29.567l-6.59-6.291a1 1 0 0 0-1.382 1.446l7.334 7l.743.71l.689-.762z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// SVG Component for Unsafe (Red X)
function UnsafeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="#fc1a02"
        fillRule="evenodd"
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10m4.066-14.066a.75.75 0 0 1 0 1.06L13.06 12l3.005 3.005a.75.75 0 0 1-1.06 1.06L12 13.062l-3.005 3.005a.75.75 0 1 1-1.06-1.06L10.938 12L7.934 8.995a.75.75 0 1 1 1.06-1.06L12 10.938l3.005-3.005a.75.75 0 0 1 1.06 0"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function UserView() {
  const table = useTable();
  const router = useRouter();

  const [logs, setLogs] = useState<Log[]>([]);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state
  const isFetching = useRef(false); // Track fetching state

  const fetchLogs = useCallback(async () => {
    if (isFetching.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    isFetching.current = true;
    setLoading(true);
    try {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const token = localStorage.getItem('token');
      console.log('isAuthenticated:', isAuthenticated);
      console.log('Token in localStorage:', token);

      if (!isAuthenticated || !token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get('/api/admin/logs'); // Use configured axios instance
      console.log('Fetched logs:', response.data);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      alert('Failed to fetch logs. Please log in again.');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      router.push('/sign-in');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [router]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const dataFiltered: Log[] = applyFilter({
    inputData: logs,
    comparator: getComparator(table.order, table.orderBy),
    filterName: filterType,
  });

  const notFound = !dataFiltered.length && !!filterType;

  if (loading) {
    return (
      <DashboardContent>
        <Typography variant="h4" mb={5}>
          Logs
        </Typography>
        <Typography>Loading...</Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Logs
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mdi:refresh" />}
          onClick={fetchLogs}
        >
          Refresh
        </Button>
      </Box>

      <Card>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            label="Filter by type (e.g., PHISHING, CODE_SAFETY)"
            value={filterType}
            onChange={(event) => {
              setFilterType(event.target.value);
              table.onResetPage();
            }}
            sx={{ maxWidth: '300px' }}
          />
        </Box>

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHeadComponent
                order={table.order}
                orderBy={table.orderBy}
                rowCount={logs.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked: boolean) =>
                  table.onSelectAllRows(
                    checked,
                    logs.map((log) => log.id.toString())
                  )
                }
                headLabel={[
                  { id: 'url', label: 'URL' },
                  { id: 'type', label: 'Type' },
                  { id: 'isSafe', label: 'Safe', align: 'center' },
                  { id: 'timestamp', label: 'Timestamp' },
                ]}
              />
              <TableBody>
                {logs.length === 0 && !filterType ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                      <Typography variant="body2">No logs available.</Typography>
                    </td>
                  </tr>
                ) : (
                  <>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <LogTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id.toString())}
                          onSelectRow={() => table.onSelectRow(row.id.toString())}
                        />
                      ))}

                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, logs.length)}
                    />

                    {notFound && <TableNoData searchQuery={filterType} />}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={logs.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

function LogTableRow({ row, selected, onSelectRow }: { row: Log; selected: boolean; onSelectRow: () => void }) {
  return (
    <tr style={{ height: 68 }}>
      <td>
        <input type="checkbox" checked={selected} onChange={onSelectRow} />
      </td>
      <td>{row.url}</td>
      <td>{row.type}</td>
      <td style={{ textAlign: 'center' }}>
        <Tooltip title={row.isSafe ? 'Safe' : 'Unsafe'} arrow>
          <Box sx={{ display: 'inline-block' }}>
            {row.isSafe ? <SafeIcon /> : <UnsafeIcon />}
          </Box>
        </Tooltip>
      </td>
      <td>{row.timestamp}</td>
    </tr>
  );
}