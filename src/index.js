const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.header;

  const validUser = users.some((user) => user.username === username);

  if (!validUser) {
    return response.status(401).json({ error: "Username not found!"});
  }

  request.username = username;
 
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  const existsUsername = users.some((user) => user.username === username);
  if (existsUsername) {
    return response.status(400).json({ error: "Username already exists!"});
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  return response.status(200).json(username.todo);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  username.todos.push(newTodo);

   return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;

  const id = request.params.id;

  const currentTodo = username.todos.find((todo) => todo.id === id);
  if (!currentTodo) {
    return response.status(404).json({ error: "To Do not found!"})
  }

  currentTodo.title = title;
  currentTodo.deadline = deadline;

  return response.status(201).json(currentTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const id = request.params.id;

  const currentTodo = username.todos.find((todo) => todo.id === id);
  if (!currentTodo) {
    return response.status(404).json({ error: "To Do not found!"})
  }

  currentTodo.done = true;

  return response.status(201).json(currentTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const id = request.params.id;

  const currentTodo = username.todos.find((todo) => todo.id === id);
  if (!currentTodo) {
    return response.status(404).json({ error: "To Do not found!"})
  }

  username.todo.splice(currentTodo, 1);

  return response.status(200).json(username.todo);
});

module.exports = app;