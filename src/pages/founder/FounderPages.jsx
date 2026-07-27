import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBusinessPlan, updateBusinessPlan, getCompanyBudget, updateCompanyBudget } from '../../services/founderService';
import { useTranslation } from 'react-i18next';

/* ==================================
   Business Plan Component
   ================================== */
export const BusinessPlan = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    companyOverview: '',
    targetMarket: '',
    competitors: '',
    marketingStrategy: '',
    financialProjections: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['businessPlan'],
    queryFn: getBusinessPlan
  });

  useEffect(() => {
    if (data) {
      setFormData({
        companyOverview: data.companyOverview || '',
        targetMarket: data.targetMarket || '',
        competitors: data.competitors || '',
        marketingStrategy: data.marketingStrategy || '',
        financialProjections: data.financialProjections || ''
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateBusinessPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessPlan'] });
      alert('Business Plan updated successfully!');
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) return <div className="p-5">Loading...</div>;

  return (
    <div className="founder-form-page" style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--text-main)', fontSize: '32px', fontWeight: '800' }}>Strategic Business Plan</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Define your vision and build your strategy with AI-guided fields.</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="founder-card" style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>1. Company Overview</h3>
          <textarea
            name="companyOverview"
            value={formData.companyOverview}
            onChange={handleChange}
            placeholder="Describe your company vision, mission, and core values..."
            style={{ width: '100%', minHeight: '120px', padding: '15px', borderRadius: '12px', border: '1px solid #eee', outline: 'none', transition: 'border 0.3s' }}
          />
        </div>

        <div className="founder-card" style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>2. Target Market</h3>
          <textarea
            name="targetMarket"
            value={formData.targetMarket}
            onChange={handleChange}
            placeholder="Who are your primary customers? Age, location, interests..."
            style={{ width: '100%', minHeight: '120px', padding: '15px', borderRadius: '12px', border: '1px solid #eee', outline: 'none' }}
          />
        </div>

        <div className="founder-card" style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>3. Competitor Analysis</h3>
          <textarea
            name="competitors"
            value={formData.competitors}
            onChange={handleChange}
            placeholder="List your main competitors and your competitive advantage..."
            style={{ width: '100%', minHeight: '120px', padding: '15px', borderRadius: '12px', border: '1px solid #eee', outline: 'none' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={mutation.isLoading}
          style={{ 
            padding: '16px 40px', 
            background: 'var(--primary)', 
            color: '#fff', 
            borderRadius: '14px', 
            border: 'none', 
            fontWeight: '700', 
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
          }}
        >
          {mutation.isLoading ? 'Saving...' : 'Save Strategy'}
        </button>
      </form>
    </div>
  );
};

/* ==================================
   Company Budget Component
   ================================== */
export const CompanyBudget = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    totalBudget: 0,
    operatingExpenses: 0,
    marketingExpenses: 0,
    revenue: 0
  });

  const { data, isLoading } = useQuery({
    queryKey: ['companyBudget'],
    queryFn: getCompanyBudget
  });

  useEffect(() => {
    if (data) {
      setFormData({
        totalBudget: data.totalBudget || 0,
        operatingExpenses: data.operatingExpenses || 0,
        marketingExpenses: data.marketingExpenses || 0,
        revenue: data.revenue || 0
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateCompanyBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyBudget'] });
      alert('Budget updated successfully!');
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) return <div className="p-5">Loading Budget...</div>;

  const totalExpenses = formData.operatingExpenses + formData.marketingExpenses;
  const burnRate = totalExpenses - formData.revenue;

  return (
    <div className="founder-budget-page" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--text-main)', fontSize: '32px', fontWeight: '800' }}>Company Financials</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track your company burn rate, runway, and financial health.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '25px', background: 'var(--primary)', color: '#fff', borderRadius: '24px', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.2)' }}>
          <span style={{ fontSize: '14px', opacity: 0.8 }}>Total Capital</span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px' }}>{formData.totalBudget.toLocaleString()} EGP</h2>
        </div>
        <div style={{ padding: '25px', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Current Burn Rate</span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px', color: burnRate > 0 ? '#ef4444' : '#10b981' }}>
            {burnRate.toLocaleString()} EGP
          </h2>
        </div>
        <div style={{ padding: '25px', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Monthly Revenue</span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px', color: 'var(--text-main)' }}>{formData.revenue.toLocaleString()} EGP</h2>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Initial Capital (EGP)</label>
            <input type="number" name="totalBudget" value={formData.totalBudget} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee' }} />
          </div>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Operating Expenses / Mo</label>
            <input type="number" name="operatingExpenses" value={formData.operatingExpenses} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee' }} />
          </div>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Marketing Budget / Mo</label>
            <input type="number" name="marketingExpenses" value={formData.marketingExpenses} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee' }} />
          </div>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Target Revenue / Mo</label>
            <input type="number" name="revenue" value={formData.revenue} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <button 
              type="submit" 
              disabled={mutation.isLoading}
              style={{ width: '100%', padding: '16px', background: 'var(--text-main)', color: '#fff', borderRadius: '14px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
            >
              {mutation.isLoading ? 'Updating...' : 'Sync Financials'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
