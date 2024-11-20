'use client';

import React, { useState, useEffect } from 'react';
import { SupabaseService, MessageData } from '@/services/supabaseService';
import { WaAPIService } from '@/services/waapiService';

import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

import {
  Delete as DeleteIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  AddCircle as AddCircleIcon,
  PhoneForwarded as PhoneForwardedIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';

export default function SettingsPage() {
  const supabase = new SupabaseService();
  const waapi = new WaAPIService();

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<MessageData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isAddingMessage, setIsAddingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionsOpen, setSubscriptionsOpen] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogAction, setDialogAction] = useState<'open' | 'close' | null>(null);

  useEffect(() => {
    refreshMessageList();
    fetchSubscriptionStatus();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchQuery]);

  /**
   * Fetches the subscription status from Supabase and updates the state.
   */
  const fetchSubscriptionStatus = async () => {
    const status = await supabase.fetchSubscriptionStatus();
    setSubscriptionsOpen(status);
  };

  /**
   * Refreshes the list of messages from Supabase.
   */
  const refreshMessageList = async () => {
    const data = await supabase.fetchDataMessage();
    setMessages(data);
  };

  /**
   * Filters messages based on the search query.
   */
  const filterMessages = () => {
    if (searchQuery.trim()) {
      const filtered = messages.filter((msg) =>
        msg.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  };

  /**
   * Handles changes in the search input.
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Adds a new message to Supabase.
   */
  const handleAddMessage = async () => {
    if (newMessage.trim() === '') {
      alert('A mensagem não pode estar vazia.');
      return;
    }
    const success = await supabase.insertMessage(newMessage.trim());
    if (success) {
      setNewMessage('');
      setIsAddingMessage(false);
      refreshMessageList();
      setSnackbar({
        open: true,
        message: 'Mensagem adicionada com sucesso!',
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Erro ao adicionar mensagem.',
        severity: 'error',
      });
    }
  };

  /**
   * Sets a message as the default message.
   * @param messageId - The ID of the message to set as default.
   */
  const handleSetDefaultMessage = async (messageId: number) => {
    const success = await supabase.updateDefaultMessage(messageId);
    if (success) {
      refreshMessageList();
      setSnackbar({
        open: true,
        message: 'Mensagem padrão atualizada com sucesso!',
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar mensagem padrão.',
        severity: 'error',
      });
    }
  };

  /**
   * Toggles the subscription status between open and closed.
   */
  const handleToggleSubscriptions = () => {
    if (subscriptionsOpen) {
      // If subscriptions are open, confirm before closing
      setDialogAction('close');
      setDialogOpen(true);
    } else {
      // If subscriptions are closed, confirm before opening
      setDialogAction('open');
      setDialogOpen(true);
    }
  };

  /**
   * Handles the confirmation from the dialog.
   * @param confirm - Whether the user confirmed the action.
   */
  const handleDialogConfirm = async (confirm: boolean) => {
    if (confirm && dialogAction) {
      const newStatus = dialogAction === 'open';
      const success = await supabase.updateSubscriptionStatus(newStatus);
      if (success) {
        setSubscriptionsOpen(newStatus);
        setSnackbar({
          open: true,
          message:
            dialogAction === 'open'
              ? 'Inscrições abertas com sucesso!'
              : 'Inscrições encerradas com sucesso!',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message:
            dialogAction === 'open'
              ? 'Erro ao abrir inscrições.'
              : 'Erro ao encerrar inscrições.',
          severity: 'error',
        });
      }
    }
    setDialogOpen(false);
    setDialogAction(null);
  };

  /**
   * Deletes a message from Supabase.
   * @param messageId - The ID of the message to delete.
   */
  const handleDeleteMessage = async (messageId: number) => {
    const success = await supabase.deleteMessage(messageId);
    if (success) {
      refreshMessageList();
      setSnackbar({
        open: true,
        message: 'Mensagem deletada com sucesso!',
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Erro ao deletar mensagem.',
        severity: 'error',
      });
    }
  };

  /**
   * Calls support via the WA API.
   */
  const callSupport = async () => {
    const success = await waapi.callSupport();
    if (success) {
      setMessageSent(true);
    } else {
      setError('Falha ao chamar suporte.');
    }
  };

  /**
   * Closes the snackbar.
   */
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      sx={{ bgcolor: 'background.default', color: 'text.primary', p: 2, pb: '75px' }}
    >
      {/* Header Section */}
      <Box display="flex" alignItems="center" mb={2}>
        <Typography p={2} variant="h5" component="h1" fontWeight="bold" flexGrow={1}>
          Mensagens
        </Typography>
        <Button
          variant="contained"
          color={subscriptionsOpen ? 'error' : 'success'}
          startIcon={subscriptionsOpen ? <ToggleOnIcon /> : <ToggleOffIcon />}
          onClick={handleToggleSubscriptions}
          size="small"
          sx={{ mr: 1 }}
        >
          {subscriptionsOpen ? 'Encerrar' : 'Abrir'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleIcon fontSize="small" />}
          onClick={() => setIsAddingMessage(true)}
          size="small"
        >
          Adicionar
        </Button>
      </Box>

      {/* Add Message Section */}
      {isAddingMessage && (
        <Box mb={2}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Mensagem"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            variant="outlined"
            margin="normal"
            size="small"
          />
          <Box display="flex" gap={1} mt={1}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => {
                setIsAddingMessage(false);
                setNewMessage('');
              }}
              size="small"
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleAddMessage}
              size="small"
            >
              Salvar
            </Button>
          </Box>
        </Box>
      )}

      {/* Search Bar */}
      <Box mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pesquisar mensagens..."
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
        />
      </Box>

      {/* Messages List */}
      <Box
        flexGrow={1}
        overflow="auto"
        borderRadius={2}
        border={1}
        borderColor="grey.300"
      >
        {filteredMessages.length > 0 ? (
          <List dense>
            {filteredMessages.map((message) => (
              <div key={message.id}>
                <ListItem
                  secondaryAction={
                    <Box display="flex" alignItems="center">
                      {!message.default ? (
                        <IconButton
                          edge="end"
                          aria-label="definir como padrão"
                          onClick={() => handleSetDefaultMessage(message.id)}
                          size="small"
                        >
                          <StarBorderIcon fontSize="small" color="action" />
                        </IconButton>
                      ) : (
                        <StarIcon fontSize="small" color="primary" />
                      )}
                      <IconButton
                        edge="end"
                        aria-label="deletar"
                        onClick={() => handleDeleteMessage(message.id)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  }
                  sx={{ py: 0.5 }}
                >
                  <ListItemText
                    primary={message.message}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        ) : (
          <Box p={4} textAlign="center" color="text.secondary">
            Nenhuma mensagem encontrada.
          </Box>
        )}
      </Box>

      {/* Support Section */}
      <Box mt={2}>
        <Typography variant="body2" color="textSecondary">
          App desenvolvido por Wenzo Rithelly, caso aconteça algum erro, clique
          no botão abaixo.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<PhoneForwardedIcon fontSize="small" />}
          onClick={callSupport}
          size="small"
          sx={{ mt: 1 }}
        >
          Call Support
        </Button>
      </Box>

      {/* Success and Error Alerts */}
      {messageSent && (
        <Alert
          onClose={() => setMessageSent(false)}
          severity="success"
          sx={{ mt: 2 }}
        >
          Suporte chamado com sucesso!
        </Alert>
      )}

      {error && (
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ mt: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Snackbar for Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => handleDialogConfirm(false)}
      >
        <DialogTitle>
          {dialogAction === 'open' ? 'Abrir Inscrições' : 'Encerrar Inscrições'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === 'open'
              ? 'Tem certeza de que deseja abrir as inscrições?'
              : 'Tem certeza de que deseja encerrar as inscrições?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogConfirm(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={() => handleDialogConfirm(true)} color="primary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
