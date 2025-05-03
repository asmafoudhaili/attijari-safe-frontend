import { NavLink as RouterLink,useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

// Simplified useActiveLink logic (inlined to avoid dependency on external hook)
const useActiveLink = (path: string) => {
  const { pathname } = useLocation();
  if (path === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(path);
};

// Icon helper function
const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

// Navigation data
const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-user'),
  },
 
  {
    title: 'Logs',
    path: '/logs',
    icon: icon('ic-analytics'),
  },
  {
    title: 'User',
    path: '/user',
    icon: icon('ic-user'),
  },
  // {
  //   title: 'Product',
  //   path: '/products',
  //   icon: icon('ic-cart'),
  //   info: (
  //     <Label color="error" variant="inverted">
  //       +3
  //     </Label>
  //   ),
  // },
  // {
  //   title: 'Blog',
  //   path: '/blog',
  //   icon: icon('ic-blog'),
  // },
  // {
  //   title: 'Sign in',
  //   path: '/sign-in',
  //   icon: icon('ic-lock'),
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic-disabled'),
  // },
];

// NavItem component (renders each navigation item)
function NavItem({ item }: { item: typeof navData[number] }) {
  const { title, path} = item;

  const active = useActiveLink(path);

  return (
    <ListItemButton
      component={RouterLink}
      to={path}
      sx={{
        minHeight: 44,
        borderRadius: 0.75,
        typography: 'body2',
        color: 'text.secondary',
        textTransform: 'capitalize',
        fontWeight: 'fontWeightMedium',
        '&:hover': {
          color: '#FFB74D', // Lighter orange for hover
          bgcolor: '#f5c6e0', // Lighter pink for hover background
        },
        ...(active && {
          color: '#FF9800', // Orange for the text when active
          fontWeight: 'fontWeightSemiBold',
          bgcolor: '#eda9cf', // Pink background for the active link
        }),
      }}
    >
      <Box
        component="span"
        sx={{
          width: 24,
          height: 24,
          mr: 2,
        }}
      >
        {/* Reintroduce the icon to avoid an empty Box */}
      </Box>

      <ListItemText primary={title} />

     
    </ListItemButton>
  );
}

// Nav component (renders the entire navigation menu)
export function Nav() {
  return (
    <Box sx={{ minHeight: 1 }}>
      <List
        disablePadding
        sx={{
          px: 2,
          pb: 1,
          pt: 2,
        }}
      >
        <ListSubheader
          component="div"
          sx={{
            typography: 'overline',
            borderRadius: 0.75,
            fontSize: 11,
            color: 'text.disabled',
            bgcolor: 'transparent',
            p: 1,
            mb: 1,
          }}
        >
          Menu
        </ListSubheader>

        {navData.map((item) => (
          <NavItem key={item.title} item={item} />
        ))}
      </List>

      <Divider sx={{ borderStyle: 'dashed' }} />
    </Box>
  );
}

// Export navData for use elsewhere if needed
export { navData };