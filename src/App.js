import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import { Typography, Button, Container, Box, ThemeProvider, createTheme, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@mui/material';
import { Speed, Analytics, HelpOutline } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import WRVUForecastingTool from './WRVUForecastingTool';
import DetailedWRVUForecaster from './DetailedWRVUForecaster';

// Premium theme: Plus Jakarta Sans, indigo/slate palette, soft shadows
const theme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5',
      light: '#818cf8',
      dark: '#3730a3',
      contrastText: '#fff',
    },
    secondary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    background: {
      default: 'transparent',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    subtitle1: { fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.5 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          boxShadow: '0 1px 2px rgba(79, 70, 229, 0.05)',
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.07), 0 2px 4px -2px rgba(79, 70, 229, 0.07)',
          border: '1px solid rgba(79, 70, 229, 0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.15)',
        },
      },
    },
  },
});

function AppContent() {
  const [totalVisits, setTotalVisits] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const location = useLocation();

  const handleUpdateForecast = (newForecast) => {
    console.log('New forecast:', newForecast);
  };

  const handleHowToUseClick = () => {
    setIsHelpOpen(true);
  };

  const menuItems = [
    { to: '/wrvu-forecast', label: 'Quick Forecast', icon: <Speed /> },
    { to: '/detailed-wrvu', label: 'Procedure Analysis', icon: <Analytics /> },
  ];

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="lg" sx={{ '@media (max-width: 599px)': { maxWidth: '100%' } }}>
        {/* Header: Gmail-style compact bar — title + nav in one row */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.5, sm: 2 },
            pt: { xs: 1.25, sm: 1.5 },
            pb: { xs: 1.25, sm: 1.5 },
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                letterSpacing: '-0.01em',
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
              }}
            >
              Provider Compensation Forecaster
            </Typography>
            <IconButton
              onClick={handleHowToUseClick}
              size="small"
              sx={{ color: 'text.secondary', ml: 0.25, '&:hover': { color: 'primary.main', backgroundColor: 'rgba(79, 70, 229, 0.06)' } }}
              aria-label="Help"
            >
              <HelpOutline fontSize="small" />
            </IconButton>
          </Box>

          {/* Tool selection — Material/Google-style segmented (tonal, pill) */}
          <Box
            component="nav"
            role="tablist"
            aria-label="Tool selection"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0,
              p: 0.25,
              borderRadius: 2,
              backgroundColor: 'rgba(0,0,0,0.06)',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {menuItems.map((item) => {
              const active = location.pathname === item.to || location.hash === `#${item.to}`;
              return (
                <Button
                  key={item.to}
                  component={Link}
                  to={item.to}
                  role="tab"
                  aria-selected={active}
                  startIcon={item.icon}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.8125rem',
                    minWidth: 0,
                    minHeight: 36,
                    px: { xs: 1.25, sm: 1.5 },
                    py: 0.75,
                    borderRadius: 1.5,
                    color: active ? 'primary.main' : 'text.secondary',
                    backgroundColor: active ? '#fff' : 'transparent',
                    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    '& .MuiButton-startIcon': {
                      marginRight: 0.5,
                      '& > *:nth-of-type(1)': { fontSize: '1rem' },
                    },
                    '&:hover': {
                      backgroundColor: active ? '#fff' : 'rgba(0,0,0,0.04)',
                      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </Box>
      </Container>

      {/* Help Dialog */}
      <Dialog
        open={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>Provider Compensation Forecaster</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography paragraph sx={{ mb: 2 }}>
              Calculate and analyze provider compensation based on wRVUs, procedure codes, and scheduling patterns.
            </Typography>

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Quick Forecast</Typography>
            <Typography paragraph>
              Use this screen for rapid compensation estimates based on your schedule and average wRVU per encounter.
              Input your schedule details, base salary, and average wRVU values to see projected annual compensation.
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Procedure Analysis</Typography>
            <Typography paragraph>
              For detailed analysis using specific procedure codes:
              1. Upload your CMS Fee Schedule using the provided template
              2. Input your procedure code distribution
              3. Set your schedule and compensation parameters
              4. View detailed wRVU and compensation projections
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Tips for Best Results</Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>Keep your CMS Fee Schedule up to date</li>
              <li>Use the detailed analysis for the most accurate projections</li>
              <li>Save different scenarios to compare various schedules and compensation models</li>
              <li>Print reports to share or review results</li>
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsHelpOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="lg" sx={{ 
        pt: { xs: 0, sm: 1 },
        pb: { xs: 3, sm: 4 },
        px: { xs: 1, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        '@media (max-width: 599px)': { maxWidth: '100%' }
      }}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/wrvu-forecast" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <WRVUForecastingTool setTotalVisits={setTotalVisits} />
              </motion.div>
            } />
            <Route path="/detailed-wrvu" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <DetailedWRVUForecaster totalVisits={totalVisits} onUpdateForecast={handleUpdateForecast} />
              </motion.div>
            } />
            <Route path="/" element={<Navigate to="/wrvu-forecast" replace />} />
            <Route path="*" element={<Navigate to="/wrvu-forecast" replace />} />
          </Routes>
        </AnimatePresence>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
