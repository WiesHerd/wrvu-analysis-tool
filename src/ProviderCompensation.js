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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { 
  AttachMoney, 
  TrendingUp, 
  MonetizationOn, 
  EmojiEvents, 
  Clear, 
  InfoOutlined,
  Save,
  Print,
  HelpOutline,
  Delete,
} from '@mui/icons-material';
import Chart from 'chart.js/auto';
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  SubTitle
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NumericFormat } from 'react-number-format';

// Register the chart components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  SubTitle,
  ChartDataLabels,
  annotationPlugin
);

// A component to display the green difference indicators with tooltips
const DifferenceIndicator = ({ value, tooltipText }) => {
  if (!value || !value.toString().startsWith('+')) return null;
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      position: 'absolute',
      right: '8px',
      top: '8px'
    }}>
      <Tooltip 
        title={tooltipText || "Potential increase based on adjusted wRVU per encounter"}
        placement="top"
        arrow
      >
        <Typography 
          variant="subtitle1" 
          sx={{
            fontWeight: 'bold', 
            color: 'success.main',
            bgcolor: 'rgba(76, 175, 80, 0.1)',
            borderRadius: '8px',
            px: 1,
            py: 0.5,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            cursor: 'help'
          }}
        >
          {value}
          <InfoOutlined 
            fontSize="small" 
            sx={{ fontSize: '0.875rem', ml: 0.5 }} 
          />
        </Typography>
      </Tooltip>
    </Box>
  );
};

