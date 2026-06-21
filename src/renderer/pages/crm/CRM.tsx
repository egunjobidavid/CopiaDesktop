import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { CreateDealModal } from './CreateDealModal';
import DealDetailModal from './DealDetailModal';
import toast from 'react-hot-toast';
import { Plus, Calendar, MoreHorizontal, Target, TrendingUp } from 'lucide-react';

interface DealStage {
  id: string;
  name: string;
  sequence: number;
  probability: number;
  color: string;
  is_won: boolean;
  is_lost: boolean;
}

interface Deal {
  id: string;
  deal_number: string;
  title: string;
  customer_id: string;
  stage_id: string;
  value: string;
  currency: string;
  probability: number;
  expected_close_date: string;
  actual_close_date: string;
  assignee_id: string;
  source: string;
  type: string;
  status: string;
  notes: string;
  created_at: string;
  customer_name?: string;
}

interface PipelineItem {
  stage: DealStage;
  deals: Deal[];
  totalValue: number;
  dealCount: number;
}

const STAGE_COLORS: Record<string, string> = {
  '#6366f1': 'bg-indigo-500',
  '#2563eb': 'bg-blue-500',
  '#f59e0b': 'bg-amber-500',
  '#10b981': 'bg-emerald-500',
  '#ef4444': 'bg-red-500',
  '#8b5cf6': 'bg-violet-500',
  '#ec4899': 'bg-pink-500',
};

export function CRM() {
  const [pipeline, setPipeline] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);

  useEffect(() => { loadPipeline(); }, []);

  const loadPipeline = async () => {
    try {
      setLoading(true);
      const res = await api.get('/crm/pipeline');
      setPipeline(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveDeal = async (dealId: string, newStageId: string) => {
    try {
      await api.post(`/crm/deals/${dealId}/move`, { stageId: newStageId });
      loadPipeline();
    } catch {
      toast.error('Failed to move deal');
    }
  };

  const handleMarkWon = async (dealId: string) => {
    try {
      await api.post(`/crm/deals/${dealId}/won`);
      toast.success('Deal marked as won');
      loadPipeline();
    } catch {
      toast.error('Failed to mark deal');
    }
  };

  const handleMarkLost = async (dealId: string) => {
    try {
      await api.post(`/crm/deals/${dealId}/lost`, { lostReason: 'Lost during pipeline review' });
      toast.success('Deal marked as lost');
      loadPipeline();
    } catch {
      toast.error('Failed to mark deal');
    }
  };

  const handleDelete = async (dealId: string) => {
    if (!confirm('Delete this deal?')) return;
    try {
      await api.delete(`/crm/deals/${dealId}`);
      toast.success('Deal deleted');
      loadPipeline();
    } catch {
      toast.error('Failed to delete deal');
    }
  };

  const onDragStart = (dealId: string) => {
    setDraggedDeal(dealId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedDeal) {
      handleMoveDeal(draggedDeal, stageId);
      setDraggedDeal(null);
    }
  };

  const formatCurrency = (value: string | number) => {
    return `₦${Number(value).toLocaleString()}`;
  };

  const allStages = pipeline.map(p => p.stage);
  const allDeals = pipeline.flatMap(p => p.deals);

  const totalPipelineValue = pipeline.reduce((sum, p) => sum + p.totalValue, 0);
  const totalDeals = pipeline.reduce((sum, p) => sum + p.dealCount, 0);
  const wonDeals = allDeals.filter(d => d.status === 'won');
  const wonValue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM Pipeline"
        subtitle={`${totalDeals} deals • ${formatCurrency(totalPipelineValue)} total value`}
        action={{ label: 'New Deal', onClick: () => setShowCreateDeal(true) }}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Deals</p>
              <p className="text-xl font-bold text-gray-900">{totalDeals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pipeline Value</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalPipelineValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Won Deals</p>
              <p className="text-xl font-bold text-gray-900">{wonDeals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Won Value</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(wonValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {pipeline.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
          {pipeline
            .sort((a, b) => a.stage.sequence - b.stage.sequence)
            .map((item) => {
              const { stage, deals: stageDeals, totalValue, dealCount } = item;

              return (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-80 bg-gray-50 rounded-xl border border-gray-200 flex flex-col"
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, stage.id)}
                >
                  {/* Stage Header */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        <h3 className="font-semibold text-sm text-gray-900">{stage.name}</h3>
                        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
                          {dealCount}
                        </span>
                      </div>
                      {stage.is_won && (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Won
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatCurrency(totalValue)}</p>
                  </div>

                  {/* Deal Cards */}
                  <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No deals in this stage
                      </div>
                    )}
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={() => onDragStart(deal.id)}
                        onClick={() => setSelectedDealId(deal.id)}
                        className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-primary-300 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm text-gray-900 group-hover:text-primary-700 line-clamp-2">
                            {deal.title}
                          </h4>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const el = e.currentTarget.nextElementSibling;
                                if (el) el.classList.toggle('hidden');
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            <div className="hidden absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMarkWon(deal.id); }}
                                className="w-full text-left px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                              >
                                Mark Won
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMarkLost(deal.id); }}
                                className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                              >
                                Mark Lost
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(deal.id); }}
                                className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-primary-700 mt-1">
                          {formatCurrency(deal.value)}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          {deal.expected_close_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(deal.expected_close_date).toLocaleDateString()}
                            </span>
                          )}
                          {deal.source && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded">{deal.source}</span>
                          )}
                        </div>
                        {deal.probability > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">Probability</span>
                              <span className="font-medium">{deal.probability}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full">
                              <div
                                className="h-full bg-primary-500 rounded-full"
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {showCreateDeal && (
        <CreateDealModal
          stages={allStages}
          onClose={() => setShowCreateDeal(false)}
          onCreate={loadPipeline}
        />
      )}

      {selectedDealId && (
        <DealDetailModal
          dealId={selectedDealId}
          stages={allStages}
          onClose={() => setSelectedDealId(null)}
          onUpdate={loadPipeline}
        />
      )}
    </div>
  );
}
