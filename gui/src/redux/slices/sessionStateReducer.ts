import { createSlice } from "@reduxjs/toolkit";
import { SessionState, StepDescription } from "../../schema/SessionState";
import { SessionUpdate } from "../../schema/SessionUpdate";
import { ContextItem } from "../../schema/ContextItem";

export interface SessionFullState {
  history: StepDescription[];
  context_items: ContextItem[];
  active: boolean;
}

export const sessionStateSlice = createSlice({
  name: "sessionState",
  initialState: {
    history: [],
    context_items: [],
    active: false,
  },
  reducers: {
    processSessionUpdate: (
      state: SessionFullState,
      { payload }: { payload: SessionUpdate }
    ) => {
      let active = state.active;
      if (typeof payload.stop === "boolean") {
        active = !payload.stop;
      }

      let step: StepDescription | undefined = undefined;

      if (payload.index > state.history.length) {
        // Partial above to allow here
        step = {
          ...(payload.update as StepDescription),
        };
      } else if (payload.delta === true) {
        step = {
          ...state.history[payload.index],
        };
        if (payload.update.name) {
          step.name += payload.update.name;
        }
        if (payload.update.description) {
          step.description += payload.update.description;
        }
        if (payload.update.observations) {
          step.observations.push(...payload.update.observations);
        }
        if (payload.update.logs) {
          step.logs.push(...payload.update.logs);
        }
      } else if (payload.delta === false) {
        step = {
          ...state.history[payload.index],
          ...payload.update,
        };
      }

      let history = [...state.history];
      if (step) {
        history[payload.index] = step;
      }

      return {
        ...state,
        history,
        active,
      };
    },
  },
});

export const { processSessionUpdate } = sessionStateSlice.actions;
export default sessionStateSlice.reducer;