import type { BoxProps } from '@mui/material/Box';

import { forwardRef } from 'react';

import Box from '@mui/material/Box';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = BoxProps & {
  href?: string;
  isSingle?: boolean;
  disableLink?: boolean;
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  (
    { width, href = '/', height, isSingle = true, disableLink = false, className, sx, ...other },
    ref
  ) => {
    // Use the same image for both single and full logo, but adjust size
    const singleLogo = (
      <Box
        alt="Attijari Logo"
        component="img"
        src="/assets/attijariBank.png"
        width="100%"
        height="100%"
      />
    );

    const fullLogo = (
      <Box
        alt="Attijari Logo"
        component="img"
        src="/assets/attijariBank.png"
        width="100%"
        height="100%"
      />
    );

    const baseSize = {
      width: width ?? 180,
      height: height ?? 60,
      ...(!isSingle && {
        width: width ?? 180,
        height: height ?? 60,
      }),
    };

    return (
      <Box
        ref={ref}
        component={RouterLink}
        href={href}
        className={logoClasses.root.concat(className ? ` ${className}` : '')}
        aria-label="Logo"
        sx={{
          ...baseSize,
          flexShrink: 0,
          display: 'inline-flex',
          verticalAlign: 'middle',
          ...(disableLink && { pointerEvents: 'none' }),
          mt:5,
          mb:5, // Add 16px margin-bottom (theme.spacing(2))
          ...sx, // Allow overriding via sx prop
        }}
        {...other}
      >
        {isSingle ? singleLogo : fullLogo}
      </Box>
    );
  }
);