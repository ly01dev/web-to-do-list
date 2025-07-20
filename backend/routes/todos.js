const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');
const { validateTodo } = require('../middleware/validation');

// Get all todos for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: todos
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể tải danh sách todo'
    });
  }
});

// Get public todos
router.get('/public', async (req, res) => {
  try {
    const todos = await Todo.find({ isPublic: true })
      .populate('user', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({
      success: true,
      data: todos
    });
  } catch (error) {
    console.error('Error fetching public todos:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể tải danh sách todo công khai'
    });
  }
});

// Get a single todo
router.get('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy todo'
      });
    }

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể tải todo'
    });
  }
});

// Create a new todo
router.post('/', auth, ...validateTodo, async (req, res) => {
  try {
    console.log('Creating todo - User:', req.user);
    console.log('Request body:', req.body);
    
    const { title, description, priority, isPublic, startDate, dueDate } = req.body;

    // Check if user exists and is active
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: 'Vui lòng đăng nhập để tạo todo'
      });
    }

<<<<<<< HEAD
    // Convert datetime strings to proper Date objects with timezone handling
    const processDateTime = (dateString) => {
      if (!dateString) return null;
      
      // If it's already an ISO string, use it directly
      if (dateString.includes('T') && dateString.includes('Z')) {
        return new Date(dateString);
      }
      
      // If it's a local datetime string (YYYY-MM-DDTHH:mm), convert to UTC
      if (dateString.includes('T') && !dateString.includes('Z')) {
        const localDate = new Date(dateString);
        return localDate;
      }
      
      // Fallback to direct conversion
      return new Date(dateString);
    };

=======
>>>>>>> e874cdcc9405843dab5928507c5b1075b8f0497c
    const todo = new Todo({
      title,
      description,
      priority: priority || 'medium',
      isPublic: isPublic || false,
<<<<<<< HEAD
      startDate: processDateTime(startDate),
      dueDate: processDateTime(dueDate),
=======
      startDate: startDate || null,
      dueDate: dueDate || null,
>>>>>>> e874cdcc9405843dab5928507c5b1075b8f0497c
      user: req.user._id // Use _id instead of id
    });

    const savedTodo = await todo.save();
    
    res.status(201).json({
      success: true,
      data: savedTodo,
      message: 'Todo đã được tạo thành công'
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: validationErrors[0] || 'Dữ liệu không hợp lệ'
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Todo này đã tồn tại'
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra khi tạo todo. Vui lòng thử lại sau.'
    });
  }
});

// Update a todo
router.put('/:id', auth, ...validateTodo, async (req, res) => {
  try {
    const { title, description, priority, isPublic, startDate, dueDate } = req.body;

    const todo = await Todo.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy todo'
      });
    }

<<<<<<< HEAD
    // Convert datetime strings to proper Date objects with timezone handling
    const processDateTime = (dateString) => {
      if (!dateString) return null;
      
      // If it's already an ISO string, use it directly
      if (dateString.includes('T') && dateString.includes('Z')) {
        return new Date(dateString);
      }
      
      // If it's a local datetime string (YYYY-MM-DDTHH:mm), convert to UTC
      if (dateString.includes('T') && !dateString.includes('Z')) {
        const localDate = new Date(dateString);
        return localDate;
      }
      
      // Fallback to direct conversion
      return new Date(dateString);
    };

=======
>>>>>>> e874cdcc9405843dab5928507c5b1075b8f0497c
    // Update fields
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (priority !== undefined) todo.priority = priority;
    if (isPublic !== undefined) todo.isPublic = isPublic;
<<<<<<< HEAD
    if (startDate !== undefined) todo.startDate = processDateTime(startDate);
    if (dueDate !== undefined) todo.dueDate = processDateTime(dueDate);
=======
    if (startDate !== undefined) todo.startDate = startDate || null;
    if (dueDate !== undefined) todo.dueDate = dueDate || null;
>>>>>>> e874cdcc9405843dab5928507c5b1075b8f0497c

    const updatedTodo = await todo.save();
    
    res.json({
      success: true,
      data: updatedTodo,
      message: 'Todo đã được cập nhật thành công'
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể cập nhật todo'
    });
  }
});

// Toggle todo completion status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy todo'
      });
    }

    todo.completed = !todo.completed;
    const updatedTodo = await todo.save();
    
    res.json({
      success: true,
      data: updatedTodo,
      message: `Todo đã được ${updatedTodo.completed ? 'hoàn thành' : 'mở lại'}`
    });
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể cập nhật trạng thái todo'
    });
  }
});

// Delete a todo
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy todo'
      });
    }

    res.json({
      success: true,
      message: 'Todo đã được xóa thành công'
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể xóa todo'
    });
  }
});

// Get todos by priority
router.get('/priority/:priority', auth, async (req, res) => {
  try {
    const { priority } = req.params;
    
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Độ ưu tiên không hợp lệ'
      });
    }

    const todos = await Todo.find({ 
      user: req.user._id, 
      priority 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: todos
    });
  } catch (error) {
    console.error('Error fetching todos by priority:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể tải danh sách todo theo độ ưu tiên'
    });
  }
});

// Get completed/incomplete todos
router.get('/status/:status', auth, async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['completed', 'incomplete'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Trạng thái không hợp lệ'
      });
    }

    const completed = status === 'completed';
    const todos = await Todo.find({ 
      user: req.user._id, 
      completed 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: todos
    });
  } catch (error) {
    console.error('Error fetching todos by status:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể tải danh sách todo theo trạng thái'
    });
  }
});

module.exports = router; 