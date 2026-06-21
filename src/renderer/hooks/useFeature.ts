import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import api from '../api/client';

// Starter plan features (free tier)
const STARTER_FEATURES = ['inventory', 'sales', 'pos', 'quotes', 'invoices', 'customers', 'basic_reports'];

// Core plan feature mapping
const PLAN_CORE_FEATURES: Record<string, string[]> = {
  starter: STARTER_FEATURES,
  free: STARTER_FEATURES,
  business: [...STARTER_FEATURES, 'sales_orders', 'advanced_reports', 'export'],
  growth: [...STARTER_FEATURES, 'sales_orders', 'advanced_reports', 'export'],
  professional: [...STARTER_FEATURES, 'sales_orders', 'advanced_reports', 'export', 'phone_support'],
  enterprise: [...STARTER_FEATURES, 'sales_orders', 'advanced_reports', 'export', 'phone_support', 'api_access', 'priority_support', 'custom_integrations'],
};

// Module feature mapping
const MODULE_FEATURES: Record<string, string[]> = {
  accounting: ['accounting', 'chart_of_accounts', 'journal_entries', 'trial_balance', 'bank_reconciliation', 'tax_config', 'general_ledger'],
  hr: ['hr', 'employees', 'attendance', 'payroll', 'departments'],
  projects: ['projects', 'time_tracking', 'tasks', 'kanban', 'gantt'],
  crm: ['crm', 'deals', 'pipeline', 'activities', 'lead_scoring', 'deal_conversion'],
  production: ['production', 'boms', 'work_orders', 'stages', 'quality', 'equipment', 'maintenance'],
  procurement: ['procurement', 'vendors', 'purchase_orders', 'bill_payments'],
  multi_location: ['locations', 'multi_location', 'location_transfers'],
  analytics: ['analytics', 'advanced_reports', 'custom_dashboards'],
};

let cachedFeatures: string[] | null = null;
let cachedModules: string[] | null = null;
let cachedLimits: Record<string, number> = {};
let cachedPlan: string = 'starter';

export function useFeature() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [features, setFeatures] = useState<string[]>(cachedFeatures || STARTER_FEATURES);
  const [modules, setModules] = useState<string[]>(cachedModules || []);
  const [limits, setLimits] = useState<Record<string, number>>(cachedLimits);
  const [plan, setPlan] = useState<string>(cachedPlan);

  useEffect(() => {
    if (!tenantId) return;
    api.get('/billing/subscription').then(({ data }) => {
      const currentPlan = data?.plan || 'starter';
      const activeModules = data?.modules || [];

      // Build features list from core plan + active modules
      const coreFeatures = PLAN_CORE_FEATURES[currentPlan] || STARTER_FEATURES;
      const moduleFeatures = activeModules.flatMap((mid: string) => MODULE_FEATURES[mid] || []);
      const allFeatures = [...new Set([...coreFeatures, ...moduleFeatures])];

      cachedPlan = currentPlan;
      cachedFeatures = allFeatures;
      cachedModules = activeModules;
      cachedLimits = data?.limits || {};

      setPlan(currentPlan);
      setFeatures(allFeatures);
      setModules(activeModules);
      setLimits(cachedLimits);
    }).catch(() => {});
  }, [tenantId]);

  return {
    hasFeature: (feature: string) => features.includes(feature),
    hasModule: (moduleId: string) => modules.includes(moduleId),
    getLimit: (name: string, fallback = 0) => limits[name] ?? fallback,
    plan,
    features,
    modules,
    limits,
  };
}

export function checkFeature(feature: string): boolean {
  return (cachedFeatures || STARTER_FEATURES).includes(feature);
}

export function checkModule(moduleId: string): boolean {
  return (cachedModules || []).includes(moduleId);
}
