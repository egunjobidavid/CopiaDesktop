import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import api from '../api/client';

const FREE_FEATURES = ['inventory', 'sales', 'crm', 'production', 'projects', 'time_tracking'];

let cachedFeatures: string[] | null = null;
let cachedLimits: Record<string, number> = {};

export function useFeature() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [features, setFeatures] = useState<string[]>(cachedFeatures || FREE_FEATURES);
  const [limits, setLimits] = useState<Record<string, number>>(cachedLimits);

  useEffect(() => {
    if (!tenantId) return;
    api.get('/billing/subscription').then(({ data }) => {
      const list = data?.features || FREE_FEATURES;
      cachedFeatures = list;
      cachedLimits = data?.limits || {};
      setFeatures(list);
      setLimits(cachedLimits);
    }).catch(() => {});
  }, [tenantId]);

  return {
    hasFeature: (feature: string) => features.includes(feature),
    getLimit: (name: string, fallback = 0) => limits[name] ?? fallback,
    features,
    limits,
  };
}

export function checkFeature(feature: string): boolean {
  return (cachedFeatures || FREE_FEATURES).includes(feature);
}
