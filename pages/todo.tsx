import { useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";

type TodoItem = {
  id: string;
  title: string;
};

const fetchTodos = async (): Promise<TodoItem[]> => {
  const { data } = await axios.get<TodoItem[]>("/api/todo");
  return data;
};

const createTodo = async (title: string): Promise<TodoItem> => {
  const { data } = await axios.post<TodoItem>("/api/todo", { title });
  return data;
};

const deleteTodo = async (id: string): Promise<string> => {
  await axios.delete(`/api/todo/${id}`);
  return id;
};

export default function TodoPage() {
  const queryClient = useQueryClient();
  const [newTodo, setNewTodo] = useState("");

  const { data: todos = [], isLoading, isError, error } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: (newItem) => {
      queryClient.setQueryData<TodoItem[]>(["todos"], (currentTodos = []) => [
        ...currentTodos,
        newItem,
      ]);
      setNewTodo("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: (deletedId) => {
      queryClient.setQueryData<TodoItem[]>(["todos"], (currentTodos = []) =>
        currentTodos.filter((todo) => todo.id !== deletedId)
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTodo = newTodo.trim();

    if (!trimmedTodo || createMutation.isPending) {
      return;
    }

    createMutation.mutate(trimmedTodo);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Title order={1} className="mb-2 text-3xl font-black md:text-4xl">
          Todo list
        </Title>
        <Text c="dimmed" size="lg" className="mb-6">
          Organize as suas tarefas de forma rápida e simples.
        </Text>

        <Card withBorder radius="lg" shadow="sm" p="lg" className="mb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
            <TextInput
              value={newTodo}
              onChange={(event) => setNewTodo(event.currentTarget.value)}
              placeholder="Adicionar nova tarefa..."
              className="flex-1"
              aria-label="Nova tarefa"
              disabled={createMutation.isPending}
            />
            <Button
              type="submit"
              leftSection={<IconPlus size={16} />}
              loading={createMutation.isPending}
            >
              Adicionar
            </Button>
          </form>
        </Card>

        <Stack gap="sm">
          {isLoading ? (
            <Card withBorder radius="lg" p="lg" className="flex items-center justify-center">
              <Loader size="sm" />
            </Card>
          ) : isError ? (
            <Card withBorder radius="lg" p="lg">
              <Text c="red">Erro ao carregar as tarefas: {error?.message}</Text>
            </Card>
          ) : todos.length === 0 ? (
            <Card withBorder radius="lg" p="xl">
              <Text ta="center" c="dimmed">
                Nenhuma tarefa registada.
              </Text>
            </Card>
          ) : (
            todos.map((todo) => (
              <Card key={todo.id} withBorder radius="md" shadow="xs" p="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Text size="lg" fw={500} className="break-all">
                    {todo.title}
                  </Text>

                  <ActionIcon
                    variant="light"
                    color="red"
                    aria-label={`Eliminar ${todo.title}`}
                    onClick={() => deleteMutation.mutate(todo.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Card>
            ))
          )}
        </Stack>
      </div>
    </main>
  );
}
