import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Mail, Phone, Building2, User, Calendar, Edit, Trash2, CheckCircle } from 'lucide-react';
import {
  getB2BInquiries,
  updateB2BInquiry,
  deleteB2BInquiry,
  B2B_STATUS,
  getNewB2BInquiriesCount,
} from '../../utils/b2bStorage';

const B2BInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = () => {
    const allInquiries = getB2BInquiries();
    setInquiries(allInquiries);
  };

  const handleStatusChange = (id, newStatus) => {
    updateB2BInquiry(id, { status: newStatus });
    loadInquiries();
  };

  const handleAddNote = (id, note) => {
    updateB2BInquiry(id, { notes: note });
    loadInquiries();
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      deleteB2BInquiry(id);
      loadInquiries();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case B2B_STATUS.NEW:
        return 'bg-blue-100 text-blue-700';
      case B2B_STATUS.CONTACTED:
        return 'bg-yellow-100 text-yellow-700';
      case B2B_STATUS.QUALIFIED:
        return 'bg-green-100 text-green-700';
      case B2B_STATUS.CLOSED:
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredInquiries = filterStatus === 'all'
    ? inquiries
    : inquiries.filter(inq => inq.status === filterStatus);

  const stats = {
    total: inquiries.length,
    new: inquiries.filter(inq => inq.status === B2B_STATUS.NEW).length,
    contacted: inquiries.filter(inq => inq.status === B2B_STATUS.CONTACTED).length,
    qualified: inquiries.filter(inq => inq.status === B2B_STATUS.QUALIFIED).length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <Briefcase className="text-[#8B0000]" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">B2B Inquiries</h1>
            <p className="text-sm text-gray-600">Manage wholesale and partnership inquiries</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Briefcase className="text-gray-400" size={32} />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">New</p>
              <p className="text-2xl font-bold text-blue-900">{stats.new}</p>
            </div>
            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-bold text-lg">{stats.new}</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Contacted</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.contacted}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
              <span className="text-yellow-700 font-bold text-lg">{stats.contacted}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Qualified</p>
              <p className="text-2xl font-bold text-green-900">{stats.qualified}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex space-x-3">
          {['all', B2B_STATUS.NEW, B2B_STATUS.CONTACTED, B2B_STATUS.QUALIFIED, B2B_STATUS.CLOSED].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-[#8B0000] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No inquiries found</h3>
          <p className="text-gray-600">
            {filterStatus === 'all'
              ? 'No B2B inquiries yet. They will appear here when customers submit the wholesale form.'
              : `No inquiries with status "${filterStatus}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <motion.div
              key={inquiry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{inquiry.companyName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User size={16} />
                      <span className="text-sm">{inquiry.contactPerson}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail size={16} />
                      <span className="text-sm">{inquiry.email}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone size={16} />
                      <span className="text-sm">{inquiry.phone}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <Building2 size={16} />
                      <span className="text-sm">{inquiry.businessType || 'Not specified'}</span>
                    </div>
                  </div>

                  {inquiry.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700"><strong>Message:</strong> {inquiry.message}</p>
                    </div>
                  )}

                  {inquiry.notes && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                      <p className="text-sm text-blue-900"><strong>Internal Notes:</strong> {inquiry.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar size={14} />
                    <span>Submitted: {new Date(inquiry.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <select
                    value={inquiry.status}
                    onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
                  >
                    {Object.values(B2B_STATUS).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setSelectedInquiry(inquiry);
                      setShowModal(true);
                    }}
                    className="flex items-center justify-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Edit size={14} />
                    <span>Notes</span>
                  </button>

                  <button
                    onClick={() => handleDelete(inquiry.id)}
                    className="flex items-center justify-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Notes Modal */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add/Edit Notes</h3>
            <p className="text-sm text-gray-600 mb-4">Internal notes for: <strong>{selectedInquiry.companyName}</strong></p>

            <textarea
              defaultValue={selectedInquiry.notes}
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] mb-4"
              placeholder="Add internal notes about this inquiry..."
              id="inquiry-notes"
            />

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const notes = document.getElementById('inquiry-notes').value;
                  handleAddNote(selectedInquiry.id, notes);
                }}
                className="flex-1 px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#DC143C] transition-colors"
              >
                Save Notes
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedInquiry(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default B2BInquiries;