import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Nav, 
  Tab, 
  Form, 
  Spinner,
  Badge,
  ProgressBar,
  Modal
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { todoApi } from '../services/api';
import type { Todo, CreateTodoData } from '../types';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('todos');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTodo, setNewTodo] = useState<CreateTodoData>({
    title: '',
    description: '',
    priority: 'medium',
    isPublic: false,
    startDate: '',
    dueDate: ''
  });
  const [profileForm, setProfileForm] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (activeTab === 'todos') {
      loadTodos();
    }
  }, [activeTab]);

  // Load todos when user is authenticated
  useEffect(() => {
    if (user && activeTab === 'todos') {
      loadTodos();
    }
  }, [user, activeTab]);

  // Load todos on component mount if user is authenticated
  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await todoApi.getAll();
      if (response.success && response.data) {
        setTodos(response.data);
        calculateStats(response.data);
      } else {
        toast.error('Không thể tải dữ liệu: ' + (response.error || 'Lỗi không xác định'));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Không thể tải danh sách todo';
      toast.error(errorMessage);
      
      // If it's a token error, suggest re-login
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login';
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (todoList: Todo[]) => {
    const total = todoList.length;
    const completed = todoList.filter(todo => todo.completed).length;
    const pending = total - completed;
    const highPriority = todoList.filter(todo => todo.priority === 'high').length;
    const mediumPriority = todoList.filter(todo => todo.priority === 'medium').length;
    const lowPriority = todoList.filter(todo => todo.priority === 'low').length;

    setStats({
      total,
      completed,
      pending,
      highPriority,
      mediumPriority,
      lowPriority
    });
  };

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề todo');
      return;
    }

    try {
      const response = await todoApi.create(newTodo);
      if (response.success && response.data) {
        setTodos([response.data, ...todos]);
        calculateStats([response.data, ...todos]);
        setShowAddModal(false);
        setNewTodo({ 
          title: '', 
          description: '', 
          priority: 'medium', 
          isPublic: false,
          startDate: '',
          dueDate: ''
        });
        toast.success('Đã thêm todo mới!');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      toast.error('Không thể tạo todo');
    }
  };

  const handleEditTodo = async () => {
    if (!editingTodo || !editingTodo.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề todo');
      return;
    }

    try {
      const response = await todoApi.update(editingTodo._id, {
        title: editingTodo.title,
        description: editingTodo.description,
        priority: editingTodo.priority,
        isPublic: editingTodo.isPublic,
        startDate: editingTodo.startDate,
        dueDate: editingTodo.dueDate
      });
      if (response.success && response.data) {
        setTodos(todos.map(todo => 
          todo._id === editingTodo._id ? response.data! : todo
        ));
        calculateStats(todos.map(todo => 
          todo._id === editingTodo._id ? response.data! : todo
        ));
        setShowEditModal(false);
        setEditingTodo(null);
        toast.success('Đã cập nhật todo!');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error('Không thể cập nhật todo');
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      const response = await todoApi.toggle(id);
      if (response.success && response.data) {
        const updatedTodos = todos.map(todo => 
          todo._id === id ? response.data! : todo
        );
        setTodos(updatedTodos);
        calculateStats(updatedTodos);
        toast.success(response.data.completed ? 'Đã hoàn thành!' : 'Đã mở lại!');
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await todoApi.delete(id);
      if (response.success) {
        const updatedTodos = todos.filter(todo => todo._id !== id);
        setTodos(updatedTodos);
        calculateStats(updatedTodos);
        toast.success('Đã xóa todo!');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Không thể xóa todo');
    }
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo({ ...todo });
    setShowEditModal(true);
  };

  const handleUpdateProfile = async () => {
    try {
      setSavingProfile(true);
      // Giả lập API call - trong thực tế sẽ gọi API update profile
      const updatedUser = {
        ...user!,
        profile: {
          firstName: profileForm.firstName,
          lastName: profileForm.lastName
        }
      };
      updateUser(updatedUser);
      toast.success('Đã cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Không thể cập nhật hồ sơ');
    } finally {
      setSavingProfile(false);
    }
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTabChange = (tabKey: string | null) => {
    const newTab = tabKey || 'todos';
    setActiveTab(newTab);
    
    // Load todos when switching to todos tab
    if (newTab === 'todos' && user) {
      loadTodos();
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Dashboard</h1>
              <p className="text-muted mb-0">
                Chào mừng trở lại, <strong>{user?.profile?.firstName || user?.username}</strong>!
              </p>
            </div>
            {user?.role === 'admin' && (
              <Button 
                variant="outline-primary" 
                onClick={() => window.location.href = '/admin'}
              >
                <i className="fas fa-cog me-2"></i>
                Admin Panel
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Navigation Tabs */}
      <Row className="mb-4">
        <Col>
          <Nav variant="tabs" activeKey={activeTab} onSelect={handleTabChange}>
            <Nav.Item>
              <Nav.Link eventKey="todos">
                <i className="fas fa-tasks me-2"></i>
                Todo List
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="stats">
                <i className="fas fa-chart-bar me-2"></i>
                Thống kê
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="profile">
                <i className="fas fa-user me-2"></i>
                Hồ sơ cá nhân
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
      </Row>

      {/* Tab Content */}
      <Tab.Content>
        {/* Todo List Tab */}
        <Tab.Pane active={activeTab === 'todos'}>
          <Row>
            <Col>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Danh sách công việc</h5>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={loadTodos}
                      disabled={loading}
                    >
                      <i className="fas fa-sync me-1"></i>
                      {loading ? 'Đang tải...' : 'Tải lại'}
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => setShowAddModal(true)}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Thêm Todo
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Đang tải danh sách...</p>
                    </div>
                  ) : todos.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                      <h5>Chưa có công việc nào</h5>
                      <p className="text-muted">Bắt đầu bằng cách thêm công việc đầu tiên của bạn!</p>
                      <Button variant="primary" onClick={() => setShowAddModal(true)}>
                        Thêm Todo đầu tiên
                      </Button>
                    </div>
                  ) : (
                    <div className="todo-list">
                      {todos.map((todo) => (
                        <div 
                          key={todo._id} 
                          className={`todo-item p-3 border rounded mb-3 ${todo.completed ? 'bg-light' : ''}`}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <Form.Check
                                  type="checkbox"
                                  checked={todo.completed}
                                  onChange={() => handleToggleTodo(todo._id)}
                                  className="me-2"
                                />
                                <h6 className={`mb-0 ${todo.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                                  {todo.title}
                                </h6>
                                <Badge bg={getPriorityColor(todo.priority)}>
                                  {getPriorityText(todo.priority)}
                                </Badge>
                                {todo.isPublic && (
                                  <Badge bg="info">Công khai</Badge>
                                )}
                              </div>
                              {todo.description && (
                                <p className={`text-muted mb-2 ${todo.completed ? 'text-decoration-line-through' : ''}`}>
                                  {todo.description}
                                </p>
                              )}
                              <div className="d-flex gap-4 text-muted small">
                                {todo.startDate && (
                                  <span>
                                    <i className="fas fa-play me-1"></i>
                                    Bắt đầu: {formatDate(todo.startDate)}
                                  </span>
                                )}
                                {todo.dueDate && (
                                  <span>
                                    <i className="fas fa-flag-checkered me-1"></i>
                                    Dự kiến: {formatDate(todo.dueDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="d-flex gap-1">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => openEditModal(todo)}
                                title="Sửa"
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDeleteTodo(todo._id)}
                                title="Xóa"
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab.Pane>

        {/* Statistics Tab */}
        <Tab.Pane active={activeTab === 'stats'}>
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Thống kê tổng quan</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6} className="mb-3">
                      <div className="text-center p-3 border rounded">
                        <h3 className="text-primary mb-1">{stats.total}</h3>
                        <p className="text-muted mb-0">Tổng số công việc</p>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="text-center p-3 border rounded">
                        <h3 className="text-success mb-1">{stats.completed}</h3>
                        <p className="text-muted mb-0">Đã hoàn thành</p>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="text-center p-3 border rounded">
                        <h3 className="text-warning mb-1">{stats.pending}</h3>
                        <p className="text-muted mb-0">Đang thực hiện</p>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="text-center p-3 border rounded">
                        <h3 className="text-info mb-1">
                          {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </h3>
                        <p className="text-muted mb-0">Tỷ lệ hoàn thành</p>
                      </div>
                    </Col>
                  </Row>

                  <hr />

                  <h6>Tiến độ hoàn thành</h6>
                  <ProgressBar 
                    now={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} 
                    className="mb-3"
                    variant="success"
                  />

                  <h6>Phân bố theo độ ưu tiên</h6>
                  <Row>
                    <Col md={4} className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>Ưu tiên cao</span>
                        <Badge bg="danger">{stats.highPriority}</Badge>
                      </div>
                    </Col>
                    <Col md={4} className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>Ưu tiên trung bình</span>
                        <Badge bg="warning">{stats.mediumPriority}</Badge>
                      </div>
                    </Col>
                    <Col md={4} className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>Ưu tiên thấp</span>
                        <Badge bg="success">{stats.lowPriority}</Badge>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Công việc gần đây</h5>
                </Card.Header>
                <Card.Body>
                  {todos.slice(0, 5).map((todo) => (
                    <div key={todo._id} className="d-flex justify-content-between align-items-center mb-2">
                      <div className="flex-grow-1">
                        <div className={`${todo.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                          {todo.title}
                        </div>
                        <small className="text-muted">
                          {new Date(todo.createdAt).toLocaleDateString('vi-VN')}
                        </small>
                      </div>
                      <Badge bg={getPriorityColor(todo.priority)}>
                        {getPriorityText(todo.priority)}
                      </Badge>
                    </div>
                  ))}
                  {todos.length === 0 && (
                    <p className="text-muted text-center">Chưa có công việc nào</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab.Pane>

        {/* Profile Tab */}
        <Tab.Pane active={activeTab === 'profile'}>
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Thông tin cá nhân</h5>
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tên đăng nhập</Form.Label>
                          <Form.Control
                            type="text"
                            value={user?.username || ''}
                            disabled
                            className="bg-light"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="bg-light"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Họ</Form.Label>
                          <Form.Control
                            type="text"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                            placeholder="Nhập họ"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tên</Form.Label>
                          <Form.Control
                            type="text"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                            placeholder="Nhập tên"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Vai trò</Form.Label>
                          <Form.Control
                            type="text"
                            value={user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                            disabled
                            className="bg-light"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Ngày tham gia</Form.Label>
                          <Form.Control
                            type="text"
                            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : ''}
                            disabled
                            className="bg-light"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex gap-2">
                      <Button 
                        variant="primary" 
                        onClick={handleUpdateProfile}
                        disabled={savingProfile}
                      >
                        {savingProfile ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Lưu thay đổi
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline-secondary"
                        onClick={() => setProfileForm({
                          firstName: user?.profile?.firstName || '',
                          lastName: user?.profile?.lastName || ''
                        })}
                      >
                        <i className="fas fa-undo me-2"></i>
                        Khôi phục
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Thông tin tài khoản</h5>
                </Card.Header>
                <Card.Body>
                  <div className="text-center mb-3">
                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                      <i className="fas fa-user fa-2x"></i>
                    </div>
                  </div>
                  
                  <div className="text-center mb-3">
                    <h5 className="mb-1">
                      {user?.profile?.firstName && user?.profile?.lastName 
                        ? `${user.profile.firstName} ${user.profile.lastName}`
                        : user?.username
                      }
                    </h5>
                    <p className="text-muted mb-0">{user?.email}</p>
                  </div>

                  <hr />

                  <div className="text-center">
                    <p className="text-muted mb-0">
                      <small>Thành viên từ {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</small>
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab.Pane>
      </Tab.Content>

      {/* Add Todo Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thêm công việc mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề *</Form.Label>
              <Form.Control
                type="text"
                value={newTodo.title}
                onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                placeholder="Nhập tiêu đề công việc"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTodo.description}
                onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                placeholder="Nhập mô tả (tùy chọn)"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian bắt đầu</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={newTodo.startDate}
                    onChange={(e) => setNewTodo({...newTodo, startDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian dự kiến hoàn thành</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Độ ưu tiên</Form.Label>
              <Form.Select
                value={newTodo.priority}
                onChange={(e) => setNewTodo({...newTodo, priority: e.target.value as any})}
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Công khai (cho phép người khác xem)"
                checked={newTodo.isPublic}
                onChange={(e) => setNewTodo({...newTodo, isPublic: e.target.checked})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddTodo}>
            Thêm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Todo Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Sửa công việc</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingTodo && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề *</Form.Label>
                <Form.Control
                  type="text"
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})}
                  placeholder="Nhập tiêu đề công việc"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editingTodo.description}
                  onChange={(e) => setEditingTodo({...editingTodo, description: e.target.value})}
                  placeholder="Nhập mô tả (tùy chọn)"
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thời gian bắt đầu</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={editingTodo.startDate ? editingTodo.startDate.slice(0, 16) : ''}
                      onChange={(e) => setEditingTodo({...editingTodo, startDate: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thời gian dự kiến hoàn thành</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={editingTodo.dueDate ? editingTodo.dueDate.slice(0, 16) : ''}
                      onChange={(e) => setEditingTodo({...editingTodo, dueDate: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Độ ưu tiên</Form.Label>
                <Form.Select
                  value={editingTodo.priority}
                  onChange={(e) => setEditingTodo({...editingTodo, priority: e.target.value as any})}
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Công khai (cho phép người khác xem)"
                  checked={editingTodo.isPublic}
                  onChange={(e) => setEditingTodo({...editingTodo, isPublic: e.target.checked})}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleEditTodo}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard; 