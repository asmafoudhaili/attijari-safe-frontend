import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import {
  Menu,
  Table,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  TableContainer
} from '@mui/material';

import { useTable } from 'src/routes/hooks/use-table';

import axiosInstance from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { UserFormDialog, type UserProps } from '../user-form-dialog';

export function UserView() {
  const tableAdmin = useTable();
  const tableClient = useTable();
  const tableEmployee = useTable();
  const [filterName, setFilterName] = useState('');
  // Removed unused users state
  const [admins, setAdmins] = useState<UserProps[]>([]);
  const [clients, setClients] = useState<UserProps[]>([]);
  const [employees, setEmployees] = useState<UserProps[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/users');
      const allUsers = response.data;
      // Removed setUsers call - users state no longer exists
      setAdmins(allUsers.filter((user: UserProps) => user.role === 'ADMIN'));
      setClients(allUsers.filter((user: UserProps) => user.role === 'CLIENT'));
      setEmployees(allUsers.filter((user: UserProps) => user.role === 'EMPLOYEE'));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = (role: string) => {
    setSelectedUser({ id: '', username: '', password: '', role, mobileNumber: '', gender: '' } as UserProps);
    setDialogOpen(true);
  };

  const handleEditUser = (user: UserProps) => {
    setSelectedUser(user);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await axiosInstance.delete(`/api/admin/users/${id}`);
      fetchUsers();
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleFormSubmit = async (formData: {
    username: string;
    password: string;
    role: string;
    mobileNumber: string;
  }) => {
    try {
      if (selectedUser) {
        await axiosInstance.put(`/api/admin/users/${selectedUser.id}`, formData);
      } else {
        await axiosInstance.post('/api/admin/users', formData);
      }
      fetchUsers();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUserId(null);
  };

  const dataFilteredAdmin = applyFilter({
    inputData: admins,
    comparator: getComparator(tableAdmin.order, tableAdmin.orderBy),
    filterName,
  });

  const dataFilteredClient = applyFilter({
    inputData: clients,
    comparator: getComparator(tableClient.order, tableClient.orderBy),
    filterName,
  });

  const dataFilteredEmployee = applyFilter({
    inputData: employees,
    comparator: getComparator(tableEmployee.order, tableEmployee.orderBy),
    filterName,
  });

  const getAvatar = (gender?: string) => {
    const normalized = gender?.trim().toUpperCase();
    if (normalized === 'FEMALE') return 'public/assets/images/avatar/1.jpg';
    if (normalized === 'MALE') return 'public/assets/images/avatar/2.jpg';
    return '/avatars/2.jpg';
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Users
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleAddUser('ADMIN')}
          sx={{
            backgroundColor: '#7b38ff',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#6a2ed8',
            },
          }}
        >
          New Admin
        </Button>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleAddUser('CLIENT')}
          sx={{ 
            ml: 1,
            backgroundColor: '#7b38ff',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#6a2ed8',
            },
          }}
        >
          New Client
        </Button>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleAddUser('EMPLOYEE')}
          sx={{ 
            ml: 1,
            backgroundColor: '#7b38ff',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#6a2ed8',
            },
          }}
        >
          New Employee
        </Button>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={tableAdmin.selected.length}
          filterName={filterName}
          onFilterName={(event) => {
            setFilterName(event.target.value);
            tableAdmin.onResetPage();
            tableClient.onResetPage();
            tableEmployee.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: '20%' }}>Avatar</TableCell>
                  <TableCell align="center" sx={{ width: '25%' }}>Username</TableCell>
                  <TableCell align="center" sx={{ width: '25%' }}>Role</TableCell>
                  <TableCell align="center" sx={{ width: '25%' }}>Mobile Number</TableCell>
                  <TableCell align="center" sx={{ width: '20%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataFilteredAdmin.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell align="center">
                      <img 
                        src={getAvatar(row.gender)} 
                        alt="user-avatar" 
                        width={40} 
                        height={40} 
                        style={{ borderRadius: '50%' }}
                        onError={(e) => console.log('Image load error for:', row.username, e)}
                      />
                    </TableCell>
                    <TableCell align="center">{row.username}</TableCell>
                    <TableCell align="center">{row.role}</TableCell>
                    <TableCell align="center">{row.mobileNumber}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(event) => handleMenuOpen(event, row.id)}>
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={menuUserId === row.id}
                        onClose={handleMenuClose}
                        PaperProps={{
                          sx: { width: 160 },
                        }}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        <MenuItem
                          onClick={() => handleEditUser(row)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
                          Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleDeleteUser(row.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
                          Delete
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
                <TableEmptyRows height={53} emptyRows={emptyRows(tableAdmin.page, tableAdmin.rowsPerPage, admins.length)} />
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              page={tableAdmin.page}
              count={admins.length}
              rowsPerPage={tableAdmin.rowsPerPage}
              onPageChange={tableAdmin.onChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={tableAdmin.onChangeRowsPerPage}
            />
          </TableContainer>
        </Scrollbar>
      </Card>

      <Card sx={{ mt: 4 }}>
        <UserTableToolbar
          numSelected={tableClient.selected.length}
          filterName={filterName}
          onFilterName={(event) => {
            setFilterName(event.target.value);
            tableClient.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: '20%' }}>Avatar</TableCell>
                  <TableCell align="center" sx={{ width: '25%' }}>Username</TableCell>
                  <TableCell align="center" sx={{ width: '25%' }}>Role</TableCell>
                  <TableCell align="center" sx={{ width: '25%' }}>Mobile Number</TableCell>
                  <TableCell align="center" sx={{ width: '20%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataFilteredClient.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell align="center">
                      <img 
                        src={getAvatar(row.gender)} 
                        alt="user-avatar" 
                        width={40} 
                        height={40} 
                        style={{ borderRadius: '50%' }}
                        onError={(e) => console.log('Image load error for:', row.username, e)}
                      />
                    </TableCell>
                    <TableCell align="center">{row.username}</TableCell>
                    <TableCell align="center">{row.role}</TableCell>
                    <TableCell align="center">{row.mobileNumber}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(event) => handleMenuOpen(event, row.id)}>
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={menuUserId === row.id}
                        onClose={handleMenuClose}
                        PaperProps={{
                          sx: { width: 160 },
                        }}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        <MenuItem
                          onClick={() => handleEditUser(row)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
                          Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleDeleteUser(row.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
                          Delete
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
                <TableEmptyRows height={53} emptyRows={emptyRows(tableClient.page, tableClient.rowsPerPage, clients.length)} />
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              page={tableClient.page}
              count={clients.length}
              rowsPerPage={tableClient.rowsPerPage}
              onPageChange={tableClient.onChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={tableClient.onChangeRowsPerPage}
            />
          </TableContainer>
        </Scrollbar>
      </Card>

      <Card sx={{ mt: 4 }}>
        <UserTableToolbar
          numSelected={tableEmployee.selected.length}
          filterName={filterName}
          onFilterName={(event) => {
            setFilterName(event.target.value);
            tableEmployee.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: '20%' }}>Avatar</TableCell>
                  <TableCell align="center" sx={{ width: '25%' }}>Username</TableCell>
                  <TableCell align="center" sx={{ width: '25%' }}>Role</TableCell>
                  <TableCell align="center" sx={{ width: '25%' }}>Mobile Number</TableCell>
                  <TableCell align="center" sx={{ width: '20%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataFilteredEmployee.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell align="center">
                      <img 
                        src={getAvatar(row.gender)} 
                        alt="user-avatar" 
                        width={40} 
                        height={40} 
                        style={{ borderRadius: '50%' }}
                        onError={(e) => console.log('Image load error for:', row.username, e)}
                      />
                    </TableCell>
                    <TableCell align="center">{row.username}</TableCell>
                    <TableCell align="center">{row.role}</TableCell>
                    <TableCell align="center">{row.mobileNumber}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(event) => handleMenuOpen(event, row.id)}>
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={menuUserId === row.id}
                        onClose={handleMenuClose}
                        PaperProps={{
                          sx: { width: 160 },
                        }}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        <MenuItem
                          onClick={() => handleEditUser(row)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
                          Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleDeleteUser(row.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
                          Delete
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
                <TableEmptyRows height={53} emptyRows={emptyRows(tableEmployee.page, tableEmployee.rowsPerPage, employees.length)} />
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              page={tableEmployee.page}
              count={employees.length}
              rowsPerPage={tableEmployee.rowsPerPage}
              onPageChange={tableEmployee.onChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={tableEmployee.onChangeRowsPerPage}
            />
          </TableContainer>
        </Scrollbar>
      </Card>

      <UserFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleFormSubmit}
        initialData={selectedUser}
      />
    </DashboardContent>
  );
}