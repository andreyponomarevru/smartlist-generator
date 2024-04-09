import * as RTK from "@reduxjs/toolkit";
/*
import { StatusFilters } from "../filters/filters-slice";

type Todo = {
  [key: string]: {
    id: number;
    completed: boolean;
    color: string;
  };
};
type TodosState = {
  status: string;
  entities: Todo;
};

const initialState: TodosState = {
  status: "idle",
  entities: {},
};

const todosSlice = RTK.createSlice({
  name: "todos",
  initialState,
  reducers: {
    todoAdded(state, action) {
      const todo = action.payload;
      state.entities[todo.id] = todo;
    },
    todoToggled(state, action) {
      const todoId = action.payload;
      const todo = state.entities[todoId];
      todo.completed = !todo.completed;
    },
    todoColorSelected: {
      reducer(state, action: any) {
        const { color, todoId } = action.payload;
        state.entities[todoId].color = color;
      },
      prepare(todoId: number, color: string) {
        return { payload: { todoId, color } };
      },
    },
    todoDeleted(state, action) {
      delete state.entities[action.payload];
    },
    allTodosCompleted(state, action) {
      Object.values(state.entities).forEach((todo) => {
        if (todo.completed) delete state.entities[todo.id];
      });
    },
    completedTodosCleared(state, action) {
      Object.values(state.entities).forEach((todo) => {
        if (todo.completed) delete state.entities[todo.id];
      });
    },
    todosLoading(state, action) {
      state.status = "loading";
    },
    todosLoaded(state, action) {
      const newEntities = {};
      (action.payload as Todo[]).forEach((todo) => {
        (newEntities as any)[todo.id as any] = todo;
      });
      state.entities = newEntities;
      state.status = "idle";
    },
  },
});

export const {
  todoAdded,
  todoToggled,
  todoColorSelected,
  todoDeleted,
  allTodosCompleted,
  completedTodosCleared,
  todosLoaded,
  todosLoading,
} = todosSlice.actions;

export const todosReducer = todosSlice.reducer;

// Thunk function
export async function fetchTodos(dispatch: any) {
  dispatch(todosLoading() as any);
  const response = await fetch("http://localhost:8080/api/stats/genres", {
    method: "GET",
  });
  dispatch(todosLoaded((await response.json()).results));
}
*/
