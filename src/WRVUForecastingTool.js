import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Container, TextField, InputAdornment, Switch, FormControlLabel, Slider, Divider, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter, Tooltip
} from '@mui/material';
import { CalendarToday, AccessTime, People, TrendingUp, AttachMoney, School, Celebration, Assignment, Add, Remove, Delete, Event, InfoOutlined } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NumericFormat } from 'react-number-format';
import { Popover } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, ChartDataLabels);

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
      <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>Work Schedule</Typography>
      <Box sx={{ mt: 2 }}>
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
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>Shift Types</Typography>
      {inputs.shifts.map((shift, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            sx={{ mr: 1, flexGrow: 1 }}
            label="Shift Name"
            value={shift.name}
            onChange={(e) => handleShiftChange(index, 'name', e.target.value)}
          />
          <TextField
            sx={{ mr: 1, width: '80px' }}
            type="number"
            label="Hours"
            value={shift.hours}
            onChange={(e) => handleShiftChange(index, 'hours', e.target.value)}
          />
          <TextField
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
      <Button startIcon={<Add />} onClick={() => handleShiftChange(null, 'add')} sx={{ borderRadius: '12px' }}>
        Add Shift Type
      </Button>
    </Paper>
  );
}

function ProductivitySummary({ metrics, adjustedMetrics }) {
  const formatNumber = (value) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

  const formatCurrency = (value) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const formatDifference = (current, adjusted, formatter) => {
    const diff = adjusted - current;
    if (diff === 0) return null;
    const formattedDiff = formatter(Math.abs(diff));
    return diff > 0 ? `+${formattedDiff}` : `-${formattedDiff}`;
  };

  const StatItem = ({ icon, label, value, difference }) => (
    <Box sx={{ 
      border: '1px solid #e0e0e0', 
      borderRadius: '16px',
      p: 3, 
      mb: 3,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      transition: 'box-shadow 0.3s',
      '&:hover': {
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      }
    }}>
      <Box sx={{ mr: 3, color: '#1976d2' }}>{icon}</Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>{label}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>{value}</Typography>
          {difference && difference !== '+$0' && difference !== '+0' && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: difference.startsWith('+') ? 'success.main' : 'error.main'
                }}
              >
                {difference}
              </Typography>
              <Tooltip title="Potential increase from improved wRVU capture (using adjusted wRVU)">
                <InfoOutlined sx={{ ml: 1, fontSize: '1rem', color: 'text.secondary', cursor: 'help' }} />
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 5, borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#1976d2' }}>
        Productivity Summary
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          {metrics.incentivePayment > 0 && (
            <StatItem 
              icon={<AttachMoney fontSize="large" />}
              label="Estimated Incentive Payment"
              value={formatCurrency(metrics.incentivePayment)}
            />
          )}
          <StatItem 
            icon={<CalendarToday fontSize="large" />}
            label="Weeks Worked Per Year"
            value={formatNumber(metrics.weeksWorkedPerYear)}
          />
          <StatItem 
            icon={<CalendarToday fontSize="large" />}
            label="Annual Clinic Days"
            value={formatNumber(metrics.clinicDaysPerYear)}
          />
          <StatItem 
            icon={<AccessTime fontSize="large" />}
            label="Annual Clinical Hours"
            value={formatNumber(metrics.annualHours)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatItem 
            icon={<AttachMoney fontSize="large" />}
            label="Estimated Total Compensation"
            value={formatCurrency(metrics.totalCompensation)}
            difference={formatDifference(metrics.totalCompensation, adjustedMetrics.totalCompensation, formatCurrency)}
          />
          <StatItem 
            icon={<People fontSize="large" />}
            label="Encounters per Week"
            value={formatNumber(metrics.encountersPerWeek)}
          />
          <StatItem 
            icon={<People fontSize="large" />}
            label="Annual Patient Encounters"
            value={formatNumber(metrics.annualEncounters)}
          />
          <StatItem 
            icon={<TrendingUp fontSize="large" />}
            label="Estimated Annual wRVUs"
            value={formatNumber(metrics.annualWRVUs)}
            difference={formatDifference(metrics.annualWRVUs, adjustedMetrics.annualWRVUs, formatNumber)}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

function WRVUForecastingTool({ setTotalVisits }) {
  const [inputs, setInputs] = useState({
    weeksPerYear: 48, // Make sure this is set
    vacationWeeks: 4,
    cmeDays: 5,
    statutoryHolidays: 0,
    shifts: [
      { name: 'Regular Clinic', hours: 8, perWeek: 4 },
      { name: 'Extended Hours', hours: 10, perWeek: 1 },
    ],
    patientsPerHour: 2,
    patientsPerDay: 16,
    avgWRVUPerEncounter: 1.5,
    adjustedWRVUPerEncounter: 1.5, // Initialize with the same value as avgWRVUPerEncounter
    baseSalary: 150000,
    wrvuConversionFactor: 45.52,
  });

  const [metrics, setMetrics] = useState({
    clinicDaysPerYear: 0,
    annualHours: 0,
    annualEncounters: 0,
    annualWRVUs: 0,
    wRVUCompensation: 0,
    totalCompensation: 0
  });

  const [isPerHour, setIsPerHour] = useState(true);
  const [detailedForecast, setDetailedForecast] = useState([]);
  const [totalEstimatedWRVUs, setTotalEstimatedWRVUs] = useState(0);
  const [totalVisits, setTotalVisitsLocal] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [adjustedMetrics, setAdjustedMetrics] = useState({});
  const [isUploadInstructionsOpen, setIsUploadInstructionsOpen] = useState(false);

  const handleInputChange = (name, value) => {
    console.log(`Changing ${name} to`, value);
    setInputs(prevInputs => ({
      ...prevInputs,
      [name]: value
    }));
  };

  const handleShiftChange = (index, field, value) => {
    setInputs(prev => {
      const newShifts = [...prev.shifts];
      newShifts[index] = { ...newShifts[index], [field]: parseFloat(value) || 0 };
      return { ...prev, shifts: newShifts };
    });
  };

  const handleSwitchChange = () => {
    setIsPerHour(!isPerHour);
  };

  const formatCurrency = (value) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const formatCompactCurrency = (value) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      notation: 'compact', 
      compactDisplay: 'short', 
      maximumFractionDigits: 1 
    }).format(value);

  useEffect(() => {
    const totalHoursPerWeek = inputs.shifts.reduce((total, shift) => 
      total + (shift.hours * shift.perWeek), 0);
    
    const totalDaysPerWeek = inputs.shifts.reduce((total, shift) => 
      total + shift.perWeek, 0);

    const totalDaysOff = (inputs.vacationWeeks * 7) + inputs.cmeDays + inputs.statutoryHolidays;
    const weeksWorkedPerYear = 52 - (totalDaysOff / 7);
    const annualHours = totalHoursPerWeek * weeksWorkedPerYear;
    const annualDays = totalDaysPerWeek * weeksWorkedPerYear;
    
    const annualEncounters = isPerHour 
      ? annualHours * inputs.patientsPerHour
      : inputs.patientsPerDay * annualDays;
    
    const encountersPerWeek = annualEncounters / weeksWorkedPerYear;
    const annualWRVUs = annualEncounters * inputs.avgWRVUPerEncounter;
    
    // Calculate the total wRVU compensation
    const totalWRVUCompensation = annualWRVUs * inputs.wrvuConversionFactor;
    
    // Calculate the incentive payment (only the amount above base salary)
    const incentivePayment = Math.max(0, totalWRVUCompensation - inputs.baseSalary);
    
    // Total compensation is base salary plus incentive payment
    const totalCompensation = inputs.baseSalary + incentivePayment;

    const calculateMetrics = (wrvuPerEncounter) => {
      const annualWRVUs = annualEncounters * wrvuPerEncounter;
      const totalWRVUCompensation = annualWRVUs * inputs.wrvuConversionFactor;
      const incentivePayment = Math.max(0, totalWRVUCompensation - inputs.baseSalary);
      const totalCompensation = inputs.baseSalary + incentivePayment;

      return {
        weeksWorkedPerYear,
        clinicDaysPerYear: annualDays,
        annualHours,
        encountersPerWeek,
        annualEncounters,
        annualWRVUs,
        incentivePayment,
        totalCompensation
      };
    };

    const currentMetrics = calculateMetrics(inputs.avgWRVUPerEncounter);
    const adjustedMetrics = calculateMetrics(inputs.adjustedWRVUPerEncounter);

    setMetrics(currentMetrics);
    setAdjustedMetrics(adjustedMetrics);

    setTotalVisitsLocal(annualEncounters);
    setTotalVisits(annualEncounters);
  }, [inputs, isPerHour, setTotalVisits]);

  const handleUpdateForecast = (newForecast) => {
    setDetailedForecast(newForecast.detailedForecast);
    setTotalEstimatedWRVUs(newForecast.totalEstimatedWRVUs);
    
    setInputs(prev => ({
      ...prev,
      avgWRVUPerEncounter: newForecast.totalEstimatedWRVUs / totalVisits
    }));
  };

  const handleDeleteShift = (index) => {
    setInputs(prevInputs => ({
      ...prevInputs,
      shifts: prevInputs.shifts.filter((_, i) => i !== index)
    }));
  };

  const handleInfoClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleInfoClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}> {/* Increased border radius */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              mb: 1, 
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
          variant="h6" 
          align="center" 
          sx={{ 
            color: 'text.secondary', 
            mb: 4, 
            fontSize: '1.1rem', 
            fontWeight: 'normal' 
          }}
        >
          Schedule and Average wRVU Per Encounter Input
        </Typography>
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
                <Typography variant="h6" gutterBottom sx={{ mb: 0, fontWeight: 'bold', color: '#1976d2' }}>Patient Encounters</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    {isPerHour ? "Patients Per Hour" : "Patients Per Day"}
                  </Typography>
                  <FormControlLabel
                    control={<Switch checked={isPerHour} onChange={handleSwitchChange} />}
                    label=""
                    sx={{ mb: 0, mr: 0 }}
                  />
                </Box>
              </Box>
              <Box sx={{ mt: '24px' }}> {/* Add top margin to align with left container */}
                <NumericFormat
                  customInput={TextField}
                  fullWidth
                  margin="normal"
                  label={isPerHour ? "Patients Seen Per Hour" : "Patients Seen Per Day"}
                  value={isPerHour ? inputs.patientsPerHour : inputs.patientsPerDay}
                  onValueChange={(values) => {
                    const value = values.floatValue || 0;
                    handleInputChange(isPerHour ? 'patientsPerHour' : 'patientsPerDay', value);
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
                              const field = isPerHour ? 'patientsPerHour' : 'patientsPerDay';
                              const currentValue = isPerHour ? inputs.patientsPerHour : inputs.patientsPerDay;
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
                              const field = isPerHour ? 'patientsPerHour' : 'patientsPerDay';
                              const currentValue = isPerHour ? inputs.patientsPerHour : inputs.patientsPerDay;
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
              </Box>
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

        <ProductivitySummary metrics={metrics} adjustedMetrics={adjustedMetrics} />

        {/* You can add your DetailedProjections component here if needed */}
      </Paper>
    </Container>
  );
}

export default WRVUForecastingTool;