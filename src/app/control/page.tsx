'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { SupabaseService, DatabaseClient } from '@/services/supabaseService';
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
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert as MuiAlert,
  AlertProps,
} from '@mui/material';

import {
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';

import debounce from 'lodash.debounce';
import ErrorBoundary from "@/components/ErrorBoundary";

// Dynamic import with SSR disabled
const QrScanner = dynamic(() => import('@/components/QrScanner'), {
  ssr: false,
});

// Create a separate Alert component for Snackbar with proper typing
const SnackbarAlert = React.forwardRef<HTMLDivElement, AlertProps>(function SnackbarAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ControlPage() {
  const supabaseService = useRef(new SupabaseService()).current;
  const waapi = useRef(new WaAPIService()).current;

  // State Variables
  const [data, setData] = useState<DatabaseClient[]>([]);
  const [filteredData, setFilteredData] = useState<UIClient[]>([]);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messageSent, setMessageSent] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Snackbar State Variables
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  // Debounced Search Handler
  const debouncedSearch = useRef(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300)
  ).current;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Fetch Data on Mount
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const clients = await supabaseService.fetchDataControl();
        if (isMounted) {
          setData(clients);
          setSelectedClients(new Set());
        }
      } catch (err) {
        setError('Failed to fetch client data.');
        console.error('Error fetching data control:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [supabaseService]);

  // Transform DatabaseClient[] to UIClient[]
  useEffect(() => {
    const uiClients: UIClient[] = data.map((client) => ({
      name: client.name,
      phone: client.phone,
      entered_at: client.entered_at !== null,
      country: client.country,
    }));
    setFilteredData(filterClientsData(uiClients, searchQuery));
  }, [data, searchQuery]);

  // Real-Time Subscription Setup
  useEffect(() => {
    // Initialize real-time subscription
    const channel: RealtimeChannel = supabase
      .channel('control-page-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
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
  }, [supabaseService]);

  // Handle Real-Time Changes
  const handleRealtimeChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
      const newClient = supabaseService.getMappedClientData(newRecord);
      setData((prevData) => {
        const exists = prevData.some((client) => client.phone === newClient.phone);
        if (exists) {
          return prevData;
        }
        return [newClient, ...prevData];
      });
    } else if (eventType === 'UPDATE') {
      const updatedClient = supabaseService.getMappedClientData(newRecord);
      setData((prevData) =>
        prevData.map((client) =>
          client.phone === updatedClient.phone ? updatedClient : client
        )
      );
    } else if (eventType === 'DELETE') {
      const deletedPhone = oldRecord.number;
      setData((prevData) =>
        prevData.filter((client) => client.phone !== deletedPhone)
      );
    }
  };

  // Handlers
  const handleSelectClient = (phone: string, selected: boolean) => {
    setSelectedClients((prev) => {
      const updated = new Set(prev);
      if (selected) {
        updated.add(phone);
      } else {
        updated.delete(phone);
      }
      return updated;
    });
  };

  const handleScanSuccess = async (decodedText: string, decodedResult: any) => {
    const uniqueCode = decodedText.trim();

    if (!uniqueCode) {
      setScanError('Invalid QR code data.');
      return;
    }

    try {
      const result = await supabaseService.handleQRCodeScan(uniqueCode);
      if (!result.success) {
        setScanError(result.message);
        return;
      }

      // Replace alert with Snackbar
      setSnackbarMessage(result.message);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      refreshData();
      setScanning(false);
    } catch (err) {
      console.error('Error handling scan:', err);
      setScanError('An unexpected error occurred.');
    }
  };

  const handleScanFailure = (error: any) => {
    console.error(error);
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const clients = await supabaseService.fetchDataControl();
      clients.sort((a, b) => Number(b.entered_at) - Number(a.entered_at));
      setData(clients);
      setSelectedClients(new Set());
    } catch (err) {
      setError('Failed to refresh data.');
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const changeState = async (action: 'present' | 'left') => {
    if (selectedClients.size === 0) return;
    setLoading(true);
    setError(null);
    try {
      await Promise.all(
        Array.from(selectedClients).map(async (phone) => {
          if (action === 'present') {
            await supabaseService.updateClientPresence(phone);
          } else if (action === 'left') {
            await supabaseService.updateClientLeft(phone);
          }
        })
      );
      refreshData();
    } catch (err) {
      setError(`Failed to update client status (${action}).`);
      console.error(`Error updating client status (${action}):`, err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessages = async () => {
    if (selectedClients.size === 0) return;
    setLoading(true);
    setError(null);
    setMessageSent(false);
    try {
      const messageData = await supabaseService.fetchDefaultMessage();
      const message =
        messageData.message ||
        'Olá, sua vez chegou, dirija-se à Sala de Oração.';

      await Promise.all(
        Array.from(selectedClients).map(async (phone) => {
          await waapi.sendMessage(phone, message);
        })
      );
      setMessageSent(true);
      setSnackbarMessage('Mensagens enviadas com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setSelectedClients(new Set());
      refreshData();
    } catch (err) {
      setError('Failed to send messages.');
      console.error('Error sending messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete Dialog Handlers
  const openDeleteDialog = (phone: string) => {
    setClientToDelete(phone);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setClientToDelete(null);
    setDeleteDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      setLoading(true);
      setError(null);
      try {
        await supabaseService.deleteClient(clientToDelete);
        setSnackbarMessage('Cliente deletado com sucesso.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        refreshData();
      } catch (err) {
        setError('Failed to delete client.');
        console.error('Error deleting client:', err);
      } finally {
        setLoading(false);
        closeDeleteDialog();
      }
    }
  };

  // Snackbar Close Handler
  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <ErrorBoundary>
      <Box
        display="flex"
        flexDirection="column"
        height="100vh"
        marginBottom="30px"
        pt={2}
        pr={2}
        pl={2}
        pb="70px"
        sx={{ bgcolor: 'background.default', color: 'text.primary' }}
      >
        {/* Header */}
        <Box display="flex" alignItems="center" mb={2}>
          <Typography p={2} variant="h5" component="h1" fontWeight="bold" flexGrow={1}>
            Controle de Sala
          </Typography>
          <IconButton
            onClick={refreshData}
            aria-label="Atualizar lista de clientes"
            size="small"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<QrCodeIcon />}
            onClick={() => setScanning(true)}
            size="small"
            sx={{ ml: 1 }}
          >
            Escanear QR
          </Button>
        </Box>

        {/* Search Bar */}
        <Box display="flex" alignItems="center" mb={1}>
          <TextField
            fullWidth
            placeholder="Pesquisar um nome..."
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} fontSize="small" />,
            }}
            size="small"
          />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert onClose={() => setError(null)} severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Scan Error Alert */}
        {scanError && (
          <Alert onClose={() => setScanError(null)} severity="error" sx={{ mb: 2 }}>
            {scanError}
          </Alert>
        )}

        {/* Client List */}
        <Box flexGrow={1} overflow="auto" borderRadius={2} border={1} borderColor="grey.300">
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress size={24} />
            </Box>
          ) : filteredData.length > 0 ? (
            <List dense>
              {filteredData.map((client) => (
                <React.Fragment key={client.phone}>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => openDeleteDialog(client.phone)}
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
                      onChange={(e) => handleSelectClient(client.phone, e.target.checked)}
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
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: client.entered_at ? 'success.main' : 'error.main',
                          width: 24,
                          height: 24,
                        }}
                      >
                        {client.entered_at ? (
                          <CheckCircleIcon fontSize="small" />
                        ) : (
                          <CancelIcon fontSize="small" />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box p={4} textAlign="center" color="text.secondary">
              Nenhuma pessoa encontrada.
            </Box>
          )}
        </Box>

        {/* Statistics */}
        <Box display="flex" justifyContent="space-between" my={1}>
          <Typography variant="body2">
            Total de Pessoas com mensagens enviadas: {data.length}
          </Typography>
          <Typography variant="body2">
            Pessoas na Sala: {data.filter((c) => c.entered_at).length}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box display="flex" gap={1} mb={1}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<CheckIcon fontSize="small" />}
            disabled={selectedClients.size === 0 || loading}
            onClick={() => changeState('present')}
            size="small"
          >
            Entrou
          </Button>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<ArrowBackIcon fontSize="small" />}
            disabled={selectedClients.size === 0 || loading}
            onClick={() => changeState('left')}
            size="small"
          >
            Saiu
          </Button>
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
          Reenviar Mensagem
        </Button>

        {/* Success Alert */}
        {messageSent && (
          <Alert
            onClose={() => setMessageSent(false)}
            severity="success"
            sx={{ mt: 1 }}
          >
            Mensagens enviadas com sucesso!
          </Alert>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza de que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog} color="primary">
              Cancelar
            </Button>
            <Button onClick={confirmDelete} color="error">
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        {/* QR Code Scanner Modal */}
        {scanning && (
          <Box
            position="fixed"
            top={0}
            left={0}
            width="100%"
            height="100%"
            bgcolor="rgba(0, 0, 0, 0.8)"
            display="flex"
            justifyContent="center"
            alignItems="center"
            zIndex={1300}
          >
            <Box position="relative" width="80%" maxWidth="400px" bgcolor="white" p={2} borderRadius={2}>
              <QrScanner
                onScanSuccess={handleScanSuccess}
                onScanFailure={handleScanFailure}
                onScanComplete={() => setScanning(false)} // Pass the new prop
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setScanning(false)}
                sx={{ position: 'absolute', top: 10, right: 10 }}
                size="small"
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        )}

        {/* Snackbar for Success and Error Messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <SnackbarAlert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </SnackbarAlert>
        </Snackbar>
      </Box>
    </ErrorBoundary>
  );
}
