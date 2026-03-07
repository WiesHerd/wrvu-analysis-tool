import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Container, TextField, InputAdornment,
  IconButton, FormControlLabel, Switch, Button, FormControl, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Popover, ThemeProvider, createTheme, Snackbar, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import CalendarToday from '@mui/icons-material/CalendarToday';
import AccessTime from '@mui/icons-material/AccessTime';
import People from '@mui/icons-material/People';
import TrendingUp from '@mui/icons-material/TrendingUp';
import AttachMoney from '@mui/icons-material/AttachMoney';
import School from '@mui/icons-material/School';
import Celebration from '@mui/icons-material/Celebration';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import Delete from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import PrintIcon from '@mui/icons-material/Print';
import Save from '@mui/icons-material/Save';
import { NumericFormat } from 'react-number-format';


// Add this constant at the top of the file
const STORAGE_KEY = 'wrvuForecastingState';

// Create a print-specific theme with reduced spacing and smaller font sizes.
// Use same palette as App so buttons/tabs/primary elements stay indigo (not default blue).
const printTheme = createTheme({
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
      defaultProps: { color: 'primary' },
      styleOverrides: {
        root: {
          '&.MuiButton-contained': { backgroundColor: '#4f46e5', color: '#fff', '&:hover': { backgroundColor: '#3730a3' } },
          '&.MuiButton-outlined': { borderColor: '#4f46e5', color: '#4f46e5', '&:hover': { borderColor: '#3730a3', backgroundColor: 'rgba(79, 70, 229, 0.04)' } },
        },
      },
    },
    MuiSwitch: {
      defaultProps: { color: 'primary' },
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': { color: '#4f46e5', '& + .MuiSwitch-track': { backgroundColor: '#4f46e5' } },
        },
        colorPrimary: {
          '&.Mui-checked': { color: '#4f46e5', '& + .MuiSwitch-track': { backgroundColor: '#4f46e5' } },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(79, 70, 229, 0.5)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          '@media print': {
            boxShadow: 'none',
            border: '1px solid',
          borderColor: 'divider',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h6: {
          '@media print': {
            fontSize: '14px',
          },
        },
        h5: {
          '@media print': {
            fontSize: '14px',
          },
        },
        subtitle1: {
          '@media print': {
            fontSize: '12px',
          },
        },
        body1: {
          '@media print': {
            fontSize: '12px',
          },
        },
        body2: {
          '@media print': {
            fontSize: '10px',
          },
        },
        caption: {
          '@media print': {
            fontSize: '8px',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media print': {
            padding: '0 !important',
            maxWidth: '100% !important',
          },
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          '@media print': {
            margin: '0 !important',
          },
        },
        item: {
          '@media print': {
            padding: '4px !important',
          },
        },
      },
    },
    MuiBox: {
      styleOverrides: {
        root: {
          '@media print': {
            margin: '0 !important',
          },
        },
      },
    },
  },
});

function CustomNumberInput({ label, value, onChange, icon, min = 0, max = Infinity, step = 0.01, ...props }) {
  const handleIncrement = () => {
    const newValue = Number((value + step).toFixed(2));
    onChange(Math.min(newValue, max));
  };

  const handleDecrement = () => {
    const newValue = Number((value - step).toFixed(2));
    onChange(Math.max(newValue, min));
  };

  return (
    <TextField
      fullWidth
      margin="normal"
      label={label}
      value={value}
      onChange={(e) => {
        const val = e.target.value === '' ? min : Number(e.target.value);
        onChange(isNaN(val) ? min : Math.max(min, Math.min(val, max)));
      }}
      sx={{
        '@media (max-width: 600px)': {
          '& .MuiInputBase-root': { minHeight: 44 },
          '& .MuiInputBase-input': { paddingTop: 1.25, paddingBottom: 1.25 },
        },
      }}
      InputProps={{
        startAdornment: icon && (
          <InputAdornment position="start">
            {icon}
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <Box sx={{ 
              display: 'flex', 
              gap: '2px',
              bgcolor: 'rgba(0,0,0,0.03)',
              borderRadius: '4px',
              padding: '2px',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.05)'
              }
            }}>
              <IconButton 
                size="small" 
                onClick={handleDecrement}
                sx={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white'
                  }
                }}
              >
                <Remove sx={{ fontSize: '0.9rem' }} />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={handleIncrement}
                sx={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white'
                  }
                }}
              >
                <Add sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Box>
          </InputAdornment>
        ),
        ...props.InputProps
      }}
      {...props}
    />
  );
}

const WEEKDAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function WorkSchedule({ inputs, handleInputChange, handleShiftChange, handleDeleteShift, typicalWeekHours, onTypicalWeekChange, onClearTypicalWeek, scheduleInputMode, onScheduleInputModeChange }) {
  const week = typicalWeekHours || [0, 0, 0, 0, 0, 0, 0];
  const totalDays = week.filter((h) => Number(h) > 0).length;
  const totalHours = week.reduce((s, h) => s + (Number(h) || 0), 0);
  const isTypicalWeek = scheduleInputMode === 'typicalWeek';

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, height: '100%', borderRadius: '16px', border: '1px solid',
      borderColor: 'divider' }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>Work Schedule</Typography>
      <CustomNumberInput
        label="Vacation Weeks per Year"
        value={inputs.vacationWeeks}
        onChange={(value) => handleInputChange('vacationWeeks', value)}
        icon={<Celebration />}
        min={0}
        max={52}
        step={1}
      />
      <CustomNumberInput
        label="Statutory Holidays per Year"
        value={inputs.statutoryHolidays}
        onChange={(value) => handleInputChange('statutoryHolidays', value)}
        icon={<EventIcon />}
        min={0}
        max={365}
        step={1}
      />
      <CustomNumberInput
        label="CME Days per Year"
        value={inputs.cmeDays}
        onChange={(value) => handleInputChange('cmeDays', value)}
        icon={<School />}
        min={0}
        max={365}
        step={1}
      />
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
        Schedule (optional)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Choose how to define your schedule—typical week or shift types.
      </Typography>
      <ToggleButtonGroup
        value={scheduleInputMode}
        exclusive
        onChange={onScheduleInputModeChange}
        size="small"
        sx={{
          mb: 2,
          '& .MuiToggleButton-root': {
            px: 2,
            textTransform: 'none',
            fontWeight: 500,
            '&.Mui-selected': {
              backgroundColor: 'rgba(79, 70, 229, 0.12)',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
              },
            },
          },
        }}
      >
        <ToggleButton value="typicalWeek" aria-label="Typical week">
          Typical week
        </ToggleButton>
        <ToggleButton value="shiftTypes" aria-label="Shift types">
          Shift types
        </ToggleButton>
      </ToggleButtonGroup>
      {isTypicalWeek ? (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {WEEKDAY_LABELS.map((label, i) => (
              <Box key={i} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: { xs: 0.5, sm: 2 } }}>
                <Typography sx={{ width: { sm: 100 }, flexShrink: 0, fontSize: '0.875rem' }}>{label}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    size="small"
                    type="number"
                    value={week[i] || 0}
                    onChange={(e) => onTypicalWeekChange(i, e.target.value)}
                    inputProps={{ min: 0, max: 24, step: 0.5 }}
                    sx={{ width: { xs: '100%', sm: 100 }, minWidth: 0, flexShrink: 0 }}
                    placeholder="0"
                  />
                  <Typography variant="body2" color="text.secondary">hrs</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          {totalHours > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
                {totalDays} day{totalDays !== 1 ? 's' : ''}, {totalHours} hrs/week
              </Typography>
              <Button size="small" onClick={onClearTypicalWeek} sx={{ mt: 1 }}>
                Clear hours
              </Button>
            </Box>
          )}
        </>
      ) : (
        <>
          {inputs.shifts.map((shift, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, flexWrap: 'wrap', gap: { xs: 1.5, sm: 0 }, mb: 2 }}>
              <TextField
                sx={{ mr: { sm: 1 }, flexGrow: 1, minWidth: { xs: '100%', sm: 0 } }}
                label="Shift Name"
                value={shift.name}
                onChange={(e) => handleShiftChange(index, 'name', e.target.value)}
              />
              <TextField
                sx={{ mr: { sm: 1 }, width: { xs: '100%', sm: '80px' } }}
                type="number"
                label="Hours"
                value={shift.hours}
                onChange={(e) => handleShiftChange(index, 'hours', e.target.value)}
              />
              <TextField
                sx={{ mr: { sm: 1 }, width: { xs: '100%', sm: '80px' } }}
                type="number"
                label="Per Week"
                value={shift.perWeek}
                onChange={(e) => handleShiftChange(index, 'perWeek', e.target.value)}
              />
              <IconButton onClick={() => handleDeleteShift(index)} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, minWidth: 44, minHeight: 44 }}>
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<Add />} onClick={() => handleShiftChange(null, 'add')}>
            Add Shift Type
          </Button>
        </>
      )}
    </Paper>
  );
}

function DifferenceIndicator({ difference }) {
  if (!difference || !difference.startsWith('+')) return null;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          fontWeight: 'bold', 
          color: 'success.main',
          bgcolor: 'rgba(76, 175, 80, 0.1)',
          borderRadius: '8px',
          px: 1.5,
          py: 0.5,
          ml: 2,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {difference}
        <InfoOutlined 
          fontSize="small" 
          sx={{ fontSize: '0.875rem', ml: 0.5, color: 'success.main' }} 
        />
      </Typography>
    </Box>
  );
}

