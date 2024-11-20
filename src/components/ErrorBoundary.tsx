import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an external service if needed
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100vh"
          textAlign="center"
          p={2}
        >
          <Typography variant="h5" gutterBottom>
            Oops! Algo deu errado.
          </Typography>
          <Typography variant="body1" gutterBottom>
            {this.state.error?.message || 'Um erro desconhecido ocorreu.'}
          </Typography>
          {this.state.error?.stack && (
            <Typography variant="body2" gutterBottom sx={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
              {this.state.error.stack}
            </Typography>
          )}
          <Button variant="contained" color="primary" onClick={this.handleReload}>
            Recarregar Página
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
