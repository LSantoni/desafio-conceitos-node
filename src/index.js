const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.body;

  const user = users.find((user) => user.username === username);

  if(!user){
    return next();
  }

  return response.status(400).json({ error: 'User Already exists' });
}

app.post('/users', checksExistsUserAccount, (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  const task = {
    id: uuidv4(),
	  title,
	  done: false, 
	  deadline: new Date(deadline),
	  created_at: new Date()
  }

  user.todos.push(task);

  return response.status(201).send(task);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);
  const task = user.todos.find((todo) => todo.id === id);

  if(!task) {
    return response.status(404).json({ error: 'Todo does not exists!' });
  }

  task.title = title;
  task.deadline = new Date(deadline);

  return response.status(201).send(task);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);
  const task = user.todos.find((todo) => todo.id === id);

  if(!task) {
    return response.status(404).json({ error: 'Todo does not exists!'});
  }

  task.done = true;

  return response.status(200).send(task);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);
  const task = user.todos.find((todo) => todo.id === id);

  if(!task) {
    return response.status(404).json({ error: 'Todo does not exists!'});
  }

  user.todos.splice(task, 1);

  return response.status(204).send(user.todos);
});

module.exports = app;