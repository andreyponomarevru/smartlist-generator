const initialState = {
  status: "All",
  colors: [] as any[],
};

export const StatusFilters = {
  All: "All",
  Active: "active",
  Completed: "completed",
};

export type FiltersAction =
  | {
      type: "filters/statusFilterChanged";
      payload: any;
    }
  | {
      type: "filters/colorFilterChanged";
      payload: { changeType: any; color: any };
    }
  | any;
export type FiltersState = typeof initialState;

export function filtersReducer(state = initialState, action: FiltersAction) {
  switch (action.type) {
    case "filters/statusFilterChanged": {
      return { ...state, status: action.payload };
    }
    case "filters/colorFilterChanged": {
      const { color, changeType } = action.payload;
      const { colors } = state;

      switch (changeType) {
        case "added": {
          if (colors.includes(color)) return state;
          return { ...state, colors: state.colors.concat(color) };
        }
        case "removed": {
          return {
            ...state,
            colors: state.colors.filter(
              (existingColor) => existingColor !== color,
            ),
          };
        }
        default: {
          return state;
        }
      }
    }
    default: {
      return state;
    }
  }
}

export function colorFilterChanged(color: any, changeType: any) {
  return {
    type: "filters/colorFilterChanged",
    payload: { color, changeType },
  };
}
