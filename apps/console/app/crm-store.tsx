"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  defaultSettings,
  initialContacts,
  initialDeals,
  type Contact,
  type ContactStatus,
  type CrmSettings,
  type Deal,
  type DealStage,
} from "./crm-data";

const STORAGE_KEY = "relay-crm-state-v1";

interface StoredState {
  version: 1;
  contacts: Contact[];
  deals: Deal[];
  settings: CrmSettings;
}

export interface NewContactInput {
  name: string;
  company: string;
  email: string;
  status?: ContactStatus | undefined;
}

export interface NewDealInput {
  name: string;
  company: string;
  value: number;
  stage?: DealStage | undefined;
}

export interface CrmApi {
  contacts: Contact[];
  deals: Deal[];
  settings: CrmSettings;
  contactFilter: string | null;
  setContactFilter(query: string | null): void;
  addContact(input: NewContactInput): Contact;
  removeContact(id: string): void;
  addDeal(input: NewDealInput): Deal;
  removeDeal(id: string): void;
  updateDealStage(id: string, stage: DealStage): void;
  updateSettings(partial: Partial<CrmSettings>): void;
  resetData(): void;
}

const CrmContext = createContext<CrmApi | null>(null);

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function readStoredState(): StoredState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (parsed.version !== 1) return null;
    if (!Array.isArray(parsed.contacts) || !Array.isArray(parsed.deals)) return null;
    return {
      version: 1,
      contacts: parsed.contacts,
      deals: parsed.deals,
      settings: { ...defaultSettings, ...parsed.settings },
    };
  } catch {
    return null;
  }
}

export function CrmProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [settings, setSettings] = useState<CrmSettings>(defaultSettings);
  const [contactFilter, setContactFilter] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredState();
    if (stored) {
      // One-time hydration from localStorage after mount; reading it during
      // render would mismatch the server-rendered seed data.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContacts(stored.contacts);
      setDeals(stored.deals);
      setSettings(stored.settings);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: StoredState = { version: 1, contacts, deals, settings };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable in hardened or private browsing contexts.
    }
  }, [contacts, deals, settings, hydrated]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const stored = readStoredState();
      if (stored) {
        setContacts(stored.contacts);
        setDeals(stored.deals);
        setSettings(stored.settings);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addContact = useCallback((input: NewContactInput): Contact => {
    const contact: Contact = {
      id: makeId("ct"),
      name: input.name,
      company: input.company,
      email: input.email,
      status: input.status ?? "Lead",
      owner: "You",
      lastActivity: "Just now",
    };
    setContacts((current) => [contact, ...current]);
    setContactFilter(null);
    return contact;
  }, []);

  const removeContact = useCallback((id: string) => {
    setContacts((current) => current.filter((contact) => contact.id !== id));
  }, []);

  const addDeal = useCallback((input: NewDealInput): Deal => {
    const deal: Deal = {
      id: makeId("dl"),
      name: input.name,
      company: input.company,
      value: input.value,
      stage: input.stage ?? "Qualified",
    };
    setDeals((current) => [deal, ...current]);
    return deal;
  }, []);

  const removeDeal = useCallback((id: string) => {
    setDeals((current) => current.filter((deal) => deal.id !== id));
  }, []);

  const updateDealStage = useCallback((id: string, stage: DealStage) => {
    setDeals((current) => current.map((deal) => (deal.id === id ? { ...deal, stage } : deal)));
  }, []);

  const updateSettings = useCallback((partial: Partial<CrmSettings>) => {
    setSettings((current) => ({ ...current, ...partial }));
  }, []);

  const resetData = useCallback(() => {
    setContacts(initialContacts);
    setDeals(initialDeals);
    setSettings(defaultSettings);
    setContactFilter(null);
  }, []);

  const api = useMemo<CrmApi>(
    () => ({
      contacts,
      deals,
      settings,
      contactFilter,
      setContactFilter,
      addContact,
      removeContact,
      addDeal,
      removeDeal,
      updateDealStage,
      updateSettings,
      resetData,
    }),
    [
      contacts,
      deals,
      settings,
      contactFilter,
      addContact,
      removeContact,
      addDeal,
      removeDeal,
      updateDealStage,
      updateSettings,
      resetData,
    ],
  );

  return <CrmContext value={api}>{children}</CrmContext>;
}

export function useCrm(): CrmApi {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error("useCrm must be used inside CrmProvider");
  }
  return context;
}
