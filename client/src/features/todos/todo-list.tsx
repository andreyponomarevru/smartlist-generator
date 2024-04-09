/*import React from "react";
import * as Redux from "react-redux";

import { TodoListItem } from "../todos/todo-list-item";

function selectTodoIds(state: any) {
  return state.todos.map((todo: any) => todo.id);
}

export function TodoList() {
  const todoIds = Redux.useSelector(selectTodoIds, Redux.shallowEqual);

  const renderedListItems = todoIds.map((todoId: number) => {
    return <TodoListItem key={todoId} id={todoId} />;
  });

  return <ul>{renderedListItems}</ul>;
}
*/
