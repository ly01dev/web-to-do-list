import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row className="text-center">
          <Col>
            <p className="mb-0">
              © {currentYear} TodoList App. Được phát triển với ❤️ bằng React & Node.js Bởi ThanhLy
            </p>
            <small className="text-muted">
              Quản lý công việc hiệu quả, đơn giản và an toàn
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default AppFooter; 