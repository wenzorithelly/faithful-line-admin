'use client';

import React, { useState, useEffect } from 'react';
import supabase from '@/services/supabaseService';
import {
  Bar,
} from 'react-chartjs-2';
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
} from 'chart.js';

import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ClientsPerDay {
  date: string;
  count: number;
}

interface AverageTimeInside {
  averageMinutes: number;
}

interface TotalClients {
  total: number;
}

const DashboardPage = () => {
  const [clientsPerDay, setClientsPerDay] = useState<ClientsPerDay[]>([]);
  const [averageTime, setAverageTime] = useState<AverageTimeInside | null>(null);
  const [totalClients, setTotalClients] = useState<TotalClients | null>(null);
  const [totalSubscriptions, setTotalSubscriptions] = useState<TotalClients | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Clients Entered Per Day
        const { data: perDayData, error: perDayError } = await supabase
          .from('clients')
          .select('entered_at')
          .not('entered_at', 'is', null)
          .order('entered_at', { ascending: true });

        if (perDayError) throw perDayError;

        // Process per day data
        const counts: { [key: string]: number } = {};
        perDayData?.forEach(client => {
          const date = new Date(client.entered_at).toLocaleDateString();
          counts[date] = (counts[date] || 0) + 1;
        });

        const perDayMetrics: ClientsPerDay[] = Object.entries(counts).map(([date, count]) => ({
          date,
          count,
        }));

        setClientsPerDay(perDayMetrics);

        // 2. Average Time of Clients Inside the Room
        const { data: timeData, error: timeError } = await supabase
          .from('clients')
          .select('entered_at, left_at')
          .not('left_at', 'is', null);

        if (timeError) throw timeError;

        let totalMinutes = 0;
        let validEntries = 0;

        timeData?.forEach(client => {
          if (client.entered_at && client.left_at) {
            const entered = new Date(client.entered_at);
            const exited = new Date(client.left_at);
            const diffMs = exited.getTime() - entered.getTime();
            const diffMinutes = diffMs / 1000 / 60;
            totalMinutes += diffMinutes;
            validEntries += 1;
          }
        });

        const averageMinutes = validEntries > 0 ? totalMinutes / validEntries : 0;
        setAverageTime({ averageMinutes: Math.round(averageMinutes) });

        // 3. Total Clients Entered
        const { data: totalData, error: totalError } = await supabase
          .from('clients')
          .select('id')
          .not('entered_at', 'is', null);

        if (totalError) throw totalError;

        setTotalClients({ total: totalData?.length || 0 });

        // 4. Total number of subscriptions
        const { data: totalDistinctNumbers, error: totalClientError } = await supabase
          .from('clients')
          .select('number')
          .not('number', 'is', null)

        if (totalClientError) throw totalClientError;

        const uniqueNumbers = new Set<string>();

        totalDistinctNumbers?.forEach((client) => {
          if (client.number) {
            uniqueNumbers.add(client.number);
          }
        })

        setTotalSubscriptions({ total: uniqueNumbers.size || 0 });
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Falha ao obter métricas.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Prepare data for charts
  const barData = {
    labels: clientsPerDay.map(item => item.date),
    datasets: [
      {
        label: 'Pessoas',
        data: clientsPerDay.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  return (
    <Box
      p={4}
      height='100vh'
      sx={{ bgcolor: 'background.default', color: 'text.primary' }}
    >
      <Typography variant="h5" component="h1" fontWeight="bold" mb={4}>
        Dashboard
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={4}>

          {/* Número total de inscrições */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" component="h2" fontWeight="medium" mb={2}>
                Número Total de Inscrições
              </Typography>
              {totalSubscriptions ? (
                <Typography variant="h3" component="p" color="primary.main" fontWeight="bold">
                  {totalSubscriptions.total}
                </Typography>
              ) : (
                <Typography variant="body1">Nenhum dado disponível.</Typography>
              )}
            </Paper>
          </Grid>

          {/* Orações por Dia */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" component="h2" fontWeight="medium" mb={2}>
                Orações por Dia
              </Typography>
              <Bar data={barData} />
            </Paper>
          </Grid>

          {/* Tempo Médio Dentro da Sala */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" component="h2" fontWeight="medium" mb={2}>
                Tempo Médio Dentro da Sala
              </Typography>
              {averageTime ? (
                <Typography variant="h3" component="p" color="success.main" fontWeight="bold">
                  {averageTime.averageMinutes} Minutos
                </Typography>
              ) : (
                <Typography variant="body1">Nenhum dado disponível.</Typography>
              )}
            </Paper>
          </Grid>

          {/* Número Total de Orações */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" component="h2" fontWeight="medium" mb={2}>
                Número Total de Orações
              </Typography>
              {totalClients ? (
                <Typography variant="h3" component="p" color="primary.main" fontWeight="bold">
                  {totalClients.total}
                </Typography>
              ) : (
                <Typography variant="body1">Nenhum dado disponível.</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" component="h2" fontWeight="light" mb={2}>
                -
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default DashboardPage;