function StatItem({ icon, label, value, difference }) {
  return (
    <Paper sx={{ 
      p: 2,
      height: '100%',
      borderRadius: '16px',
      border: '1px solid',
      borderColor: 'divider',
      backgroundColor: 'background.paper'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Box sx={{ mr: 2, color: 'primary.main' }}>{icon}</Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{value}</Typography>
            <DifferenceIndicator difference={difference} />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function ProductivitySummary({ metrics, adjustedMetrics, inputs }) {
  // Calculate adjusted metrics
  const adjustedAnnualWRVUs = metrics.annualPatientEncounters * inputs.adjustedWRVUPerEncounter;
  const adjustedWRVUCompensation = adjustedAnnualWRVUs * inputs.wrvuConversionFactor;
  
  // Calculate incentive payments
  const currentIncentive = Math.max(0, metrics.wrvuCompensation - inputs.baseSalary);
  const adjustedIncentive = Math.max(0, adjustedWRVUCompensation - inputs.baseSalary);

  const formatNumber = (value) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

  const formatCurrency = (value) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const formatDifference = (current, adjusted, prefix = '') => {
    const diff = adjusted - current;
    if (diff <= 0) return null;
    return `+${prefix}${formatCurrency(diff)}`;
  };

  const formatWRVUDifference = (current, adjusted) => {
    const diff = adjusted - current;
    if (diff <= 0) return null;
    return `+${formatNumber(diff)}`;
  };

  const summaryItems = [
    {
      icon: <AttachMoney fontSize="large" />,
      label: "Estimated Total Compensation",
      value: formatCurrency(metrics.estimatedTotalCompensation)
    },
    {
      icon: <AttachMoney fontSize="large" />,
      label: "Estimated Incentive Payment",
      value: formatCurrency(currentIncentive),
      difference: formatDifference(currentIncentive, adjustedIncentive)
    },
    {
      icon: <CalendarToday fontSize="large" />,
      label: "Weeks Worked Per Year",
      value: formatNumber(metrics.weeksWorkedPerYear)
    },
    {
      icon: <People fontSize="large" />,
      label: "Encounters per Week",
      value: formatNumber(metrics.encountersPerWeek)
    },
    {
      icon: <CalendarToday fontSize="large" />,
      label: "Annual Clinic Days",
      value: formatNumber(metrics.annualClinicDays)
    },
    {
      icon: <AccessTime fontSize="large" />,
      label: "Annual Clinical Hours",
      value: formatNumber(metrics.annualClinicalHours)
    },
    {
      icon: <People fontSize="large" />,
      label: "Annual Patient Encounters",
      value: formatNumber(metrics.annualPatientEncounters)
    },
    {
      icon: <TrendingUp fontSize="large" />,
      label: "Estimated Annual wRVUs",
      value: formatNumber(metrics.estimatedAnnualWRVUs),
      difference: formatWRVUDifference(metrics.estimatedAnnualWRVUs, adjustedAnnualWRVUs)
    }
  ];

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Productivity Summary
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: '16px', border: '1px solid',
      borderColor: 'divider' }}>

      <Grid container spacing={2}>
        {summaryItems.map((item, index) => (
          <Grid item xs={12} md={6} key={index}>
            <div style={{ height: '100%' }}>
              <StatItem {...item} />
            </div>
          </Grid>
        ))}
      </Grid>
      </Paper>
    </>
  );
}

// Add this new component for print-only view
function PrintableView({ metrics, inputs }) {
  // Format helpers
  const formatNumber = (value) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

  const formatCurrency = (value) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  // Calculate adjusted metrics for the difference indicators
  const adjustedAnnualWRVUs = metrics.annualPatientEncounters * inputs.adjustedWRVUPerEncounter;
  const adjustedWRVUCompensation = adjustedAnnualWRVUs * inputs.wrvuConversionFactor;
  const currentIncentive = Math.max(0, metrics.wrvuCompensation - inputs.baseSalary);
  const adjustedIncentive = Math.max(0, adjustedWRVUCompensation - inputs.baseSalary);

  // Common styles for consistency
  const boxStyles = {
    p: 1.5, 
    border: '1px solid',
          borderColor: 'divider', 
    borderRadius: '4px',
    backgroundColor: 'background.paper'
  };

  const headerStyles = {
    fontSize: '13px', 
    fontWeight: 'bold', 
    color: 'text.secondary', 
    mb: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    pb: 0.5,
    display: 'flex',
    alignItems: 'center'
  };

  const rowStyles = {
    display: 'flex', 
    justifyContent: 'space-between', 
    mb: 0.5
  };

  const labelStyles = {
    fontSize: '11px', 
    fontWeight: 'bold', 
    color: 'text.secondary'
  };

  const valueStyles = {
    fontSize: '11px', 
    color: 'text.primary'
  };

  const metricValueStyles = {
    fontSize: '16px', 
    fontWeight: 'bold', 
    color: 'text.primary',
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  };

  const projectionValueStyles = {
    fontSize: '11px', 
    color: 'text.primary',
    width: '120px',
    textAlign: 'right'
  };

  return (
    <Box 
      data-print-section="true"
      sx={{ 
        display: 'none', 
        '@media print': { 
          display: 'block !important',
          width: '100%',
          padding: '10px',
          fontFamily: 'Arial, sans-serif',
          background: 'white !important',
          color: 'text.primary',
          pageBreakAfter: 'avoid',
          pageBreakInside: 'avoid'
        } 
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary', fontSize: '16px' }}>
          <TrendingUp sx={{ fontSize: '18px', verticalAlign: 'text-bottom', color: 'primary.main', mr: 0.5 }} />
          Provider Analytics Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 0.5, color: 'primary.main', fontSize: '13px' }}>
          Quick Calculator wRVU Adjustments
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '11px' }}>
          <CalendarToday sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
          Generated on {new Date().toLocaleDateString()}
        </Typography>
      </Box>

      {/* Top row - Summary metrics */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: { xs: 1.5, sm: 0 }, mb: 2.5 }}>
        <Box sx={{ 
          width: { xs: '100%', sm: '32%' }, 
          p: 1.5, 
          border: '1px solid',
          borderColor: 'divider', 
          borderRadius: '4px',
          backgroundColor: 'background.paper'
        }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 'normal', color: 'text.secondary', mb: 0.5 }}>
            <AttachMoney sx={{ fontSize: '14px', verticalAlign: 'text-bottom', color: 'primary.main' }} />
            Total Compensation
          </Typography>
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: 'text.primary' }}>
            {formatCurrency(metrics.estimatedTotalCompensation)}
          </Typography>
        </Box>
        
        <Box sx={{ 
          width: { xs: '100%', sm: '32%' }, 
          p: 1.5, 
          border: '1px solid',
          borderColor: 'divider', 
          borderRadius: '4px',
          backgroundColor: 'background.paper'
        }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 'normal', color: 'text.secondary', mb: 0.5 }}>
            <AttachMoney sx={{ fontSize: '14px', verticalAlign: 'text-bottom', color: 'primary.main' }} />
            Incentive Payment
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: 'text.primary' }}>
              {formatCurrency(currentIncentive)}
            </Typography>
            {adjustedIncentive > currentIncentive && (
              <Typography sx={{ 
                ml: 1, 
                fontSize: '11px', 
                fontWeight: 'bold', 
                color: 'success.main',
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                borderRadius: '8px',
                px: 1,
                py: 0.25,
                display: 'flex',
                alignItems: 'center'
              }}>
                +{formatCurrency(adjustedIncentive - currentIncentive).replace('$', '')}
                <InfoOutlined 
                  sx={{ fontSize: '10px', ml: 0.5, color: 'success.main' }} 
                />
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ 
          width: { xs: '100%', sm: '32%' }, 
          p: 1.5, 
          border: '1px solid',
          borderColor: 'divider', 
          borderRadius: '4px',
          backgroundColor: 'background.paper'
        }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 'normal', color: 'text.secondary', mb: 0.5 }}>
            <TrendingUp sx={{ fontSize: '14px', verticalAlign: 'text-bottom', color: 'primary.main' }} />
            Estimated Annual wRVUs
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: 'text.primary' }}>
              {formatNumber(metrics.estimatedAnnualWRVUs)}
            </Typography>
            {adjustedAnnualWRVUs > metrics.estimatedAnnualWRVUs && (
              <Typography sx={{ 
                ml: 1, 
                fontSize: '11px', 
                fontWeight: 'bold', 
                color: 'success.main',
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                borderRadius: '8px',
                px: 1,
                py: 0.25,
                display: 'flex',
                alignItems: 'center'
              }}>
                +{formatNumber(adjustedAnnualWRVUs - metrics.estimatedAnnualWRVUs)}
                <InfoOutlined 
                  sx={{ fontSize: '10px', ml: 0.5, color: 'success.main' }} 
                />
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Main content - Two-column layout */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: { xs: 1.5, sm: 0 } }}>
        {/* Left column - Work Schedule & Shift Types & Patient Encounters */}
        <Box sx={{ width: { xs: '100%', sm: '49%' } }}>
          <Box sx={{ ...boxStyles, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography sx={headerStyles}>
              <People sx={{ fontSize: '14px', mr: 0.5, color: 'primary.main' }} />
              Provider Input Data
            </Typography>
            
            {/* Work Schedule section */}
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: 'text.secondary', 
                mb: 0.5,
                display: 'flex',
                alignItems: 'center'
              }}>
                <CalendarToday sx={{ fontSize: '12px', mr: 0.5, color: 'primary.main' }} />
                Work Schedule
              </Typography>
              
              <Box sx={rowStyles}>
                <Typography sx={labelStyles}>
                  Weeks Worked:
                </Typography>
                <Typography sx={valueStyles}>
                  {formatNumber(metrics.weeksWorkedPerYear)} weeks/year
                </Typography>
              </Box>
              
              <Box sx={rowStyles}>
                <Typography sx={labelStyles}>
                  <Celebration sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
                  Vacation:
                </Typography>
                <Typography sx={valueStyles}>
                  {inputs.vacationWeeks} weeks
                </Typography>
              </Box>
              
              <Box sx={rowStyles}>
                <Typography sx={labelStyles}>
                  <School sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
                  CME:
                </Typography>
                <Typography sx={valueStyles}>
                  {inputs.cmeDays} days
                </Typography>
              </Box>
              
              <Box sx={rowStyles}>
                <Typography sx={labelStyles}>
                  <EventIcon sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
                  Holidays:
                </Typography>
                <Typography sx={valueStyles}>
                  {inputs.statutoryHolidays} days
                </Typography>
              </Box>
            </Box>
            
            {/* Schedule: typical week or shift types */}
            <Box sx={{ mb: 1.5, borderTop: '1px dashed',
          borderColor: 'divider', pt: 1.5 }}>
              <Typography sx={{ 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: 'text.secondary', 
                mb: 0.5,
                display: 'flex',
                alignItems: 'center'
              }}>
                <AccessTime sx={{ fontSize: '12px', mr: 0.5, color: 'primary.main' }} />
                {inputs.scheduleInputMode === 'typicalWeek' ? 'Typical week' : 'Shift Types'}
              </Typography>
              {inputs.scheduleInputMode === 'typicalWeek' && inputs.typicalWeekHours?.some((h) => Number(h) > 0) ? (
                <Box sx={rowStyles}>
                  <Typography sx={labelStyles}>Schedule:</Typography>
                  <Typography sx={valueStyles}>
                    {inputs.typicalWeekHours.filter((h) => Number(h) > 0).length} days, {inputs.typicalWeekHours.reduce((s, h) => s + (Number(h) || 0), 0)} hrs/week
                    ({WEEKDAY_LABELS.map((d, i) => Number(inputs.typicalWeekHours[i]) > 0 ? `${d} ${inputs.typicalWeekHours[i]}h` : null).filter(Boolean).join(', ')})
                  </Typography>
                </Box>
              ) : null}
              {inputs.scheduleInputMode === 'shiftTypes' && inputs.shifts.map((shift, i) => (
                <Box key={i} sx={rowStyles}>
                  <Typography sx={labelStyles}>
                    {shift.name}:
                  </Typography>
                  <Typography sx={valueStyles}>
                    {shift.hours} hrs × {shift.perWeek}/week
                  </Typography>
                </Box>
              ))}
            </Box>
            
            {/* Patient Encounters section */}
            <Box sx={{ borderTop: '1px dashed',
          borderColor: 'divider', pt: 1.5 }}>
              <Typography sx={{ 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: 'text.secondary', 
                mb: 0.5,
                display: 'flex',
                alignItems: 'center'
              }}>
                <People sx={{ fontSize: '12px', mr: 0.5, color: 'primary.main' }} />
                Patient Encounters
              </Typography>
              
              <Box sx={rowStyles}>
                <Typography sx={labelStyles}>
                  <People sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
                  Patients Per Day:
                </Typography>
                <Typography sx={valueStyles}>
                  {inputs.patientsPerDay}
                </Typography>
              </Box>
              
              <Box sx={rowStyles}>
                <Typography sx={labelStyles}>
                  <TrendingUp sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
                  Avg wRVU/Encounter:
                </Typography>
                <Typography sx={valueStyles}>
                  {inputs.avgWRVUPerEncounter.toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={rowStyles}>
                <Typography sx={labelStyles}>
                  <TrendingUp sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
                  Adj wRVU/Encounter:
                </Typography>
                <Typography sx={valueStyles}>
                  {inputs.adjustedWRVUPerEncounter.toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={rowStyles}>
                <Typography sx={labelStyles}>
                  <AttachMoney sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
                  Base Salary:
                </Typography>
                <Typography sx={valueStyles}>
                  {formatCurrency(inputs.baseSalary)}
                </Typography>
              </Box>
              
              <Box sx={rowStyles}>
                <Typography sx={labelStyles}>
                  <AttachMoney sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
                  wRVU Conversion:
                </Typography>
                <Typography sx={valueStyles}>
                  {inputs.wrvuConversionFactor.toFixed(2)}/wRVU
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Right column - Productivity Metrics */}
        <Box sx={{ width: { xs: '100%', sm: '49%' } }}>
          <Box sx={{ ...boxStyles, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography sx={headerStyles}>
              <TrendingUp sx={{ fontSize: '14px', mr: 0.5, color: 'primary.main' }} />
              Productivity Metrics
            </Typography>
            
            {/* Combined metrics and projection section */}
            <Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: { xs: 1.5, sm: 0 }, mb: 1 }}>
                <Box sx={{ width: { xs: '100%', sm: '48%' }, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'text.secondary', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarToday sx={{ fontSize: '11px', mr: 0.5 }} />
                    Annual Clinic Days
                  </Typography>
                  <Typography sx={metricValueStyles}>
                    {formatNumber(metrics.annualClinicDays)}
                  </Typography>
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: '48%' }, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'text.secondary', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AccessTime sx={{ fontSize: '11px', mr: 0.5 }} />
                    Annual Clinical Hours
                  </Typography>
                  <Typography sx={metricValueStyles}>
                    {formatNumber(metrics.annualClinicalHours)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: { xs: 1.5, sm: 0 }, mb: 1.5 }}>
                <Box sx={{ width: { xs: '100%', sm: '48%' }, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'text.secondary', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <People sx={{ fontSize: '11px', mr: 0.5 }} />
                    Encounters per Week
                  </Typography>
                  <Typography sx={metricValueStyles}>
                    {formatNumber(metrics.encountersPerWeek)}
                  </Typography>
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: '48%' }, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'text.secondary', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <People sx={{ fontSize: '11px', mr: 0.5 }} />
                    Annual Patient Encounters
                  </Typography>
                  <Typography sx={metricValueStyles}>
                    {formatNumber(metrics.annualPatientEncounters)}
                  </Typography>
                </Box>
              </Box>
              
              {/* Projected Increase section - integrated with metrics */}
              <Box sx={{ borderTop: '1px dashed',
          borderColor: 'divider', pt: 1.5 }}>
                <Typography sx={{ 
                  fontSize: '13px', 
                  fontWeight: 'bold', 
                  color: 'text.secondary', 
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <TrendingUp sx={{ fontSize: '14px', mr: 0.5, color: 'success.main' }} />
                  Projected Increase with Adjusted wRVU
                </Typography>
                
                <Box sx={rowStyles}>
                  <Typography sx={labelStyles}>
                    <TrendingUp sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
                    Current wRVU per Encounter:
                  </Typography>
                  <Typography sx={projectionValueStyles}>
                    {inputs.avgWRVUPerEncounter.toFixed(2)} = {formatNumber(metrics.estimatedAnnualWRVUs)} wRVUs
                  </Typography>
                </Box>
                
                <Box sx={rowStyles}>
                  <Typography sx={labelStyles}>
                    <TrendingUp sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5, color: 'success.main' }} />
                    Adjusted wRVU per Encounter:
                  </Typography>
                  <Typography sx={projectionValueStyles}>
                    {inputs.adjustedWRVUPerEncounter.toFixed(2)} = {formatNumber(adjustedAnnualWRVUs)} wRVUs
                  </Typography>
                </Box>
                
                <Box sx={rowStyles}>
                  <Typography sx={labelStyles}>
                    <AttachMoney sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5, color: 'success.main' }} />
                    Potential Additional Incentive:
                  </Typography>
                  <Typography sx={{ 
                    ...projectionValueStyles, 
                    fontWeight: 'bold', 
                    color: 'success.main',
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: '8px',
                    px: 1,
                    py: 0.25,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    +{formatCurrency(adjustedIncentive - currentIncentive)}
                    <InfoOutlined 
                      sx={{ fontSize: '10px', ml: 0.5, color: 'success.main' }} 
                    />
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        mt: 1, 
        pt: 0.5, 
        textAlign: 'center',
        borderTop: '1px solid #eee'
      }}>
        <Typography sx={{ fontSize: '10px', color: 'text.disabled', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <InfoOutlined sx={{ fontSize: '10px', mr: 0.5 }} />
          *Green values indicate potential increases with adjusted wRVU per encounter.
        </Typography>
      </Box>
    </Box>
  );
}

