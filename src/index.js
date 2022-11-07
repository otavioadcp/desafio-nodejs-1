const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;
  next();
}

const checkExistTodo = (request, response, next) => {
  const { username } = request.headers;
  const { id: todoId } = request.params;

  const user = users.find((user) => user.username === username);
  const todo = user.todos.find((todo) => todo.id === todoId);

  if (!todo) {
    return response.status(404).json({ error: "TODO não encontrado" });
  }

  request.todo = todo;
  next();
};

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (users.some((user) => user.username === username)) {
    return response.status(400).json({ error: "Usuário já existe!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;

  const todos = user.todos;

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false,
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checkExistTodo,
  (request, response) => {
    const user = request.user;
    const { id } = request.params;
    const { title, deadline } = request.body;
    const todo = request.todo;

    todo.title = title ?? todo.title;
    todo.deadline = deadline ?? todo.deadline;

    return response.status(201).json(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checkExistTodo,
  (request, response) => {
    const todo = request.todo;

    todo.done = true;

    return response.status(201).json(todo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checkExistTodo,
  (request, response) => {
    const user = request.user;
    const { id } = request.params;
    const todoIndex = user.todos.findIndex((todo) => todo.id === id);

    user.todos.splice(todoIndex, 1);

    return response.status(204).send();
  }
);

module.exports = app;
