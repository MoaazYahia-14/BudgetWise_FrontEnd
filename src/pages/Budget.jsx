import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getMyPlan, getPlanSummary } from '../services/planService';
import { getMyBudget, createBudget, updateBudget, getBudgetStats, getBudgetTips } from '../services/budgetService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import '../styles/pages/Budget.css';

/* ==============================
   Icons
   ============================== */
const BagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
);

const PlannedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const SetBudgetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

/* ==============================
   Component
   ============================== */
const Budget = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // Date states for chart filtering
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [closingEditModal, setClosingEditModal] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editPeriod, setEditPeriod] = useState('monthly');
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  // Queries
  const { data: planData = {} } = useQuery({
    queryKey: ['myPlanItems'],
    queryFn: async () => {
      const res = await getMyPlan();
      return res.data?.data || {};
    }
  });
  const planItems = Array.isArray(planData.items) ? planData.items : [];

  const { data: summary } = useQuery({
    queryKey: ['planSummary'],
    queryFn: async () => (await getPlanSummary()).data?.data
  });

  const { data: budgetStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['budgetStats', selectedMonth, selectedYear],
    queryFn: async () => (await getBudgetStats(selectedMonth, selectedYear)).data?.data
  });

  const { data: budgetInfo } = useQuery({
    queryKey: ['myBudget'],
    queryFn: async () => (await getMyBudget()).data?.data
  });

  const { data: budgetTips = [] } = useQuery({
    queryKey: ['budgetTips'],
    queryFn: async () => (await getBudgetTips()).data?.data?.tips || []
  });

  // Mutations
  const budgetMutation = useMutation({
    mutationFn: async ({ id, amount, period, isUpdate }) => {
      if (isUpdate) return updateBudget(id, { amount, period });
      return createBudget({ amount, period, currency: 'EGP' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBudget'] });
      queryClient.invalidateQueries({ queryKey: ['budgetStats'] });
      queryClient.invalidateQueries({ queryKey: ['planSummary'] });
      closeEditModal();
      setPopupMessage(t('budgetSaved', 'Budget saved successfully!'));
      setIsSuccess(true);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Failed to save budget';
      setPopupMessage(msg);
      setIsSuccess(false);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    }
  });

  // Budget calculations — prefer API summary when available
  const totalBudget = budgetInfo?.amount ?? summary?.totalBudget ?? 0;
  const spent       = budgetInfo?.spent ?? budgetStats?.totalSpent ?? summary?.spent ?? planItems.reduce((a, i) => a + (Number(i.cost || i.price) || 0), 0);
  const remaining   = budgetInfo?.hasBudget ? (totalBudget - spent) : (summary?.remaining ?? (totalBudget - spent));

  // Recent Expenses — prefer real API data
  const recentExpenses = budgetStats?.recentExpenses?.length
    ? budgetStats.recentExpenses
    : [...planItems].reverse().slice(0, 4).map(i => ({ id: i._id, title: i.title, price: i.price || i.cost }));
  
  const maxRecentPrice = recentExpenses.length
    ? Math.max(...recentExpenses.map(e => Number(e.price) || 0))
    : 1;

  // Chart Data — use real monthly data from API, apply smoothing for the wavy flow
  const chartData = (() => {
    const raw = budgetStats?.chartData?.length
      ? budgetStats.chartData.map(d => {
          const parts = d.name.split(' ');
          const translatedName = parts.length === 2
            ? `${(t(parts[0].toLowerCase()) || parts[0]).toUpperCase()} ${parts[1]}`
            : (t(d.name.toLowerCase()) || d.name).toUpperCase();
          return { ...d, name: translatedName, rawSpent: d.spent };
        })
      : [
          { name: (t('jan') || 'Jan').toUpperCase(), spent: 0, rawSpent: 0, budget: totalBudget },
          { name: (t('feb') || 'Feb').toUpperCase(), spent: 0, rawSpent: 0, budget: totalBudget },
          { name: (t('mar') || 'Mar').toUpperCase(), spent: 0, rawSpent: 0, budget: totalBudget },
          { name: (t('apr') || 'Apr').toUpperCase(), spent: 0, rawSpent: 0, budget: totalBudget },
          { name: (t('may') || 'May').toUpperCase(), spent: 0, rawSpent: 0, budget: totalBudget },
          { name: (t('jun') || 'Jun').toUpperCase(), spent: 0, rawSpent: 0, budget: totalBudget },
          { name: (t('jul') || 'Jul').toUpperCase(), spent: spent, rawSpent: spent, budget: totalBudget },
        ];

    // Apply smoothing (7-day window) to create the exact wavy flow shape requested by the design
    // This distributes a spike over surrounding days to form a bell-shaped wave instead of a sharp triangle
    if (raw.length > 7) {
      return raw.map((d, i, arr) => {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - 3); j <= Math.min(arr.length - 1, i + 3); j++) {
          sum += arr[j].rawSpent;
          count++;
        }
        return { ...d, spent: sum / count }; // Smoothed value for the wavy curve
      });
    }
    return raw;
  })();

  // Dynamic Categories — prefer real API data
  const calculateCategories = () => {
    if (budgetStats?.categories?.length) {
      const total = budgetStats.categories.reduce((a, c) => a + c.spent, 0) || 1;
      return budgetStats.categories
        .map(c => ({ name: c.category.charAt(0).toUpperCase() + c.category.slice(1), percent: Math.round((c.spent / total) * 100) }))
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 4);
    }
    let food = 0, shopping = 0, entertainment = 0, outdoor = 0;
    planItems.forEach(item => {
      const p = Number(item.cost || item.price) || 0;
      const title = (item.title || item.titleKey || '').toLowerCase();
      
      if (title.includes('food') || title.includes('dining') || title.includes('dinner') || title.includes('dessert')) {
        food += p;
      } else if (title.includes('shopping') || title.includes('mall')) {
        shopping += p;
      } else if (title.includes('safari') || title.includes('skydiving')) {
        outdoor += p;
      } else {
        entertainment += p;
      }
    });

    const totalCalculated = food + shopping + entertainment + outdoor;
    
    // If no data, return a placeholder instead of dummy percentages
    if (totalCalculated === 0) {
      return [
        { name: t('noExpensesYet') || 'No Expenses Yet', percent: 100, isPlaceholder: true }
      ];
    }

    return [
      { name: t('foodDining') || 'Food & Dining', percent: Math.round((food / totalCalculated) * 100) },
      { name: t('shoppingCat') || 'Shopping', percent: Math.round((shopping / totalCalculated) * 100) },
      { name: t('entertainment') || 'Entertainment', percent: Math.round((entertainment / totalCalculated) * 100) },
      { name: t('outdoor') || 'Outdoor', percent: Math.round((outdoor / totalCalculated) * 100) }
    ].sort((a, b) => b.percent - a.percent);
  };

  const categories = calculateCategories();

  // Custom Tooltip for Chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--bg-card, #fff)',
          border: '1px solid #e5e7eb',
          padding: '14px 18px',
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          minWidth: '160px'
        }}>
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>{label} · {selectedYear}</p>
          {payload.map((entry, idx) => (
            <div key={idx} style={{ marginBottom: idx < payload.length - 1 ? '10px' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color, display: 'inline-block' }}></span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{entry.name}</span>
              </div>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                {entry.value.toLocaleString()} {t('egp')}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const openEditModal = () => {
    setEditAmount(budgetInfo?.amount || '');
    setEditPeriod(budgetInfo?.period || 'monthly');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setClosingEditModal(true);
    setTimeout(() => {
      setShowEditModal(false);
      setClosingEditModal(false);
    }, 300);
  };

  const handleSaveBudget = () => {
    if (!editAmount) return;
    budgetMutation.mutate({
      id: budgetInfo?._id,
      amount: Number(editAmount),
      period: editPeriod,
      isUpdate: !!(budgetInfo?.hasBudget && budgetInfo?._id)
    });
  };

  return (
    <div className="budget-page page-transition">
      
      {/* ── Header ── */}
      <div className="budget-header">
        <div className="budget-header-text">
          <h1>{t('budgetOverview')}</h1>
          <p>{t('trackBudget')}</p>
        </div>
        <button className="budget-btn-edit" onClick={openEditModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> {t('editBudget') || 'Edit Budget'}
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="budget-summary-grid">
        <div className="budget-summary-card">
          <div className="budget-card-top">
            <div className="budget-icon-title">
              <div className="budget-icon-box bg-grey"><BagIcon /></div>
              <span className="budget-card-name">{t('totalBudget')}</span>
            </div>
          </div>
          <div className="budget-card-value">
            {totalBudget.toLocaleString()} <span className="budget-currency">{t('egp')}</span>
          </div>
        </div>

        <div className="budget-summary-card">
          <div className="budget-card-top">
            <div className="budget-icon-title">
              <div className="budget-icon-box bg-purple"><PlannedIcon /></div>
              <span className="budget-card-name">{t('planned') || 'Planned'}</span>
            </div>
            <span className="budget-card-badge" style={{ backgroundColor: '#E0E7FF', color: '#6366F1', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>+10% vs Planned</span>
          </div>
          <div className="budget-card-value">
            {spent.toLocaleString()} <span className="budget-currency">{t('egp')}</span>
          </div>
        </div>

        <div className="budget-summary-card">
          <div className="budget-card-top">
            <div className="budget-icon-title">
              <div className="budget-icon-box bg-orange"><BagIcon /></div>
              <span className="budget-card-name">{t('remaining')}</span>
            </div>
            <span className="budget-card-badge" style={{ backgroundColor: '#FEF3C7', color: '#F59E0B', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>+10% vs Last Plan</span>
          </div>
          <div className="budget-card-value">
            {remaining.toLocaleString()} <span className="budget-currency">{t('egp')}</span>
          </div>
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="budget-content-grid">
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Budget Chart */}
          <div className="budget-section">
            <div className="budget-section-header">
              <h2>{t('budgetChart')}</h2>
              <div className="budget-chart-controls" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', backgroundColor: 'var(--background)', color: 'var(--text-main)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const m = new Date(0, i).toLocaleString('en', { month: 'long' });
                    return <option key={i+1} value={i+1}>{t(m.toLowerCase()) || m}</option>;
                  })}
                </select>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    style={{ padding: '8px 12px 8px 30px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', backgroundColor: 'var(--background)', color: 'var(--text-main)', cursor: 'pointer', fontSize: '14px', fontWeight: '500', appearance: 'none' }}
                  >
                    {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
            <div className="budget-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradFlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C7FFF" stopOpacity={0.35}/>
                      <stop offset="100%" stopColor="#7C7FFF" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#EFEFEF" />
                  <XAxis 
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }}
                    dy={10}
                    ticks={[
                      chartData[0]?.name,
                      chartData[7]?.name,
                      chartData[15]?.name,
                      chartData[21]?.name,
                      chartData[chartData.length - 1]?.name
                    ].filter(Boolean)}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }} 
                    dx={-10}
                    tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k EGP` : `${val} EGP`} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8B8FFF', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area
                    type="natural"
                    dataKey="spent"
                    name="Flow"
                    stroke="#7C7FFF"
                    strokeWidth={2.5}
                    fill="url(#gradFlow)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#7C7FFF', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Categories */}
          <div className="budget-section">
            <div className="budget-section-header">
              <h2>{t('topCategories')}</h2>
              <a href="#" className="budget-view-all">View All <span>→</span></a>
            </div>
            <div className="budget-categories-content" style={{ display: 'flex', alignItems: 'center', gap: '32px', padding: '10px 0' }}>
              <div className="budget-doughnut-container" style={{ position: 'relative', width: '200px', height: '200px', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={0}
                      dataKey="percent"
                      stroke="none"
                    >
                      {categories.map((entry, index) => {
                        const COLORS = ['#6366F1', '#F43F5E', '#F59E0B', '#10B981'];
                        const fill = entry.isPlaceholder ? '#E5E7EB' : COLORS[index % COLORS.length];
                        return <Cell key={`cell-${index}`} fill={fill} />;
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>{totalBudget.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('totalBudget') || 'Total Budget'}</div>
                </div>
              </div>
              <div className="budget-categories-legend" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {categories.map((cat, idx) => {
                  const COLORS = ['#6366F1', '#F43F5E', '#F59E0B', '#10B981'];
                  const bg = cat.isPlaceholder ? '#E5E7EB' : COLORS[idx % COLORS.length];
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: bg }}></span>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: cat.isPlaceholder ? '#9CA3AF' : 'var(--text-main)' }}>{cat.name}</span>
                      </div>
                      {!cat.isPlaceholder && (
                        <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-secondary)' }}>{cat.percent}%</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Recent Expenses */}
          <div className="budget-section">
            <div className="budget-section-header">
              <h2>{t('recentExpenses')}</h2>
              <a href="#" className="budget-view-all">View All <span>→</span></a>
            </div>
            {recentExpenses.length > 0 ? (
              <div className="budget-progress-list" style={{ gap: '24px' }}>
                {recentExpenses.map((expense, idx) => {
                  const p = Number(expense.cost || expense.price) || 0;
                  const pct = Math.min((p / maxRecentPrice) * 100, 100);
                  
                  const bgColors = ['#FEF3C7', '#D1FAE5', '#FCE7F3', '#E0E7FF'];
                  const iconColors = ['#F59E0B', '#10B981', '#F43F5E', '#6366F1'];
                  const icons = [
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>,
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                  ];
                  
                  return (
                    <div key={idx} className="budget-expense-item" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: bgColors[idx % bgColors.length], color: iconColors[idx % iconColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {icons[idx % icons.length]}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{t(expense.titleKey || expense.title) || expense.title}</span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>{p.toLocaleString()} {t('egp')}</span>
                        </div>
                        <div className="bpi-bar-bg" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', height: '6px' }}>
                          <div className="bpi-bar-fill" style={{ width: `${pct}%`, backgroundColor: 'var(--primary)' }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('noExpensesYet')}</p>
            )}
          </div>

          {/* Budget Tips */}
          <div className="budget-section">
            <div className="budget-section-header">
              <h2>{t('budgetTips')}</h2>
            </div>
            <div className="budget-tips-list">
              {budgetTips && budgetTips.length > 0 && typeof budgetTips[0] === 'object' ? (
                budgetTips.map((tip, idx) => (
                  <div key={idx} className="budget-tip-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      </div>
                      <div className="tip-content">
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{tip.title || tip}</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{tip.desc || tip}</p>
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                ))
              ) : (
                <>
                  <div className="budget-tip-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                      </div>
                      <div className="tip-content">
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{t('saveOnDining') || 'Save on dining'}</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{t('saveOnDiningDesc') || 'Choose budget-friendly restaurants or share meals to cut costs.'}</p>
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                  <div className="budget-tip-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                      <div className="tip-content">
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{t('planAhead') || 'Plan ahead'}</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{t('planAheadDesc') || 'Set your activities in advance to avoid overspending.'}</p>
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                  <div className="budget-tip-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <div className="tip-content">
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{t('limitImpulse') || 'Limit impulse spending'}</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{t('limitImpulseDesc') || 'Avoid unplanned purchases and stick to your budget.'}</p>
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

      </div>
      {/* Edit Budget Modal */}
      {showEditModal && (
        <div className="otp-overlay">
          <div className={`otp-popup ${closingEditModal ? 'otp-popup-closing' : ''}`} style={{ maxWidth: '400px', width: '90%', padding: '24px' }}>
            <button className="otp-close-btn" onClick={closeEditModal}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <h2 style={{ marginBottom: '16px', alignSelf: 'flex-start', color: 'var(--text-main)', fontSize: '20px' }}>
              {t('setBudget')}
            </h2>
            
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{t('amount')} ({t('egp')})</label>
                <input 
                  type="number" 
                  value={editAmount} 
                  onChange={(e) => setEditAmount(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none' }}
                  placeholder="e.g. 3000"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{t('period')}</label>
                <select 
                  value={editPeriod} 
                  onChange={(e) => setEditPeriod(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', backgroundColor: '#fff' }}
                >
                  <option value="daily">{t('daily')}</option>
                  <option value="weekly">{t('weekly')}</option>
                  <option value="monthly">{t('monthly')}</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', width: '100%' }}>
              <button 
                onClick={closeEditModal}
                disabled={budgetMutation.isLoading}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#fff', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleSaveBudget}
                disabled={budgetMutation.isLoading}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
              >
                {budgetMutation.isLoading ? t('saving') || 'Saving...' : t('save') || 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Popup */}
      {showPopup && (
        <div className="otp-overlay">
          <div className="otp-popup">
            <div className="otp-success-screen">
              {isSuccess ? (
                <div className="otp-checkmark">
                  <svg viewBox="0 0 52 52" className="otp-checkmark-svg">
                    <circle className="otp-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="otp-checkmark-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
              ) : (
                <div style={{ fontSize: '48px', color: '#DC2626' }}>⚠️</div>
              )}
              <h2 className="otp-success-title">{isSuccess ? (t('success') || 'Success!') : (t('info') || 'Info')}</h2>
              <p className="otp-success-msg">{popupMessage}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Budget;
