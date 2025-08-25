// src/sections/logs/view/logs-view.tsx
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
import axios from 'src/utils/axios';
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';
import { TableNoData } from 'src/sections/user/table-no-data';
import { TableEmptyRows } from 'src/sections/user/table-empty-rows';
import UserTableHeadComponent from 'src/sections/user/user-table-head';
import { emptyRows, applyFilter, getComparator } from 'src/sections/user/utils';
import { useTable } from 'src/routes/hooks/use-table';

// Interfaces
interface PhishingLog {
  id: number;
  url: string;
  isSafe: boolean;
  timestamp: string;
  probability: number;
  prediction: string;
  error?: string;
}

interface RansomwareLog {
  id: number;
  url: string;
  isSafe: boolean;
  timestamp: string;
  probability: number;
  walletAddress: string;
  error?: string;
}

interface DoSLog {
  id: number;
  url: string;
  isSafe: boolean;
  timestamp: string;
  probability: number;
  error?: string;
}

interface CodeSafetyLog {
  id: number;
  url: string;
  isSafe: boolean;
  timestamp: string;
  prediction: string;
  anomalyScore: number;
  error?: string;
}

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

 // src/sections/logs/view/logs-view.tsx (partial update)
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
      const log = {
        id: notification.id || index + 1,
        url: details.url || details.code || 'N/A',
        isSafe: notification.isSafe,
        timestamp: notification.timestamp,
        error: details.error || 'N/A',
      };

      switch (notification.threatType) {
        case 'phishing':
          phishing.push({
            ...log,
            probability: details.probability || 0,
            prediction: details.prediction || 'N/A',
          });
          break;
        case 'ransomware':
          ransomware.push({
            ...log,
            probability: details.probability || 0,
            walletAddress: details.wallet_address || 'N/A',
          });
          break;
        case 'dos':
          dos.push({
            ...log,
            probability: details.probability || 0,
          });
          break;
        case 'codeSafety':
          codeSafety.push({
            ...log,
            prediction: details.prediction || 'N/A',
            anomalyScore: details.anomaly_score || 0,
          });
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
    localStorage.removeItem('isAuthenticated'); // Clear isAuthenticated
    router.push('/sign-in');
  } finally {
    setLoading(false);
    isFetching.current = false;
  }
}, [router]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const dataFilteredPhishing = applyFilter({
    inputData: phishingLogs,
    comparator: getComparator(tablePhishing.order, tablePhishing.orderBy),
    filterName: tablePhishing.filterName,
  });

  const dataFilteredRansomware = applyFilter({
    inputData: ransomwareLogs,
    comparator: getComparator(tableRansomware.order, tableRansomware.orderBy),
    filterName: tableRansomware.filterName,
  });

  const dataFilteredDoS = applyFilter({
    inputData: doSLogs,
    comparator: getComparator(tableDoS.order, tableDoS.orderBy),
    filterName: tableDoS.filterName,
  });

  const dataFilteredCodeSafety = applyFilter({
    inputData: codeSafetyLogs,
    comparator: getComparator(tableCodeSafety.order, tableCodeSafety.orderBy),
    filterName: tableCodeSafety.filterName,
  });

  const notFoundPhishing = !dataFilteredPhishing.length && !!tablePhishing.filterName;
  const notFoundRansomware = !dataFilteredRansomware.length && !!tableRansomware.filterName;
  const notFoundDoS = !dataFilteredDoS.length && !!tableDoS.filterName;
  const notFoundCodeSafety = !dataFilteredCodeSafety.length && !!tableCodeSafety.filterName;

  if (loading) {
    return (
      <DashboardContent>
        <Typography variant="h4" mb={5}>Logs</Typography>
        <Typography>Loading...</Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>Logs</Typography>
        <Button variant="contained" color="inherit" startIcon={<Iconify icon="mdi:refresh" />} onClick={fetchLogs}>
          Refresh
        </Button>
      </Box>

      {/* Phishing Logs Table */}
      <Card sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ p: 2 }}>Phishing Logs</Typography>
        <TextField
          fullWidth
          value={tablePhishing.filterName}
          onChange={(event) => {
            tablePhishing.onFilterName(event.target.value);
            tablePhishing.onResetPage();
          }}
          placeholder="Filter by URL or Prediction..."
          sx={{ p: 2, maxWidth: '300px' }}
        />
        <Scrollbar>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHeadComponent
                order={tablePhishing.order}
                orderBy={tablePhishing.orderBy}
                rowCount={phishingLogs.length}
                numSelected={tablePhishing.selected.length}
                onSort={tablePhishing.onSort}
                onSelectAllRows={(checked) =>
                  tablePhishing.onSelectAllRows(
                    checked,
                    phishingLogs.map((log) => log.id.toString())
                  )
                }
                headLabel={[
                  { id: 'url', label: 'URL' },
                  { id: 'isSafe', label: 'Safe', align: 'center' },
                  { id: 'timestamp', label: 'Timestamp' },
                  { id: 'probability', label: 'Probability (%)', align: 'center' },
                  { id: 'prediction', label: 'Prediction', align: 'center' },
                  { id: 'error', label: 'Error', align: 'center' },
                ]}
              />
              <TableBody>
                {phishingLogs.length === 0 && !tablePhishing.filterName ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      <Typography variant="body2">No phishing logs available.</Typography>
                    </td>
                  </tr>
                ) : (
                  <>
                    {dataFilteredPhishing
                      .slice(
                        tablePhishing.page * tablePhishing.rowsPerPage,
                        tablePhishing.page * tablePhishing.rowsPerPage + tablePhishing.rowsPerPage
                      )
                      .map((row) => (
                        <tr key={row.id} style={{ height: 68 }}>
                          <td>{row.url}</td>
                          <td style={{ textAlign: 'center' }}>
                            <Tooltip title={row.isSafe ? 'Safe' : 'Unsafe'} arrow>
                              <Box sx={{ display: 'inline-block' }}>{row.isSafe ? <SafeIcon /> : <UnsafeIcon />}</Box>
                            </Tooltip>
                          </td>
                          <td>{row.timestamp}</td>
                          <td style={{ textAlign: 'center' }}>{Math.round(row.probability * 100)}%</td>
                          <td style={{ textAlign: 'center' }}>{row.prediction}</td>
                          <td style={{ textAlign: 'center' }}>{row.error || 'N/A'}</td>
                        </tr>
                      ))}
                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(tablePhishing.page, tablePhishing.rowsPerPage, phishingLogs.length)}
                    />
                    {notFoundPhishing && <TableNoData searchQuery={tablePhishing.filterName} />}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          component="div"
          page={tablePhishing.page}
          count={dataFilteredPhishing.length}
          rowsPerPage={tablePhishing.rowsPerPage}
          onPageChange={tablePhishing.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={tablePhishing.onChangeRowsPerPage}
        />
      </Card>

      {/* Ransomware Logs Table */}
      <Card sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ p: 2 }}>Ransomware Logs</Typography>
        <TextField
          fullWidth
          value={tableRansomware.filterName}
          onChange={(event) => {
            tableRansomware.onFilterName(event.target.value);
            tableRansomware.onResetPage();
          }}
          placeholder="Filter by URL or Wallet Address..."
          sx={{ p: 2, maxWidth: '300px' }}
        />
        <Scrollbar>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHeadComponent
                order={tableRansomware.order}
                orderBy={tableRansomware.orderBy}
                rowCount={ransomwareLogs.length}
                numSelected={tableRansomware.selected.length}
                onSort={tableRansomware.onSort}
                onSelectAllRows={(checked) =>
                  tableRansomware.onSelectAllRows(
                    checked,
                    ransomwareLogs.map((log) => log.id.toString())
                  )
                }
                headLabel={[
                  { id: 'url', label: 'URL' },
                  { id: 'isSafe', label: 'Safe', align: 'center' },
                  { id: 'timestamp', label: 'Timestamp' },
                  { id: 'probability', label: 'Probability (%)', align: 'center' },
                  { id: 'walletAddress', label: 'Wallet Address', align: 'center' },
                  { id: 'error', label: 'Error', align: 'center' },
                ]}
              />
              <TableBody>
                {ransomwareLogs.length === 0 && !tableRansomware.filterName ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      <Typography variant="body2">No ransomware logs available.</Typography>
                    </td>
                  </tr>
                ) : (
                  <>
                    {dataFilteredRansomware
                      .slice(
                        tableRansomware.page * tableRansomware.rowsPerPage,
                        tableRansomware.page * tableRansomware.rowsPerPage + tableRansomware.rowsPerPage
                      )
                      .map((row) => (
                        <tr key={row.id} style={{ height: 68 }}>
                          <td>{row.url}</td>
                          <td style={{ textAlign: 'center' }}>
                            <Tooltip title={row.isSafe ? 'Safe' : 'Unsafe'} arrow>
                              <Box sx={{ display: 'inline-block' }}>{row.isSafe ? <SafeIcon /> : <UnsafeIcon />}</Box>
                            </Tooltip>
                          </td>
                          <td>{row.timestamp}</td>
                          <td style={{ textAlign: 'center' }}>{Math.round(row.probability * 100)}%</td>
                          <td style={{ textAlign: 'center' }}>{row.walletAddress}</td>
                          <td style={{ textAlign: 'center' }}>{row.error || 'N/A'}</td>
                        </tr>
                      ))}
                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(tableRansomware.page, tableRansomware.rowsPerPage, ransomwareLogs.length)}
                    />
                    {notFoundRansomware && <TableNoData searchQuery={tableRansomware.filterName} />}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          component="div"
          page={tableRansomware.page}
          count={dataFilteredRansomware.length}
          rowsPerPage={tableRansomware.rowsPerPage}
          onPageChange={tableRansomware.onChangePage}
          rowsPerPageOptions={[5, 10, 25]} // Fixed syntax
          onRowsPerPageChange={tableRansomware.onChangeRowsPerPage}
        />
      </Card>

      {/* DoS Logs Table */}
      <Card sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ p: 2 }}>DoS Logs</Typography>
        <TextField
          fullWidth
          value={tableDoS.filterName}
          onChange={(event) => {
            tableDoS.onFilterName(event.target.value);
            tableDoS.onResetPage();
          }}
          placeholder="Filter by URL..."
          sx={{ p: 2, maxWidth: '300px' }}
        />
        <Scrollbar>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHeadComponent
                order={tableDoS.order}
                orderBy={tableDoS.orderBy}
                rowCount={doSLogs.length}
                numSelected={tableDoS.selected.length}
                onSort={tableDoS.onSort}
                onSelectAllRows={(checked) =>
                  tableDoS.onSelectAllRows(
                    checked,
                    doSLogs.map((log) => log.id.toString())
                  )
                }
                headLabel={[
                  { id: 'url', label: 'URL' },
                  { id: 'isSafe', label: 'Safe', align: 'center' },
                  { id: 'timestamp', label: 'Timestamp' },
                  { id: 'probability', label: 'Probability (%)', align: 'center' },
                  { id: 'error', label: 'Error', align: 'center' },
                ]}
              />
              <TableBody>
                {doSLogs.length === 0 && !tableDoS.filterName ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                      <Typography variant="body2">No DoS logs available.</Typography>
                    </td>
                  </tr>
                ) : (
                  <>
                    {dataFilteredDoS
                      .slice(
                        tableDoS.page * tableDoS.rowsPerPage,
                        tableDoS.page * tableDoS.rowsPerPage + tableDoS.rowsPerPage
                      )
                      .map((row) => (
                        <tr key={row.id} style={{ height: 68 }}>
                          <td>{row.url}</td>
                          <td style={{ textAlign: 'center' }}>
                            <Tooltip title={row.isSafe ? 'Safe' : 'Unsafe'} arrow>
                              <Box sx={{ display: 'inline-block' }}>{row.isSafe ? <SafeIcon /> : <UnsafeIcon />}</Box>
                            </Tooltip>
                          </td>
                          <td>{row.timestamp}</td>
                          <td style={{ textAlign: 'center' }}>{Math.round(row.probability * 100)}%</td>
                          <td style={{ textAlign: 'center' }}>{row.error || 'N/A'}</td>
                        </tr>
                      ))}
                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(tableDoS.page, tableDoS.rowsPerPage, doSLogs.length)}
                    />
                    {notFoundDoS && <TableNoData searchQuery={tableDoS.filterName} />}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          component="div"
          page={tableDoS.page}
          count={dataFilteredDoS.length}
          rowsPerPage={tableDoS.rowsPerPage}
          onPageChange={tableDoS.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={tableDoS.onChangeRowsPerPage}
        />
      </Card>

      {/* Code Safety Logs Table */}
      <Card>
        <Typography variant="h6" sx={{ p: 2 }}>Code Safety Logs</Typography>
        <TextField
          fullWidth
          value={tableCodeSafety.filterName}
          onChange={(event) => {
            tableCodeSafety.onFilterName(event.target.value);
            tableCodeSafety.onResetPage();
          }}
          placeholder="Filter by URL or Prediction..."
          sx={{ p: 2, maxWidth: '300px' }}
        />
        <Scrollbar>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHeadComponent
                order={tableCodeSafety.order}
                orderBy={tableCodeSafety.orderBy}
                rowCount={codeSafetyLogs.length}
                numSelected={tableCodeSafety.selected.length}
                onSort={tableCodeSafety.onSort}
                onSelectAllRows={(checked) =>
                  tableCodeSafety.onSelectAllRows(
                    checked,
                    codeSafetyLogs.map((log) => log.id.toString())
                  )
                }
                headLabel={[
                  { id: 'url', label: 'URL/Code' },
                  { id: 'isSafe', label: 'Safe', align: 'center' },
                  { id: 'timestamp', label: 'Timestamp' },
                  { id: 'prediction', label: 'Prediction', align: 'center' },
                  { id: 'anomalyScore', label: 'Anomaly Score', align: 'center' },
                  { id: 'error', label: 'Error', align: 'center' },
                ]}
              />
              <TableBody>
                {codeSafetyLogs.length === 0 && !tableCodeSafety.filterName ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      <Typography variant="body2">No code safety logs available.</Typography>
                    </td>
                  </tr>
                ) : (
                  <>
                    {dataFilteredCodeSafety
                      .slice(
                        tableCodeSafety.page * tableCodeSafety.rowsPerPage,
                        tableCodeSafety.page * tableCodeSafety.rowsPerPage + tableCodeSafety.rowsPerPage
                      )
                      .map((row) => (
                        <tr key={row.id} style={{ height: 68 }}>
                          <td>{row.url}</td>
                          <td style={{ textAlign: 'center' }}>
                            <Tooltip title={row.isSafe ? 'Safe' : 'Unsafe'} arrow>
                              <Box sx={{ display: 'inline-block' }}>{row.isSafe ? <SafeIcon /> : <UnsafeIcon />}</Box>
                            </Tooltip>
                          </td>
                          <td>{row.timestamp}</td>
                          <td style={{ textAlign: 'center' }}>{row.prediction}</td>
                          <td style={{ textAlign: 'center' }}>{row.anomalyScore?.toFixed(2) || 'N/A'}</td>
                          <td style={{ textAlign: 'center' }}>{row.error || 'N/A'}</td>
                        </tr>
                      ))}
                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(tableCodeSafety.page, tableCodeSafety.rowsPerPage, codeSafetyLogs.length)}
                    />
                    {notFoundCodeSafety && <TableNoData searchQuery={tableCodeSafety.filterName} />}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          component="div"
          page={tableCodeSafety.page}
          count={dataFilteredCodeSafety.length}
          rowsPerPage={tableCodeSafety.rowsPerPage}
          onPageChange={tableCodeSafety.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={tableCodeSafety.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}