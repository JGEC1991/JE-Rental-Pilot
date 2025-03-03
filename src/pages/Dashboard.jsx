import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

function Dashboard() {
  // State for various metrics
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('6 Months');
  const [summaryPeriod, setSummaryPeriod] = useState('Last week');
  const [vehicleStatusData, setVehicleStatusData] = useState({});
  const [revenueByStatus, setRevenueByStatus] = useState({});
  const [activitiesByType, setActivitiesByType] = useState({});

  // Fetch all necessary data when component mounts
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      
      await Promise.all([
        fetchVehicles(),
        fetchDrivers(),
        fetchActivities(),
        fetchExpenses(),
        fetchRevenue()
      ]);
      
      setLoading(false);
    }
    
    fetchDashboardData();
  }, []);

  // Process vehicle status data after vehicles are loaded
  useEffect(() => {
    if (vehicles.length > 0) {
      processVehicleStatusData();
    }
  }, [vehicles]);

  // Process revenue by status after revenue is loaded
  useEffect(() => {
    if (revenue.length > 0) {
      processRevenueByStatus();
    }
  }, [revenue]);

  // Process activities by type after activities are loaded
  useEffect(() => {
    if (activities.length > 0) {
      processActivitiesByType();
    }
  }, [activities]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');
      
      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*');
      
      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*');
      
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*');
      
      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const fetchRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('revenue')
        .select('*');
      
      if (error) throw error;
      setRevenue(data || []);
    } catch (error) {
      console.error("Error fetching revenue:", error);
    }
  };

  // Process vehicle status data
  const processVehicleStatusData = () => {
    const statusCounts = {
      'Available': 0,
      'In Use': 0,
      'Maintenance': 0,
      'Out of Service': 0
    };

    // Count vehicles by status
    vehicles.forEach(vehicle => {
      const status = vehicle.status || 'Available';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Format for chart
    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    const colors = [
      '#4CAF50', // Available - Green
      '#2196F3', // In Use - Blue
      '#FFC107', // Maintenance - Yellow
      '#F44336'  // Out of Service - Red
    ];

    setVehicleStatusData({ labels, data, colors });
  };

  // Process revenue by status
  const processRevenueByStatus = () => {
    const statusAmounts = {
      'Paid': 0,
      'Pending': 0,
      'Past Due': 0,
      'Canceled': 0
    };

    // Sum revenue by status
    revenue.forEach(item => {
      const status = item.status || 'Pending';
      statusAmounts[status] = (statusAmounts[status] || 0) + parseFloat(item.amount || 0);
    });

    // Format for chart
    const labels = Object.keys(statusAmounts);
    const data = Object.values(statusAmounts);
    const colors = [
      '#4CAF50', // Paid - Green
      '#FFC107', // Pending - Yellow
      '#F44336', // Past Due - Red
      '#9E9E9E'  // Canceled - Gray
    ];

    setRevenueByStatus({ labels, data, colors });
  };

  // Process activities by type
  const processActivitiesByType = () => {
    const typeCounts = {};

    // Count activities by type
    activities.forEach(activity => {
      const type = activity.activity_type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Format for chart
    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);
    const colors = labels.map((_, index) => {
      const colorPalette = [
        '#ffeb3b', '#e0e0e0', '#fff9c4', '#ffd54f', 
        '#4CAF50', '#2196F3', '#9C27B0', '#FF5722'
      ];
      return colorPalette[index % colorPalette.length];
    });

    setActivitiesByType({ labels, data, colors });
  };

  // Get months for charts
  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(currentMonth - 5, currentMonth + 1);
  };

  // Get days of week for weekly charts
  const getDayLabels = () => {
    return ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  };

  // Calculate total revenue
  const getTotalRevenue = () => {
    return revenue.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0).toFixed(2);
  };

  // Calculate total expenses
  const getTotalExpenses = () => {
    return expenses.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0).toFixed(2);
  };

  // Calculate net balance
  const getNetBalance = () => {
    const totalRev = parseFloat(getTotalRevenue());
    const totalExp = parseFloat(getTotalExpenses());
    return (totalRev - totalExp).toFixed(2);
  };

  // Calculate total deliveries
  const getTotalDeliveries = () => {
    return activities.filter(activity => activity.activity_type === 'Delivery').length;
  };

  // Generate vehicle usage data for pie chart
  const getVehicleUsageData = () => {
    // Count activities by vehicle type to show distribution
    const vehicleTypes = {};
    const vehicleMap = {};
    
    // Create a map of vehicle IDs to types
    vehicles.forEach(vehicle => {
      vehicleMap[vehicle.id] = vehicle.vehicle_type || 'Uncategorized';
    });
    
    // Count activities by vehicle type
    activities.forEach(activity => {
      const vehicleType = vehicleMap[activity.vehicle_id] || 'Uncategorized';
      vehicleTypes[vehicleType] = (vehicleTypes[vehicleType] || 0) + 1;
    });
    
    // Calculate percentages
    const total = Object.values(vehicleTypes).reduce((acc, count) => acc + count, 0) || 1;
    
    // Prepare data for chart
    const labels = Object.keys(vehicleTypes);
    const data = Object.values(vehicleTypes).map(count => Math.round((count / total) * 100));
    
    // Default data if no real data exists
    if (labels.length === 0) {
      return {
        labels: ['Van', 'Truck', 'Sedan', 'SUV'],
        data: [72, 18, 6, 4],
        colors: ['#ffeb3b', '#e0e0e0', '#fff9c4', '#ffd54f']
      };
    }
    
    // Colors for each type
    const colors = labels.map((_, index) => {
      const colorOptions = ['#ffeb3b', '#e0e0e0', '#fff9c4', '#ffd54f'];
      return colorOptions[index % colorOptions.length];
    });
    
    return { labels, data, colors };
  };

  // Revenue and Expense data for line chart
  const getRevenueExpenseData = () => {
    const monthLabels = getMonthLabels();
    const currentYear = new Date().getFullYear();
    
    // Group revenue by month
    const monthlyRevenue = monthLabels.map(month => {
      const monthIndex = new Date(`${month} 1, ${currentYear}`).getMonth();
      
      return revenue
        .filter(item => new Date(item.date).getMonth() === monthIndex)
        .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    });
    
    // Group expenses by month
    const monthlyExpenses = monthLabels.map(month => {
      const monthIndex = new Date(`${month} 1, ${currentYear}`).getMonth();
      
      return expenses
        .filter(item => new Date(item.date).getMonth() === monthIndex)
        .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    });
    
    // Calculate balance over time
    const monthlyBalance = monthlyRevenue.map((rev, index) => rev - monthlyExpenses[index]);
    
    // Default data if no real data exists
    if (monthlyRevenue.every(r => r === 0)) {
      return {
        labels: monthLabels,
        datasets: [
          {
            label: 'Revenue',
            data: [1500, 2000, 1800, 2200, 2500, 1900],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.4)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Expenses',
            data: [1200, 1800, 1500, 1700, 1300, 1600],
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.4)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Net Balance',
            data: [300, 200, 300, 500, 1200, 300],
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.0)',
            borderWidth: 2,
            tension: 0.4,
            fill: false
          }
        ]
      };
    }
    
    return {
      labels: monthLabels,
      datasets: [
        {
          label: 'Revenue',
          data: monthlyRevenue,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.4)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Expenses',
          data: monthlyExpenses,
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.4)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Net Balance',
          data: monthlyBalance,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.0)', 
          borderWidth: 2,
          tension: 0.4,
          fill: false
        }
      ]
    };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate pending payments
  const getPendingPayments = () => {
    return revenue
      .filter(item => item.status === 'Pending')
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const vehicleUsage = getVehicleUsageData();
  const revenueExpenseData = getRevenueExpenseData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search..."
            className="px-4 py-2 pr-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <svg 
            className="absolute right-3 top-3 h-4 w-4 text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-green-100">
            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(getTotalRevenue())}
            </p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-red-100">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
              <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(getTotalExpenses())}
            </p>
            <p className="text-sm text-gray-500">Total Expenses</p>
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-blue-100">
            <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className={`text-3xl font-bold ${parseFloat(getNetBalance()) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(getNetBalance())}
            </p>
            <p className="text-sm text-gray-500">Net Balance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vehicle Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Vehicle Status</h2>
          </div>
          <div className="flex">
            <div className="w-1/3">
              {vehicleStatusData.labels && vehicleStatusData.labels.map((label, index) => (
                <div key={index} className="flex items-center mb-2">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: vehicleStatusData.colors[index] }}
                  ></div>
                  <span className="text-sm text-gray-600">{label}: {vehicleStatusData.data[index]}</span>
                </div>
              ))}
            </div>
            <div className="w-2/3 flex justify-center">
              <div className="w-48">
                {vehicleStatusData.labels && (
                  <Doughnut 
                    data={{
                      labels: vehicleStatusData.labels,
                      datasets: [
                        {
                          data: vehicleStatusData.data,
                          backgroundColor: vehicleStatusData.colors,
                          borderWidth: 0
                        }
                      ]
                    }}
                    options={{
                      cutout: '60%',
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.label}: ${context.raw} vehicles`;
                            }
                          }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Revenue by Status</h2>
          </div>
          <div className="flex">
            <div className="w-1/3">
              {revenueByStatus.labels && revenueByStatus.labels.map((label, index) => (
                <div key={index} className="flex items-center mb-2">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: revenueByStatus.colors[index] }}
                  ></div>
                  <span className="text-sm text-gray-600">{label}: {formatCurrency(revenueByStatus.data[index])}</span>
                </div>
              ))}
            </div>
            <div className="w-2/3 flex justify-center">
              <div className="w-48">
                {revenueByStatus.labels && (
                  <Pie 
                    data={{
                      labels: revenueByStatus.labels,
                      datasets: [
                        {
                          data: revenueByStatus.data,
                          backgroundColor: revenueByStatus.colors,
                          borderWidth: 1,
                          borderColor: '#fff'
                        }
                      ]
                    }}
                    options={{
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.label}: ${formatCurrency(context.raw)}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Balance Over Time */}
        <div className="bg-white p-6 rounded-lg shadow col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Balance Over Time</h2>
            <div className="relative">
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className="appearance-none bg-transparent border border-gray-300 rounded px-2 py-1 pr-8 text-sm"
              >
                <option>Last 6 Months</option>
                <option>Last 3 Months</option>
                <option>Last Year</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
          <Line 
            data={revenueExpenseData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  align: 'end',
                  labels: {
                    boxWidth: 15,
                    usePointStyle: true
                  }
                },
                tooltip: {
                  mode: 'index',
                  intersect: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return value.toLocaleString('en-US', {
                        style: 'decimal',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      });
                    }
                  }
                }
              },
              interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vehicle Usage */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Vehicle Usage</h2>
          </div>
          <div className="flex">
            <div className="w-1/3">
              {vehicleUsage.labels.map((label, index) => (
                <div key={index} className="flex items-center mb-2">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: vehicleUsage.colors[index] }}
                  ></div>
                  <span className="text-sm text-gray-600">{label}: {vehicleUsage.data[index]}%</span>
                </div>
              ))}
            </div>
            <div className="w-2/3 flex justify-center">
              <div className="w-48">
                <Doughnut 
                  data={{
                    labels: vehicleUsage.labels,
                    datasets: [
                      {
                        data: vehicleUsage.data,
                        backgroundColor: vehicleUsage.colors,
                        borderWidth: 0
                      }
                    ]
                  }}
                  options={{
                    cutout: '60%',
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activities by Type */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Activities by Type</h2>
          </div>
          <div className="flex">
            <div className="w-1/3">
              {activitiesByType.labels && activitiesByType.labels.map((label, index) => (
                <div key={index} className="flex items-center mb-2">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: activitiesByType.colors[index] }}
                  ></div>
                  <span className="text-sm text-gray-600">{label}: {activitiesByType.data[index]}</span>
                </div>
              ))}
            </div>
            <div className="w-2/3 flex justify-center">
              <div className="w-48">
                {activitiesByType.labels && (
                  <Pie 
                    data={{
                      labels: activitiesByType.labels,
                      datasets: [
                        {
                          data: activitiesByType.data,
                          backgroundColor: activitiesByType.colors,
                          borderWidth: 1,
                          borderColor: '#fff'
                        }
                      ]
                    }}
                    options={{
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.label}: ${context.raw} activities`;
                            }
                          }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Payments */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-yellow-100">
            <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-yellow-600">
              {formatCurrency(getPendingPayments())}
            </p>
            <p className="text-sm text-gray-500">Pending Payments</p>
          </div>
        </div>

        {/* Deliveries Metric */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-blue-100">
            <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h4.05a1 1 0 01.95.68l1.944 5.815a1 1 0 01-.94 1.32h-1.094a2.5 2.5 0 01-4.9 0H14a1 1 0 01-1-1V8a1 1 0 011-1z" />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold">{getTotalDeliveries()}</p>
            <p className="text-sm text-gray-500">Deliveries Made</p>
          </div>
        </div>

        {/* Activities Metric */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-green-100">
            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 2a2 2 0 00-2 2v1H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3V4a2 2 0 00-2-2zm0 2a1 1 0 00-1 1v1h2V5a1 1 0 00-1-1zm-5 4h10v1h-1v3a1 1 0 01-1 1H7a1 1 0 01-1-1V9H5V8z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold">{activities.length}</p>
            <p className="text-sm text-gray-500">Total Activities</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
