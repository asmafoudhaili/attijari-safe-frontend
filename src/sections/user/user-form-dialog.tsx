import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
} from '@mui/material';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    username: string;
    password: string;
    role: string;
    mobileNumber: string;
  }) => Promise<void>;
  initialData: UserProps | null;
}

export function UserFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}: UserFormDialogProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
    mobileNumber: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        password: initialData.password || '',
        role: initialData.role || '',
        mobileNumber: initialData.mobileNumber || '',
      });
    } else {
      setFormData({
        username: '',
        password: '',
        role: '',
        mobileNumber: '',
      });
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose(); // Close the dialog after successful submit
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    !formData.username || !formData.password || !formData.role || !formData.mobileNumber;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>User Form</DialogTitle>
      <DialogContent dividers>
        <TextField
          margin="normal"
          fullWidth
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <TextField
          margin="normal"
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <TextField
          margin="normal"
          fullWidth
          select
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <MenuItem value="Admin">Admin</MenuItem>
          <MenuItem value="User">User</MenuItem>
          <MenuItem value="Manager">Manager</MenuItem>
          {/* Add more roles as needed */}
        </TextField>
        <TextField
          margin="normal"
          fullWidth
          label="Mobile Number"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitDisabled || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export type UserProps = {
  id: number;
  username: string;
  password: string;
  role: string;
  mobileNumber: string;
  status?: string;
  company?: string;
  avatarUrl?: string;
  isVerified?: boolean;
};
