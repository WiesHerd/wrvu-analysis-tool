import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  Typography,
  TextField,
  InputAdornment,
  Slider,
  Box,
  Divider,
  Paper,
  Button,
  IconButton,
  Popover,
} from '@mui/material';
import { Pie, Bar } from 'react-chartjs-2';
import { AttachMoney, TrendingUp, MonetizationOn, EmojiEvents, Clear, InfoOutlined } from '@mui/icons-material';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NumericFormat } from 'react-number-format';

Chart.register(ChartDataLabels);

const ResultCard = ({ title, value, color, icon }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ p: 2, height: '100%', border: '1px solid #e0e0e0', borderRadius: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
        <Typography variant="subtitle1" color="textSecondary" gutterBottom align="center">
          {title}
        </Typography>
        <Typography variant="h4" color={color} sx={{ mt: 1, mb: 2, fontWeight: 'bold' }} align="center">
          {value}
        </Typography>
        {icon}
      </Box>
    </Card>
  </Grid>
);

function ProviderCompensation({ savedMonthlyRvus, setSavedMonthlyRvus }) {
  const [salary, setSalary] = useState(150000);
  const [conversionFactor, setConversionFactor] = useState(45.52);
  const [qualityIncentive, setQualityIncentive] = useState(5.0);
  const [monthlyRvus, setMonthlyRvus] = useState(() => {
    const savedRvus = localStorage.getItem('monthlyRvus');
    return savedRvus ? JSON.parse(savedRvus) : Array(12).fill('');
  });
  const [fte, setFte] = useState(1.0);
  const [totalCompensation, setTotalCompensation] = useState(0);
  const [incentiveAmount, setIncentiveAmount] = useState(0);
  const [annualizedRvus, setAnnualizedRvus] = useState(0);
  const [ytdRvus, setYtdRvus] = useState(0);
  const [dynamicMessage, setDynamicMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const months = useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], []);

  const calculateCompensation = useCallback(() => {
    const enteredMonths = monthlyRvus
      .filter((rvu) => rvu !== '' && !isNaN(rvu))
      .map((rvu) => parseFloat(rvu));

    const monthsCount = enteredMonths.length;
    if (monthsCount === 0) {
      setAnnualizedRvus(0);
      setTotalCompensation(salary * fte);
      setIncentiveAmount(0);
      return;
    }

    const totalRvusYtd = enteredMonths.reduce((sum, rvu) => sum + rvu, 0);
    setYtdRvus(totalRvusYtd);

    const averageRvuPerMonth = totalRvusYtd / monthsCount;
    const annualizedRvusValue = (averageRvuPerMonth * 12) * fte;
    setAnnualizedRvus(annualizedRvusValue);

    const grossProductionAmount = annualizedRvusValue * conversionFactor;
    const incentivePayment = Math.max(0, grossProductionAmount - salary * fte);
    setIncentiveAmount(incentivePayment);

    const qualityBonus = salary * (qualityIncentive / 100) * fte;
    const totalComp = salary * fte + incentivePayment + qualityBonus;
    setTotalCompensation(totalComp);

    updateDynamicMessage(months[monthsCount - 1], totalRvusYtd, annualizedRvusValue, incentivePayment);
  }, [salary, conversionFactor, qualityIncentive, monthlyRvus, fte, months]);

  useEffect(() => {
    calculateCompensation();
  }, [calculateCompensation]);

  useEffect(() => {
    localStorage.setItem('monthlyRvus', JSON.stringify(monthlyRvus));
  }, [monthlyRvus]);

  const updateDynamicMessage = useCallback((currentMonth, totalYtdRvus, annualizedRvusValue, incentiveForecast) => {
    const message = `As of ${currentMonth}, you've entered ${formatNumber(totalYtdRvus)} wRVUs for the year so far. Annualizing this gives a projected total of ${formatNumber(annualizedRvusValue)} wRVUs for the year. Based on this, your forecasted incentive payment is ${formatCurrency(incentiveForecast)}.`;
    setDynamicMessage(message);
  }, []);

  const formatCurrency = useMemo(() => 
    (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value),
  []);

  const formatNumber = useMemo(() => 
    (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value),
  []);

  const donutChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Compensation Breakdown',
        align: 'center',
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        display: false  // This will remove the labels from inside the chart
      }
    },
  }), [formatCurrency]);

  const pieChartData = useMemo(() => ({
    labels: ['Base Salary', 'Incentive Payment', 'Quality Bonus'],
    datasets: [
      {
        data: [salary * fte, incentiveAmount, salary * (qualityIncentive / 100) * fte],
        backgroundColor: ['#4CAF50', '#FF5722', '#FFC107'],
      },
    ],
  }), [salary, fte, incentiveAmount, qualityIncentive]);

  const barChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Monthly RVUs',
        align: 'center',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `RVUs: ${formatNumber(context.parsed.y)}`
        }
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (value) => value > 0 ? formatNumber(value) : '',
        font: { weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'RVUs',
        },
        grid: { display: false },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
        grid: { display: false },
      }
    },
  }), [formatNumber]);

  const barChartData = useMemo(() => ({
    labels: months,
    datasets: [
      {
        label: 'Monthly RVUs',
        data: monthlyRvus.map((rvu) => parseFloat(rvu) || 0),
        backgroundColor: '#4CAF50',
      },
    ],
  }), [months, monthlyRvus]);

  const handleClearRVUs = () => {
    setMonthlyRvus(Array(12).fill(''));
  };

  const handleInfoClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleInfoClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h4" 
              align="center" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Monthly Performance
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
              mb: 3, 
              mt: 0.5,
              fontSize: '1.1rem',
              fontWeight: 'normal' 
            }}
          >
            Track RVUs and Projected Compensation
          </Typography>
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
        >
          <Typography sx={{ p: 2, maxWidth: 300 }}>
            This screen allows you to forecast your annual compensation based on monthly wRVU input. 
            Enter your base salary, conversion factor, quality incentive, and monthly RVUs to see 
            projected total compensation, incentive payment, and other key metrics.
          </Typography>
        </Popover>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%', borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Compensation Details
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <TextField
                label="Base Salary"
                value={salary.toLocaleString('en-US')}
                onChange={(e) => setSalary(parseFloat(e.target.value.replace(/,/g, '')) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  sx: { 
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                  },
                }}
                fullWidth
                margin="normal"
                variant="outlined"
                type="text"
              />

              <NumericFormat
                customInput={TextField}
                fullWidth
                margin="normal"
                label="Conversion Factor ($/RVU)"
                value={conversionFactor}
                onValueChange={(values) => setConversionFactor(values.floatValue)}
                decimalScale={2}
                fixedDecimalScale={true}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Target Annual wRVUs"
                value={conversionFactor ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(salary / conversionFactor) : '0'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TrendingUp />
                    </InputAdornment>
                  ),
                  readOnly: true,
                }}
                helperText="Target wRVUs needed to reach base salary (Base Salary ÷ Conversion Factor)"
              />

              <TextField
                label="Quality Incentive"
                value={qualityIncentive}
                onChange={(e) => setQualityIncentive(parseFloat(e.target.value) || 0)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  sx: { 
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                  },
                }}
                fullWidth
                margin="normal"
                variant="outlined"
                type="number"
              />

              <Box mt={3}>
                <Typography gutterBottom>FTE (Full-Time Equivalent)</Typography>
                <Slider
                  value={fte}
                  onChange={(e, newValue) => setFte(newValue)}
                  step={0.01}
                  min={0.1}
                  max={1.0}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0.1, label: '0.1' },
                    { value: 0.5, label: '0.5' },
                    { value: 1.0, label: '1.0' },
                  ]}
                  sx={{ 
                    '& .MuiSlider-thumb': { borderRadius: '12px' }, 
                    '& .MuiSlider-rail': { borderRadius: '12px' }, 
                    '& .MuiSlider-track': { borderRadius: '12px' },
                    '& .MuiSlider-valueLabel': { borderRadius: '12px' },
                  }}
                />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%', borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Monthly RVUs
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                {months.map((month, index) => (
                  <Grid item xs={6} sm={4} key={month}>
                    <TextField
                      label={month}
                      value={monthlyRvus[index]}
                      onChange={(e) => {
                        const newRvus = [...monthlyRvus];
                        newRvus[index] = e.target.value;
                        setMonthlyRvus(newRvus);
                      }}
                      fullWidth
                      variant="outlined"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">RVU</InputAdornment>,
                        sx: { 
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e0e0e0',
                          },
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
              <Box mt={3} display="flex" justifyContent="center">
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleClearRVUs}
                  startIcon={<Clear />}
                  sx={{ 
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    '&:hover': {
                      boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  Clear All RVUs
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
          <ResultCard 
            title="Total Compensation"
            value={formatCurrency(totalCompensation)}
            color="primary"
            icon={<AttachMoney fontSize="large" color="primary" />}
          />
          <ResultCard 
            title="Annualized RVUs"
            value={formatNumber(annualizedRvus)}
            color="secondary"
            icon={<TrendingUp fontSize="large" color="secondary" />}
          />
          <ResultCard 
            title="Incentive Payment"
            value={formatCurrency(incentiveAmount)}
            color="error"
            icon={<MonetizationOn fontSize="large" color="error" />}
          />
          <ResultCard 
            title="Quality Bonus"
            value={formatCurrency(salary * (qualityIncentive / 100) * fte)}
            color="warning.main"
            icon={<EmojiEvents fontSize="large" color="warning" />}
          />
        </Grid>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" color="primary">
                Explanation
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {dynamicMessage}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: 400, border: '1px solid #e0e0e0', borderRadius: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              <Box sx={{ height: 'calc(100% - 32px)' }}>
                <Pie data={pieChartData} options={donutChartOptions} plugins={[ChartDataLabels]} />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: 400, border: '1px solid #e0e0e0', borderRadius: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              <Box sx={{ height: 'calc(100% - 32px)' }}>
                <Bar data={barChartData} options={barChartOptions} plugins={[ChartDataLabels]} />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
              </Typography>
    </Container>
  );
}

export default ProviderCompensation;