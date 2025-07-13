import { useReducer } from "react";

const useSetState = <S extends Record<string, unknown>>(initialState: S) => {
  const reducer = (
    state: S,
    action: Partial<S> | ((state: S) => Partial<S>)
  ) => ({
    ...state,
    ...(typeof action === "function" ? action(state) : action),
  });

  return useReducer(reducer, initialState);
};

export default useSetState;
