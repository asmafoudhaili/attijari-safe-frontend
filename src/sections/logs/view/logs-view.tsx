import { useState, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import { useRouter } from 'src/routes/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import axios from 'src/utils/axios';
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';
import { TableNoData } from 'src/sections/logs/table-no-data';
import { TableEmptyRows } from 'src/sections/logs/table-empty-rows';
import { emptyRows, applyFilter, getComparator } from 'src/sections/logs/utils';
import { useTable } from 'src/routes/hooks/use-table';
import LogsTableHead from 'src/sections/logs/logs-table-head';

// Interfaces
interface LogBase {
  id: number;
  url: string;
  isSafe: boolean;
  timestamp: string;
}
interface PhishingLog extends LogBase { probability: number; }
interface RansomwareLog extends LogBase { probability: number; walletAddress: string; }
interface DoSLog extends LogBase { probability: number; }
interface CodeSafetyLog extends LogBase { anomalyScore: number; }

// SVG Components
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

export function LogsView() {
  const router = useRouter();

  const tablePhishing = useTable({ defaultFilterName: '' });
  const tableRansomware = useTable({ defaultFilterName: '' });
  const tableDoS = useTable({ defaultFilterName: '' });
  const tableCodeSafety = useTable({ defaultFilterName: '' });

  const [phishingLogs, setPhishingLogs] = useState<PhishingLog[]>([]);
  const [ransomwareLogs, setRansomwareLogs] = useState<RansomwareLog[]>([]);
  const [doSLogs, setDoSLogs] = useState<DoSLog[]>([]);
  const [codeSafetyLogs, setCodeSafetyLogs] = useState<CodeSafetyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchLogs = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await axios.get('/api/admin/notifications/history', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const phishing: PhishingLog[] = [];
      const ransomware: RansomwareLog[] = [];
      const dos: DoSLog[] = [];
      const codeSafety: CodeSafetyLog[] = [];

      response.data.forEach((notification: any, index: number) => {
        const details = JSON.parse(notification.details);
        const baseLog = {
          id: notification.id || index + 1,
          url: details.url || details.code || 'N/A',
          isSafe: notification.isSafe,
          timestamp: notification.timestamp,
        };

        switch (notification.threatType) {
          case 'phishing':
            phishing.push({ ...baseLog, probability: details.probability || 0 });
            break;
          case 'ransomware':
            ransomware.push({ ...baseLog, probability: details.probability || 0, walletAddress: details.wallet_address || 'N/A' });
            break;
          case 'dos':
            dos.push({ ...baseLog, probability: details.probability || 0 });
            break;
          case 'codeSafety':
            codeSafety.push({ ...baseLog, anomalyScore: details.anomaly_score || 0 });
            break;
          default:
            break;
        }
      });

      setPhishingLogs(phishing);
      setRansomwareLogs(ransomware);
      setDoSLogs(dos);
      setCodeSafetyLogs(codeSafety);
    } catch (error) {
      console.error('Error fetching logs:', error);
      alert('Failed to fetch logs. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      router.push('/sign-in');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [router]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getFilteredData = (data: any[], tableHook: any) =>
    applyFilter({
      inputData: data,
      comparator: getComparator(tableHook.order, tableHook.orderBy),
      filterName: tableHook.filterName,
    });

  const phishingData = getFilteredData(phishingLogs, tablePhishing);
  const ransomwareData = getFilteredData(ransomwareLogs, tableRansomware);
  const dosData = getFilteredData(doSLogs, tableDoS);
  const codeSafetyData = getFilteredData(codeSafetyLogs, tableCodeSafety);

  if (loading) {
    return (
      <DashboardContent>
        <Typography variant="h4" mb={5}>Logs</Typography>
        <Typography>Loading...</Typography>
      </DashboardContent>
    );
  }

  const renderTable = (title: string, data: any[], columns: any[], tableHook: any) => (
    <Card sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>{title}</Typography>
      <TextField
        fullWidth
        type="date"
        value={tableHook.filterName}
        onChange={(event) => {
          tableHook.onFilterName(event.target.value);
          tableHook.onResetPage();
        }}
        InputLabelProps={{ shrink: true }}
        sx={{ p: 2, maxWidth: '300px' }}
      />
      <Scrollbar>
        <TableContainer>
          <Table sx={{ minWidth: 600 }}>
            <LogsTableHead
              order={tableHook.order}
              orderBy={tableHook.orderBy}
              rowCount={data.length}
              numSelected={0}
              onSort={tableHook.onSort}
              headLabel={columns}
              onSelectAllRows={() => {}}
            />
            <TableBody>
              {data.length === 0 && !tableHook.filterName ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2">No logs available.</Typography>
                  </td>
                </tr>
              ) : (
                <>
                  {data
                    .slice(tableHook.page * tableHook.rowsPerPage, tableHook.page * tableHook.rowsPerPage + tableHook.rowsPerPage)
                    .map((row) => (
                      <tr key={row.id} style={{ height: 68 }}>
                        {columns.map((col) => (
                          <td key={col.id} style={{ padding: '8px 16px', textAlign: col.align }}>
                            {col.id === 'isSafe' ? (
                              <Tooltip title={row.isSafe ? 'Safe' : 'Unsafe'} arrow>
                                <Box sx={{ display: 'inline-block' }}>{row.isSafe ? <SafeIcon /> : <UnsafeIcon />}</Box>
                              </Tooltip>
                            ) : col.id === 'probability' ? (
                              `${Math.round(row[col.id] * 100)}%`
                            ) : col.id === 'anomalyScore' ? (
                              row[col.id]?.toFixed(2) || 'N/A'
                            ) : (
                              row[col.id]?.toString() || 'N/A'
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  <TableEmptyRows height={68} emptyRows={emptyRows(tableHook.page, tableHook.rowsPerPage, data.length)} />
                  {!data.length && tableHook.filterName && <TableNoData searchQuery={tableHook.filterName} />}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
      <TablePagination
        component="div"
        page={tableHook.page}
        count={data.length}
        rowsPerPage={tableHook.rowsPerPage}
        onPageChange={tableHook.onChangePage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={tableHook.onChangeRowsPerPage}
      />
    </Card>
  );

  const phishingColumns = [
    { id: 'url', label: 'URL', align: 'center' },
    { id: 'isSafe', label: 'Safe', align: 'center' },
    { id: 'timestamp', label: 'Timestamp', align: 'center' },
    { id: 'probability', label: 'Probability (%)', align: 'center' },
  ];

  const ransomwareColumns = [
    { id: 'url', label: 'URL', align: 'center' },
    { id: 'isSafe', label: 'Safe', align: 'center' },
    { id: 'timestamp', label: 'Timestamp', align: 'center' },
    { id: 'probability', label: 'Probability (%)', align: 'center' },
    { id: 'walletAddress', label: 'Wallet Address', align: 'center' },
  ];

  const dosColumns = [
    { id: 'url', label: 'URL', align: 'center' },
    { id: 'isSafe', label: 'Safe', align: 'center' },
    { id: 'timestamp', label: 'Timestamp', align: 'center' },
    { id: 'probability', label: 'Probability (%)', align: 'center' },
  ];

  const codeSafetyColumns = [
    { id: 'url', label: 'URL/Code', align: 'center' },
    { id: 'isSafe', label: 'Safe', align: 'center' },
    { id: 'timestamp', label: 'Timestamp', align: 'center' },
    { id: 'anomalyScore', label: 'Anomaly Score', align: 'center' },
  ];

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>Logs</Typography>
        <Button variant="contained" color="inherit" startIcon={<Iconify icon="mdi:refresh" />} onClick={fetchLogs}>
          Refresh
        </Button>
      </Box>

      {renderTable('Phishing Logs', phishingData, phishingColumns, tablePhishing)}
      {renderTable('Ransomware Logs', ransomwareData, ransomwareColumns, tableRansomware)}
      {renderTable('DoS Logs', dosData, dosColumns, tableDoS)}
      {renderTable('Code Safety Logs', codeSafetyData, codeSafetyColumns, tableCodeSafety)}
    </DashboardContent>
  );
}