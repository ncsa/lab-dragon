"use client"
import React, { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks } from '../constants/index';
import { MenuBook, Comment, Search, AccountCircle } from '@mui/icons-material';
import Image from 'next/image';
import { Box, IconButton, Paper, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import ExplorerDrawer from './ExplorerDrawer';
import { ExplorerContext } from '../contexts/explorerContext';

// FIXME: Handle errors properly
async function getLibraries() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/get_all_libraries`);
  // const res = await fetch(`/api/entities/get_all_libraries`);
    return await res.json();
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  left: 0,
  top: 0,
  height: '100%',
  width: 64,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: '#BFBFBF',
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

export default function Toolbar() {
  const { drawerOpen, setDrawerOpen } = useContext(ExplorerContext);
  const pathname = usePathname();
  const [libraries, setLibraries] = useState([]);

  useEffect(() => {
    getLibraries().then(data => {
      setLibraries(data);
    });
  }, []);  

  return (
    <StyledPaper elevation={3}>
      {/* Logo */}
      <StyledLink href="/" active={pathname === '/' ? 1 : 0}>
        <IconContainer active={pathname === '/' ? 1 : 0}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            style={{ objectFit: 'cover' }}
          />
        </IconContainer>
      </StyledLink>

      {/* Libraries */}
      <Stack flexGrow={1}>
        {Object.entries(libraries).map(([key, value]) => {
          const isActive = pathname === `/library/${value}`;
          return (
            <Box key={value}>
              <StyledLink href={`/library/${value}`} active={isActive ? 1 : 0}>
                <IconContainer active={isActive ? 1 : 0}>
                  <IconButton
                    title={key}
                    color={isActive ? 'primary' : 'default'}
                    size="small"
                    onClick={() => {
                      if (isActive) {
                        setDrawerOpen(!drawerOpen);
                      } else {
                        setDrawerOpen(true);
                      }
                    }}
                  >
                    <MenuBook />
                  </IconButton>
                </IconContainer>
              </StyledLink>
              {isActive && drawerOpen && <ExplorerDrawer open={drawerOpen} name={key} id={value} />}
            </Box>
          );
        })}
      </Stack>

      {/* Profile */}
      <Box p={1.5} display="flex" justifyContent="center">
        <IconContainer>
          <IconButton color="default" size="small">
            <AccountCircle />
          </IconButton>
        </IconContainer>
      </Box>
    </StyledPaper>
  );
}