import { createContext, useContext, useState } from "react";
import React from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import { type Provider } from "../utilities/types";

const AppContext = createContext<StoreApi<Provider> | undefined>(undefined);

const AppStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [store] = useState(() =>
    createStore<Provider>((set) => ({
      auditResults: null,
      userProjects: null,
      userToken: null,
      activeProject: null,
      activeIssue: null,
      actions: {
        setAuditResults: (value) => set({ auditResults: value }),
        setUserProjects: (value) => set({ userProjects: value }),
        setUserToken: (value) => set({ userToken: value }),
        setActiveProject: (value) => set({ activeProject: value }),
        setActiveIssue: (value) => set({ activeIssue: value }),
      },
    }))
  );

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};

const useAppStore = (selector: (state: Provider) => unknown) => {
  const store = useContext(AppContext);
  if (!store) {
    throw new Error("Missing AppStoreProvider");
  }
  return useStore(store, selector);
};

export const useApp = () => useAppStore((state) => state) as Provider;

const Store = ({ children }: { children: React.ReactNode }) => {
  return <AppStoreProvider>{children}</AppStoreProvider>;
};

export default Store;