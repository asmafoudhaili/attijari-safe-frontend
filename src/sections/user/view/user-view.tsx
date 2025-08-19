import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import axiosInstance from 'src/utils/axios';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTable } from 'src/routes/hooks/use-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';

import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { UserFormDialog, type UserProps } from '../user-form-dialog';
import { emptyRows, applyFilter, getComparator } from '../utils';

export function UserView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  const [users, setUsers] = useState<UserProps[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setSelectedUser(null);
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

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  // Enhanced getAvatar function with debugging
 const getAvatar = (gender?: string) => {
  const normalized = gender?.trim().toUpperCase();
  if (normalized === 'FEMALE') return '/avatars/1.jpg';
  if (normalized === 'MALE') return '/avatars/2.jpg';
  return '/avatars/2.jpg'; // Default to male avatar if gender is missing or unknown
};

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Users
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAddUser}
        >
          New user
        </Button>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event) => {
            setFilterName(event.target.value);
            table.onResetPage();
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
                {dataFiltered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell align="center">
                      <img 
                        src={getAvatar(row.gender)} 
                        alt="user-avatar" 
                        width={40} 
                        height={40} 
                        style={{ borderRadius: '50%' }}
                        onError={(e) => console.log('Image load error for:', row.username, e)} // Debug image load failure
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
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={users.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
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