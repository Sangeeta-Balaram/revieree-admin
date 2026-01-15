import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Users, Download, Trash2, Upload, UserPlus } from 'lucide-react';
import { getNewsletterSubscribers, deleteNewsletterSubscriber, addNewsletterSubscriber } from '../../utils/adminStorage';

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubscriberEmail, setNewSubscriberEmail] = useState('');
  const fileInputRef = useRef(null);
  const [email, setEmail] = useState({
    subject: '',
    content: '',
    preview: '',
  });

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = () => {
    setSubscribers(getNewsletterSubscribers());
    setLoading(false);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    // In production, this would integrate with an email service like SendGrid or AWS SES
    alert(`Email "${email.subject}" would be sent to ${subscribers.length} subscribers`);
    setEmail({ subject: '', content: '', preview: '' });
    setShowComposeModal(false);
  };

  const handleDeleteSubscriber = (id, subscriberEmail) => {
    if (window.confirm(`Remove ${subscriberEmail} from newsletter?`)) {
      deleteNewsletterSubscriber(id);
      loadSubscribers();
    }
  };

  const exportSubscribers = () => {
    const csv = ['Email,Subscribed Date\n'];
    subscribers.forEach((sub) => {
      csv.push(`${sub.email},${new Date(sub.subscribed_at).toLocaleDateString()}\n`);
    });
    const blob = new Blob(csv, { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
  };

  const handleAddSubscriber = (e) => {
    e.preventDefault();
    if (newSubscriberEmail) {
      // Check if email already exists
      const exists = subscribers.some(s => s.email === newSubscriberEmail);
      if (exists) {
        alert('This email is already subscribed');
        return;
      }

      addNewsletterSubscriber(newSubscriberEmail);
      loadSubscribers();
      setNewSubscriberEmail('');
      setShowAddModal(false);
    }
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target.result;
      const lines = csv.split('\n');
      let addedCount = 0;
      let skippedCount = 0;

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Extract email (first column)
        const email = line.split(',')[0].trim().replace(/"/g, '');

        if (email && email.includes('@')) {
          // Check if already exists
          const exists = subscribers.some(s => s.email === email);
          if (!exists) {
            addNewsletterSubscriber(email);
            addedCount++;
          } else {
            skippedCount++;
          }
        }
      }

      loadSubscribers();
      alert(`Import complete!\nAdded: ${addedCount} subscribers\nSkipped (already subscribed): ${skippedCount}`);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Newsletter</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 border border-green-700 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
          >
            <UserPlus size={18} />
            <span>Add Subscriber</span>
          </button>
          <label className="flex items-center space-x-2 border border-blue-700 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
            <Upload size={18} />
            <span>Import CSV</span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>
          <button
            onClick={exportSubscribers}
            className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowComposeModal(true)}
            className="flex items-center space-x-2 bg-burgundy-700 text-white px-6 py-3 rounded-lg hover:bg-burgundy-800 transition-colors"
          >
            <Send size={20} />
            <span>Compose Email</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Subscribers</p>
              <p className="text-3xl font-bold text-gray-900">{subscribers.length}</p>
            </div>
            <Users className="text-burgundy-700" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">This Week</p>
              <p className="text-3xl font-bold text-green-600">
                {
                  subscribers.filter(
                    (s) =>
                      new Date(s.subscribed_at) >
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length
                }
              </p>
            </div>
            <Mail className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Subscribers</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading subscribers...</div>
          ) : subscribers.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No subscribers yet</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Subscribed Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-burgundy-100 rounded-full flex items-center justify-center">
                          <Mail className="text-burgundy-700" size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {subscriber.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(subscriber.subscribed_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteSubscriber(subscriber.id, subscriber.email)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Subscriber</h2>
            <form onSubmit={handleAddSubscriber} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={newSubscriberEmail}
                    onChange={(e) => setNewSubscriberEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    placeholder="subscriber@example.com"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewSubscriberEmail('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 transition-colors"
                >
                  Add Subscriber
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Compose Email Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Compose Newsletter</h2>
              <p className="text-sm text-gray-600 mt-1">
                This will be sent to {subscribers.length} subscribers
              </p>
            </div>

            <form onSubmit={handleSendEmail} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={email.subject}
                  onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview Text
                </label>
                <input
                  type="text"
                  value={email.preview}
                  onChange={(e) => setEmail({ ...email, preview: e.target.value })}
                  placeholder="This appears in the email preview..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content
                </label>
                <textarea
                  value={email.content}
                  onChange={(e) => setEmail({ ...email, content: e.target.value })}
                  rows="12"
                  placeholder="Write your email content here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  required
                ></textarea>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> In production, this will integrate with an email service
                  provider (SendGrid, AWS SES, etc.) to send bulk emails.
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 transition-colors"
                >
                  <Send size={18} />
                  <span>Send to All Subscribers</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Newsletter;