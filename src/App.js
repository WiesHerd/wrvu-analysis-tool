import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, ThemeProvider, createTheme } from '@mui/material';
import ProviderCompensation from './ProviderCompensation';
import WRVUForecastingTool from './WRVUForecastingTool';
import DetailedWRVUForecaster from './DetailedWRVUForecaster';
import { Speed, Analytics, MonetizationOn } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Create a professional theme with standardized typography
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

function App() {
  const [totalVisits, setTotalVisits] = useState(0);
  const [activeRoute, setActiveRoute] = useState(window.location.hash.replace('#', '') || '/');

  const handleUpdateForecast = (newForecast) => {
    console.log('New forecast:', newForecast);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(180deg, rgba(240,244,248,0.8) 0%, rgba(250,252,254,0.9) 100%)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ 
            width: '100%', 
            background: 'transparent',
            py: { xs: 2, sm: 3 },
            mb: 0,
            backgroundColor: 'transparent',
            position: 'relative',
            zIndex: 1
          }}>
            <Container maxWidth="lg">
              <Typography 
                variant="h3" 
                align="center" 
                sx={{ 
                  mb: 2.5, 
                  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    background: 'linear-gradient(45deg, #1976d2 10%, #2196f3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }
                }}
              >
                Provider Compensation Calculator
              </Typography>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                gap: { xs: 1.5, sm: 2 },
                width: '100%',
                maxWidth: '800px',
                mx: 'auto',
                px: { xs: 1, sm: 0 }
              }}>
                <Button
                  component={Link}
                  to="/wrvu-forecast"
                  variant="contained"
                  startIcon={<Speed />}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: '200px' },
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 6px rgba(25,118,210,0.12)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(25,118,210,0.2)',
                      '& .MuiSvgIcon-root': {
                        transform: 'rotate(180deg)'
                      }
                    },
                    '& .MuiSvgIcon-root': {
                      transition: 'transform 0.5s ease-in-out'
                    }
                  }}
                >
                  Quick Forecast
                </Button>
                <Button
                  component={Link}
                  to="/detailed-wrvu"
                  variant="contained"
                  startIcon={<Analytics />}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: '200px' },
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 6px rgba(25,118,210,0.12)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(25,118,210,0.2)',
                      '& .MuiSvgIcon-root': {
                        transform: 'scale(1.2)'
                      }
                    },
                    '& .MuiSvgIcon-root': {
                      transition: 'transform 0.3s ease-in-out'
                    }
                  }}
                >
                  Procedure Analysis
                </Button>
                <Button
                  component={Link}
                  to="/"
                  variant="contained"
                  startIcon={<MonetizationOn />}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: '200px' },
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 6px rgba(25,118,210,0.12)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(25,118,210,0.2)',
                      '& .MuiSvgIcon-root': {
                        transform: 'rotate(15deg) scale(1.2)'
                      }
                    },
                    '& .MuiSvgIcon-root': {
                      transition: 'transform 0.3s ease-in-out'
                    }
                  }}
                >
                  Monthly Performance
                </Button>
              </Box>
            </Container>
          </Box>

          <Container maxWidth="lg" sx={{ 
            pt: { xs: 1, sm: 2 },
            pb: { xs: 3, sm: 4 },
            px: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column'
          }}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ProviderCompensation />
                  </motion.div>
                } />
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
                    <DetailedWRVUForecaster 
                      totalVisits={totalVisits} 
                      onUpdateForecast={handleUpdateForecast} 
                    />
                  </motion.div>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