const ResultCard = ({ title, value, color, icon, differenceValue, differenceTooltip }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ 
      p: 2, 
      height: '100%', 
      border: '1px solid #e0e0e0', 
      borderRadius: '16px', 
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
        <Typography variant="subtitle1" color="textSecondary" gutterBottom align="center">
          {title}
        </Typography>
        <Typography variant="h4" color={color} sx={{ mt: 1, mb: 2, fontWeight: 'bold' }} align="center">
          {value}
        </Typography>
        {icon}
      </Box>
      {differenceValue && (
        <DifferenceIndicator 
          value={differenceValue} 
          tooltipText={differenceTooltip}
        />
      )}
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
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [savedScenarios, setSavedScenarios] = useState(() => {
    const saved = localStorage.getItem('monthlyPerformanceScenarios');
    return saved ? JSON.parse(saved) : [];
  });

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

  useEffect(() => {
    localStorage.setItem('monthlyPerformanceScenarios', JSON.stringify(savedScenarios));
  }, [savedScenarios]);

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
        display: false,
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
        display: function(context) {
          // Only show labels for segments that are at least 5% of the total
          const value = context.dataset.data[context.dataIndex];
          const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
          return (value / total) >= 0.05;
        },
        color: '#fff',
        font: {
          weight: 'bold',
          size: 12
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
          const percentage = ((value / total) * 100).toFixed(0);
          return percentage + '%';
        }
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

  const barChartData = useMemo(() => {
    // Get current month (0-indexed, like the months array)
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();

    // Find the last month with actual data (this could be current month or earlier)
    let lastDataMonth = -1;
    for (let i = 0; i < monthlyRvus.length; i++) {
      if (parseFloat(monthlyRvus[i]) > 0) {
        lastDataMonth = i;
      }
    }
    // If no data found, use current month as reference
    if (lastDataMonth === -1) {
      lastDataMonth = currentMonthIndex;
    }

    // Process the RVU data
    const actualData = monthlyRvus.map((rvu, index) => {
      return parseFloat(rvu) || 0; // All entered values are actual RVUs
    });

    // Calculate statistics for projections
    let sum = 0;
    let count = 0;
    let validValues = [];
    
    // First, calculate average of available values and collect valid data points
    for (let i = 0; i <= lastDataMonth; i++) {
      const value = parseFloat(monthlyRvus[i]) || 0;
      if (value > 0) {
        sum += value;
        count++;
        validValues.push(value);
      }
    }

    const avgPerMonth = count > 0 ? sum / count : 300; // Default to 300 if no data

    // Add a forecast trend line based on average of actual data
    const forecastTrendData = [];
    for (let i = 0; i < months.length; i++) {
      if (i <= lastDataMonth) {
        // For months with actual data, show null (only show forecast for future)
        forecastTrendData.push(null);
      } else {
        // For future months, show the average as the forecast
        forecastTrendData.push(avgPerMonth);
      }
    }

    // Add trendline that passes through the actual data points
    const trendLineData = [];
    
    // Calculate linear regression for trendline
    if (validValues.length > 1) {
      // Get x and y values for regression calculation
      const xValues = [];
      const yValues = [];
      
      for (let i = 0; i <= lastDataMonth; i++) {
        const value = parseFloat(monthlyRvus[i]) || 0;
        if (value > 0) {
          xValues.push(i);
          yValues.push(value);
        }
      }
      
      // Calculate regression coefficients
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      const n = xValues.length;
      
      for (let i = 0; i < n; i++) {
        sumX += xValues[i];
        sumY += yValues[i];
        sumXY += xValues[i] * yValues[i];
        sumXX += xValues[i] * xValues[i];
      }
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      // Generate trendline data points using the regression equation
      for (let i = 0; i < months.length; i++) {
        const trendValue = slope * i + intercept;
        trendLineData.push(trendValue);
      }
    } else {
      // Not enough data for regression, use average
      for (let i = 0; i < months.length; i++) {
        if (i <= lastDataMonth) {
          const value = parseFloat(monthlyRvus[i]) || 0;
          trendLineData.push(value > 0 ? value : avgPerMonth);
        } else {
          trendLineData.push(avgPerMonth);
        }
      }
    }

    return {
      labels: months,
      datasets: [
        {
          label: 'Actual RVUs',
          data: actualData,
          backgroundColor: '#4CAF50', // Green for actual data
          borderWidth: 1,
          borderColor: '#388E3C',
          order: 1,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        },
        {
          label: 'Forecast',
          data: forecastTrendData,
          borderColor: '#FF9800', // Orange for forecast
          borderWidth: 2,
          borderDash: [5, 5],
          type: 'line',
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
          tension: 0.3,
          order: 0
        },
        {
          label: 'Trendline',
          data: trendLineData,
          borderColor: '#2196F3', // Blue for trendline
          borderWidth: 2,
          type: 'line',
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
          tension: 0.4,
          order: 0,
          borderDash: [] // Solid line, not dashed
        }
      ]
    };
  }, [months, monthlyRvus]);

  const barChartOptions = useMemo(() => {
    // Get current month for annotation
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const annotations = {};
    
    // Find the last month with actual data
    let lastDataMonth = -1;
    for (let i = 0; i < monthlyRvus.length; i++) {
      if (parseFloat(monthlyRvus[i]) > 0) {
        lastDataMonth = i;
      }
    }
    // If no data found, use current month as reference
    if (lastDataMonth === -1) {
      lastDataMonth = currentMonthIndex;
    }
    
    // Only add annotation if we have future months to forecast
    if (lastDataMonth < 11) {
      annotations.forecastLine = {
        type: 'line',
        mode: 'vertical',
        scaleID: 'x',
        value: lastDataMonth,
        borderColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 2,
        borderDash: [6, 6],
        label: {
          content: 'Forecast →',
          enabled: true,
          position: 'start',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          font: {
            size: 12
          },
          padding: 5
        }
      };
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        annotation: {
          annotations
        },
        legend: { 
          display: true,
          position: 'top',
          align: 'center',
          labels: {
            usePointStyle: false,
            padding: 15,
            boxWidth: 50,
            boxHeight: 1,
            font: {
              size: 11
            },
            generateLabels: function(chart) {
              const datasets = chart.data.datasets;
              return datasets.map((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                
                // Special case for forecast line - force display as line
                if (dataset.type === 'line') {
                  return {
                    text: dataset.label,
                    fillStyle: 'transparent',
                    strokeStyle: dataset.borderColor,
                    lineWidth: 2.5,
                    // Use dataset's borderDash property (empty for trendline, dashed for forecast)
                    lineDash: dataset.borderDash || [],
                    hidden: !meta.visible,
                    index: i
                  };
                }
                
                return {
                  text: dataset.label,
                  fillStyle: dataset.backgroundColor,
                  strokeStyle: dataset.borderColor,
                  lineWidth: 1,
                  hidden: !meta.visible,
                  index: i
                };
              });
            }
          }
        },
        title: {
          display: false,
          text: 'Monthly RVUs with Forecasting',
          align: 'center',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        subtitle: {
          display: false,
          text: 'Showing actual data and future forecast based on monthly average',
          align: 'center',
          font: {
            size: 12,
            style: 'italic'
          },
          padding: {
            bottom: 10
          }
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              if (!items.length) return '';
              const index = items[0].dataIndex;
              
              // Find the last month with actual data
              let lastDataMonth = -1;
              for (let i = 0; i < monthlyRvus.length; i++) {
                if (parseFloat(monthlyRvus[i]) > 0) {
                  lastDataMonth = i;
                }
              }
              
              const monthLabel = months[index];
              
              if (index <= lastDataMonth) {
                return `${monthLabel} (Actual)`;
              }
              return `${monthLabel} (Forecast)`;
            },
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y || 0;
              return `${label}: ${formatNumber(value)} wRVUs`;
            },
            footer: (tooltipItems) => {
              const dataIndex = tooltipItems[0].dataIndex;
              
              // Find the last month with actual data
              let lastDataMonth = -1;
              for (let i = 0; i < monthlyRvus.length; i++) {
                if (parseFloat(monthlyRvus[i]) > 0) {
                  lastDataMonth = i;
                }
              }
              
              if (dataIndex > lastDataMonth) {
                return 'Forecast is based on monthly average';
              }
              return '';
            }
          }
        },
        datalabels: {
          anchor: 'end',
          align: 'top',
          offset: 4,
          formatter: (value, context) => {
            // Only show labels for actual values
            if (context.dataset.label === 'Actual RVUs' && value && value > 0) {
              return formatNumber(value);
            }
            return '';
          },
          font: { 
            weight: 'bold',
            size: 11
          },
          color: (context) => {
            // Use dark color for values to ensure readability
            return '#333';
          },
          padding: {
            top: 6
          }
        }
      },
      scales: {
        y: {
          stacked: false,
          beginAtZero: true,
          title: {
            display: true,
            text: 'wRVUs',
          },
          grid: { display: false },
          // Add a bit of padding at the top to ensure labels don't get cut off
          suggestedMax: (context) => {
            let maxValue = 0;
            context.chart.data.datasets.forEach(dataset => {
              const max = Math.max(...dataset.data.filter(v => v !== null && v !== undefined));
              if (max > maxValue) maxValue = max;
            });
            return maxValue * 1.15; // Add 15% padding at the top
          }
        },
        x: {
          title: {
            display: true,
            text: 'Month',
          },
          grid: { display: false },
        }
      },
      layout: {
        padding: {
          top: 20, // Add top padding to make space for labels
          right: 20
        }
      }
    };
  }, [formatNumber, months]);

  const handleClearRVUs = () => {
    setMonthlyRvus(Array(12).fill(''));
  };

  const handleInfoClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleInfoClose = () => {
    setAnchorEl(null);
  };

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) {
      return; // Don't save if name is empty
    }
    
    const newScenario = {
      id: Date.now(), // Add unique ID
      name: scenarioName.trim(),
      date: new Date().toISOString(),
      data: {
        salary,
        conversionFactor,
        qualityIncentive,
        monthlyRvus: [...monthlyRvus], // Create copy of array
        fte,
        totalCompensation,
        incentiveAmount,
        annualizedRvus,
        ytdRvus
      }
    };

    // Update state and localStorage
    const updatedScenarios = [...savedScenarios, newScenario];
    setSavedScenarios(updatedScenarios);
    localStorage.setItem('monthlyPerformanceScenarios', JSON.stringify(updatedScenarios));
    
    setScenarioName('');
    setShowSaveDialog(false);
  };

  const handleLoadScenario = (scenario) => {
    if (!scenario || !scenario.data) return;
    
    setSalary(scenario.data.salary || 150000);
    setConversionFactor(scenario.data.conversionFactor || 45.52);
    setQualityIncentive(scenario.data.qualityIncentive || 5.0);
    setMonthlyRvus(scenario.data.monthlyRvus || Array(12).fill(''));
    setFte(scenario.data.fte || 1.0);
  };

  const PrintableView = ({ metrics, inputs }) => {
    // Format helpers
    const formatNumber = (value) => 
      new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

    const formatCurrency = (value) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

    // Common styles for consistency
    const boxStyles = {
      p: 2,
      border: '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: 'white'
    };

    const sectionHeaderStyles = {
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#666',
      mb: 1,
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
      color: '#666'
    };

    const valueStyles = {
      fontSize: '11px',
      color: '#333',
      fontWeight: 'bold'
    };

    return (
      <Box 
        data-print-section="true"
        sx={{ 
          display: 'none', 
          '@media print': { 
            display: 'block !important',
            width: '100%',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            background: 'white !important',
            color: '#333'
          } 
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
            <TrendingUp sx={{ fontSize: '20px', verticalAlign: 'text-bottom', mr: 1 }} />
            Provider Analytics Dashboard
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#666', mb: 0.5 }}>
            Monthly Performance Tracking
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#888' }}>
            Generated on {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        {/* Top Metrics */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ ...boxStyles, width: '32%' }}>
            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
              <AttachMoney sx={{ fontSize: '14px', verticalAlign: 'text-bottom', color: '#1976d2' }} />
              Total Compensation
            </Typography>
            <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              {formatCurrency(metrics.totalCompensation)}
            </Typography>
          </Box>
          
          <Box sx={{ ...boxStyles, width: '32%' }}>
            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
              <MonetizationOn sx={{ fontSize: '14px', verticalAlign: 'text-bottom', color: '#1976d2' }} />
              Incentive Payment
            </Typography>
            <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              {formatCurrency(metrics.incentiveAmount)}
            </Typography>
          </Box>
          
          <Box sx={{ ...boxStyles, width: '32%' }}>
            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
              <TrendingUp sx={{ fontSize: '14px', verticalAlign: 'text-bottom', color: '#1976d2' }} />
              Annualized wRVUs
            </Typography>
            <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              {formatNumber(metrics.annualizedRvus)}
            </Typography>
          </Box>
        </Box>

        {/* Two Column Layout */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Left Column */}
          <Box sx={{ width: '48%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              ...boxStyles, 
              mb: 2,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography sx={sectionHeaderStyles}>
                <AttachMoney sx={{ fontSize: '14px', mr: 0.5, color: '#1976d2' }} />
                Compensation Parameters
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={rowStyles}>
                  <Typography sx={labelStyles}>Base Salary:</Typography>
                  <Typography sx={valueStyles}>{formatCurrency(inputs.salary)}</Typography>
                </Box>
                <Box sx={rowStyles}>
                  <Typography sx={labelStyles}>Conversion Factor:</Typography>
                  <Typography sx={valueStyles}>${inputs.conversionFactor}/wRVU</Typography>
                </Box>
                <Box sx={rowStyles}>
                  <Typography sx={labelStyles}>Quality Incentive:</Typography>
                  <Typography sx={valueStyles}>{inputs.qualityIncentive}%</Typography>
                </Box>
                <Box sx={rowStyles}>
                  <Typography sx={labelStyles}>FTE:</Typography>
                  <Typography sx={valueStyles}>{inputs.fte}</Typography>
                </Box>
                <Box sx={rowStyles}>
                  <Typography sx={labelStyles}>Quality Bonus:</Typography>
                  <Typography sx={valueStyles}>{formatCurrency(inputs.salary * (inputs.qualityIncentive / 100) * inputs.fte)}</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ 
              ...boxStyles,
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography sx={sectionHeaderStyles}>
                <InfoOutlined sx={{ fontSize: '14px', mr: 0.5, color: '#1976d2' }} />
                Performance Summary
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#666', lineHeight: 1.5, flexGrow: 1 }}>
                {dynamicMessage}
              </Typography>
            </Box>
          </Box>

          {/* Right Column */}
          <Box sx={{ width: '48%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              ...boxStyles, 
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              flexGrow: 1
            }}>
              <Typography sx={sectionHeaderStyles}>
                <TrendingUp sx={{ fontSize: '14px', mr: 0.5, color: '#1976d2' }} />
                Monthly wRVU Data
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 1,
                flexGrow: 1
              }}>
                {months.map((month, index) => (
                  <Box key={month} sx={rowStyles}>
                    <Typography sx={labelStyles}>{month}:</Typography>
                    <Typography sx={valueStyles}>{inputs.monthlyRvus[index] || '0'} wRVUs</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #eee' }}>
                <Box sx={rowStyles}>
                  <Typography sx={labelStyles}>YTD Total:</Typography>
                  <Typography sx={valueStyles}>{formatNumber(metrics.ytdRvus)} wRVUs</Typography>
                </Box>
                <Box sx={rowStyles}>
                  <Typography sx={labelStyles}>Annualized Projection:</Typography>
                  <Typography sx={valueStyles}>{formatNumber(metrics.annualizedRvus)} wRVUs</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 2, pt: 1, textAlign: 'center', borderTop: '1px solid #eee' }}>
          <Typography sx={{ fontSize: '10px', color: '#888' }}>
            *Calculations are based on entered monthly wRVU data and compensation parameters.
          </Typography>
        </Box>
      </Box>
    );
  };

  // Add global print styles
  const printStyles = `
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
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        background-color: white !important;
        background-image: none !important;
      }
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
      nav, 
      [role="tablist"],
      [role="tab"],
      button:not([type="submit"]), 
      .MuiTabs-root,
      header > div:first-child,
      a[href] {
        display: none !important;
      }
      .MuiToolbar-root,
      .MuiAppBar-root {
        display: none !important;
      }
      body > div > div:first-child > div:first-child {
        display: none !important;
      }
      div[style*="display: flex"][style*="justify-content: center"],
      div[style*="border-radius: 24px"],
      div[style*="backdropFilter"] {
        display: none !important;
      }
      h3[style*="background: linear-gradient"] {
        display: none !important;
      }
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
      div[style*="border: 1px dashed"] {
        border: 1px solid #eee !important;
        background-color: white !important;
      }
      .MuiContainer-root {
        height: auto !important;
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
        max-height: 100% !important;
        overflow: visible !important;
      }
      div[data-print-section="true"] {
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
        max-height: 100% !important;
        overflow: visible !important;
      }
      body, html, #root, #root > div {
        height: auto !important;
        overflow: visible !important;
      }
      button[aria-label*="Save"],
      div[role="combobox"],
      .MuiFormControl-root,
      div[role="presentation"] {
        display: none !important;
      }
    }
  `;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, '@media print': { mt: 0 } }}>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      
      {/* Print View */}
      <PrintableView 
        metrics={{
          totalCompensation,
          incentiveAmount,
          annualizedRvus,
          ytdRvus
        }}
        inputs={{
          salary,
          conversionFactor,
          qualityIncentive,
          fte,
          monthlyRvus
        }}
      />

      {/* Main Content */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: '16px', 
          border: '1px solid #e0e0e0', 
          '@media print': { display: 'none' },
          backgroundColor: '#fff',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}
      >
        {/* Title and Buttons */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          mb: 4
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'text.secondary',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '1.1rem',
              fontWeight: 'normal'
            }}
          >
            Monthly Performance Tracking
            <IconButton
              size="small"
              onClick={handleInfoClick}
              sx={{ ml: 1, color: '#666' }}
            >
              <HelpOutline fontSize="small" />
            </IconButton>
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<Save />} 
              onClick={() => setShowSaveDialog(true)}
              sx={{ 
                borderRadius: '24px',
                textTransform: 'uppercase',
                px: 3,
                py: 0.75,
                fontSize: '0.8125rem',
                letterSpacing: '0.02857em',
                fontWeight: 500,
                color: 'rgb(25, 118, 210)',
                borderColor: 'rgba(25, 118, 210, 0.5)',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  borderColor: 'rgb(25, 118, 210)'
                }
              }}
            >
              SAVE SCENARIO
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Print />} 
              onClick={() => window.print()}
              sx={{ 
                borderRadius: '24px',
                textTransform: 'uppercase',
                px: 3,
                py: 0.75,
                fontSize: '0.8125rem',
                letterSpacing: '0.02857em',
                fontWeight: 500,
                color: 'rgb(25, 118, 210)',
                borderColor: 'rgba(25, 118, 210, 0.5)',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  borderColor: 'rgb(25, 118, 210)'
                }
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
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the load scenario
                          const updatedScenarios = savedScenarios.filter(s => s.id !== scenario.id);
                          setSavedScenarios(updatedScenarios);
                          localStorage.setItem('monthlyPerformanceScenarios', JSON.stringify(updatedScenarios));
                        }}
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
          PaperProps={{
            sx: {
              maxWidth: '90vw',
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
            <Card sx={{ 
              p: 3, 
              height: 450, 
              border: '1px solid #e0e0e0', 
              borderRadius: '16px', 
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 1 }}>
                Compensation Breakdown
              </Typography>
              <Box sx={{ 
                flexGrow: 1, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center' 
              }}>
                <Pie data={pieChartData} options={donutChartOptions} plugins={[ChartDataLabels]} />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ 
              p: 3, 
              height: 450, 
              border: '1px solid #e0e0e0', 
              borderRadius: '16px', 
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 1 }}>
                Monthly RVUs
              </Typography>
              <Box sx={{ 
                flexGrow: 1, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center' 
              }}>
                <Bar data={barChartData} options={barChartOptions} plugins={[ChartDataLabels]} />
              </Box>
            </Card>
          </Grid>
        </Grid>

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
      </Paper>
    </Container>
  );
}

export default ProviderCompensation;