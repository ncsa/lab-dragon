"use client";
import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Typography, Container, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Toolbar from '../components/Toolbar';

const drawerWidth = 240;

const MainContent = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10),
  paddingLeft: 64,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(10),
    paddingLeft: `calc(64px + ${theme.spacing(10)})`,
  },
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const DrawerContent = styled('div')(({ theme }) => ({
  width: drawerWidth,
  marginTop: theme.spacing(2),
}));

export default function Library() {
  const [open, setOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <Toolbar onMenuBookClick={handleDrawerToggle} />
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginLeft: '64px',
            paddingTop: '20px',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerContent>
          <List>
            {['Notebooks', 'Recent', 'Favorites', 'Shared'].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {['Archive', 'Trash'].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DrawerContent>
      </Drawer>
      <MainContent
        sx={{
          ...(open && {
            marginLeft: `${drawerWidth}px`,
            transition: (theme) =>
              theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }),
        }}
      >
        <Typography variant="h4" component="h1">
          Library
        </Typography>
        {/* Add your library content here */}
      </MainContent>
    </>
  );
}