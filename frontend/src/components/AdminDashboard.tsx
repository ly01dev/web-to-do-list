import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Badge,
  Form,
  Modal,
  Alert,
  Spinner,
  ProgressBar,
  InputGroup
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';
import type { User, Todo } from '../types';
import toast from 'react-hot-toast';

interface DashboardStats {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    regularUsers: number;
  };
  todoStats: {
    totalTodos: number;
    completedTodos: number;
    pendingTodos: number;
  };
  recentUsers: User[];
  recentTodos: Todo[];
  usersByRole: Array<{ _id: string; count: number }>;
  todosByPriority: Array<{ _id: string; count: number }>;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    role: 'user',
    isActive: true,
    firstName: '',
    lastName: ''
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (activeTab === 'overview') {
      loadDashboardData();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, currentPage, searchTerm]);

  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true);
      const response = await adminApi.getDashboard();
      if (response.success && response.data) {
        setStats(response.data as DashboardStats);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await adminApi.updateUser(selectedUser._id, {
        role: userForm.role as 'user' | 'admin',
        isActive: userForm.isActive,
        profile: {
          firstName: userForm.firstName,
          lastName: userForm.lastName
        }
      });
      
      if (response.success && response.data) {
        setUsers(users.map(u => u._id === selectedUser._id ? response.data! : u));
        setShowUserModal(false);
        setSelectedUser(null);
        toast.success('Đã cập nhật người dùng!');
        loadDashboardData(); // Refresh dashboard stats
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Không thể cập nhật người dùng');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?._id) {
      toast.error('Không thể xóa tài khoản của chính mình!');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Tất cả todo của họ cũng sẽ bị xóa.')) {
      try {
        const response = await adminApi.deleteUser(userId);
        if (response.success) {
          setUsers(users.filter(u => u._id !== userId));
          toast.success('Đã xóa người dùng!');
          loadDashboardData(); // Refresh dashboard stats
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Không thể xóa người dùng');
      }
    }
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive !== false, // Default to true if not set
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || ''
    });
    setShowUserModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Admin Dashboard</h1>
              <p className="text-muted mb-0">
                Quản lý hệ thống và người dùng
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Navigation Tabs */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex gap-2">
            <Button 
              variant={activeTab === 'overview' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-chart-line me-2"></i>
              Tổng quan
            </Button>
            <Button 
              variant={activeTab === 'users' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('users')}
            >
              <i className="fas fa-users me-2"></i>
              Quản lý người dùng
            </Button>
          </div>
        </Col>
      </Row>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {dashboardLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Đang tải dữ liệu dashboard...</p>
            </div>
          ) : stats ? (
            <>
              {/* Statistics Cards */}
              <Row className="mb-4">
                <Col md={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-center mb-2">
                        <i className="fas fa-users fa-2x text-primary"></i>
                      </div>
                      <h3 className="text-primary mb-1">{stats.userStats.totalUsers}</h3>
                      <p className="text-muted mb-0">Tổng số người dùng</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-center mb-2">
                        <i className="fas fa-user-check fa-2x text-success"></i>
                      </div>
                      <h3 className="text-success mb-1">{stats.userStats.activeUsers}</h3>
                      <p className="text-muted mb-0">Người dùng hoạt động</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-center mb-2">
                        <i className="fas fa-tasks fa-2x text-info"></i>
                      </div>
                      <h3 className="text-info mb-1">{stats.todoStats.totalTodos}</h3>
                      <p className="text-muted mb-0">Tổng số công việc</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-center mb-2">
                        <i className="fas fa-check-circle fa-2x text-warning"></i>
                      </div>
                      <h3 className="text-warning mb-1">{stats.todoStats.completedTodos}</h3>
                      <p className="text-muted mb-0">Công việc hoàn thành</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                {/* Recent Users */}
                <Col lg={6} className="mb-4">
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">
                        <i className="fas fa-user-clock me-2"></i>
                        Người dùng gần đây
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      {stats.recentUsers.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {stats.recentUsers.map((user) => (
                            <div key={user._id} className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                              <div>
                                <div className="fw-semibold">{user.username}</div>
                                <small className="text-muted">{user.email}</small>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                                  {user.role === 'admin' ? 'Admin' : 'User'}
                                </Badge>
                                <Badge bg={user.isActive !== false ? 'success' : 'secondary'}>
                                  {user.isActive !== false ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted text-center">Chưa có người dùng nào</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                {/* Recent Todos */}
                <Col lg={6} className="mb-4">
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">
                        <i className="fas fa-clipboard-list me-2"></i>
                        Công việc gần đây
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      {stats.recentTodos.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {stats.recentTodos.map((todo) => (
                            <div key={todo._id} className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                              <div>
                                <div className={`fw-semibold ${todo.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                                  {todo.title}
                                </div>
                                <small className="text-muted">
                                  <i className="fas fa-user me-1"></i>
                                  {typeof todo.user === 'object' ? todo.user.username : todo.user}
                                </small>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <Badge bg={getPriorityColor(todo.priority)}>
                                  {getPriorityText(todo.priority)}
                                </Badge>
                                <Badge bg={todo.completed ? 'success' : 'secondary'}>
                                  {todo.completed ? 'Hoàn thành' : 'Đang làm'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted text-center">Chưa có công việc nào</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                {/* Users by Role */}
                <Col lg={6} className="mb-4">
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">
                        <i className="fas fa-chart-pie me-2"></i>
                        Phân bố người dùng theo vai trò
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      {stats.usersByRole.map((role) => (
                        <div key={role._id} className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold">
                            {role._id === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                          </span>
                          <div className="d-flex align-items-center gap-2">
                            <ProgressBar 
                              now={(role.count / stats.userStats.totalUsers) * 100} 
                              style={{ width: '100px' }}
                              variant={role._id === 'admin' ? 'danger' : 'primary'}
                            />
                            <span className="fw-bold">{role.count}</span>
                          </div>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </Col>

                {/* Todos by Priority */}
                <Col lg={6} className="mb-4">
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">
                        <i className="fas fa-chart-bar me-2"></i>
                        Phân bố công việc theo độ ưu tiên
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      {stats.todosByPriority.map((priority) => (
                        <div key={priority._id} className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold">
                            {getPriorityText(priority._id)}
                          </span>
                          <div className="d-flex align-items-center gap-2">
                            <ProgressBar 
                              now={(priority.count / stats.todoStats.totalTodos) * 100} 
                              style={{ width: '100px' }}
                              variant={getPriorityColor(priority._id)}
                            />
                            <span className="fw-bold">{priority.count}</span>
                          </div>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Alert variant="warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Không thể tải dữ liệu dashboard
            </Alert>
          )}
        </>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <>
          {/* Search and Filters */}
          <Row className="mb-4">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="fas fa-search"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Tìm kiếm người dùng..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                    </Col>
                    <Col md={6} className="d-flex justify-content-end">
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-secondary"
                          onClick={() => {
                            setSearchTerm('');
                            setCurrentPage(1);
                          }}
                        >
                          <i className="fas fa-refresh me-1"></i>
                          Làm mới
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Users Table */}
          <Row>
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-users me-2"></i>
                    Quản lý người dùng
                  </h5>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Đang tải danh sách người dùng...</p>
                    </div>
                  ) : (
                    <>
                      <Table responsive striped hover>
                        <thead>
                          <tr>
                            <th>Người dùng</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Ngày tham gia</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr key={u._id}>
                              <td>
                                <div>
                                  <strong>{u.username}</strong>
                                  {u.profile?.firstName && u.profile?.lastName && (
                                    <div className="text-muted small">
                                      {u.profile.firstName} {u.profile.lastName}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>{u.email}</td>
                              <td>
                                <Badge bg={u.role === 'admin' ? 'danger' : 'primary'}>
                                  {u.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                                </Badge>
                              </td>
                              <td>
                                <Badge bg={u.isActive !== false ? 'success' : 'secondary'}>
                                  {u.isActive !== false ? 'Hoạt động' : 'Không hoạt động'}
                                </Badge>
                              </td>
                              <td>
                                {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => openUserModal(u)}
                                    title="Sửa"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </Button>
                                  {u._id !== (user && user._id) && (
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleDeleteUser(u._id)}
                                      title="Xóa"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(currentPage - 1)}
                            >
                              <i className="fas fa-chevron-left"></i>
                            </Button>
                            <span className="px-3 py-2">
                              Trang {currentPage} / {totalPages}
                            </span>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(currentPage + 1)}
                            >
                              <i className="fas fa-chevron-right"></i>
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Edit User Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sửa thông tin người dùng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên đăng nhập</Form.Label>
              <Form.Control
                type="text"
                value={userForm.username}
                disabled
                className="bg-light"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={userForm.email}
                disabled
                className="bg-light"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ</Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                    placeholder="Nhập họ"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên</Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                    placeholder="Nhập tên"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Vai trò</Form.Label>
              <Form.Select
                value={userForm.role}
                onChange={(e) => setUserForm({...userForm, role: e.target.value as 'user' | 'admin'})}
              >
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Tài khoản hoạt động"
                checked={userForm.isActive}
                onChange={(e) => setUserForm({...userForm, isActive: e.target.checked})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdateUser}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard; 