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
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { useRouter } from 'src/routes/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import axios from 'src/utils/axios';
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';
import { TableNoData } from 'src/sections/user/table-no-data';
import { TableEmptyRows } from 'src/sections/user/table-empty-rows';
import LogsTableHeadComponent from 'src/sections/reclamation/reclamation-table-head';
import { emptyRows, applyFilter, getComparator } from 'src/sections/user/utils';
import { useTable } from 'src/routes/hooks/use-table';

interface ReclamationLog {
  id: number;
  itemHash: string;
  threatType: string;
  details: string;
  user: string;
  timestamp: string;
  processed: boolean;
  isSafe: boolean;
}

function SafeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
      <path fill="#75d35a" fillRule="evenodd" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20m10.742-26.33a1 1 0 1 0-1.483-1.34L21.28 29.567l-6.59-6.291a1 1 0 0 0-1.382 1.446l7.334 7l.743.71l.689-.762z" clipRule="evenodd" />
    </svg>
  );
}

function UnsafeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="#fc1a02" fillRule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10m4.066-14.066a.75.75 0 0 1 0 1.06L13.06 12l3.005 3.005a.75.75 0 0 1-1.06 1.06L12 13.062l-3.005 3.005a.75.75 0 1 1-1.06-1.06L10.938 12L7.934 8.995a.75.75 0 1 1 1.06-1.06L12 10.938l3.005-3.005a.75.75 0 0 1 1.06 0" clipRule="evenodd" />
    </svg>
  );
}

export function ReclamationsView() {
  const router = useRouter();
  const table = useTable({ defaultFilterName: '' });
  const [reclamationLogs, setReclamationLogs] = useState<ReclamationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const isFetching = useRef(false);

  const SPRING_BOOT_URL = 'http://localhost:8080';

  const fetchReclamations = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await axios.get<ReclamationLog[]>(`${SPRING_BOOT_URL}/api/admin/reclamations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReclamationLogs(response.data);
    } catch (error: any) {
      console.error('Error fetching reclamations:', error.message);
      setSnackbar({ open: true, message: 'Failed to fetch reclamations. Please log in again.', severity: 'error' });
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      router.push('/sign-in');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [router]);

  const handleConfirmReclamation = useCallback(
    async (id: number, isSafe: boolean) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const payload = { id, isSafe, processed: true };
        const response = await axios.post(`${SPRING_BOOT_URL}/api/admin/confirm-reclamation`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status !== 200) throw new Error('Failed to confirm reclamation');

        setReclamationLogs((prev) => prev.filter((log) => log.id !== id));
        setSnackbar({ open: true, message: `Reclamation marked as ${isSafe ? 'safe' : 'not safe'}`, severity: 'success' });

        // Refresh notifications to reflect updated safe status
        const notificationResponse = await axios.get(`${SPRING_BOOT_URL}/api/admin/notifications/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Assuming NotificationsPopover listens to this endpoint or SSE updates
      } catch (error: any) {
        console.error('Error confirming reclamation:', error.message);
        setSnackbar({ open: true, message: 'Failed to confirm reclamation', severity: 'error' });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('isAuthenticated');
          router.push('/sign-in');
        }
      }
    },
    [router]
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    fetchReclamations();
  }, [fetchReclamations]);

  const dataFiltered = applyFilter({
    inputData: reclamationLogs,
    comparator: getComparator(table.order, table.orderBy),
    filterName: table.filterName,
  });

  const notFound = !dataFiltered.length && !!table.filterName;

  if (loading) {
    return (
      <DashboardContent>
        <Typography variant="h4" mb={5}>Reclamations</Typography>
        <Typography>Loading...</Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>Reclamations</Typography>
        <Button variant="contained" color="inherit" startIcon={<Iconify icon="mdi:refresh" />} onClick={fetchReclamations}>
          Refresh
        </Button>
      </Box>

      <Card>
        <Typography variant="h6" sx={{ p: 2 }}>Unprocessed Reclamations</Typography>
        <TextField
          fullWidth
          value={table.filterName}
          onChange={(event) => {
            table.onFilterName(event.target.value);
            table.onResetPage();
          }}
          placeholder="Filter by URL or User..."
          sx={{ p: 2, maxWidth: '300px' }}
        />
        <Scrollbar>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <LogsTableHeadComponent
                order={table.order}
                orderBy={table.orderBy}
                rowCount={reclamationLogs.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    reclamationLogs.map((log) => log.id.toString())
                  )
                }
                headLabel={[
                  { id: 'details', label: 'URL/Details' },
                  { id: 'threatType', label: 'Threat Type', align: 'center' },
                  { id: 'user', label: 'User' },
                  { id: 'timestamp', label: 'Timestamp' },
                  { id: 'actions', label: 'Actions', align: 'center' },
                ]}
              />
              <TableBody>
                {reclamationLogs.length === 0 && !table.filterName ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                      <Typography variant="body2">No unprocessed reclamations available.</Typography>
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
                        <tr key={row.id} style={{ height: 68 }}>
                          <td>{JSON.parse(row.details).url || JSON.parse(row.details).code || 'N/A'}</td>
                          <td style={{ textAlign: 'center' }}>
                            {row.threatType.charAt(0).toUpperCase() + row.threatType.slice(1)}
                          </td>
                          <td>{row.user}</td>
                          <td>{row.timestamp}</td>
                          <td style={{ textAlign: 'center' }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleConfirmReclamation(row.id, true)}
                              sx={{ mr: 1 }}
                            >
                              Safe
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => handleConfirmReclamation(row.id, false)}
                            >
                              Not Safe
                            </Button>
                          </td>
                        </tr>
                      ))}
                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, reclamationLogs.length)}
                    />
                    {notFound && <TableNoData searchQuery={table.filterName} />}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          component="div"
          page={table.page}
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}