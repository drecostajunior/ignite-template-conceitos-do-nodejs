const express = require('express');
const cors = require('cors');
const {
  v4: uuidv4
} = require('uuid');

const app = express();
app.use(express.json());

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {
    username
  } = request.headers;

  const user = users.find((element) => {
    return element.username === username;
  });
  if (!user) return response.status(404).json({
    error: 'user not found'
  });

  request.user = user;

  next();
}

const getTodoByID = (request, response, next) => {
  const {
    user
  } = request;
  const {
    id
  } = request.params;

  const current_todo = user.todos.find((element) => {
    return element.id === id;
  });
  if (current_todo === undefined) return response.status(404).json({
    error: 'todo not found'
  })

  request.todo = current_todo;

  next();
}

app.post('/users', (request, response) => {
  const {
    name,
    username
  } = request.body;

  const existsUsernameCheck = users.some((element) => {
    return element.username === username;
  });
  if (existsUsernameCheck) return response.status(400).json({
    error: 'user already exists'
  });

  const new_user = {
    id: uuidv4(), // precisa ser um uuid
    name,
    username,
    todos: []
  }

  users.push(new_user);

  return response.status(201).json(new_user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {
    user
  } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {
    user
  } = request;
  const {
    title,
    deadline
  } = request.body;

  const new_todo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(new_todo);

  return response.status(201).json(new_todo);

});

app.put('/todos/:id', checksExistsUserAccount, getTodoByID, (request, response) => {
  const {
    todo
  } = request;
  const {
    title,
    deadline
  } = request.body;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, getTodoByID, (request, response) => {
  const {
    todo
  } = request;

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, getTodoByID, (request, response) => {
  const {
    user,
    todo
  } = request;

  user.todos.splice(user.todos.indexOf(todo), 1);

  return response.status(204).send();
});

module.exports = app;