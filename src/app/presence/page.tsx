'use client';

import React, { useState, useEffect } from 'react';
import { SupabaseService } from '@/services/supabaseService';
import supabase from '@/services/supabaseService';
import { WaAPIService } from '@/services/waapiService';
import { filterClientsData, UIClient } from '@/utils/clientUtils';
import { RealtimeChannel } from '@supabase/supabase-js';

import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';

import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';

export default function PresencePage() {
  const supabaseService = new SupabaseService();
  const waapi = new WaAPIService();

  const [data, setData] = useState<UIClient[]>([]);
  const [filteredData, setFilteredData] = useState<UIClient[]>([]);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    refreshData();

    const channel: RealtimeChannel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: 'message_sent=eq.false',
        },
        (payload: any) => {
          console.log('Realtime change received:', payload);
          handleRealtimeChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRealtimeChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
      setData((prevData) => {
        const exists = prevData.some((client) => client.phone === newRecord.number);
        if (exists) {
          return prevData;
        }

        const newClient: UIClient = {
          name: `${newRecord.first_name} ${newRecord.last_name}`.trim(),
          phone: newRecord.number,
          entered_at: !!newRecord.entered_at,
          country: newRecord.country || 'BR',
        };
        return [newClient, ...prevData];
      });
    } else if (eventType === 'UPDATE') {
      setData((prevData) =>
        prevData.map((client) =>
          client.phone === newRecord.number
            ? {
                ...client,
                name: `${newRecord.first_name} ${newRecord.last_name}`.trim(),
                entered_at: !!newRecord.entered_at,
                country: newRecord.country || 'BR',
              }
            : client
        )
      );
    } else if (eventType === 'DELETE') {
      setData((prevData) =>
        prevData.filter((client) => client.phone !== oldRecord.number)
      );
    }
  };

  useEffect(() => {
    const filtered = filterClientsData(data, searchQuery);
    setFilteredData(filtered);
  }, [data, searchQuery]);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const clients = await supabaseService.fetchDataPresence();

      const uniqueClientsMap = new Map();
      clients.forEach((client) => {
        if (!uniqueClientsMap.has(client.phone)) {
          uniqueClientsMap.set(client.phone, client);
        }
      });
      const uniqueClients = Array.from(uniqueClientsMap.values());

      setData(uniqueClients);
      setSelectedClients(new Set());
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Erro ao buscar dados. Tente novamente.'); // Adjust message as needed
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectClient = (phone: string, selected: boolean) => {
    const updatedSelectedClients = new Set(selectedClients);
    if (selected) {
      updatedSelectedClients.add(phone);
    } else {
      updatedSelectedClients.delete(phone);
    }
    setSelectedClients(updatedSelectedClients);
  };

  const sendToNextFifty = async () => {
  setLoading(true);
  setError(null);

  try {
    const nextFiftyClients = filteredData.slice(0, 100); // Get the first 100 clients
    const messageData = await supabaseService.fetchDefaultMessage();
    const message = messageData.message || 'Olá, sua vez chegou';

    if (!message) {
      alert('Nenhuma mensagem padrão configurada.');
      setLoading(false);
      return;
    }

    for (const client of nextFiftyClients) {
      const success = await waapi.sendMessage(client.phone, message);
      if (success) {
        await supabaseService.updateMessageSentStatus(client.phone);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    setMessageSent(true);
    refreshData(); // Refresh data to ensure updated statuses are reflected
  } catch (error) {
    console.error('Error sending messages:', error);
    setError('Erro ao enviar mensagens para os próximos 50 clientes. Tente novamente.');
  } finally {
    setLoading(false);
  }
};

  const sendMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const messageData = await supabaseService.fetchDefaultMessage();
      const message = messageData.message || 'Olá, sua vez chegou';

      if (!message) {
        alert('Nenhuma mensagem padrão configurada.');
        setLoading(false);
        return;
      }

      for (const phone of selectedClients) {
        const success = await waapi.sendMessage(phone, message);
        if (success) {
          await supabaseService.updateMessageSentStatus(phone);
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      setMessageSent(true);
      setSelectedClients(new Set());
      refreshData();
    } catch (error) {
      console.error('Error sending messages:', error);
      setError('Erro ao enviar mensagens. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (phone: string) => {
    await supabaseService.deleteClient(phone);
    refreshData();
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      sx={{
        p: 2,
        pb: '75px',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Typography
          p={2}
          variant="h5"
          component="h1"
          fontWeight="bold"
          flexGrow={1}
        >
          Lista de Presença
        </Typography>
        <IconButton
          onClick={refreshData}
          aria-label="Atualizar"
          size="small"
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box display="flex" alignItems="center" mb={1}>
        <TextField
          fullWidth
          placeholder="Pesquisar um nome..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} fontSize="small" />,
          }}
          size="small"
        />
      </Box>

      <Box
        flexGrow={1}
        overflow="auto"
        borderRadius={2}
        border={1}
        borderColor="grey.300"
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress size={24} />
          </Box>
        ) : filteredData.length > 0 ? (
          <List dense>
            {filteredData.map((client) => (
              <div key={client.phone}>
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteClient(client.phone)}
                      size="small"
                    >
                      <DeleteIcon color="error" fontSize="small" />
                    </IconButton>
                  }
                  sx={{ py: 0.5 }}
                >
                  <Checkbox
                    edge="start"
                    checked={selectedClients.has(client.phone)}
                    onChange={(e) =>
                      handleSelectClient(client.phone, e.target.checked)
                    }
                    tabIndex={-1}
                    disableRipple
                    size="small"
                  />
                  <ListItemText
                    primary={client.name}
                    secondary={client.country || 'BR'}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        ) : (
          <Box p={4} textAlign="center" color="text.secondary">
            Nenhum cliente encontrado.
          </Box>
        )}
      </Box>

      <Box display="flex" justifyContent="space-between" my={1}>
        <Typography variant="body2">
          Total de pessoas para enviar mensagem: {data.length}
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="secondary"
        fullWidth
        startIcon={<SendIcon fontSize="small" />}
        sx={{ mt: 1 }}
        disabled={selectedClients.size === 0 || loading}
        onClick={sendMessages}
        size="small"
      >
        Enviar Mensagem
      </Button>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        startIcon={<SendIcon fontSize="small" />}
        sx={{ mt: 1 }}
        disabled={loading || filteredData.length === 0}
        onClick={sendToNextFifty}
        size="small"
        >
        Enviar Mensagem para Próximos 100
      </Button>


      {messageSent && (
        <Alert
          onClose={() => setMessageSent(false)}
          severity="success"
          sx={{ mt: 1 }}
        >
          Mensagens enviadas com sucesso!
        </Alert>
      )}
    </Box>
  );
}
