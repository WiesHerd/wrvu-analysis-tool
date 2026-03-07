import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Container, TextField, InputAdornment,
  IconButton, FormControlLabel, Switch, Button, Tooltip, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Popover, ThemeProvider, createTheme, Snackbar
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
  },
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
      size="small"
      label={label}
      value={value === 0 ? '' : value}
      onChange={(e) => {
        const val = e.target.value === '' ? min : Number(e.target.value);
        onChange(isNaN(val) ? min : Math.max(min, Math.min(val, max)));
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

function WorkSchedule({ inputs, handleInputChange, handleShiftChange, handleDeleteShift }) {
  return (
    <Paper elevation={2} sx={{ p: 2.5, height: '100%', borderRadius: '12px', border: '1px solid',
      borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Work Schedule</Typography>
      <Box sx={{ mt: 0.5 }}>
        <Tooltip title="Enter the number of vacation weeks you take per year" enterTouchDelay={50} leaveTouchDelay={1500}>
          <Box sx={{ mb: 2 }}>
            <CustomNumberInput
              label="Vacation Weeks per Year"
              name="vacationWeeks"
              value={inputs.vacationWeeks}
              onChange={(value) => handleInputChange('vacationWeeks', value)}
              icon={<Celebration />}
              min={0}
              max={52}
              step={1}
            />
          </Box>
        </Tooltip>
        <Tooltip title="Enter the number of statutory holidays per year" enterTouchDelay={50} leaveTouchDelay={1500}>
          <Box sx={{ mb: 2 }}>
            <CustomNumberInput
              label="Statutory Holidays per Year"
              name="statutoryHolidays"
              value={inputs.statutoryHolidays}
              onChange={(value) => handleInputChange('statutoryHolidays', value)}
              icon={<EventIcon />}
              min={0}
              max={365}
              step={1}
            />
          </Box>
        </Tooltip>
        <Tooltip title="Enter the number of CME (Continuing Medical Education) days per year" enterTouchDelay={50} leaveTouchDelay={1500}>
          <Box sx={{ mb: 2 }}>
            <CustomNumberInput
              label="CME Days per Year"
              name="cmeDays"
              value={inputs.cmeDays}
              onChange={(value) => handleInputChange('cmeDays', value)}
              icon={<School />}
              min={0}
              max={365}
              step={1}
            />
          </Box>
        </Tooltip>
      </Box>
      <Typography variant="body1" sx={{ mt: 3, mb: 1.5, fontWeight: 'bold', display: 'block' }}>Shift Types</Typography>
      {inputs.shifts.map((shift, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            size="small"
            sx={{ mr: 1, flexGrow: 1 }}
            label="Shift Name"
            value={shift.name}
            onChange={(e) => handleShiftChange(index, 'name', e.target.value)}
          />
          <TextField
            size="small"
            sx={{ mr: 1, width: '80px' }}
            type="number"
            label="Hours"
            value={shift.hours}
            onChange={(e) => handleShiftChange(index, 'hours', e.target.value)}
          />
          <TextField
            size="small"
            sx={{ mr: 1, width: '100px', '& .MuiInputBase-input': { px: 1 } }}
            type="number"
            label="Per Week"
            value={shift.perWeek}
            onChange={(e) => handleShiftChange(index, 'perWeek', e.target.value)}
          />
          <IconButton onClick={() => handleDeleteShift(index)}>
            <Delete />
          </IconButton>
        </Box>
      ))}
      <Button size="small" startIcon={<Add />} onClick={() => handleShiftChange(null, 'add')} sx={{ borderRadius: '8px', mt: 2 }}>
        Add Shift Type
      </Button>
    </Paper>
  );
}

function DifferenceIndicator({ difference, tooltipText }) {
  if (!difference || !difference.startsWith('+')) return null;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={tooltipText || "Potential increase using adjusted wRVU per encounter"} arrow placement="top">
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
            alignItems: 'center',
            cursor: 'help'
          }}
        >
          {difference}
          <InfoOutlined 
            fontSize="small" 
            sx={{ fontSize: '0.875rem', ml: 0.5, color: 'success.main' }} 
          />
        </Typography>
      </Tooltip>
    </Box>
  );
}

function StatItem({ icon, label, value, difference, tooltipText }) {
  return (
    <Paper sx={{ 
      p: 2,
      height: '100%',
      borderRadius: '12px',
      border: '1px solid',
      borderColor: 'divider',
      backgroundColor: 'background.paper',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        transform: 'translateY(-2px)'
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Box sx={{ color: 'primary.main', mr: 1.5 }}>{icon}</Box>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{value}</Typography>
        <DifferenceIndicator difference={difference} tooltipText={tooltipText} />
      </Box>
    </Paper>
  );
}

function ProductivitySummary({ metrics, adjustedMetrics, inputs }) {
  // Calculate adjusted metrics
  const adjustedAnnualWRVUs = metrics.annualPatientEncounters * inputs.adjustedWRVUPerEncounter;
  const adjustedWRVUCompensation = adjustedAnnualWRVUs * inputs.wrvuConversionFactor;
  const adjustedTotalCompensation = Math.max(inputs.baseSalary, adjustedWRVUCompensation);
  
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
      value: formatCurrency(metrics.estimatedTotalCompensation),
      tooltipText: "Total annual compensation including base salary and wRVU-based incentive payments"
    },
    {
      icon: <AttachMoney fontSize="large" />,
      label: "Estimated Incentive Payment",
      value: formatCurrency(currentIncentive),
      difference: formatDifference(currentIncentive, adjustedIncentive),
      tooltipText: "Additional compensation earned above base salary based on wRVU production"
    },
    {
      icon: <CalendarToday fontSize="large" />,
      label: "Weeks Worked Per Year",
      value: formatNumber(metrics.weeksWorkedPerYear),
      tooltipText: "Total working weeks per year after subtracting vacation, CME, and holidays"
    },
    {
      icon: <People fontSize="large" />,
      label: "Encounters per Week",
      value: formatNumber(metrics.encountersPerWeek),
      tooltipText: "Average number of patient encounters per week based on your schedule"
    },
    {
      icon: <CalendarToday fontSize="large" />,
      label: "Annual Clinic Days",
      value: formatNumber(metrics.annualClinicDays),
      tooltipText: "Total clinic days per year after subtracting vacation, CME, and holidays"
    },
    {
      icon: <AccessTime fontSize="large" />,
      label: "Annual Clinical Hours",
      value: formatNumber(metrics.annualClinicalHours),
      tooltipText: "Total clinical hours per year based on your schedule"
    },
    {
      icon: <People fontSize="large" />,
      label: "Annual Patient Encounters",
      value: formatNumber(metrics.annualPatientEncounters),
      tooltipText: "Total patient encounters per year based on your schedule and daily/hourly patient load"
    },
    {
      icon: <TrendingUp fontSize="large" />,
      label: "Estimated Annual wRVUs",
      value: formatNumber(metrics.estimatedAnnualWRVUs),
      difference: formatWRVUDifference(metrics.estimatedAnnualWRVUs, adjustedAnnualWRVUs),
      tooltipText: "Total annual wRVUs based on patient encounters and average wRVU per encounter"
    }
  ];

  return (
    <Paper elevation={2} sx={{ p: 2.5, mt: 3, borderRadius: '12px', border: '1px solid',
      borderColor: 'divider' }}>
      <Typography variant="subtitle1" component="h2" sx={{ color: 'primary.main', mb: 2, fontWeight: 'bold' }}>
        Productivity Summary
      </Typography>

      <Grid container spacing={2}>
        {summaryItems.map((item, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Tooltip 
              title={item.tooltipText} 
              placement="top"
              enterTouchDelay={50}
              leaveTouchDelay={1500}
              arrow
            >
              <div style={{ height: '100%' }}>
                <StatItem {...item} />
              </div>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Paper>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ 
          width: '32%', 
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
          width: '32%', 
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
          width: '32%', 
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left column - Work Schedule & Shift Types & Patient Encounters */}
        <Box sx={{ width: '49%' }}>
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
            
            {/* Shift Types section */}
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
                Shift Types
              </Typography>
              
              {inputs.shifts.map((shift, i) => (
                <Box key={i} sx={rowStyles}>
                  <Typography sx={labelStyles}>
                    {i === 0 ? (
                      <>
                        <AccessTime sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
                        Regular Clinic:
                      </>
                    ) : (
                      <>
                        <AccessTime sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
                        Extended Hours:
                      </>
                    )}
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
        <Box sx={{ width: '49%' }}>
          <Box sx={{ ...boxStyles, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography sx={headerStyles}>
              <TrendingUp sx={{ fontSize: '14px', mr: 0.5, color: 'primary.main' }} />
              Productivity Metrics
            </Typography>
            
            {/* Combined metrics and projection section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ width: '48%', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'text.secondary', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarToday sx={{ fontSize: '11px', mr: 0.5 }} />
                    Annual Clinic Days
                  </Typography>
                  <Typography sx={metricValueStyles}>
                    {formatNumber(metrics.annualClinicDays)}
                  </Typography>
                </Box>
                
                <Box sx={{ width: '48%', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'text.secondary', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AccessTime sx={{ fontSize: '11px', mr: 0.5 }} />
                    Annual Clinical Hours
                  </Typography>
                  <Typography sx={metricValueStyles}>
                    {formatNumber(metrics.annualClinicalHours)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ width: '48%', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: 'text.secondary', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <People sx={{ fontSize: '11px', mr: 0.5 }} />
                    Encounters per Week
                  </Typography>
                  <Typography sx={metricValueStyles}>
                    {formatNumber(metrics.encountersPerWeek)}
                  </Typography>
                </Box>
                
                <Box sx={{ width: '48%', textAlign: 'center' }}>
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
      return JSON.parse(savedState);
    }
    
    return {
      weeksPerYear: 48,
      vacationWeeks: 4,
      cmeDays: 5,
      statutoryHolidays: 10,
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

  const [detailedForecast, setDetailedForecast] = useState([]);
  const [totalEstimatedWRVUs, setTotalEstimatedWRVUs] = useState(0);
  const [totalVisitsLocal, setTotalVisitsLocal] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [adjustedMetrics, setAdjustedMetrics] = useState({});
  const [isUploadInstructionsOpen, setIsUploadInstructionsOpen] = useState(false);

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

  useEffect(() => {
    // Calculate weeks worked per year
    const totalWeeksOff = inputs.vacationWeeks + ((inputs.cmeDays + inputs.statutoryHolidays) / 7);
    const weeksWorkedPerYear = 52 - totalWeeksOff;

    // Calculate annual clinic days and hours
    const totalDaysPerWeek = inputs.shifts.reduce((total, shift) => total + shift.perWeek, 0);
    const totalHoursPerWeek = inputs.shifts.reduce((total, shift) => total + (shift.hours * shift.perWeek), 0);

    const annualClinicDays = (totalDaysPerWeek * weeksWorkedPerYear) - inputs.statutoryHolidays - inputs.cmeDays;
    const annualClinicalHours = totalHoursPerWeek * weeksWorkedPerYear;

    // Calculate encounters
    const encountersPerWeek = inputs.isPerHour 
      ? totalHoursPerWeek * inputs.patientsPerHour
      : totalDaysPerWeek * inputs.patientsPerDay;

    const annualPatientEncounters = inputs.isPerHour
      ? annualClinicalHours * inputs.patientsPerHour
      : annualClinicDays * inputs.patientsPerDay;

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

  const handleUpdateForecast = (newForecast) => {
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
      <Container maxWidth="lg" sx={{ mt: 4, '@media print': { mt: 0 } }}>
        <Box sx={{ '@media print': { display: 'none' } }}>
          {/* Normal view content */}
          <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', border: '1px solid',
      borderColor: 'divider', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}> 
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
                    maxWidth: '90vw', // Limit width on mobile
                    width: 'max-content',
                    maxWidth: 350,
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

              {/* Secondary actions: Save / Print (Gmail-style — less prominent than primary CTA) */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<Save />} 
                  onClick={() => setShowSaveDialog(true)}
                  sx={{ borderRadius: '20px', fontSize: '0.8rem' }}
                >
                  Save Scenario
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<PrintIcon />} 
                  onClick={handlePrint}
                  sx={{ borderRadius: '20px', fontSize: '0.8rem' }}
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

            {/* Step nav: 1 Inputs | 2 Results - mobile-friendly */}
            <Box sx={{ display: 'flex', gap: 0, mb: 2, pt: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              <Button
                onClick={() => setActiveStep(0)}
                variant={activeStep === 0 ? 'contained' : 'text'}
                size="medium"
                sx={{
                  flex: 1,
                  py: 1.25,
                  px: 2,
                  textTransform: 'none',
                  fontWeight: activeStep === 0 ? 600 : 400,
                  borderRadius: 0,
                  '&:hover': { backgroundColor: activeStep === 0 ? 'primary.dark' : 'action.hover' },
                }}
              >
                1. Inputs
              </Button>
              <Button
                onClick={() => setActiveStep(1)}
                variant={activeStep === 1 ? 'contained' : 'text'}
                size="medium"
                sx={{
                  flex: 1,
                  py: 1.25,
                  px: 2,
                  textTransform: 'none',
                  fontWeight: activeStep === 1 ? 600 : 400,
                  borderRadius: 0,
                  '&:hover': { backgroundColor: activeStep === 1 ? 'primary.dark' : 'action.hover' },
                }}
              >
                2. Results
              </Button>
            </Box>

            {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <WorkSchedule 
                  inputs={inputs} 
                  handleInputChange={handleInputChange} 
                  handleShiftChange={handleShiftChange} 
                  handleDeleteShift={handleDeleteShift}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2.5, height: '100%', borderRadius: '12px', border: '1px solid',
      borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 0, fontWeight: 'bold', color: 'primary.main' }}>Patient Encounters</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        {inputs.isPerHour ? "Patients Per Hour" : "Patients Per Day"}
                      </Typography>
                      <FormControlLabel
                        control={<Switch checked={inputs.isPerHour} onChange={(e) => handleSwitchChange(e.target.checked)} />}
                        label=""
                        sx={{ mb: 0, mr: 0 }}
                      />
                    </Box>
                  </Box>
<Box sx={{ mt: 0 }}>
                    <Tooltip
                      title={inputs.isPerHour ? "Enter the average number of patients seen per hour" : "Enter the average number of patients seen per day"}
                      enterTouchDelay={50}
                      leaveTouchDelay={1500}
                      arrow
                    >
                      <div>
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          size="small"
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
                      </div>
                    </Tooltip>
                  </Box>
                  <Tooltip 
                    title="Enter your current average wRVU per patient encounter"
                    enterTouchDelay={50}
                    leaveTouchDelay={1500}
                    arrow
                  >
                    <div>
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
                        size="small"
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
                    </div>
                  </Tooltip>
                  <Tooltip 
                    title="Enter an adjusted wRVU per encounter to see how changes in billing efficiency affect your compensation"
                    enterTouchDelay={50}
                    leaveTouchDelay={1500}
                    arrow
                  >
                    <div>
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
                        size="small"
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
                    </div>
                  </Tooltip>
                  <Tooltip 
                    title="Enter your base salary (minimum guaranteed compensation)"
                    enterTouchDelay={50}
                    leaveTouchDelay={1500}
                    arrow
                  >
                    <div>
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
                        size="small"
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
                    </div>
                  </Tooltip>
                  <Tooltip 
                    title="Enter the dollar amount paid per wRVU"
                    enterTouchDelay={50}
                    leaveTouchDelay={1500}
                    arrow
                  >
                    <div>
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
                        size="small"
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
                    </div>
                  </Tooltip>
                  <Tooltip 
                    title="Number of wRVUs needed to exceed base salary compensation"
                    enterTouchDelay={50}
                    leaveTouchDelay={1500}
                    arrow
                  >
                    <div>
                      <TextField
                        fullWidth
                        size="small"
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
                    </div>
                  </Tooltip>
                </Paper>
              </Grid>
            </Grid>
            )}
            {activeStep === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<TrendingUp />}
                  onClick={() => setActiveStep(1)} 
                  sx={{ minWidth: 200, py: 1.25, px: 3, fontWeight: 600, boxShadow: 2 }}
                >
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