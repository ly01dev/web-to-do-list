// Script khởi tạo MongoDB cho TodoList app
db = db.getSiblingDB('todolist');

// Tạo user cho ứng dụng
db.createUser({
  user: 'todolist_user',
  pwd: 'todolist_password',
  roles: [
    {
      role: 'readWrite',
      db: 'todolist'
    }
  ]
});

// Tạo collections
db.createCollection('users');
db.createCollection('todos');

// Tạo indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.todos.createIndex({ "userId": 1 });
db.todos.createIndex({ "createdAt": -1 });

print('MongoDB initialized successfully for TodoList app'); 