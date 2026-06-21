import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { X, Calendar, Plus, Check, Trash2, FileText, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

interface Deal {
  id: string;
  dealNumber: string;
  title: string;
  customerId: string;
  stageId: string;
  value: number;
  currency: string;
  probability: number;
  expectedCloseDate: string;
  actualCloseDate: string | null;
  assigneeId: string;
  source: string;
  type: string;
  status: string;
  notes: string;
  createdAt: string;
  stage?: { name: string; color: string };
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt: string | null;
  outcome: string;
  entityType: string;
  entityId: string;
}

interface Note {
  id: string;
  content: string;
  isPinned: boolean;
  entityType: string;
  entityId: string;
  createdAt: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface DealDetailModalProps {
  dealId: string;
  stages: { id: string; name: string }[];
  onClose: () => void;
  onUpdate: () => void;
}

const activityTypes = [
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'task', label: 'Task' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'email', label: 'Email' },
  { value: 'note', label: 'Note' },
];

export default function DealDetailModal({ dealId, stages, onClose, onUpdate }: DealDetailModalProps) {
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'activities' | 'notes' | 'tags'>('details');
  const [loading, setLoading] = useState(true);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [dealTags, setDealTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: 'call',
    title: '',
    description: '',
    dueDate: '',
  });

  const [noteContent, setNoteContent] = useState('');
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#6366f1');
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostReason, setLostReason] = useState('');

  const fetchDeal = useCallback(async () => {
    try {
      const res = await api.get(`/crm/deals/${dealId}`);
      setDeal(res.data);
    } catch {
      toast.error('Failed to load deal');
    }
  }, [dealId]);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await api.get(`/crm/activities?entityType=deal&entityId=${dealId}`);
      setActivities(res.data);
    } catch {
      toast.error('Failed to load activities');
    }
  }, [dealId]);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await api.get(`/crm/notes?entityType=deal&entityId=${dealId}`);
      setNotes(res.data);
    } catch {
      toast.error('Failed to load notes');
    }
  }, [dealId]);

  const fetchDealTags = useCallback(async () => {
    try {
      const res = await api.get(`/crm/tags/entity?entityType=deal&entityId=${dealId}`);
      setDealTags(res.data);
    } catch {
      toast.error('Failed to load deal tags');
    }
  }, [dealId]);

  const fetchAllTags = useCallback(async () => {
    try {
      const res = await api.get('/crm/tags');
      setAllTags(res.data);
    } catch {
      toast.error('Failed to load tags');
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchDeal(), fetchActivities(), fetchNotes(), fetchDealTags(), fetchAllTags()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchDeal, fetchActivities, fetchNotes, fetchDealTags, fetchAllTags]);

  const handleMoveStage = async (stageId: string) => {
    try {
      await api.post(`/crm/deals/${dealId}/move`, { stageId });
      toast.success('Deal moved');
      fetchDeal();
      onUpdate();
    } catch {
      toast.error('Failed to move deal');
    }
  };

  const handleMarkWon = async () => {
    try {
      await api.post(`/crm/deals/${dealId}/won`);
      toast.success('Deal marked as won');
      fetchDeal();
      onUpdate();
    } catch {
      toast.error('Failed to mark deal as won');
    }
  };

  const handleMarkLost = async () => {
    try {
      await api.post(`/crm/deals/${dealId}/lost`, { lostReason });
      toast.success('Deal marked as lost');
      setShowLostModal(false);
      setLostReason('');
      fetchDeal();
      onUpdate();
    } catch {
      toast.error('Failed to mark deal as lost');
    }
  };

  const handleDeleteDeal = async () => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    try {
      await api.delete(`/crm/deals/${dealId}`);
      toast.success('Deal deleted');
      onUpdate();
      onClose();
    } catch {
      toast.error('Failed to delete deal');
    }
  };

  const handleConvertToQuote = () => {
    onClose();
    navigate('/quotes');
  };

  const handleConvertToInvoice = () => {
    onClose();
    navigate('/invoices');
  };

  const handleCreateActivity = async () => {
    if (!activityForm.title.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      await api.post('/crm/activities', {
        entityType: 'deal',
        entityId: dealId,
        type: activityForm.type,
        title: activityForm.title,
        description: activityForm.description || undefined,
        dueDate: activityForm.dueDate || undefined,
      });
      toast.success('Activity created');
      setActivityForm({ type: 'call', title: '', description: '', dueDate: '' });
      setShowActivityForm(false);
      fetchActivities();
    } catch {
      toast.error('Failed to create activity');
    }
  };

  const handleCompleteActivity = async (activityId: string) => {
    try {
      await api.patch(`/crm/activities/${activityId}/complete`, { outcome: 'completed' });
      toast.success('Activity completed');
      fetchActivities();
    } catch {
      toast.error('Failed to complete activity');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await api.delete(`/crm/activities/${activityId}`);
      toast.success('Activity deleted');
      fetchActivities();
    } catch {
      toast.error('Failed to delete activity');
    }
  };

  const handleCreateNote = async () => {
    if (!noteContent.trim()) {
      toast.error('Note content is required');
      return;
    }
    try {
      await api.post('/crm/notes', {
        entityType: 'deal',
        entityId: dealId,
        content: noteContent,
      });
      toast.success('Note added');
      setNoteContent('');
      fetchNotes();
    } catch {
      toast.error('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.delete(`/crm/notes/${noteId}`);
      toast.success('Note deleted');
      fetchNotes();
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const handleCreateTag = async () => {
    if (!tagName.trim()) {
      toast.error('Tag name is required');
      return;
    }
    try {
      await api.post('/crm/tags', { name: tagName, color: tagColor });
      toast.success('Tag created');
      setTagName('');
      setTagColor('#6366f1');
      fetchAllTags();
    } catch {
      toast.error('Failed to create tag');
    }
  };

  const handleAttachTag = async (tagId: string) => {
    try {
      await api.post(`/crm/tags/${tagId}/attach`, { entityType: 'deal', entityId: dealId });
      toast.success('Tag attached');
      fetchDealTags();
    } catch {
      toast.error('Failed to attach tag');
    }
  };

  const handleDetachTag = async (tagId: string) => {
    try {
      await api.delete(`/crm/tags/${tagId}/detach`, { data: { entityType: 'deal', entityId: dealId } });
      toast.success('Tag detached');
      fetchDealTags();
    } catch {
      toast.error('Failed to detach tag');
    }
  };

  const formatCurrency = (amount: number) => `\u20A6${amount.toLocaleString()}`;

  const formatDate = (date: string) =>
    date ? new Date(date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : '\u2014';

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'activities', label: `Activities (${activities.length})` },
    { key: 'notes', label: `Notes (${notes.length})` },
    { key: 'tags', label: 'Tags' },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-8 text-gray-500">Deal not found</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{deal.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{deal.dealNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex border-b px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Value</label>
                  <p className="mt-1 text-2xl font-bold text-primary-600">{formatCurrency(deal.value)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                  <span className={`mt-1 inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                    deal.status === 'won' ? 'bg-green-100 text-green-700' :
                    deal.status === 'lost' ? 'bg-red-100 text-red-700' :
                    deal.status === 'deleted' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {deal.status?.charAt(0).toUpperCase() + deal.status?.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Stage</label>
                  <div className="mt-1 flex items-center gap-2">
                    {deal.stage && (
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: deal.stage.color }} />
                    )}
                    <span className="text-sm font-medium text-gray-900">{deal.stage?.name || '\u2014'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Probability</label>
                  <p className="mt-1 text-sm text-gray-900">{deal.probability}%</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
                  <p className="mt-1 text-sm text-gray-900">{deal.type || '\u2014'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Source</label>
                  <p className="mt-1 text-sm text-gray-900">{deal.source || '\u2014'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Expected Close</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(deal.expectedCloseDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Actual Close</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(deal.actualCloseDate)}</p>
                </div>
              </div>

              {deal.notes && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{deal.notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Move to Stage</label>
                <div className="flex flex-wrap gap-2">
                  {stages.map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => handleMoveStage(stage.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        deal.stageId === stage.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {stage.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Actions</label>
                <div className="flex gap-2">
                  {deal.status !== 'won' && (
                    <button
                      onClick={handleMarkWon}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      <Check size={16} />
                      Mark Won
                    </button>
                  )}
                  {deal.status === 'won' && (
                    <>
                      <button
                        onClick={handleConvertToQuote}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        <FileText size={16} />
                        Convert to Quote
                      </button>
                      <button
                        onClick={handleConvertToInvoice}
                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                      >
                        <Receipt size={16} />
                        Convert to Invoice
                      </button>
                    </>
                  )}
                  {deal.status !== 'lost' && (
                    <button
                      onClick={() => setShowLostModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Mark Lost
                    </button>
                  )}
                  <button
                    onClick={handleDeleteDeal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors ml-auto"
                  >
                    <Trash2 size={16} />
                    Delete Deal
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowActivityForm(!showActivityForm)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Activity
                </button>
              </div>

              {showActivityForm && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={activityForm.type}
                        onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      >
                        {activityTypes.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={activityForm.dueDate}
                        onChange={(e) => setActivityForm({ ...activityForm, dueDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={activityForm.title}
                      onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="Activity title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={activityForm.description}
                      onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      rows={2}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowActivityForm(false)}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateActivity}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      Create Activity
                    </button>
                  </div>
                </div>
              )}

              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No activities yet</p>
              ) : (
                <div className="space-y-2">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        activity.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                            {activity.type.replace('_', ' ')}
                          </span>
                          {activity.completed && (
                            <span className="text-xs text-green-600 font-medium">Completed</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-1">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                        )}
                        {activity.dueDate && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar size={12} />
                            Due: {formatDate(activity.dueDate)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {!activity.completed && (
                          <button
                            onClick={() => handleCompleteActivity(activity.id)}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="Complete"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  rows={3}
                  placeholder="Write a note..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleCreateNote}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Note
                </button>
              </div>

              {notes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No notes yet</p>
              ) : (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg border ${note.isPinned ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {note.isPinned && (
                            <span className="text-xs font-medium text-yellow-600 mb-1 inline-block">Pinned</span>
                          )}
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                          <p className="text-xs text-gray-400 mt-2">{formatDate(note.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Create New Tag</h4>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={tagName}
                      onChange={(e) => setTagName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="Tag name"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="color"
                      value={tagColor}
                      onChange={(e) => setTagColor(e.target.value)}
                      className="w-full h-[38px] border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={handleCreateTag}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Attached Tags</h4>
                {dealTags.length === 0 ? (
                  <p className="text-sm text-gray-500">No tags attached</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {dealTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                        <button
                          onClick={() => handleDetachTag(tag.id)}
                          className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Available Tags</h4>
                {allTags.filter((t) => !dealTags.some((dt) => dt.id === t.id)).length === 0 ? (
                  <p className="text-sm text-gray-500">All tags are attached or none available</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allTags
                      .filter((t) => !dealTags.some((dt) => dt.id === t.id))
                      .map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleAttachTag(tag.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border-2 border-dashed transition-colors"
                          style={{ borderColor: tag.color, color: tag.color }}
                        >
                          <Plus size={14} />
                          {tag.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showLostModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark Deal as Lost</h3>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                rows={3}
                placeholder="Why was this deal lost?"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowLostModal(false); setLostReason(''); }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkLost}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
