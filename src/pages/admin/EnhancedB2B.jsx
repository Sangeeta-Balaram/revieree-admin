import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import {
  Briefcase, Upload, Download, Brain, Filter, Plus, Calendar, Phone, Mail, MessageSquare,
  Edit, Trash2, Clock, TrendingUp, Target, User, Building2, MapPin, DollarSign, X, Sparkles
} from 'lucide-react';
import {
  getB2BInquiries, updateB2BInquiry, deleteB2BInquiry, B2B_STATUS, ACTIVITY_TYPES,
  bulkImportLeads, addActivity, setFollowUpReminder, filterLeads, getPipelineAnalytics,
  exportLeadsToCSV, getUniqueIndustries, getUniqueLocations, getFollowUpDue
} from '../../utils/b2bStorage';
import AIB2BCoach from '../../components/AIB2BCoach';
import AILeadGenerator from '../../components/AILeadGenerator';

const EnhancedB2B = () => {
  const [activeTab, setActiveTab] = useState('list'); // list, pipeline, coach, generator
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [filters, setFilters] = useState({ status: 'all', industry: 'all', location: 'all', search: '' });
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = filterLeads(filters);
    setFilteredLeads(filtered);
  }, [filters, leads]);

  const loadData = () => {
    const allLeads = getB2BInquiries();
    setLeads(allLeads);
    setFilteredLeads(allLeads);
    setAnalytics(getPipelineAnalytics());
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const { imported, errors } = bulkImportLeads(results.data);
        alert(`Imported ${imported.length} leads. ${errors.length} errors.`);
        loadData();
        setShowImportModal(false);
      },
      error: (error) => {
        alert('Error parsing CSV: ' + error.message);
      }
    });
  };

  const handleExport = () => {
    const csvData = exportLeadsToCSV(filteredLeads);
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `b2b_leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleStatusChange = (leadId, newStatus) => {
    updateB2BInquiry(leadId, { status: newStatus });
    loadData();
  };

  const handleAddActivity = (type, description) => {
    addActivity(selectedLead.id, { type, description, createdBy: localStorage.getItem('adminEmail') || 'Admin' });
    loadData();
    setShowActivityModal(false);
  };

  const handleSetFollowUp = (date, note) => {
    setFollowUpReminder(selectedLead.id, date, note);
    loadData();
    setShowFollowUpModal(false);
  };

  const handleDelete = (leadId) => {
    if (window.confirm('Delete this lead?')) {
      deleteB2BInquiry(leadId);
      loadData();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      [B2B_STATUS.COLD]: 'bg-gray-100 text-gray-700 border-gray-300',
      [B2B_STATUS.CONTACTED]: 'bg-blue-100 text-blue-700 border-blue-300',
      [B2B_STATUS.INTERESTED]: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      [B2B_STATUS.QUALIFIED]: 'bg-green-100 text-green-700 border-green-300',
      [B2B_STATUS.CLOSED_WON]: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      [B2B_STATUS.CLOSED_LOST]: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const followUpsDue = getFollowUpDue();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <Briefcase className="text-[#8B0000]" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">B2B CRM</h1>
            <p className="text-sm text-gray-600">Wholesale & Partnership Management</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Upload size={18} />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <StatCard label="Total" value={analytics.total} icon={Briefcase} color="gray" />
          <StatCard label="Cold" value={analytics.byStage[B2B_STATUS.COLD]?.count || 0} color="gray" />
          <StatCard label="Contacted" value={analytics.byStage[B2B_STATUS.CONTACTED]?.count || 0} color="blue" />
          <StatCard label="Interested" value={analytics.byStage[B2B_STATUS.INTERESTED]?.count || 0} color="yellow" />
          <StatCard label="Qualified" value={analytics.byStage[B2B_STATUS.QUALIFIED]?.count || 0} color="green" />
          <StatCard label="Won" value={analytics.byStage[B2B_STATUS.CLOSED_WON]?.count || 0} color="emerald" />
          <StatCard label="Lost" value={analytics.byStage[B2B_STATUS.CLOSED_LOST]?.count || 0} color="red" />
        </div>
      )}

      {/* Follow-ups Due Alert */}
      {followUpsDue.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="text-amber-600" size={20} />
            <p className="text-amber-900 font-medium">
              {followUpsDue.length} lead{followUpsDue.length > 1 ? 's' : ''} need follow-up today!
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {['list', 'pipeline', 'generator', 'coach'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab ? 'bg-[#8B0000] text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            {tab === 'list' && 'List View'}
            {tab === 'pipeline' && 'Pipeline'}
            {tab === 'generator' && 'Find Leads'}
            {tab === 'coach' && 'AI Coach'}
          </button>
        ))}
      </div>

      {/* Filters (for list and pipeline) */}
      {(activeTab === 'list' || activeTab === 'pipeline') && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            />

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            >
              <option value="all">All Stages</option>
              {Object.values(B2B_STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            >
              <option value="all">All Industries</option>
              {getUniqueIndustries().map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>

            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            >
              <option value="all">All Locations</option>
              {getUniqueLocations().map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'list' && (
        <ListView
          leads={filteredLeads}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onSelectLead={(lead) => {
            setSelectedLead(lead);
            setShowActivityModal(true);
          }}
          onSetFollowUp={(lead) => {
            setSelectedLead(lead);
            setShowFollowUpModal(true);
          }}
          getStatusColor={getStatusColor}
        />
      )}

      {activeTab === 'pipeline' && (
        <PipelineView
          leads={filteredLeads}
          onStatusChange={handleStatusChange}
          getStatusColor={getStatusColor}
        />
      )}

      {activeTab === 'generator' && (
        <AILeadGenerator onLeadsGenerated={loadData} />
      )}

      {activeTab === 'coach' && analytics && (
        <AIB2BCoach
          leadsData={{
            total: analytics.total,
            cold: analytics.byStage[B2B_STATUS.COLD]?.count || 0,
            contacted: analytics.byStage[B2B_STATUS.CONTACTED]?.count || 0,
            interested: analytics.byStage[B2B_STATUS.INTERESTED]?.count || 0,
            qualified: analytics.byStage[B2B_STATUS.QUALIFIED]?.count || 0,
            closedWon: analytics.byStage[B2B_STATUS.CLOSED_WON]?.count || 0,
            closedLost: analytics.byStage[B2B_STATUS.CLOSED_LOST]?.count || 0,
            topIndustries: getUniqueIndustries().slice(0, 5),
            topLocations: getUniqueLocations().slice(0, 5),
          }}
          pipelineAnalytics={analytics}
        />
      )}

      {/* Modals */}
      <ImportModal show={showImportModal} onClose={() => setShowImportModal(false)} onUpload={handleCSVUpload} />
      <ActivityModal
        show={showActivityModal}
        lead={selectedLead}
        onClose={() => setShowActivityModal(false)}
        onAddActivity={handleAddActivity}
      />
      <FollowUpModal
        show={showFollowUpModal}
        lead={selectedLead}
        onClose={() => setShowFollowUpModal(false)}
        onSetFollowUp={handleSetFollowUp}
      />
    </div>
  );
};

// Sub-components
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    gray: 'bg-gray-50 border-gray-200',
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    red: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-3`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const ListView = ({ leads, onStatusChange, onDelete, onSelectLead, onSetFollowUp, getStatusColor }) => {
  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No leads found</h3>
        <p className="text-gray-600">Import leads via CSV or wait for inquiries from your website.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <motion.div
          key={lead.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h3 className="text-lg font-bold text-gray-900">{lead.companyName}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
                {lead.followUpDate && new Date(lead.followUpDate) <= new Date() && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                    Follow-up Due
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <InfoItem icon={User} text={lead.contactPerson} />
                <InfoItem icon={Mail} text={lead.email} />
                <InfoItem icon={Phone} text={lead.phone || 'N/A'} />
                <InfoItem icon={Building2} text={lead.industry || 'N/A'} />
                <InfoItem icon={MapPin} text={lead.location || 'N/A'} />
                <InfoItem icon={DollarSign} text={lead.dealValue ? `₹${lead.dealValue}` : 'N/A'} />
                {lead.lastContacted && (
                  <InfoItem icon={Clock} text={`Last: ${new Date(lead.lastContacted).toLocaleDateString('en-GB')}`} />
                )}
                {lead.followUpDate && (
                  <InfoItem icon={Calendar} text={`Follow-up: ${new Date(lead.followUpDate).toLocaleDateString('en-GB')}`} />
                )}
              </div>

              {lead.activities && lead.activities.length > 0 && (
                <p className="text-xs text-gray-500">
                  {lead.activities.length} activit{lead.activities.length > 1 ? 'ies' : 'y'} logged
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-2 ml-4">
              <select
                value={lead.status}
                onChange={(e) => onStatusChange(lead.id, e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              >
                {Object.values(B2B_STATUS).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <button
                onClick={() => onSelectLead(lead)}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
              >
                Activity
              </button>

              <button
                onClick={() => onSetFollowUp(lead)}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
              >
                Follow-up
              </button>

              <button
                onClick={() => onDelete(lead.id)}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const InfoItem = ({ icon: Icon, text }) => (
  <div className="flex items-center space-x-2 text-gray-600">
    <Icon size={14} className="flex-shrink-0" />
    <span className="text-xs truncate">{text}</span>
  </div>
);

const PipelineView = ({ leads, onStatusChange, getStatusColor }) => {
  const stages = Object.values(B2B_STATUS);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stages.map(stage => {
        const stageLeads = leads.filter(l => l.status === stage);
        return (
          <div key={stage} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm">{stage}</h3>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{stageLeads.length}</span>
            </div>
            <div className="space-y-2">
              {stageLeads.map(lead => (
                <div key={lead.id} className={`p-3 rounded-lg border ${getStatusColor(lead.status)}`}>
                  <p className="font-semibold text-sm mb-1">{lead.companyName}</p>
                  <p className="text-xs text-gray-600">{lead.contactPerson}</p>
                  {lead.dealValue > 0 && (
                    <p className="text-xs font-medium mt-1">₹{lead.dealValue}</p>
                  )}
                  <select
                    value={lead.status}
                    onChange={(e) => onStatusChange(lead.id, e.target.value)}
                    className="w-full mt-2 px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    {Object.values(B2B_STATUS).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ImportModal = ({ show, onClose, onUpload }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Import Leads from CSV</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            Upload a CSV file with these columns: <strong>companyName, contactPerson, email, phone, industry, location, dealValue, message</strong>
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Required: companyName, email | Optional: all others
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={onUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8B0000] file:text-white hover:file:bg-[#DC143C]"
          />
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

const ActivityModal = ({ show, lead, onClose, onAddActivity }) => {
  const [activityType, setActivityType] = useState(ACTIVITY_TYPES.NOTE);
  const [description, setDescription] = useState('');

  if (!show || !lead) return null;

  const handleSubmit = () => {
    if (!description.trim()) return;
    onAddActivity(activityType, description);
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Activity Log - {lead.companyName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Add Activity */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Log New Activity</h4>
          <div className="space-y-3">
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {Object.values(ACTIVITY_TYPES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the activity..."
              className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleSubmit}
              className="w-full px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#DC143C]"
            >
              Log Activity
            </button>
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Activity Timeline</h4>
          {lead.activities && lead.activities.length > 0 ? (
            <div className="space-y-3">
              {lead.activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 border-l-2 border-gray-300 pl-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {activity.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString('en-GB')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">By: {activity.createdBy}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No activities logged yet</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const FollowUpModal = ({ show, lead, onClose, onSetFollowUp }) => {
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  if (!show || !lead) return null;

  const handleSubmit = () => {
    if (!date) return;
    onSetFollowUp(date, note);
    setDate('');
    setNote('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Set Follow-up - {lead.companyName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What to discuss during follow-up..."
              className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#DC143C]"
            >
              Set Reminder
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedB2B;