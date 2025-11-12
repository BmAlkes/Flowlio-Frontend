import { environment } from "@/configs/axios.config";
import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import type { MutableRefObject } from "react";

type Ref = MutableRefObject<HTMLDivElement | null> | null;

interface Store {
  setSidebarRef: (sidebarRef: Ref) => void;
  sidebarRef: Ref;
}

const store: StateCreator<Store> = (set) => ({
  setSidebarRef: (sidebarRef) => set({ sidebarRef }),
  sidebarRef: null,
});

export const useSidebarRefStore = create(
  devtools(store, {
    enabled: environment === "development",
    store: "Sidebar Store",
  })
);
