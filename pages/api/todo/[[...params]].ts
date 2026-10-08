import { createHandler, Get, Post, Delete, Body, Param } from "next-api-decorators";

interface TodoItem {
  id: string;
  title: string;
}

let todos: TodoItem[] = [
  { id: "1", title: "Configurar Mantine e Tailwind" },
  { id: "2", title: "Integrar TanStack Query com Axios" },
];

class TodoHandler {
  @Get()
  getTodos() {
    return todos;
  }

  @Post()
  createTodo(@Body() body: { title: string }) {
    const newItem: TodoItem = {
      id: Date.now().toString(),
      title: body.title,
    };
    todos.push(newItem);
    return newItem;
  }

  @Delete("/:id")
  deleteTodo(@Param("id") id: string) {
    todos = todos.filter((t) => t.id !== id);
    return { success: true };
  }
}

export default createHandler(TodoHandler);
