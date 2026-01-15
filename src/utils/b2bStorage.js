// B2B Inquiries and Wholesale Settings Management
import { notifyNewB2BInquiry } from './notifications';

// B2B Lead Pipeline Stages
export const B2B_STATUS = {
  COLD: 'Cold Lead',
  CONTACTED: 'Contacted',
  INTERESTED: 'Interested',
  QUALIFIED: 'Qualified',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
};

// Activity Types
export const ACTIVITY_TYPES = {
  CALL: 'Call',
  EMAIL: 'Email',
  MEETING: 'Meeting',
  NOTE: 'Note',
  TASK: 'Task',
};

// Get all B2B inquiries
export const getB2BInquiries = () => {
  const inquiries = localStorage.getItem('b2b_inquiries');
  return inquiries ? JSON.parse(inquiries) : [];
};

// Add new B2B inquiry/lead
export const addB2BInquiry = (inquiry) => {
  const inquiries = getB2BInquiries();
  const newInquiry = {
    id: Date.now(),
    ...inquiry,
    status: inquiry.status || B2B_STATUS.COLD,
    notes: inquiry.notes || '',
    industry: inquiry.industry || '',
    location: inquiry.location || '',
    dealValue: inquiry.dealValue || 0,
    lastContacted: null,
    followUpDate: null,
    activities: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inquiries.unshift(newInquiry);
  localStorage.setItem('b2b_inquiries', JSON.stringify(inquiries));

  // Trigger notification for form submissions
  if (!inquiry.bulkImport) {
    notifyNewB2BInquiry(inquiry.companyName, inquiry.contactPerson);
  }

  return newInquiry;
};

// Update B2B inquiry
export const updateB2BInquiry = (id, updates) => {
  const inquiries = getB2BInquiries();
  const updatedInquiries = inquiries.map((inquiry) =>
    inquiry.id === id
      ? { ...inquiry, ...updates, updatedAt: new Date().toISOString() }
      : inquiry
  );

  localStorage.setItem('b2b_inquiries', JSON.stringify(updatedInquiries));
  return updatedInquiries.find((inquiry) => inquiry.id === id);
};

// Delete B2B inquiry
export const deleteB2BInquiry = (id) => {
  const inquiries = getB2BInquiries();
  const filtered = inquiries.filter((inquiry) => inquiry.id !== id);
  localStorage.setItem('b2b_inquiries', JSON.stringify(filtered));
  return true;
};

// Get inquiry by ID
export const getB2BInquiryById = (id) => {
  const inquiries = getB2BInquiries();
  return inquiries.find((inquiry) => inquiry.id === id);
};

// Get inquiries by status
export const getB2BInquiriesByStatus = (status) => {
  const inquiries = getB2BInquiries();
  return inquiries.filter((inquiry) => inquiry.status === status);
};

// Get new inquiries count
export const getNewB2BInquiriesCount = () => {
  const inquiries = getB2BInquiries();
  return inquiries.filter((inquiry) => inquiry.status === B2B_STATUS.NEW).length;
};

// Wholesale Settings
const DEFAULT_WHOLESALE_SETTINGS = {
  enabled: true,
  discountPercentage: 35,
  minimumOrderValue: 10000,
  minimumOrderQuantity: 10,
  paymentTerms: 'Advance payment required for first order',
  shippingInfo: 'Free shipping on orders above ₹25,000',
  returnPolicy: '7 days return policy for damaged products only',
};

// Get wholesale settings
export const getWholesaleSettings = () => {
  const settings = localStorage.getItem('wholesale_settings');
  return settings ? JSON.parse(settings) : DEFAULT_WHOLESALE_SETTINGS;
};

// Update wholesale settings
export const updateWholesaleSettings = (settings) => {
  const currentSettings = getWholesaleSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  localStorage.setItem('wholesale_settings', JSON.stringify(updatedSettings));
  return updatedSettings;
};

// Calculate wholesale price
export const calculateWholesalePrice = (retailPrice) => {
  const settings = getWholesaleSettings();
  const discount = (retailPrice * settings.discountPercentage) / 100;
  return Math.round(retailPrice - discount);
};

// Get wholesale price for product
export const getProductWholesalePrice = (product) => {
  return calculateWholesalePrice(product.price);
};

// ==================== ENHANCED CRM FEATURES ====================

// Bulk Import from CSV
export const bulkImportLeads = (csvData) => {
  const imported = [];
  const errors = [];

  csvData.forEach((row, index) => {
    try {
      if (!row.companyName || !row.email) {
        errors.push({ row: index + 1, error: 'Missing required fields (companyName, email)' });
        return;
      }

      const lead = {
        companyName: row.companyName,
        contactPerson: row.contactPerson || '',
        email: row.email,
        phone: row.phone || '',
        industry: row.industry || '',
        location: row.location || '',
        dealValue: parseFloat(row.dealValue) || 0,
        message: row.message || '',
        businessType: row.businessType || '',
        bulkImport: true,
      };

      const newLead = addB2BInquiry(lead);
      imported.push(newLead);
    } catch (error) {
      errors.push({ row: index + 1, error: error.message });
    }
  });

  return { imported, errors };
};

// Activity Management
export const addActivity = (leadId, activity) => {
  const inquiries = getB2BInquiries();
  const updatedInquiries = inquiries.map((inquiry) => {
    if (inquiry.id === leadId) {
      const newActivity = {
        id: Date.now(),
        type: activity.type,
        description: activity.description,
        createdAt: new Date().toISOString(),
        createdBy: activity.createdBy || 'Admin',
      };

      return {
        ...inquiry,
        activities: [newActivity, ...(inquiry.activities || [])],
        lastContacted: activity.type === ACTIVITY_TYPES.CALL || activity.type === ACTIVITY_TYPES.EMAIL || activity.type === ACTIVITY_TYPES.MEETING
          ? new Date().toISOString()
          : inquiry.lastContacted,
        updatedAt: new Date().toISOString(),
      };
    }
    return inquiry;
  });

  localStorage.setItem('b2b_inquiries', JSON.stringify(updatedInquiries));
  return updatedInquiries.find(inq => inq.id === leadId);
};

// Get activities for a lead
export const getActivities = (leadId) => {
  const lead = getB2BInquiryById(leadId);
  return lead?.activities || [];
};

// Set follow-up reminder
export const setFollowUpReminder = (leadId, date, note) => {
  updateB2BInquiry(leadId, {
    followUpDate: date,
    followUpNote: note,
  });
};

// Get leads due for follow-up
export const getFollowUpDue = () => {
  const inquiries = getB2BInquiries();
  const today = new Date().toISOString().split('T')[0];

  return inquiries.filter(inquiry => {
    if (!inquiry.followUpDate) return false;
    const followUpDate = new Date(inquiry.followUpDate).toISOString().split('T')[0];
    return followUpDate <= today && inquiry.status !== B2B_STATUS.CLOSED_WON && inquiry.status !== B2B_STATUS.CLOSED_LOST;
  });
};

// Advanced Filtering
export const filterLeads = (filters) => {
  let inquiries = getB2BInquiries();

  if (filters.status && filters.status !== 'all') {
    inquiries = inquiries.filter(inq => inq.status === filters.status);
  }

  if (filters.industry && filters.industry !== 'all') {
    inquiries = inquiries.filter(inq => inq.industry === filters.industry);
  }

  if (filters.location && filters.location !== 'all') {
    inquiries = inquiries.filter(inq => inq.location === filters.location);
  }

  if (filters.dealValueMin) {
    inquiries = inquiries.filter(inq => (inq.dealValue || 0) >= filters.dealValueMin);
  }

  if (filters.dealValueMax) {
    inquiries = inquiries.filter(inq => (inq.dealValue || 0) <= filters.dealValueMax);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    inquiries = inquiries.filter(inq =>
      inq.companyName.toLowerCase().includes(searchLower) ||
      inq.contactPerson.toLowerCase().includes(searchLower) ||
      inq.email.toLowerCase().includes(searchLower)
    );
  }

  return inquiries;
};

// Get unique industries
export const getUniqueIndustries = () => {
  const inquiries = getB2BInquiries();
  const industries = inquiries
    .map(inq => inq.industry)
    .filter(industry => industry && industry.trim());
  return [...new Set(industries)];
};

// Get unique locations
export const getUniqueLocations = () => {
  const inquiries = getB2BInquiries();
  const locations = inquiries
    .map(inq => inq.location)
    .filter(location => location && location.trim());
  return [...new Set(locations)];
};

// Pipeline Analytics
export const getPipelineAnalytics = () => {
  const inquiries = getB2BInquiries();

  const analytics = {
    total: inquiries.length,
    byStage: {},
    totalDealValue: 0,
    avgDealValue: 0,
    conversionRate: 0,
  };

  Object.values(B2B_STATUS).forEach(status => {
    analytics.byStage[status] = {
      count: inquiries.filter(inq => inq.status === status).length,
      value: inquiries
        .filter(inq => inq.status === status)
        .reduce((sum, inq) => sum + (inq.dealValue || 0), 0),
    };
  });

  analytics.totalDealValue = inquiries.reduce((sum, inq) => sum + (inq.dealValue || 0), 0);
  analytics.avgDealValue = analytics.total > 0 ? Math.round(analytics.totalDealValue / analytics.total) : 0;

  const closedWon = analytics.byStage[B2B_STATUS.CLOSED_WON]?.count || 0;
  const closedTotal = (analytics.byStage[B2B_STATUS.CLOSED_WON]?.count || 0) +
    (analytics.byStage[B2B_STATUS.CLOSED_LOST]?.count || 0);

  analytics.conversionRate = closedTotal > 0 ? Math.round((closedWon / closedTotal) * 100) : 0;

  return analytics;
};

// Export leads to CSV format
export const exportLeadsToCSV = (leads = null) => {
  const leadsToExport = leads || getB2BInquiries();

  const headers = [
    'Company Name',
    'Contact Person',
    'Email',
    'Phone',
    'Industry',
    'Location',
    'Deal Value',
    'Status',
    'Last Contacted',
    'Follow Up Date',
    'Created Date',
  ];

  const rows = leadsToExport.map(lead => [
    lead.companyName,
    lead.contactPerson,
    lead.email,
    lead.phone || '',
    lead.industry || '',
    lead.location || '',
    lead.dealValue || 0,
    lead.status,
    lead.lastContacted ? new Date(lead.lastContacted).toLocaleDateString('en-GB') : '',
    lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString('en-GB') : '',
    new Date(lead.createdAt).toLocaleDateString('en-GB'),
  ]);

  return [headers, ...rows];
};