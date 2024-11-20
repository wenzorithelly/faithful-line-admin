'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import {
  Language as LanguageIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { RealtimeChannel } from "@supabase/supabase-js";
import supabase from "@/services/supabaseService";

export default function LandingPage() {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const [subscriptionsOpen, setSubscriptionsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Optional: For loading state

  useEffect(() => {
    // Function to fetch the initial "subscriptions" value
    const fetchInitialSubscriptionStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('configs')
          .select('subscription')
          .single();

        if (error) {
          console.error('Error fetching subscription status:', error);
          // Optionally, handle the error state here
        } else {
          setSubscriptionsOpen(data.subscription);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };

    fetchInitialSubscriptionStatus();

    // Set up the real-time listener
    const channel: RealtimeChannel = supabase
      .channel('configs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'configs',
        },
        (payload: any) => {
          handleRealtimeChange(payload);
        }
      )
      .subscribe();

    // Cleanup the channel on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handler for real-time changes
  const handleRealtimeChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      if (newRecord && typeof newRecord.subscription !== 'undefined') {
        setSubscriptionsOpen(newRecord.subscription);
      }
    } else if (eventType === 'DELETE') {
      if (oldRecord && typeof oldRecord.subscription !== 'undefined') {
        // Assuming that deletion means subscriptions are closed
        setSubscriptionsOpen(false);
      }
    }
  };

  const handleLanguageSelection = (lang: 'en' | 'pt') => {
    setLanguage(lang);
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  const navigateToCheckSpot = () => {
    router.push('/check-spot');
  };

  // Optional: Show a loading indicator while fetching initial data
  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        textAlign="center"
        p={4}
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          backgroundImage: 'url("/school_of_prophets.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold" mb={4}>
          FAITHFUL_LINE
        </Typography>
        <Typography variant="h5" component="h2" fontWeight="medium" mb={6}>
          {language === 'pt'
            ? 'Carregando...'
            : 'Loading...'}
        </Typography>
      </Box>
    );
  }

  // If language is not set, show language selection
  if (!language) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        textAlign="center"
        p={4}
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          backgroundImage: 'url("/school_of_prophets.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold" mb={4} color="white">
          <LanguageIcon fontSize="large" sx={{ mr: 1 }} />
          Escolha seu idioma / Choose your language
        </Typography>

        <Stack spacing={2} width="100%" maxWidth={300}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleLanguageSelection('pt')}
            startIcon={
              <img
                src="/images/flags/brasil.png"
                alt="Português (BR)"
                width="24"
                height="24"
              />
            }
            size="large"
            fullWidth
          >
            Português (BR)
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleLanguageSelection('en')}
            startIcon={
              <img
                src="/images/flags/EUA.png"
                alt="English"
                width="24"
                height="24"
              />
            }
            size="large"
            fullWidth
          >
            English
          </Button>
        </Stack>
      </Box>
    );
  }

  if (!subscriptionsOpen) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        textAlign="center"
        p={4}
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          backgroundImage: 'url("/school_of_prophets.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold" mb={40} color="white">
          FAITHFUL_LINE
        </Typography>

        <Typography variant="h5" component="h2" fontWeight="bold" mb={0} color="error">
          {language === 'pt'
            ? 'Cadastro para a Sala de Oração encerrado.'
            : 'Registrations for the Prayer Room are closed.'}
        </Typography>
      </Box>
    );
  }

  // Render navigation options after language selection and if subscriptions are open
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      textAlign="center"
      p={4}
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        backgroundImage: 'url("/school_of_prophets.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Typography variant="h4" component="h1" fontWeight="bold" mb={10} color="white">
        FAITHFUL_LINE
      </Typography>
      <Typography variant="h5" component="h2" fontWeight="medium" pt={44} mb={6} color="white">
        {language === 'pt'
          ? 'Bem-vindo à Fila Digital da Sala de Oração'
          : 'Welcome to the Digital Line of the Prayer Room'}
      </Typography>
      <Stack spacing={2} width="100%" maxWidth={400} mt={-2}>
        <Button
          variant="contained"
          color="primary"
          onClick={navigateToRegister}
          size="large"
          fullWidth
          startIcon={<PersonAddIcon />}
        >
          {language === 'pt' ? 'Registrar-se' : 'Register'}
        </Button>
        <Button
          variant="contained"
          onClick={navigateToCheckSpot}
          size="large"
          color="secondary"
          fullWidth
          startIcon={<CheckCircleIcon />}
        >
          {language === 'pt'
            ? 'Verificar Minha Posição'
            : 'Check My Spot'}
        </Button>
      </Stack>
    </Box>
  );
}
