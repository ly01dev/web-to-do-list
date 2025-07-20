import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { todoApi } from '../services/api';
import type { Todo, CreateTodoData } from '../types';
import { formatDateForDisplay, formatDateForInput, convertLocalToUTC } from '../utils/dateUtils';
import toast from 'react-hot-toast';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
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
      }
    } catch (error) {
      console.error('Error loading todos:', error);
      toast.error('Không thể tải danh sách todo');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề todo');
      return;
    }

    try {
      // Convert local datetime to UTC before sending to backend
      const todoData = {
        ...newTodo,
        startDate: newTodo.startDate ? convertLocalToUTC(newTodo.startDate) : undefined,
        dueDate: newTodo.dueDate ? convertLocalToUTC(newTodo.dueDate) : undefined
      };

      const response = await todoApi.create(todoData);
      if (response.success && response.data) {
        setTodos([response.data!, ...todos]);
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
      // Convert local datetime to UTC before sending to backend
      const todoData = {
        title: editingTodo.title,
        description: editingTodo.description,
        priority: editingTodo.priority,
        isPublic: editingTodo.isPublic,
        startDate: editingTodo.startDate ? convertLocalToUTC(editingTodo.startDate) : undefined,
        dueDate: editingTodo.dueDate ? convertLocalToUTC(editingTodo.dueDate) : undefined
      };

      const response = await todoApi.update(editingTodo._id, todoData);
      if (response.success && response.data) {
        setTodos(todos.map(todo => 
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
        setTodos(todos.map(todo => 
          todo._id === id ? response.data! : todo
        ));
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
        setTodos(todos.filter(todo => todo._id !== id));
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

  // const requireAuth = () => {
  //   if (!user) {
  //     setShowLoginModal(true);
  //   }
  // };

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

  // Use utility functions for date formatting
  const formatDate = formatDateForDisplay;
  const formatDateTimeForInput = formatDateForInput;

  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto text-center">
          <h1 className="display-4 fw-bold mb-4">
            Quản lý công việc hiệu quả với TodoList
          </h1>
          <p className="lead mb-4">
            Tạo, theo dõi và hoàn thành các công việc của bạn một cách dễ dàng và có tổ chức.
            Hệ thống đơn giản, an toàn và miễn phí.
          </p>
          {!user && (
            <div className="d-flex gap-3 justify-content-center">
              <Button size="lg" variant="primary" onClick={() => navigate('/register')}>
                Bắt đầu miễn phí
              </Button>
              <Button size="lg" variant="outline-primary" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* Todo List Section */}
      <Row>
        <Col lg={10} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">📝 Danh sách công việc</h4>
                {user && (
                  <Button 
                    variant="light" 
                    size="sm"
                    onClick={() => setShowAddModal(true)}
                  >
                    + Thêm Todo
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {!user ? (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="fas fa-lock fa-3x text-muted"></i>
                  </div>
                  <h5>Vui lòng đăng nhập để sử dụng</h5>
                  <p className="text-muted mb-4">
                    Bạn cần đăng nhập hoặc đăng ký để tạo và quản lý danh sách công việc của mình.
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button variant="primary" onClick={() => navigate('/login')}>
                      Đăng nhập
                    </Button>
                    <Button variant="outline-primary" onClick={() => navigate('/register')}>
                      Đăng ký
                    </Button>
                  </div>
                </div>
              ) : loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-2">Đang tải danh sách...</p>
                </div>
              ) : todos.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="fas fa-clipboard-list fa-3x text-muted"></i>
                  </div>
                  <h5>Chưa có công việc nào</h5>
                  <p className="text-muted mb-4">
                    Bắt đầu bằng cách thêm công việc đầu tiên của bạn!
                  </p>
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

      {/* Login Required Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Đăng nhập cần thiết</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn cần đăng nhập để sử dụng tính năng này.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Đăng nhập
          </Button>
        </Modal.Footer>
      </Modal>

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
                      value={editingTodo.startDate ? formatDateTimeForInput(editingTodo.startDate) : ''}
                      onChange={(e) => setEditingTodo({...editingTodo, startDate: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thời gian dự kiến hoàn thành</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={editingTodo.dueDate ? formatDateTimeForInput(editingTodo.dueDate) : ''}
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

export default HomePage; 