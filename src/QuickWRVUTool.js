import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Container, TextField, InputAdornment, 
  IconButton, FormControlLabel, Switch
} from '@mui/material';
import { CalendarToday, AccessTime, People, TrendingUp, AttachMoney, Add, Remove, Celebration, School } from '@mui/icons-material';
import { NumericFormat } from 'react-number-format';

function CustomNumberInput({ label, value, onChange, icon, min = 0, max = Infinity, step = 0.01, ...props }) {
  const handleIncrement = () => {
    const newValue = step === 1 ? Math.floor(value) + 1 : Number((value + step).toFixed(2));
    if (newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = step === 1 ? Math.floor(value) - 1 : Number((value - step).toFixed(2));
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value === '' ? min : Number(e.target.value);
    if (!isNaN(val)) {
      const newValue = step === 1 ? Math.floor(val) : Number(val.toFixed(2));
      onChange(Math.max(min, Math.min(newValue, max)));
    }
  };

  return (
    <TextField
      fullWidth
      margin="normal"
      label={label}
      value={value}
      onChange={handleChange}
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
            {props.InputProps?.endAdornment}
          </InputAdornment>
        ),
        ...props.InputProps,
      }}
      {...props}
    />
  );
}

function QuickWRVUTool() {
  const [baseSalary, setBaseSalary] = useState(150000);
  const [wrvuConversionFactor, setWrvuConversionFactor] = useState(45.52);
  const [isPerHour, setIsPerHour] = useState(true);
  const [patientsPerHour, setPatientsPerHour] = useState(2);
  const [patientsPerDay, setPatientsPerDay] = useState(16);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [weeksPerYear, setWeeksPerYear] = useState(5);
  const [statutoryHolidays, setStatutoryHolidays] = useState(10);
  const [cmeDays, setCmeDays] = useState(20);

  const handleInputChange = (name, value) => {
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: '16px', border: '1px solid #e0e0e0' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#1976d2' }}>
          Quick wRVU Analysis
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: '16px', border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
                Work Schedule
              </Typography>
              <FormControlLabel
                control={<Switch checked={isPerHour} onChange={() => setIsPerHour(!isPerHour)} />}
                label={isPerHour ? "Patients Per Hour" : "Patients Per Day"}
                sx={{ mb: 2 }}
              />
              <NumericFormat
                customInput={TextField}
                fullWidth
                margin="normal"
                label={isPerHour ? "Patients Seen Per Hour" : "Patients Seen Per Day"}
                value={isPerHour ? patientsPerHour : patientsPerDay}
                onValueChange={(values) => {
                  const value = values.floatValue || 0;
                  if (isPerHour) {
                    setPatientsPerHour(value);
                  } else {
                    setPatientsPerDay(value);
                  }
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
                            if (isPerHour) {
                              setPatientsPerHour(Math.max(0, patientsPerHour - 1));
                            } else {
                              setPatientsPerDay(Math.max(0, patientsPerDay - 1));
                            }
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
                            if (isPerHour) {
                              setPatientsPerHour(patientsPerHour + 1);
                            } else {
                              setPatientsPerDay(patientsPerDay + 1);
                            }
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
                label="Hours Per Day"
                value={hoursPerDay}
                onValueChange={(values) => setHoursPerDay(values.floatValue || 0)}
                decimalScale={1}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTime />
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
                          onClick={() => setHoursPerDay(Math.max(0, hoursPerDay - 0.5))}
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
                          onClick={() => setHoursPerDay(Math.min(24, hoursPerDay + 0.5))}
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
                label="Days Per Week"
                value={daysPerWeek}
                onValueChange={(values) => setDaysPerWeek(values.floatValue || 0)}
                decimalScale={0}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday />
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
                          onClick={() => setDaysPerWeek(Math.max(0, daysPerWeek - 1))}
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
                          onClick={() => setDaysPerWeek(Math.min(7, daysPerWeek + 1))}
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
              <CustomNumberInput
                label="Vacation Weeks per Year"
                value={weeksPerYear}
                onChange={(value) => setWeeksPerYear(value)}
                icon={<Celebration />}
                min={0}
                max={52}
                step={1}
              />
              <CustomNumberInput
                label="Statutory Holidays per Year"
                value={statutoryHolidays}
                onChange={setStatutoryHolidays}
                icon={<CalendarToday />}
                min={0}
                max={52}
                step={1}
              />
              <CustomNumberInput
                label="CME Days per Year"
                value={cmeDays}
                onChange={setCmeDays}
                icon={<School />}
                min={0}
                max={52}
                step={1}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: '16px', border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
                Compensation Settings
              </Typography>
              <NumericFormat
                customInput={TextField}
                fullWidth
                margin="normal"
                label="Base Salary"
                value={baseSalary}
                onValueChange={(values) => setBaseSalary(values.floatValue)}
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
                value={wrvuConversionFactor}
                onValueChange={(values) => setWrvuConversionFactor(values.floatValue)}
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
                            const newValue = Number((wrvuConversionFactor - 0.01).toFixed(2));
                            setWrvuConversionFactor(Math.max(0, newValue));
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
                            const newValue = Number((wrvuConversionFactor + 0.01).toFixed(2));
                            setWrvuConversionFactor(newValue);
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
                value={wrvuConversionFactor ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(baseSalary / wrvuConversionFactor) : '0'}
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
      </Paper>
    </Container>
  );
}

export default QuickWRVUTool; 