function WRVUForecastingTool({ setTotalVisits }) {
  // Load initial state from localStorage or use default values
  const getInitialState = () => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (!Array.isArray(parsed.typicalWeekHours) || parsed.typicalWeekHours.length !== 7) {
        parsed.typicalWeekHours = [0, 0, 0, 0, 0, 0, 0];
      }
      if (parsed.scheduleInputMode !== 'typicalWeek' && parsed.scheduleInputMode !== 'shiftTypes') {
        parsed.scheduleInputMode = 'shiftTypes';
      }
      return parsed;
    }
    return {
      weeksPerYear: 48,
      vacationWeeks: 4,
      cmeDays: 5,
      statutoryHolidays: 10,
      scheduleInputMode: 'shiftTypes', // 'typicalWeek' | 'shiftTypes' — optional schedule input
      typicalWeekHours: [0, 0, 0, 0, 0, 0, 0],
      shifts: [
        { name: 'Regular Clinic', hours: 8, perWeek: 4 },
        { name: 'Extended Hours', hours: 10, perWeek: 1 },
      ],
      patientsPerHour: 2,
      patientsPerDay: 16,
      avgWRVUPerEncounter: 1.5,
      adjustedWRVUPerEncounter: 1.5,
      baseSalary: 150000,
      wrvuConversionFactor: 45.52,
      isPerHour: true,
    };
  };

  const [inputs, setInputs] = useState(getInitialState());

  // Save to localStorage whenever inputs change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  const [metrics, setMetrics] = useState({
    weeksWorkedPerYear: 0,
    annualClinicDays: 0,
    annualClinicalHours: 0,
    encountersPerWeek: 0,
    annualPatientEncounters: 0,
    estimatedAnnualWRVUs: 0,
    estimatedTotalCompensation: 0,
    wrvuCompensation: 0
  });

  const [, setDetailedForecast] = useState([]);
  const [, setTotalEstimatedWRVUs] = useState(0);
  const [totalVisitsLocal] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  // eslint-disable-next-line no-unused-vars -- setter reserved for future sync with Procedure Analysis
  const [adjustedMetrics, setAdjustedMetrics] = useState({});
  const [, setIsUploadInstructionsOpen] = useState(false); // eslint-disable-line no-unused-vars

  // Add state for saved scenarios
  const [savedScenarios, setSavedScenarios] = useState(() => {
    const saved = localStorage.getItem('savedScenarios');
    return saved ? JSON.parse(saved) : [];
  });
  const [scenarioName, setScenarioName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleInputChange = (name, value) => {
    setInputs(prevInputs => ({
      ...prevInputs,
      [name]: value
    }));
  };

  const handleShiftChange = (index, field, value) => {
    setInputs(prev => {
      const newShifts = [...prev.shifts];
      if (field === 'add') {
        newShifts.push({ name: 'New Shift', hours: 8, perWeek: 1 });
      } else if (field === 'remove') {
        newShifts.splice(index, 1);
      } else {
        newShifts[index] = {
          ...newShifts[index],
          [field]: field === 'name' ? value : Number(value) || 0
        };
      }
      return { ...prev, shifts: newShifts };
    });
  };

  const handleDeleteShift = (index) => {
    setInputs(prevInputs => ({
      ...prevInputs,
      shifts: prevInputs.shifts.filter((_, i) => i !== index)
    }));
  };

  const handleTypicalWeekChange = (dayIndex, value) => {
    const hours = Math.max(0, Math.min(24, Number(value) || 0));
    setInputs(prev => {
      const next = [...(prev.typicalWeekHours || [0, 0, 0, 0, 0, 0, 0])];
      next[dayIndex] = hours;
      return { ...prev, typicalWeekHours: next };
    });
  };

  const handleClearTypicalWeek = () => {
    setInputs(prev => ({ ...prev, typicalWeekHours: [0, 0, 0, 0, 0, 0, 0] }));
  };

  const handleScheduleInputModeChange = (_, value) => {
    if (value !== null) setInputs(prev => ({ ...prev, scheduleInputMode: value }));
  };

  useEffect(() => {
    const totalWeeksOff = inputs.vacationWeeks + ((inputs.cmeDays + inputs.statutoryHolidays) / 7);
    const weeksWorkedPerYear = 52 - totalWeeksOff;

    const useTypicalWeek = inputs.scheduleInputMode === 'typicalWeek';
    const weekHours = inputs.typicalWeekHours || [0, 0, 0, 0, 0, 0, 0];
    const totalDaysPerWeek = useTypicalWeek
      ? weekHours.filter((h) => Number(h) > 0).length
      : inputs.shifts.reduce((total, shift) => total + shift.perWeek, 0);
    const totalHoursPerWeek = useTypicalWeek
      ? weekHours.reduce((sum, h) => sum + (Number(h) || 0), 0)
      : inputs.shifts.reduce((total, shift) => total + (shift.hours * shift.perWeek), 0);

    const annualClinicDays = Math.max(0, (totalDaysPerWeek * weeksWorkedPerYear) - inputs.statutoryHolidays - inputs.cmeDays);
    const hoursPerClinicDay = totalDaysPerWeek > 0 ? totalHoursPerWeek / totalDaysPerWeek : 0;
    const annualClinicalHours = annualClinicDays * hoursPerClinicDay;

    const annualPatientEncounters = inputs.isPerHour
      ? annualClinicalHours * inputs.patientsPerHour
      : annualClinicDays * inputs.patientsPerDay;
    const encountersPerWeek = weeksWorkedPerYear > 0 ? annualPatientEncounters / weeksWorkedPerYear : 0;

    // Calculate wRVUs and compensation
    const estimatedAnnualWRVUs = annualPatientEncounters * inputs.avgWRVUPerEncounter;
    const wrvuCompensation = estimatedAnnualWRVUs * inputs.wrvuConversionFactor;
    const estimatedTotalCompensation = Math.max(inputs.baseSalary, wrvuCompensation);

    // Update summary state
    setMetrics({
      weeksWorkedPerYear,
      annualClinicDays,
      annualClinicalHours,
      encountersPerWeek,
      annualPatientEncounters,
      estimatedAnnualWRVUs,
      estimatedTotalCompensation,
      wrvuCompensation
    });

    setTotalVisits(annualPatientEncounters);
  }, [inputs, setTotalVisits]);

  const _handleUpdateForecast = (newForecast) => { // eslint-disable-line no-unused-vars
    setDetailedForecast(newForecast.detailedForecast);
    setTotalEstimatedWRVUs(newForecast.totalEstimatedWRVUs);
    
    setInputs(prev => ({
      ...prev,
      avgWRVUPerEncounter: newForecast.totalEstimatedWRVUs / totalVisitsLocal
    }));
  };

  const handleInfoClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleInfoClose = () => {
    setAnchorEl(null);
  };

  const handleSwitchChange = (checked) => {
    setInputs(prev => ({
      ...prev,
      isPerHour: checked
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Add scenario saving functionality
  const handleSaveScenario = () => {
    if (!scenarioName.trim()) return;
    
    const newScenario = {
      id: Date.now(), // Use timestamp as unique ID
      name: scenarioName,
      inputs: { ...inputs },
      metrics: { ...metrics },
      date: new Date().toLocaleDateString()
    };
    
    const updatedScenarios = [...savedScenarios, newScenario];
    setSavedScenarios(updatedScenarios);
    localStorage.setItem('savedScenarios', JSON.stringify(updatedScenarios));
    setScenarioName('');
    setShowSaveDialog(false);
    setSnackbarOpen(true);
  };
  
  const handleLoadScenario = (scenario) => {
    console.log(`Loading scenario: ${scenario.name}`);
    setInputs(scenario.inputs);
    // Metrics will be recalculated automatically via useEffect
  };
  
  const handleDeleteScenario = (id, event) => {
    event.stopPropagation(); // Prevent triggering the load scenario
    const updatedScenarios = savedScenarios.filter(scenario => scenario.id !== id);
    setSavedScenarios(updatedScenarios);
    localStorage.setItem('savedScenarios', JSON.stringify(updatedScenarios));
  };

  return (
    <ThemeProvider theme={printTheme}>
      <Container maxWidth="lg" sx={{ mt: 4, '@media print': { mt: 0 }, '@media (max-width: 599px)': { maxWidth: '100%' } }}>
        <Box sx={{ '@media print': { display: 'none' } }}>
          {/* Normal view content */}
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mt: 4, borderRadius: '16px', border: '1px solid',
      borderColor: 'divider' }}> 
            {/* Mobile-friendly header layout */}
            <Box sx={{ mb: 2 }}>
              {/* Centered title container */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '1.1rem',
                      fontWeight: 'normal'
                    }}
                  >
                    Schedule and Average wRVU Per Encounter Input
                  </Typography>
                  <IconButton 
                    onClick={handleInfoClick} 
                    size="small" 
                    sx={{ 
                      ml: 1,
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                      '@media (hover: none)': {
                        '&:hover': { backgroundColor: 'transparent' }
                      }
                    }}
                    aria-label="More information"
                  >
                    <InfoOutlined sx={{ fontSize: '1.2rem' }} />
                  </IconButton>
                </Box>
              </Box>

              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleInfoClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                PaperProps={{
                  sx: {
                    width: 'max-content',
                    maxWidth: 'min(350px, 90vw)',
                    p: 2,
                    '@media (max-width: 600px)': {
                      margin: 2
                    }
                  }
                }}
              >
                <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                  This screen allows you to input your work schedule details and wRVU per encounter. 
                  It calculates your estimated annual wRVUs, encounters, and potential compensation based on 
                  your inputs. The "Adjusted wRVU Per Encounter" field lets you see how changes in your 
                  billing efficiency might affect your productivity and compensation.
                </Typography>
              </Popover>

              {/* Secondary actions: Save / Print — same size */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<Save />} 
                  onClick={() => setShowSaveDialog(true)}
                  sx={{ borderRadius: '20px', fontSize: '0.8rem', minWidth: 100 }}
                >
                  Save
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<PrintIcon />} 
                  onClick={handlePrint}
                  sx={{ borderRadius: '20px', fontSize: '0.8rem', minWidth: 100 }}
                >
                  Print
                </Button>
              </Box>
            </Box>
            
            {/* Scenario selector */}
            {savedScenarios.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 3,
                mt: 2,
                px: { xs: 2, sm: 0 }
              }}>
                <Box sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                  borderRadius: '24px',
                  px: { xs: 1.5, sm: 2 },
                  py: 0.5,
                  border: '1px solid rgba(79, 70, 229, 0.2)',
                  width: { xs: '100%', sm: 'auto' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 0 }
                }}>
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'primary.main',
                      mr: { xs: 0, sm: 1.5 },
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                    Scenarios:
                  </Box>
                  
                  <FormControl 
                    variant="standard" 
                    sx={{ 
                      minWidth: { xs: '100%', sm: 180 },
                      '& .MuiInput-underline:before': { borderBottom: 'none' },
                      '& .MuiInput-underline:after': { borderBottom: 'none' },
                      '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                    }}
                  >
                    <Select
                      value=""
                      displayEmpty
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const scenario = savedScenarios.find(s => s.id === e.target.value);
                        if (scenario) {
                          handleLoadScenario(scenario);
                          e.target.value = ""; // Reset select after loading
                        }
                      }}
                      sx={{ 
                        fontSize: '0.875rem',
                        color: 'primary.main',
                        width: '100%',
                        '& .MuiSelect-select': { 
                          paddingBottom: 0,
                          paddingTop: 0,
                          paddingRight: '24px !important'
                        }
                      }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select scenario</em>
                      </MenuItem>
                      {savedScenarios.map((scenario) => (
                        <MenuItem 
                          key={scenario.id} 
                          value={scenario.id} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUp fontSize="small" sx={{ mr: 1, color: 'action.active', opacity: 0.6 }} />
                            {scenario.name}
                          </Box>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleDeleteScenario(scenario.id, e)}
                            sx={{ 
                              color: 'error.light', 
                              opacity: 0.7,
                              width: 28, 
                              height: 28,
                              '&:hover': { 
                                opacity: 1,
                                backgroundColor: 'rgba(211, 47, 47, 0.1)'
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            )}

            {/* Step nav: 1 Inputs | 2 Results - same style as Detailed work overview */}
            <Box sx={{ display: 'flex', gap: 0, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              <Button
                onClick={() => setActiveStep(0)}
                variant={activeStep === 0 ? 'contained' : 'text'}
                size="medium"
                sx={{ flex: 1, py: 1.25, px: 2, textTransform: 'none', fontWeight: activeStep === 0 ? 600 : 400, borderRadius: 0 }}
              >
                1. Inputs
              </Button>
              <Button
                onClick={() => setActiveStep(1)}
                variant={activeStep === 1 ? 'contained' : 'text'}
                size="medium"
                sx={{ flex: 1, py: 1.25, px: 2, textTransform: 'none', fontWeight: activeStep === 1 ? 600 : 400, borderRadius: 0 }}
              >
                2. Results
              </Button>
            </Box>

            {activeStep === 0 && (
            <Grid container spacing={{ xs: 2, sm: 4 }} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <WorkSchedule 
                  inputs={inputs} 
                  handleInputChange={handleInputChange} 
                  handleShiftChange={handleShiftChange} 
                  handleDeleteShift={handleDeleteShift}
                  typicalWeekHours={inputs.typicalWeekHours}
                  onTypicalWeekChange={handleTypicalWeekChange}
                  onClearTypicalWeek={handleClearTypicalWeek}
                  scheduleInputMode={inputs.scheduleInputMode}
                  onScheduleInputModeChange={handleScheduleInputModeChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, height: '100%', borderRadius: '16px', border: '1px solid',
      borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Patient Encounters</Typography>
                    <FormControlLabel
                      control={<Switch checked={inputs.isPerHour} onChange={(e) => handleSwitchChange(e.target.checked)} />}
                      label={inputs.isPerHour ? "Patients Per Hour" : "Patients Per Day"}
                    />
                  </Box>
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    margin="normal"
                          label={inputs.isPerHour ? "Patients Seen Per Hour" : "Patients Seen Per Day"}
                          value={inputs.isPerHour ? inputs.patientsPerHour : inputs.patientsPerDay}
                          onValueChange={(values) => {
                            const value = values.floatValue || 0;
                            handleInputChange(inputs.isPerHour ? 'patientsPerHour' : 'patientsPerDay', value);
                          }}
                          decimalScale={0}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <People />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <Box sx={{ 
                                  display: 'flex', 
                                  gap: '2px',
                                  bgcolor: 'rgba(0,0,0,0.03)',
                                  borderRadius: '4px',
                                  padding: '2px',
                                  '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.05)'
                                  }
                                }}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => {
                                      const field = inputs.isPerHour ? 'patientsPerHour' : 'patientsPerDay';
                                      const currentValue = inputs.isPerHour ? inputs.patientsPerHour : inputs.patientsPerDay;
                                      handleInputChange(field, Math.max(0, currentValue - 1));
                                    }}
                                    sx={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '4px',
                                      '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white'
                                      }
                                    }}
                                  >
                                    <Remove sx={{ fontSize: '0.9rem' }} />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => {
                                      const field = inputs.isPerHour ? 'patientsPerHour' : 'patientsPerDay';
                                      const currentValue = inputs.isPerHour ? inputs.patientsPerHour : inputs.patientsPerDay;
                                      handleInputChange(field, currentValue + 1);
                                    }}
                                    sx={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '4px',
                                      '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white'
                                      }
                                    }}
                                  >
                                    <Add sx={{ fontSize: '0.9rem' }} />
                                  </IconButton>
                                </Box>
                              </InputAdornment>
                            ),
                          }}
                  />
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    margin="normal"
                    label="Average wRVU Per Encounter"
                        value={inputs.avgWRVUPerEncounter}
                        onValueChange={(values) => handleInputChange('avgWRVUPerEncounter', values.floatValue || 0)}
                        decimalScale={2}
                        fixedDecimalScale
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TrendingUp />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Box sx={{ 
                                display: 'flex', 
                                gap: '2px',
                                bgcolor: 'rgba(0,0,0,0.03)',
                                borderRadius: '4px',
                                padding: '2px',
                                '&:hover': {
                                  bgcolor: 'rgba(0,0,0,0.05)'
                                }
                              }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleInputChange('avgWRVUPerEncounter', Math.max(0, Number((inputs.avgWRVUPerEncounter - 0.01).toFixed(2))))}
                                  sx={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '4px',
                                    '&:hover': {
                                      bgcolor: 'primary.main',
                                      color: 'white'
                                    }
                                  }}
                                >
                                  <Remove sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleInputChange('avgWRVUPerEncounter', Number((inputs.avgWRVUPerEncounter + 0.01).toFixed(2)))}
                                  sx={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '4px',
                                    '&:hover': {
                                      bgcolor: 'primary.main',
                                      color: 'white'
                                    }
                                  }}
                                >
                                  <Add sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                              </Box>
                            </InputAdornment>
                          ),
                        }}
                  />
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    margin="normal"
                    label="Adjusted wRVU Per Encounter"
                        value={inputs.adjustedWRVUPerEncounter}
                        onValueChange={(values) => handleInputChange('adjustedWRVUPerEncounter', values.floatValue || 0)}
                        decimalScale={2}
                        fixedDecimalScale
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TrendingUp />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Box sx={{ 
                                display: 'flex', 
                                gap: '2px',
                                bgcolor: 'rgba(0,0,0,0.03)',
                                borderRadius: '4px',
                                padding: '2px',
                                '&:hover': {
                                  bgcolor: 'rgba(0,0,0,0.05)'
                                }
                              }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleInputChange('adjustedWRVUPerEncounter', Math.max(0, Number((inputs.adjustedWRVUPerEncounter - 0.01).toFixed(2))))}
                                  sx={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '4px',
                                    '&:hover': {
                                      bgcolor: 'primary.main',
                                      color: 'white'
                                    }
                                  }}
                                >
                                  <Remove sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleInputChange('adjustedWRVUPerEncounter', Number((inputs.adjustedWRVUPerEncounter + 0.01).toFixed(2)))}
                                  sx={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '4px',
                                    '&:hover': {
                                      bgcolor: 'primary.main',
                                      color: 'white'
                                    }
                                  }}
                                >
                                  <Add sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                              </Box>
                            </InputAdornment>
                          ),
                        }}
                  />
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    margin="normal"
                    label="Base Salary"
                        value={inputs.baseSalary}
                        onValueChange={(values) => setInputs(prev => ({ ...prev, baseSalary: values.floatValue }))}
                        thousandSeparator={true}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney />
                            </InputAdornment>
                          ),
                        }}
                  />
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    margin="normal"
                    label="wRVU Conversion Factor"
                        value={inputs.wrvuConversionFactor}
                        onValueChange={(values) => setInputs(prev => ({ ...prev, wrvuConversionFactor: values.floatValue }))}
                        decimalScale={2}
                        fixedDecimalScale
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Box sx={{ 
                                display: 'flex', 
                                gap: '2px',
                                bgcolor: 'rgba(0,0,0,0.03)',
                                borderRadius: '4px',
                                padding: '2px',
                                '&:hover': {
                                  bgcolor: 'rgba(0,0,0,0.05)'
                                }
                              }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => {
                                    const newValue = Number((inputs.wrvuConversionFactor - 0.01).toFixed(2));
                                    setInputs(prev => ({ ...prev, wrvuConversionFactor: Math.max(0, newValue) }));
                                  }}
                                  sx={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '4px',
                                    '&:hover': {
                                      bgcolor: 'primary.main',
                                      color: 'white'
                                    }
                                  }}
                                >
                                  <Remove sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => {
                                    const newValue = Number((inputs.wrvuConversionFactor + 0.01).toFixed(2));
                                    setInputs(prev => ({ ...prev, wrvuConversionFactor: newValue }));
                                  }}
                                  sx={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '4px',
                                    '&:hover': {
                                      bgcolor: 'primary.main',
                                      color: 'white'
                                    }
                                  }}
                                >
                                  <Add sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                              </Box>
                              <Box component="span" sx={{ ml: 1 }}>/ wRVU</Box>
                            </InputAdornment>
                          ),
                        }}
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Target Annual wRVUs"
                        value={inputs.wrvuConversionFactor ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(inputs.baseSalary / inputs.wrvuConversionFactor) : '0'}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <TrendingUp />
                            </InputAdornment>
                          ),
                        }}
                    helperText="Target wRVUs needed to reach base salary (Base Salary ÷ Conversion Factor)"
                  />
                </Paper>
              </Grid>
            </Grid>
            )}
            {activeStep === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                <Button variant="contained" onClick={() => setActiveStep(1)} sx={{ minWidth: 160 }}>
                  View results
                </Button>
              </Box>
            )}

            {activeStep === 1 && (
            <ProductivitySummary metrics={metrics} adjustedMetrics={adjustedMetrics} inputs={inputs} />
            )}
          </Paper>
        </Box>

        {/* Printable view - Only shows when printing */}
        <PrintableView metrics={metrics} inputs={inputs} />
        
        {/* Dialog for saving scenarios */}
        <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
          <DialogTitle>Save Current Scenario</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter a name for this scenario to save the current settings and calculations.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Scenario Name"
              type="text"
              fullWidth
              variant="outlined"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveScenario} variant="contained" disabled={!scenarioName.trim()}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          onClose={() => setSnackbarOpen(false)}
          autoHideDuration={4000}
          message="Scenario saved"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          sx={{ bottom: { xs: 72, sm: 24 } }}
        />
      </Container>
      
      {/* Add global print styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { 
                size: portrait;
                margin: 0.4cm;
                size: auto;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
                background: white !important;
              }
              /* Force background colors to print */
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
                background-color: white !important;
                background-image: none !important;
              }
              /* Hide browser elements */
              @page {
                margin: 0.4cm;
                size: auto;
              }
              html, body {
                width: 100%;
                height: auto;
                background: white !important;
                overflow: hidden !important;
              }
              /* Hide tab navigation */
              nav, 
              [role="tablist"],
              [role="tab"],
              button:not([type="submit"]), 
              .MuiTabs-root,
              header > div:first-child,
              a[href] {
                display: none !important;
              }
              /* Remove extra headers from other components */
              .MuiToolbar-root,
              .MuiAppBar-root {
                display: none !important;
              }
              /* Hide the top navigation header completely */
              body > div > div:first-child > div:first-child {
                display: none !important;
              }
              /* Target the specific navigation box in the app */
              div[style*="display: flex"][style*="justify-content: center"],
              div[style*="border-radius: 24px"],
              div[style*="backdropFilter"] {
                display: none !important;
              }
              /* Hide the main app header */
              h3[style*="background: linear-gradient"] {
                display: none !important;
              }
              /* Force white background on all container elements */
              #root, 
              #root > div, 
              .MuiContainer-root, 
              .MuiPaper-root,
              div[data-print-section="true"],
              div[style*="background-color"],
              [class*="Paper-root"],
              [class*="MuiBox-root"],
              div {
                background-color: white !important;
                background: white !important;
                box-shadow: none !important;
              }
              /* Remove dashed border in projected increase box */
              div[style*="border: 1px dashed"] {
                border: 1px solid #eee !important;
                background-color: white !important;
              }
              /* Force single-page printing */
              .MuiContainer-root {
                height: auto !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                max-height: 100% !important;
                overflow: visible !important;
              }
              /* Ensure the print section fits on one page */
              div[data-print-section="true"] {
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                max-height: 100% !important;
                overflow: visible !important;
              }
              /* Fix unexpected page breaks */
              body, html, #root, #root > div {
                height: auto !important;
                overflow: visible !important;
              }
              /* Ensure scenario management controls don't show in print */
              button[aria-label*="Save"],
              div[role="combobox"],
              .MuiFormControl-root,
              div[role="presentation"] {
                display: none !important;
              }
            }
          `
        }}
      />
    </ThemeProvider>
  );
}

export default WRVUForecastingTool;