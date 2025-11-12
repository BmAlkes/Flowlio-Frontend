import { environment } from "@/configs/axios.config";
import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";


interface Store {
  isComponentActive: string[];
  setIsComponentActive: (isComponentActive: string[]) => void;
}

const store: StateCreator<Store> = (set) => ({  
  isComponentActive: ['work-flow', 'home'],
  setIsComponentActive: (isComponentActive: string[]) => set({ isComponentActive }),
});

export const useRenderComponentStore = create(
  devtools(store, {
    enabled: environment === "development",
    store: "Render Component Store",
  })
);
