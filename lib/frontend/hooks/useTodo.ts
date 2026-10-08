import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type TodoItem = {
  id: string;
  title: string;
};

const fetchTodos = async (): Promise<TodoItem[]> => {
  const { data } = await axios.get<TodoItem[]>("/api/todo");
  return data;
};

const createTodoRequest = async (title: string): Promise<TodoItem> => {
  const { data } = await axios.post<TodoItem>("/api/todo", { title });
  return data;
};

const deleteTodoRequest = async (id: string): Promise<string> => {
  await axios.delete(`/api/todo/${id}`);
  return id;
};

export function useTodo() {
  const queryClient = useQueryClient();

  const {
    data: todos = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const createMutation = useMutation({
    mutationFn: createTodoRequest,
    onSuccess: (newItem) => {
      queryClient.setQueryData<TodoItem[]>(["todos"], (currentTodos = []) => [
        ...currentTodos,
        newItem,
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodoRequest,
    onSuccess: (deletedId) => {
      queryClient.setQueryData<TodoItem[]>(["todos"], (currentTodos = []) =>
        currentTodos.filter((todo) => todo.id !== deletedId)
      );
    },
  });

  return {
    todos,
    isLoading,
    isError,
    error,
    createTodo: (title: string) => createMutation.mutate(title),
    deleteTodo: (id: string) => deleteMutation.mutate(id),
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
