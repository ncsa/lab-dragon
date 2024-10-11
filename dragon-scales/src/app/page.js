"use client";
import { Box, Typography, Container, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const MainContent = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(10),
  },
  display: 'grid',
  gridTemplateRows: '20px 1fr 20px',
  alignItems: 'center',
  justifyItems: 'center',
  gap: theme.spacing(8),
}));

const ContentStack = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  gridRow: 2,
  gap: theme.spacing(4),
  [theme.breakpoints.up('sm')]: {
    alignItems: 'flex-start',
  },
}));

const WelcomeStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
  },
}));

export default function Library() {

  return (
    <Container>
      <MainContent>
        <ContentStack>
          <Typography variant="h4" component="h1">
            Lab Dragon
          </Typography>
          <WelcomeStack>
            <Typography>Welcome!</Typography>
          </WelcomeStack>
        </ContentStack>
      </MainContent>
    </Container>
  );
}