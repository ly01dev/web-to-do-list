import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const LoadingSpinner: React.FC = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Đang tải...</p>
      </div>
    </Container>
  );
};

export default LoadingSpinner; 