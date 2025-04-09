import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, ThemeProvider, createTheme } from '@mui/material';
import ProviderCompensation from './ProviderCompensation';
import WRVUForecastingTool from './WRVUForecastingTool';
import DetailedWRVUForecaster from './DetailedWRVUForecaster';

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
          width: '100%', 
          minHeight: '100vh',
          bgcolor: 'background.default',
          backgroundImage: 'linear-gradient(180deg, rgba(25,118,210,0.04) 0%, rgba(25,118,210,0.01) 100%)',
          backgroundAttachment: 'fixed'
        }}>
          <Box sx={{ 
            width: '100%', 
            background: 'transparent',
            borderBottom: '1px solid rgba(25,118,210,0.12)',
            py: 3,
            mb: 4,
            backgroundColor: 'transparent'
          }}>
            <Container maxWidth="lg">
              <Typography 
                variant="h3" 
                align="center" 
                sx={{ 
                  mb: 4, 
                  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700
                }}
              >
                Provider Analytics Dashboard
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                gap: 1.5,
                px: 2.5,
                py: 1.5,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                width: 'fit-content',
                margin: '0 auto',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.7)'
              }}>
                {[
                  { to: "/", label: "Monthly Dashboard" },
                  { to: "/quick-wrvu", label: "Quick Calculator" },
                  { to: "/advanced-wrvu", label: "Procedure Code Analysis" }
                ].map((item) => (
                  <Button
                    key={item.to}
                    component={Link}
                    to={item.to}
                    onClick={() => setActiveRoute(item.to)}
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      borderRadius: '16px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      bgcolor: activeRoute === item.to ? 'primary.main' : 'transparent',
                      color: activeRoute === item.to ? 'white' : '#334155',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: activeRoute === item.to ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                        transform: 'translateY(-1px)',
                        boxShadow: activeRoute === item.to ? '0 4px 16px rgba(33, 150, 243, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.06)'
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            </Container>
          </Box>

          <Container maxWidth="lg">
            <Routes>
              <Route path="/" element={<ProviderCompensation />} />
              <Route path="/quick-wrvu" element={<WRVUForecastingTool setTotalVisits={setTotalVisits} />} />
              <Route 
                path="/advanced-wrvu" 
                element={
                  <DetailedWRVUForecaster 
                    totalVisits={totalVisits} 
                    onUpdateForecast={handleUpdateForecast} 
                  />
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
