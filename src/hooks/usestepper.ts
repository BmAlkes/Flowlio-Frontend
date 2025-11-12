import { useCallback, useEffect, useReducer, useState } from "react";

interface Action {
  type: "setallfinished" | "reset" | "jump" | "setSteps";
  step: string | string[];
}

interface Step {
  isActive: boolean;
  isFinished: boolean;
}

export interface State {
  [property: string]: Step;
}

const stepperReducer = (state: State, { type, step }: Action) => {
  switch (type) {
    case "jump": {
      const keys = Object.keys(state);
      if ((step as string) in state) {
        const filtered = keys.slice(0, keys.indexOf(step as string) + 1);
        keys.forEach((val) => {
          state[val] = { isActive: false, isFinished: false };
        });

        filtered.forEach((val) => {
          state[val] = {
            isActive: true,
            isFinished: val !== step ? true : false,
          };
        });
      }
      return { ...state };
    }

    case "setallfinished": {
      Object.keys(state).forEach((key) => {
        state[key] = { isActive: true, isFinished: true };
      });
      return { ...state };
    }

    case "setSteps": {
      if (Array.isArray(step)) {
        const newSteps = Object.fromEntries(
          step.map((key) => [key, { isActive: false, isFinished: false }])
        );

        return { ...newSteps };
      }

      return { ...state };
    }

    case "reset": {
      Object.keys(state).forEach((key) => {
        state[key] = { isActive: false, isFinished: false };
      });
      return { ...state };
    }
  }
};

export interface UseStepper<T extends string = string> {
  goToStep: (step: T, data?: any, force?: boolean) => void;
  isStepActive: (step: T) => boolean;
  updateSteps: (steps: T[]) => void;
  setData: (data?: any) => void;
  setAllFinished: () => void;
  previous: () => void;
  reset: () => void;
  next: () => void;
  data?: any;
  step: T;
  state: {
    [key in any]: {
      isActive: boolean;
      isFinished: boolean;
    };
  };
}

export const useStepper = <T extends string>(
  initialSteps: T[],
  initialStep?: T
) => {
  const initialData: State = Object.fromEntries(
    initialSteps.map((key) => [key, { isActive: false, isFinished: false }])
  );
  const [state, dispatch] = useReducer(stepperReducer, initialData);
  const [step, setStep] = useState(initialStep ?? initialSteps[0]);
  const [data, setData] = useState<any>();

  useEffect(() => {
    if (initialStep) dispatch({ type: "jump", step: initialStep });
  }, [initialStep]);

  const isStepActive = useCallback((Step: T) => Step === step, [step]);

  const updateSteps = useCallback((steps: T[]) => {
    dispatch({ type: "setSteps", step: steps });
    dispatch({ type: "jump", step: steps[0] });
    setStep(steps[0]);
  }, []);

  const goToStep = useCallback(
    (step: T, data?: any, force = false) => {
      if (isStepActive(step) && !force) return;
      if (data) setData(data);
      setStep(step);
      dispatch({ step, type: "jump" });
    },
    [isStepActive]
  );

  const next = useCallback(() => {
    const keys = Object.keys(state) as T[];
    const nextStep = keys.at(keys.indexOf(step) + 1);
    if (nextStep) goToStep(nextStep);
  }, [step]);

  const previous = useCallback(() => {
    const keys = Object.keys(state) as T[];
    const previousStep = keys.at(keys.indexOf(step) - 1);
    if (previousStep !== keys.at(-1)) goToStep(previousStep as any);
  }, [step]);

  const setAllFinished = useCallback(() => {
    if (step === "done") return;
    setStep("done" as T);
    dispatch({ type: "setallfinished", step: Object.keys(state) });
  }, [step]);

  const reset = useCallback(() => {
    if (step === "undone") return;
    setStep("undone" as T);
    dispatch({ type: "reset", step: Object.keys(state) });
  }, [step]);

  return {
    step,
    data,
    state,
    next,
    reset,
    setData,
    previous,
    goToStep,
    updateSteps,
    isStepActive,
    setAllFinished,
  };
};
