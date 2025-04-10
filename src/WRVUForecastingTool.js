import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Container, TextField, InputAdornment, 
  IconButton, FormControlLabel, Switch, Button, Tooltip, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { 
  CalendarToday, AccessTime, People, TrendingUp, 
  AttachMoney, School, Celebration, Add, Remove, Delete, 
  Event, InfoOutlined, Print as PrintIcon, Save
} from '@mui/icons-material';
import { NumericFormat } from 'react-number-format';
import { Popover } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Add this constant at the top of the file
const STORAGE_KEY = 'wrvuForecastingState';

// Create a print-specific theme with reduced spacing and smaller font sizes
const printTheme = createTheme({
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          '@media print': {
            boxShadow: 'none',
            border: '1px solid #ddd',
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
    <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: '16px', border: '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 0, fontWeight: 'bold', color: '#1976d2' }}>
          Work Schedule
        </Typography>
        <Tooltip 
          title="Configure your annual schedule including vacation time, CME days, and holidays. Add different shift types to accurately reflect your work patterns."
          placement="top"
          arrow
        >
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoOutlined sx={{ fontSize: '1.1rem', color: 'rgba(25, 118, 210, 0.7)' }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Tooltip title="Enter the number of vacation weeks you take per year" placement="right" arrow>
          <div>
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
          </div>
        </Tooltip>
      </Box>

      <Tooltip title="Enter the number of statutory holidays per year" placement="right" arrow>
        <div>
          <CustomNumberInput
            label="Statutory Holidays per Year"
            name="statutoryHolidays"
            value={inputs.statutoryHolidays}
            onChange={(value) => handleInputChange('statutoryHolidays', value)}
            icon={<Event />}
            min={0}
            max={365}
            step={1}
          />
        </div>
      </Tooltip>

      <Tooltip title="Enter the number of CME (Continuing Medical Education) days per year" placement="right" arrow>
        <div>
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
        </div>
      </Tooltip>

      <Box sx={{ mt: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Shift Types
          </Typography>
          <Tooltip 
            title="Add different types of shifts with their duration and frequency per week"
            placement="top"
            arrow
          >
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoOutlined sx={{ fontSize: '1rem', color: 'rgba(25, 118, 210, 0.7)' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {inputs.shifts.map((shift, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            sx={{ mr: 1, flexGrow: 1 }}
            label="Shift Name"
            value={shift.name}
            onChange={(e) => handleShiftChange(index, 'name', e.target.value)}
          />
          <Tooltip title="Duration of the shift in hours" placement="top" arrow>
            <TextField
              sx={{ mr: 1, width: '80px' }}
              type="number"
              label="Hours"
              value={shift.hours}
              onChange={(e) => handleShiftChange(index, 'hours', e.target.value)}
            />
          </Tooltip>
          <Tooltip title="Number of times this shift occurs per week" placement="top" arrow>
            <TextField
              sx={{ mr: 1, width: '100px', '& .MuiInputBase-input': { px: 1 } }}
              type="number"
              label="Per Week"
              value={shift.perWeek}
              onChange={(e) => handleShiftChange(index, 'perWeek', e.target.value)}
            />
          </Tooltip>
          <IconButton onClick={() => handleDeleteShift(index)}>
            <Delete />
          </IconButton>
        </Box>
      ))}
      <Button startIcon={<Add />} onClick={() => handleShiftChange(null, 'add')} sx={{ borderRadius: '12px' }}>
        Add Shift Type
      </Button>
    </Paper>
  );
}

function StatItem({ icon, label, value, difference, tooltipText }) {
  const descriptions = {
    "Estimated Total Compensation": "Total annual compensation including base salary and incentive payments based on wRVU production",
    "Estimated Incentive Payment": "Additional compensation earned above base salary based on wRVU production",
    "Weeks Worked Per Year": "Total working weeks per year after subtracting vacation, CME, and holidays",
    "Encounters per Week": "Average number of patient encounters scheduled per week",
    "Annual Clinic Days": "Total number of clinic days worked per year excluding holidays and time off",
    "Annual Clinical Hours": "Total clinical hours worked per year based on your schedule",
    "Annual Patient Encounters": "Total number of patient encounters projected for the year",
    "Estimated Annual wRVUs": "Projected annual work Relative Value Units (wRVUs) based on your patient encounters and average wRVU per encounter"
  };

  return (
    <Paper 
      sx={{ 
        p: 3,
        height: '100%',
        borderRadius: '16px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
        transition: 'all 0.3s ease',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          transform: 'translateY(-4px)',
          borderColor: '#1976d2'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Header with icon and label */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 1
        }}>
          <Box sx={{ 
            color: '#1976d2', 
            mr: 2,
            display: 'flex',
            alignItems: 'center'
          }}>
            {icon}
          </Box>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {label}
          </Typography>
          <Tooltip 
            title={descriptions[label]}
            placement="top"
            arrow
            enterDelay={200}
            leaveDelay={100}
          >
            <IconButton size="small" sx={{ ml: 'auto' }}>
              <InfoOutlined sx={{ 
                fontSize: '1.1rem', 
                color: 'rgba(25, 118, 210, 0.7)',
                '&:hover': {
                  color: '#1976d2'
                }
              }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Value and difference */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 'auto'
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#333',
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            {value}
          </Typography>
          
          {difference && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderRadius: '12px',
              px: 1.5,
              py: 0.5
            }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'success.main',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {difference}
              </Typography>
              {tooltipText && (
                <Tooltip 
                  title={tooltipText} 
                  placement="top" 
                  arrow
                  enterDelay={200}
                  leaveDelay={100}
                >
                  <InfoOutlined sx={{ 
                    ml: 1, 
                    fontSize: '1rem', 
                    color: 'success.main',
                    opacity: 0.7,
                    cursor: 'help',
                    '&:hover': {
                      opacity: 1
                    }
                  }} />
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
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
      value: formatCurrency(metrics.estimatedTotalCompensation)
    },
    {
      icon: <AttachMoney fontSize="large" />,
      label: "Estimated Incentive Payment",
      value: formatCurrency(currentIncentive),
      difference: formatDifference(currentIncentive, adjustedIncentive),
      tooltipText: "Potential increase in incentive payment with adjusted wRVU per encounter"
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
      difference: formatWRVUDifference(metrics.estimatedAnnualWRVUs, adjustedAnnualWRVUs),
      tooltipText: "Potential increase in annual wRVUs with adjusted wRVU per encounter"
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 5, borderRadius: '16px', border: '1px solid #e0e0e0' }}>
      <Typography variant="h6" component="h2" sx={{ color: '#1976d2', mb: 3 }}>
        Productivity Summary
      </Typography>

      <Grid container spacing={3}>
        {summaryItems.map((item, index) => (
          <Grid item xs={12} md={6} key={index}>
            <StatItem {...item} />
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
    border: '1px solid #ddd', 
    borderRadius: '4px',
    backgroundColor: 'white'
  };

  const headerStyles = {
    fontSize: '13px', 
    fontWeight: 'bold', 
    color: '#666', 
    mb: 1,
    borderBottom: '1px solid #eee',
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
    color: '#666'
  };

  const valueStyles = {
    fontSize: '11px', 
    color: '#333'
  };

  const metricValueStyles = {
    fontSize: '16px', 
    fontWeight: 'bold', 
    color: '#333',
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  };

  const projectionValueStyles = {
    fontSize: '11px', 
    color: '#333',
    width: '120px',
    textAlign: 'right'
  };

  return (
    <Box 
      data-print-section="true"
      sx={{ 
        display: 'none', 
        '@media print': { 
          display: 'block',
          width: '100%',
          padding: '10px',
          fontFamily: 'Arial, sans-serif',
          background: 'white !important',
          color: '#333',
          pageBreakAfter: 'avoid',
          pageBreakInside: 'avoid'
        } 
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: '#333', fontSize: '16px' }}>
          <TrendingUp sx={{ fontSize: '18px', verticalAlign: 'text-bottom', color: '#1976d2', mr: 0.5 }} />
          Provider Analytics Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 0.5, color: '#1976d2', fontSize: '13px' }}>
          Quick Calculator wRVU Adjustments
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontSize: '11px' }}>
          <CalendarToday sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
          Generated on {new Date().toLocaleDateString()}
        </Typography>
      </Box>

      {/* Top row - Summary metrics */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ 
          width: '32%', 
          p: 1.5, 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          backgroundColor: 'white'
        }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 'normal', color: '#666', mb: 0.5 }}>
            <AttachMoney sx={{ fontSize: '14px', verticalAlign: 'text-bottom', color: '#1976d2' }} />
            Total Compensation
          </Typography>
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
            {formatCurrency(metrics.estimatedTotalCompensation)}
          </Typography>
        </Box>
        
        <Box sx={{ 
          width: '32%', 
          p: 1.5, 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          backgroundColor: 'white'
        }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 'normal', color: '#666', mb: 0.5 }}>
            <AttachMoney sx={{ fontSize: '14px', verticalAlign: 'text-bottom', color: '#1976d2' }} />
            Incentive Payment
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              {formatCurrency(currentIncentive)}
            </Typography>
            {adjustedIncentive > currentIncentive && (
              <Typography sx={{ ml: 1, fontSize: '11px', fontWeight: 'bold', color: '#4caf50' }}>
                +{formatCurrency(adjustedIncentive - currentIncentive).replace('$', '')}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ 
          width: '32%', 
          p: 1.5, 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          backgroundColor: 'white'
        }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 'normal', color: '#666', mb: 0.5 }}>
            <TrendingUp sx={{ fontSize: '14px', verticalAlign: 'text-bottom', color: '#1976d2' }} />
            Estimated Annual wRVUs
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              {formatNumber(metrics.estimatedAnnualWRVUs)}
            </Typography>
            {adjustedAnnualWRVUs > metrics.estimatedAnnualWRVUs && (
              <Typography sx={{ ml: 1, fontSize: '11px', fontWeight: 'bold', color: '#4caf50' }}>
                +{formatNumber(adjustedAnnualWRVUs - metrics.estimatedAnnualWRVUs)}
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
              <People sx={{ fontSize: '14px', mr: 0.5, color: '#1976d2' }} />
              Provider Input Data
            </Typography>
            
            {/* Work Schedule section */}
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: '#666', 
                mb: 0.5,
                display: 'flex',
                alignItems: 'center'
              }}>
                <CalendarToday sx={{ fontSize: '12px', mr: 0.5, color: '#1976d2' }} />
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
                  <Event sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5 }} />
                  Holidays:
                </Typography>
                <Typography sx={valueStyles}>
                  {inputs.statutoryHolidays} days
                </Typography>
              </Box>
            </Box>
            
            {/* Shift Types section */}
            <Box sx={{ mb: 1.5, borderTop: '1px dashed #ddd', pt: 1.5 }}>
              <Typography sx={{ 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: '#666', 
                mb: 0.5,
                display: 'flex',
                alignItems: 'center'
              }}>
                <AccessTime sx={{ fontSize: '12px', mr: 0.5, color: '#1976d2' }} />
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
            <Box sx={{ borderTop: '1px dashed #ddd', pt: 1.5 }}>
              <Typography sx={{ 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: '#666', 
                mb: 0.5,
                display: 'flex',
                alignItems: 'center'
              }}>
                <People sx={{ fontSize: '12px', mr: 0.5, color: '#1976d2' }} />
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
              <TrendingUp sx={{ fontSize: '14px', mr: 0.5, color: '#1976d2' }} />
              Productivity Metrics
            </Typography>
            
            {/* Combined metrics and projection section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ width: '48%', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: '#666', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarToday sx={{ fontSize: '11px', mr: 0.5 }} />
                    Annual Clinic Days
                  </Typography>
                  <Typography sx={metricValueStyles}>
                    {formatNumber(metrics.annualClinicDays)}
                  </Typography>
                </Box>
                
                <Box sx={{ width: '48%', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: '#666', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: '#666', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <People sx={{ fontSize: '11px', mr: 0.5 }} />
                    Encounters per Week
                  </Typography>
                  <Typography sx={metricValueStyles}>
                    {formatNumber(metrics.encountersPerWeek)}
                  </Typography>
                </Box>
                
                <Box sx={{ width: '48%', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: '#666', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <People sx={{ fontSize: '11px', mr: 0.5 }} />
                    Annual Patient Encounters
                  </Typography>
                  <Typography sx={metricValueStyles}>
                    {formatNumber(metrics.annualPatientEncounters)}
                  </Typography>
                </Box>
              </Box>
              
              {/* Projected Increase section - integrated with metrics */}
              <Box sx={{ borderTop: '1px dashed #ddd', pt: 1.5 }}>
                <Typography sx={{ 
                  fontSize: '13px', 
                  fontWeight: 'bold', 
                  color: '#666', 
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <TrendingUp sx={{ fontSize: '14px', mr: 0.5, color: '#4caf50' }} />
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
                    <TrendingUp sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5, color: '#4caf50' }} />
                    Adjusted wRVU per Encounter:
                  </Typography>
                  <Typography sx={projectionValueStyles}>
                    {inputs.adjustedWRVUPerEncounter.toFixed(2)} = {formatNumber(adjustedAnnualWRVUs)} wRVUs
                  </Typography>
                </Box>
                
                <Box sx={rowStyles}>
                  <Typography sx={labelStyles}>
                    <AttachMoney sx={{ fontSize: '11px', verticalAlign: 'text-bottom', mr: 0.5, color: '#4caf50' }} />
                    Potential Additional Incentive:
                  </Typography>
                  <Typography sx={{ ...projectionValueStyles, fontWeight: 'bold', color: '#4caf50' }}>
                    +{formatCurrency(adjustedIncentive - currentIncentive)}
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
        <Typography sx={{ fontSize: '10px', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}> 
            {/* Mobile-friendly header layout */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              mb: 4
            }}>
              {/* Title and subtitle section */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 1
                }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Compensation Forecast
                  </Typography>
                  <IconButton onClick={handleInfoClick} size="small" sx={{ ml: 1 }}>
                    <InfoOutlined />
                  </IconButton>
                </Box>

                <Typography 
                  variant="subtitle1" 
                  align="center" 
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Schedule and Average wRVU Per Encounter Input
                </Typography>

                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  mt: 1
                }}>
                  <Button
                    variant="outlined"
                    startIcon={<Save />}
                    onClick={() => setShowSaveDialog(true)}
                    sx={{ 
                      borderRadius: '20px',
                      px: 3
                    }}
                  >
                    SAVE SCENARIO
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    sx={{ 
                      borderRadius: '20px',
                      px: 3
                    }}
                  >
                    PRINT SUMMARY
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
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    borderRadius: '24px',
                    px: { xs: 1.5, sm: 2 },
                    py: 0.5,
                    border: '1px solid rgba(25, 118, 210, 0.2)',
                    width: { xs: '100%', sm: 'auto' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#1976d2',
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
                          color: '#1976d2',
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
              >
                <Typography sx={{ p: 2, maxWidth: 350 }}>
                  This screen allows you to input your work schedule details and wRVU per encounter. 
                  It calculates your estimated annual wRVUs, encounters, and potential compensation based on 
                  your inputs. The "Adjusted wRVU Per Encounter" field lets you see how changes in your 
                  billing efficiency might affect your productivity and compensation. 
                  Adjustments are reflected in the Estimated Total Compensation and Estimated Annual wRVUs 
                  in the Productivity Summary section. Experiment with different values to forecast various scenarios.
                </Typography>
              </Popover>
            </Box>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <WorkSchedule 
                  inputs={inputs} 
                  handleInputChange={handleInputChange} 
                  handleShiftChange={handleShiftChange} 
                  handleDeleteShift={handleDeleteShift}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: '16px', border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ mb: 0, fontWeight: 'bold', color: '#1976d2' }}>
                        Patient Encounters
                      </Typography>
                      <Tooltip 
                        title="Configure your patient encounter settings, including the number of patients seen and wRVU values per encounter. Toggle between per-hour and per-day calculations."
                        placement="top"
                        arrow
                      >
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlined sx={{ fontSize: '1.1rem', color: 'rgba(25, 118, 210, 0.7)' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        {inputs.isPerHour ? "Patients Per Hour" : "Patients Per Day"}
                      </Typography>
                      <Tooltip title="Toggle between per-hour and per-day patient calculations" placement="top" arrow>
                        <FormControlLabel
                          control={<Switch checked={inputs.isPerHour} onChange={(e) => handleSwitchChange(e.target.checked)} />}
                          label=""
                          sx={{ mb: 0, mr: 0 }}
                        />
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: '24px' }}>
                    <Tooltip title={inputs.isPerHour ? "Average number of patients seen per hour" : "Average number of patients seen per day"} placement="right" arrow>
                      <div>
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
                          }}
                        />
                      </div>
                    </Tooltip>
                  </Box>

                  <Tooltip title="Current average work RVU value per patient encounter" placement="right" arrow>
                    <div>
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
                        }}
                      />
                    </div>
                  </Tooltip>

                  <Tooltip title="Adjusted work RVU value per encounter to calculate potential changes in productivity" placement="right" arrow>
                    <div>
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
                        }}
                      />
                    </div>
                  </Tooltip>

                  <Tooltip title="Your guaranteed base salary before wRVU-based compensation" placement="right" arrow>
                    <div>
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
                    </div>
                  </Tooltip>

                  <Tooltip title="Dollar amount paid per work RVU generated" placement="right" arrow>
                    <div>
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
                        }}
                      />
                    </div>
                  </Tooltip>

                  <Tooltip title="Number of wRVUs needed to exceed base salary compensation" placement="right" arrow>
                    <div>
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
                    </div>
                  </Tooltip>
                </Paper>
              </Grid>
            </Grid>

            <ProductivitySummary metrics={metrics} adjustedMetrics={adjustedMetrics} inputs={inputs} />
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