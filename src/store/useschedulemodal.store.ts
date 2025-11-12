import { GeneralModalReturnTypeProps } from "@/components/common/generalmodal";
import { environment } from "@/configs/axios.config";
import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

const store: StateCreator<GeneralModalReturnTypeProps> = (set) =>
  ({
    open: false,
    contentProps: {
      className: "",
      children: null,
    },
    onOpenChange: (open) => set(() => ({ open })),
    setContentProps: (props) =>
      set((state) => ({
        contentProps: {
          ...state.contentProps,
          ...props,
        },
      })),
  } satisfies GeneralModalReturnTypeProps);

export const useModalStore = create(
  devtools(store, {
    enabled: environment === "development",
    store: "schedule modal",
  })
);
