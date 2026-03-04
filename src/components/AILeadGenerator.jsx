import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Building2, Loader2, Download, Plus, Search } from 'lucide-react';
import { addB2BInquiry } from '../utils/b2bStorage';

const AILeadGenerator = ({ onLeadsGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [generatedLeads, setGeneratedLeads] = useState([]);
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    businessType: '',
    count: 10,
  });

  // Load saved leads on mount
  useEffect(() => {
    const savedLeads = localStorage.getItem('ai_generated_leads');
    const savedFilters = localStorage.getItem('ai_lead_filters');

    if (savedLeads) {
      const leads = JSON.parse(savedLeads);
      setGeneratedLeads(leads);
      if (onLeadsGenerated) {
        onLeadsGenerated(leads);
      }
    }

    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, [onLeadsGenerated]);

  const industryOptions = [
    'Hotels & Hospitality',
    'Spas & Wellness Centers',
    'Luxury Retail Stores',
    'Beauty Salons & Parlors',
    'Corporate Gifting Companies',
    'Wedding Planners & Event Management',
    'E-commerce & Online Marketplaces',
    'Boutique Hotels & Resorts',
    'Fitness Centers & Gyms',
    'Airlines & Premium Travel Services',
    'Real Estate & Property Developers',
    'Automobile Showrooms (Luxury)',
    'High-End Restaurants & Cafes',
    'Fashion & Lifestyle Brands',
    'Gift Shops & Specialty Stores',
  ];

  const locationOptions = [
    'Mumbai',
    'Delhi NCR',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Lucknow',
    'Chandigarh',
    'Goa',
    'Kochi',
    'Indore',
    'Surat',
  ];

  const generateLeads = async () => {
    if (!filters.industry || !filters.location) {
      alert('Please select both industry and location');
      return;
    }

    setLoading(true);
    try {
      const prompt = `You are a B2B lead generation expert for a luxury fragrance and cosmetics wholesale business called "Revieree".

Generate ${filters.count} potential B2B leads/prospects in the ${filters.industry} industry located in ${filters.location}, India.

For each lead, provide:
1. **Company Name**: Realistic business name (can be hypothetical but realistic)
2. **Contact Person**: Typical decision-maker title (e.g., "Purchase Manager", "Owner", "Operations Head")
3. **Email Pattern**: Common email format for this type of business (e.g., info@companyname.com, contact@companyname.com)
4. **Phone Pattern**: Format like "+91-XXXXXXXXXX" (don't provide real numbers)
5. **Why Target**: 2-3 line explanation of why this business would need wholesale fragrances/cosmetics
6. **Estimated Deal Value**: Potential order value in INR (realistic for this industry)
7. **Best Approach**: How to reach out (email, phone, LinkedIn, etc.)
8. **Pain Point**: What problem Revieree can solve for them

${filters.businessType ? `Focus on: ${filters.businessType}` : ''}

Format as JSON array:
[
  {
    "companyName": "...",
    "contactPerson": "...",
    "email": "...",
    "phone": "...",
    "industry": "${filters.industry}",
    "location": "${filters.location}",
    "whyTarget": "...",
    "dealValue": 50000,
    "bestApproach": "...",
    "painPoint": "..."
  }
]

Make it realistic and actionable. These should be real types of businesses that exist in ${filters.location}.`;

      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ b2bPrompt: prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate leads');
      }

      const data = await response.json();

      // Parse the leads from response
      let leads = [];
      if (Array.isArray(data)) {
        leads = data;
      } else if (data.rawText) {
        // Try to extract JSON array from raw text
        const jsonMatch = data.rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          leads = JSON.parse(jsonMatch[0]);
        }
      } else if (data.leads) {
        leads = data.leads;
      }

      setGeneratedLeads(leads);
      if (onLeadsGenerated) {
        onLeadsGenerated(leads);
      }

      // Auto-save generated leads and filters
      localStorage.setItem('ai_generated_leads', JSON.stringify(leads));
      localStorage.setItem('ai_lead_filters', JSON.stringify(filters));
    } catch (error) {
      alert('Failed to generate leads: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const importLeadToCRM = (lead) => {
    try {
      addB2BInquiry({
        companyName: lead.companyName,
        contactPerson: lead.contactPerson || 'Contact Person',
        email: lead.email,
        phone: lead.phone || '',
        industry: lead.industry || filters.industry,
        location: lead.location || filters.location,
        dealValue: lead.dealValue || 0,
        message: `Generated Lead - ${lead.whyTarget || ''}\n\nPain Point: ${lead.painPoint || ''}\n\nBest Approach: ${lead.bestApproach || ''}`,
        businessType: filters.businessType || '',
        notes: `AI Generated Lead\n\nWhy Target: ${lead.whyTarget}\nPain Point: ${lead.painPoint}\nBest Approach: ${lead.bestApproach}`,
      });
      alert(`${lead.companyName} added to CRM!`);
    } catch (error) {
      alert('Failed to import lead: ' + error.message);
    }
  };

  const importAllLeads = () => {
    let successCount = 0;
    generatedLeads.forEach((lead) => {
      try {
        addB2BInquiry({
          companyName: lead.companyName,
          contactPerson: lead.contactPerson || 'Contact Person',
          email: lead.email,
          phone: lead.phone || '',
          industry: lead.industry || filters.industry,
          location: lead.location || filters.location,
          dealValue: lead.dealValue || 0,
          message: `Generated Lead - ${lead.whyTarget || ''}\n\nPain Point: ${lead.painPoint || ''}\n\nBest Approach: ${lead.bestApproach || ''}`,
          businessType: filters.businessType || '',
          notes: `AI Generated Lead\n\nWhy Target: ${lead.whyTarget}\nPain Point: ${lead.painPoint}\nBest Approach: ${lead.bestApproach}`,
        });
        successCount++;
      } catch (error) {
        console.error('Failed to import lead:', lead.companyName, error);
      }
    });
    alert(`Successfully imported ${successCount} leads to CRM!`);

    // Clear saved leads after successful import
    if (successCount > 0) {
      localStorage.removeItem('ai_generated_leads');
      localStorage.removeItem('ai_lead_filters');
    }

    window.location.reload(); // Refresh to show new leads
  };

  const exportToCSV = () => {
    const headers = ['Company Name', 'Contact Person', 'Email', 'Phone', 'Industry', 'Location', 'Deal Value', 'Why Target', 'Pain Point', 'Best Approach'];
    const rows = generatedLeads.map(lead => [
      lead.companyName,
      lead.contactPerson,
      lead.email,
      lead.phone || '',
      lead.industry || filters.industry,
      lead.location || filters.location,
      lead.dealValue || 0,
      lead.whyTarget || '',
      lead.painPoint || '',
      lead.bestApproach || '',
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_leads_${filters.industry}_${filters.location}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles size={32} />
          <h2 className="text-2xl font-bold">AI Lead Generator</h2>
        </div>
        <p className="text-purple-100">
          Generate targeted B2B lead suggestions based on industry and location. AI will suggest potential clients with contact strategies.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Search Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 size={16} className="inline mr-1" />
              Industry *
            </label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Industry</option>
              {industryOptions.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-1" />
              Location *
            </label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Location</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Leads
            </label>
            <input
              type="number"
              min="5"
              max="50"
              value={filters.count}
              onChange={(e) => setFilters({ ...filters, count: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Business Type (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., 5-star hotels, luxury spas, premium salons..."
              value={filters.businessType}
              onChange={(e) => setFilters({ ...filters, businessType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={generateLeads}
          disabled={loading || !filters.industry || !filters.location}
          className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Generating Leads...</span>
            </>
          ) : (
            <>
              <Search size={20} />
              <span>Generate Leads</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Leads */}
      {generatedLeads.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Generated Leads ({generatedLeads.length})
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download size={18} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={importAllLeads}
                className="px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#DC143C] transition-colors flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Import All to CRM</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {generatedLeads.map((lead, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{lead.companyName}</h4>
                    <p className="text-sm text-gray-600">{lead.contactPerson}</p>
                  </div>
                  <button
                    onClick={() => importLeadToCRM(lead)}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  >
                    Add to CRM
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-500 font-medium min-w-[80px]">Email:</span>
                    <span className="text-gray-700">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-500 font-medium min-w-[80px]">Phone:</span>
                      <span className="text-gray-700">{lead.phone}</span>
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-500 font-medium min-w-[80px]">Location:</span>
                    <span className="text-gray-700">{lead.location || filters.location}</span>
                  </div>
                  {lead.dealValue && (
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-500 font-medium min-w-[80px]">Deal Value:</span>
                      <span className="text-green-600 font-semibold">₹{(lead.dealValue || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-600 mb-1">
                    <strong>Why Target:</strong> {lead.whyTarget}
                  </p>
                  {lead.painPoint && (
                    <p className="text-xs text-gray-600 mb-1">
                      <strong>Pain Point:</strong> {lead.painPoint}
                    </p>
                  )}
                  {lead.bestApproach && (
                    <p className="text-xs text-gray-600">
                      <strong>Best Approach:</strong> {lead.bestApproach}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AILeadGenerator;