"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { navLinks } from '../constants/index';
import { MenuBook, Comment, Search, AccountCircle } from '@mui/icons-material';
import Image from 'next/image';
import { Box, IconButton, Paper, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  left: 0,
  top: 0,
  height: '100%',
  width: 64,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.grey[100],
  boxShadow: theme.shadows[3],
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledLink = styled(Link)(({ theme, active }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: active ? theme.palette.primary.main : 'transparent',
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.main : theme.palette.primary.light,
  },
}));

const IconContainer = styled(Box)(({ theme, active }) => ({
  width: 40,
  height: 40,
  borderRadius: active ? theme.shape.borderRadius : '50%',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: theme.shadows[1],
}));

const Toolbar = ({ onMenuBookClick }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleMenuBookClick = (e) => {
    e.preventDefault();
    if (pathname !== '/library') {
      router.push('/library');
    }
    if (onMenuBookClick) {
      onMenuBookClick();
    }
  };

  return (
    <StyledPaper elevation={3}>
      {/* Logo */}
      <StyledLink href="/" active={pathname === '/' ? 1 : 0}>
        <IconContainer>
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            style={{ objectFit: 'cover' }}
          />
        </IconContainer>
      </StyledLink>

      {/* Navigation Links */}
      <Stack flexGrow={1}>
        <Box
          onClick={handleMenuBookClick}
          sx={{
            cursor: 'pointer',
            width: '100%',
            padding: (theme) => theme.spacing(1.5),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: pathname === '/library' ? (theme) => theme.palette.primary.main : 'transparent',
            '&:hover': {
              backgroundColor: pathname === '/library' 
                ? (theme) => theme.palette.primary.main 
                : (theme) => theme.palette.primary.light,
            },
          }}
        >
          <IconContainer active={pathname === '/library' ? 1 : 0}>
            <IconButton
              color={pathname === '/library' ? 'primary' : 'default'}
              size="small"
            >
              <MenuBook />
            </IconButton>
          </IconContainer>
        </Box>
        {navLinks
          .filter(link => ['comment', 'search'].includes(link.id))
          .map((link) => (
            <StyledLink
              key={link.id}
              href={`/${link.id}`}
              active={pathname === `/${link.id}` ? 1 : 0}
            >
              <IconContainer active={pathname === `/${link.id}` ? 1 : 0}>
                <IconButton
                  color={pathname === `/${link.id}` ? 'primary' : 'default'}
                  size="small"
                >
                  {link.id === 'comment' && <Comment />}
                  {link.id === 'search' && <Search />}
                </IconButton>
              </IconContainer>
            </StyledLink>
          ))}
      </Stack>

      {/* Profile */}
      <Box p={1.5} display="flex" justifyContent="center">
        <IconContainer>
          <IconButton color="primary" size="small">
            <AccountCircle />
          </IconButton>
        </IconContainer>
      </Box>
    </StyledPaper>
  );
};

export default Toolbar;