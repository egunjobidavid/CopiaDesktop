import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, ArrowRight, X } from 'lucide-react';
import api from '../../api/client';

interface TrialStatus {
  production?: { status: string; isTrial: boolean; daysLeft: number };
  projects?: { status: string; isTrial: boolean; daysLeft: number };
  time_tracking?: { status: string; isTrial: boolean; daysLeft: number };
}

export function TrialBanner() {
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<TrialStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    api.get('/billing/trial-status')
      .then((res) => setStatuses(res.data))
      .catch(() => {});
  }, []);

  if (dismissed || !statuses) return null;

  const trials = Object.entries(statuses).filter(([_, s]) => s?.isTrial);
  const activeTrials = trials.filter(([_, s]) => s?.status === 'active');
  const endedTrials = trials.filter(([_, s]) => s?.status === 'ended');

  if (activeTrials.length === 0 && endedTrials.length === 0) return null;

  const MODULE_NAMES: Record<string, string> = {
    production: 'Production',
    projects: 'Project Management',
    time_tracking: 'Time Tracking',
  };

  const MODULE_UPGRADE: Record<string, string> = {
    production: 'growth',
    projects: 'professional',
    time_tracking: 'professional',
  };

  return (
    <div className="space-y-2 mb-4">
      {/* Active trial warnings */}
      {activeTrials.map(([module, status]) => (
        <div key={module} className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-medium text-amber-800">{MODULE_NAMES[module]} trial:</span>
            <span className="text-amber-700 ml-1">{status.daysLeft} days remaining</span>
          </div>
          <button onClick={() => navigate('/settings/billing')} className="text-xs font-medium text-amber-800 hover:text-amber-900 flex items-center gap-1">
            Upgrade now <ArrowRight className="w-3 h-3" />
          </button>
          <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Ended trial alerts */}
      {endedTrials.map(([module, status]) => (
        <div key={module} className="flex items-center gap-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-medium text-red-800">{MODULE_NAMES[module]} trial ended</span>
            <span className="text-red-700 ml-1">— Upgrade to {MODULE_UPGRADE[module] === 'growth' ? 'Growth' : 'Professional'} to continue</span>
          </div>
          <button onClick={() => navigate('/settings/billing')} className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 flex items-center gap-1">
            Upgrade <ArrowRight className="w-3 h-3" />
          </button>
          <button onClick={() => setDismissed(true)} className="text-red-400 hover:text-red-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function FeatureGateModal({ module, onClose }: { module: string; onClose: () => void }) {
  const navigate = useNavigate();

  const MODULE_INFO: Record<string, { name: string; requiredPlan: string; requiredPlanName: string; features: string[] }> = {
    production: {
      name: 'Production',
      requiredPlan: 'growth',
      requiredPlanName: 'Growth',
      price: '₦7,500/mo',
      features: ['BOM Management', 'Work Orders', 'Quality Control', 'Equipment Tracking', 'Material Issues', 'Cost Tracking'],
    },
    projects: {
      name: 'Project Management',
      requiredPlan: 'professional',
      requiredPlanName: 'Professional',
      price: '₦22,500/mo',
      features: ['Unlimited Projects', 'Kanban Board', 'Gantt Charts', 'Milestones', 'Time Tracking', 'Team Collaboration'],
    },
    time_tracking: {
      name: 'Time Tracking',
      requiredPlan: 'professional',
      requiredPlanName: 'Professional',
      price: '₦22,500/mo',
      features: ['Task Timer', 'Time Entries', 'Team Reports', 'Billable Hours', 'Timesheets', 'Productivity Insights'],
    },
    hr: {
      name: 'HR & Payroll',
      requiredPlan: 'professional',
      requiredPlanName: 'Professional',
      price: '₦22,500/mo',
      features: ['Employee Management', 'Payroll Processing', 'Leave Management', 'Attendance', 'Reports', 'Payslips'],
    },
  };

  const info = MODULE_INFO[module] || { name: module, requiredPlan: 'growth', requiredPlanName: 'Growth', price: '₦7,500/mo', features: [] };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{info.name} is a {info.requiredPlanName} feature</h3>
          <p className="text-sm text-gray-500 mt-1">Upgrade to {info.requiredPlanName} ({info.price}) to unlock</p>
        </div>

        <ul className="space-y-2 mb-5">
          {info.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {f}
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            Maybe Later
          </button>
          <button onClick={() => { onClose(); navigate('/settings/billing'); }} className="flex-1 px-4 py-2.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
