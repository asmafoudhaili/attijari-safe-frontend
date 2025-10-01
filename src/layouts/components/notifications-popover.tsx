import { useState, useEffect, useCallback } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { useRouter } from 'src/routes/hooks';

import axios from 'src/utils/axios';
import { fToNow } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

interface NotificationItemProps {
  id: string;
  type: string;
  title: string;
  isUnRead: boolean;
  description: string;
  avatarUrl: string | null;
  postedAt: string | null;
}

interface NotificationsPopoverProps {
  sx?: object;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

interface NotificationResponse {
  detailsHash: string;
  threatType: string;
  details: string;
  isSafe: boolean;
  adminConfirmed: boolean;
  timestamp: string;
}

const SPRING_BOOT_URL = 'http://localhost:8080';
  // Removed unused FASTAPI_URL

export function NotificationsPopover({ sx, ...other }: NotificationsPopoverProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItemProps[]>([]);
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const totalUnRead = notifications.filter((item) => item.isUnRead).length;

  // Fetch historical notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await axios.get<NotificationResponse[]>(
        `${SPRING_BOOT_URL}/api/admin/unsafe-alerts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const transformedNotifications: NotificationItemProps[] = response.data
        .map((notification) => {
          const details = JSON.parse(notification.details);
          return {
            id: notification.detailsHash,
            type: notification.threatType,
            title:
              `${notification.threatType.charAt(0).toUpperCase() + notification.threatType.slice(1)} Alert`,
            isUnRead: !notification.isSafe,
            description: details.url || details.code || 'No details available',
            avatarUrl: null,
            postedAt: notification.timestamp,
          };
        })
        .sort((a, b) => new Date(b.postedAt!).getTime() - new Date(a.postedAt!).getTime()); // Sort by latest first

      setNotifications(transformedNotifications);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching notifications:', error.message);
      setSnackbar({ open: true, message: 'Failed to fetch notifications', severity: 'error' });
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      router.push('/sign-in');
    }
  }, [router]);

  // Refresh token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.post<{ jwt: string }>(
        `${SPRING_BOOT_URL}/api/refresh`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newToken = response.data.jwt;
      localStorage.setItem('token', newToken);
      return newToken;
    } catch (error: any) {
      console.error('Token refresh failed:', error.message);
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      router.push('/sign-in');
      return null;
    }
  }, [router]);

  // Filter notifications to hide read ones after 1 day
  const filterNotifications = useCallback((notifs: NotificationItemProps[]) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notifs.filter((notification) => {
      if (notification.isUnRead) return true;
      return new Date(notification.postedAt!).getTime() > oneDayAgo.getTime();
    });
  }, []);

  // Set up real-time notifications using SSE
  useEffect(() => {
    fetchNotifications();

    const token = localStorage.getItem('token');
    if (!token) return () => {};

    let eventSource: EventSourcePolyfill | null = new EventSourcePolyfill(
      `${SPRING_BOOT_URL}/api/admin/notifications/stream`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        heartbeatTimeout: 120000,
      }
    );

    eventSource.onmessage = (event: MessageEvent) => {
      const notification: NotificationResponse = JSON.parse(event.data as string);
      const details = JSON.parse(notification.details);
      const newNotification: NotificationItemProps = {
        id: notification.detailsHash,
        type: notification.threatType,
        title:
          `${notification.threatType.charAt(0).toUpperCase() + notification.threatType.slice(1)} Alert`,
        isUnRead: !notification.isSafe,
        description: details.url || details.code || 'No details available',
        avatarUrl: null,
        postedAt: notification.timestamp,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        return filterNotifications(updated.sort((a, b) => new Date(b.postedAt!).getTime() - new Date(a.postedAt!).getTime()));
      });
    };

    eventSource.onerror = () => {
      console.error('SSE error, attempting to reconnect with refreshed token');
      eventSource?.close();
      refreshToken().then((newToken) => {
        if (newToken) {
          eventSource = new EventSourcePolyfill(
            `${SPRING_BOOT_URL}/api/admin/notifications/stream`,
            {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
              heartbeatTimeout: 120000,
            }
          );
          eventSource.onmessage = (event: MessageEvent) => {
            const notification: NotificationResponse = JSON.parse(event.data as string);
            const details = JSON.parse(notification.details);
            const newNotification: NotificationItemProps = {
              id: notification.detailsHash,
              type: notification.threatType,
              title:
                `${notification.threatType.charAt(0).toUpperCase() + notification.threatType.slice(1)} Alert`,
              isUnRead: !notification.isSafe,
              description: details.url || details.code || 'No details available',
              avatarUrl: null,
              postedAt: notification.timestamp,
            };
            setNotifications((prev) => {
              const updated = [newNotification, ...prev];
              return filterNotifications(updated.sort((a, b) => new Date(b.postedAt!).getTime() - new Date(a.postedAt!).getTime()));
            });
          };
          eventSource.onerror = () => console.error('SSE reconnection failed');
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('isAuthenticated');
          router.push('/sign-in');
        }
      });
    };

    return () => {
      eventSource?.close();
    };
  }, [fetchNotifications, refreshToken, filterNotifications, router]);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      filterNotifications(prev.map((notification) => ({ ...notification, isUnRead: false })))
    );
  }, [filterNotifications]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  if (loading) {
    return (
      <IconButton sx={sx} {...other}>
        <Typography>Loading...</Typography>
      </IconButton>
    );
  }

  return (
    <>
      <IconButton
        color={openPopover ? 'primary' : 'default'}
        onClick={handleOpenPopover}
        sx={sx}
        {...other}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 360,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box display="flex" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You have {totalUnRead} unread messages
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="solar:check-read-outline" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar fillContent sx={{ minHeight: 240, maxHeight: { xs: 360, sm: 'none' } }}>
          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                New
              </ListSubheader>
            }
          >
            {notifications.slice(0, 2).map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isLatestTwoUnread={notification.isUnRead && index < 2}
              />
            ))}
          </List>

          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                Before that
              </ListSubheader>
            }
          >
            {notifications.slice(2, 5).map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isLatestTwoUnread={notification.isUnRead && index < 2}
              />
            ))}
          </List>
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple color="inherit" onClick={() => router.push('/logs')}>
            View all
          </Button>
        </Box>
      </Popover>

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
    </>
  );
}

interface NotificationItemComponentProps {
  notification: NotificationItemProps;
  isLatestTwoUnread: boolean;
}

function NotificationItem({ notification, isLatestTwoUnread }: NotificationItemComponentProps) {
  const { avatarUrl, title } = renderContent(notification);

  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(isLatestTwoUnread && {
          bgcolor: 'background.neutral',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatarUrl}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <Iconify width={14} icon="solar:clock-circle-outline" />
            {fToNow(notification.postedAt)}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

function renderContent(notification: NotificationItemProps) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        &nbsp; {notification.description}
      </Typography>
    </Typography>
  );

  const iconMap: { [key: string]: string } = {
    phishing: '/assets/icons/glass/danger.svg',
    ransomware: '/assets/icons/glass/danger.svg',
    dos: '/assets/icons/glass/danger.svg',
    codeSafety: '/assets/icons/glass/danger.svg',
  };

  return {
    avatarUrl: (
      <img
        alt={notification.title}
        src={iconMap[notification.type] || '/assets/icons/glass/danger.svg'}
      />
    ),
    title,
  };
}