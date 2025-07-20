import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AppNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <Navbar 
      expand="lg" 
      className="py-3"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-white">
          📝 TodoList App
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`text-white ${location.pathname === '/' ? 'fw-bold' : ''}`}
              style={{ opacity: location.pathname === '/' ? 1 : 0.8 }}
            >
              Trang chủ
            </Nav.Link>
            {user && (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/dashboard" 
                  className={`text-white ${location.pathname === '/dashboard' ? 'fw-bold' : ''}`}
                  style={{ opacity: location.pathname === '/dashboard' ? 1 : 0.8 }}
                >
                  Dashboard
                </Nav.Link>
                {user.role === 'admin' && (
                  <Nav.Link 
                    as={Link} 
                    to="/admin" 
                    className={`text-white ${location.pathname === '/admin' ? 'fw-bold' : ''}`}
                    style={{ opacity: location.pathname === '/admin' ? 1 : 0.8 }}
                  >
                    Admin Panel
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          
          <Nav className="ms-auto">
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <span className="text-white fw-semibold">
                  Chào bạn, <span className="fw-bold">{user.profile?.firstName || user.username}</span>! 👋
                </span>
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={handleLogout}
                  className="fw-semibold"
                >
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Button 
                  as={Link as any} 
                  to="/login" 
                  variant="outline-light"
                  className={`fw-semibold ${isAuthPage ? 'd-none' : ''}`}
                >
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Đăng nhập
                </Button>
                <Button 
                  as={Link as any} 
                  to="/register" 
                  variant="light"
                  className={`fw-semibold ${isAuthPage ? 'd-none' : ''}`}
                  style={{ color: '#667eea' }}
                >
                  <i className="fas fa-user-plus me-1"></i>
                  Đăng ký
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar; 