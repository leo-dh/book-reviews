import { IState, IAction, EActionType } from "./types";
import { IActionUpdatePersistence } from "./actions";

const initialState: IState = {
  persistence: {},
};
function reducer(state: IState = initialState, action: IAction): IState {
  let data;
  switch (action.type) {
    case EActionType.UPDATE_PERSISTENT_DATA:
      data = ((action as unknown) as IActionUpdatePersistence).data;
      return {
        ...state,
        persistence: {
          ...state.persistence,
          [data.key]: data.value,
        },
      };
    case EActionType.CLEAR_PERSISTENT_DATA:
      return {
        ...state,
        persistence: {},
      };
    default:
      return state;
  }
}

export { reducer };
