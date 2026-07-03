import { create } from 'zustand';
import type { ConsentState, BreResult, RebalancingModel, GroupBreResult } from '../types/rebalancer';

interface RebalancerStore extends ConsentState {
  setSelectedModel: (model: RebalancingModel) => void;
  setBreResults: (results: BreResult[]) => void;
  setSelectedFunds: (ids: string[]) => void;
  setConsentGiven: (v: boolean) => void;
  setModelUnits: (fundId: string, replacementId: string, units: number) => void;
  modelUnits: Record<string, Record<string, number>>;
  groupBreResults: GroupBreResult[];
  setGroupBreResults: (results: GroupBreResult[]) => void;
  reset: () => void;
}

export const useRebalancerStore = create<RebalancerStore>((set) => ({
  consentGiven: false,
  selectedModel: null,
  breResults: [],
  selectedFundsForSwitch: [],
  modelUnits: {},
  groupBreResults: [],
  setSelectedModel: (model) => set({ selectedModel: model }),
  setBreResults: (results) => set({ breResults: results }),
  setSelectedFunds: (ids) => set({ selectedFundsForSwitch: ids }),
  setConsentGiven: (v) => set({ consentGiven: v }),
  setModelUnits: (fundId, replacementId, units) =>
    set((s) => ({
      modelUnits: {
        ...s.modelUnits,
        [fundId]: { ...(s.modelUnits[fundId] ?? {}), [replacementId]: units },
      },
    })),
  setGroupBreResults: (results) => set({ groupBreResults: results }),
  reset: () => set({ consentGiven: false, selectedModel: null, breResults: [], selectedFundsForSwitch: [], modelUnits: {}, groupBreResults: [] }),
}));
