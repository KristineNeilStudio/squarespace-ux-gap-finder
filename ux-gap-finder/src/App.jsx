import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Lightbulb, BarChart3, MessageSquare, Zap } from 'lucide-react';

// Sample touchpoint cards database
const touchpointCards = {
  ecommerce: {
    awareness: [
      { id: 'social-ads', name: 'Social Media Ads', tags: { communication_type: 'persuasive', trust_level: 'low-trust', conversion_proximity: 'discovery' }},
      { id: 'google-ads', name: 'Google Search Ads', tags: { communication_type: 'informational', trust_level: 'low-trust', conversion_proximity: 'discovery' }},
      { id: 'content-blog', name: 'SEO Content/Blog', tags: { communication_type: 'informational', trust_level: 'medium-trust', conversion_proximity: 'discovery' }},
      { id: 'influencer', name: 'Influencer Partnerships', tags: { communication_type: 'social-proof', trust_level: 'medium-trust', conversion_proximity: 'discovery' }}
    ],
    consideration: [
      { id: 'product-pages', name: 'Product Detail Pages', tags: { communication_type: 'informational', trust_level: 'medium-trust', conversion_proximity: 'conversion-prep' }},
      { id: 'reviews', name: 'Customer Reviews', tags: { communication_type: 'social-proof', trust_level: 'high-trust', conversion_proximity: 'conversion-prep' }},
      { id: 'comparison', name: 'Product Comparison Tools', tags: { communication_type: 'informational', trust_level: 'medium-trust', conversion_proximity: 'conversion-prep' }},
      { id: 'live-chat', name: 'Live Chat Support', tags: { communication_type: 'informational', trust_level: 'medium-trust', conversion_proximity: 'conversion-prep' }},
      { id: 'size-guide', name: 'Size Guides/Product Info', tags: { communication_type: 'informational', trust_level: 'low-trust', conversion_proximity: 'conversion-prep' }}
    ],
    decision: [
      { id: 'cart', name: 'Shopping Cart Page', tags: { communication_type: 'transactional', trust_level: 'low-trust', conversion_proximity: 'direct-conversion' }},
      { id: 'checkout', name: 'Checkout Process', tags: { communication_type: 'transactional', trust_level: 'low-trust', conversion_proximity: 'direct-conversion' }},
      { id: 'security-badges', name: 'Security Badges/Trust Signals', tags: { communication_type: 'informational', trust_level: 'high-trust', conversion_proximity: 'conversion-prep' }},
      { id: 'payment-options', name: 'Payment Options Display', tags: { communication_type: 'informational', trust_level: 'medium-trust', conversion_proximity: 'conversion-prep' }},
      { id: 'return-policy', name: 'Return Policy Clear Display', tags: { communication_type: 'informational', trust_level: 'high-trust', conversion_proximity: 'conversion-prep' }}
    ],
    retention: [
      { id: 'order-confirm', name: 'Order Confirmation Email', tags: { communication_type: 'transactional', trust_level: 'low-trust', conversion_proximity: 'nurture' }},
      { id: 'shipping-notify', name: 'Shipping Notification', tags: { communication_type: 'informational', trust_level: 'low-trust', conversion_proximity: 'nurture' }},
      { id: 'review-request', name: 'Review Request Email', tags: { communication_type: 'relational', trust_level: 'low-trust', conversion_proximity: 'nurture' }},
      { id: 'loyalty-program', name: 'Loyalty Program Invitation', tags: { communication_type: 'persuasive', trust_level: 'medium-trust', conversion_proximity: 'nurture' }}
    ]
  }
};

// Industry benchmarks for gap detection
const industryBenchmarks = {
  ecommerce: {
    critical: [
      { stage: 'consideration', touchpoint: 'reviews', message: '95% of successful eCommerce sites show customer reviews' },
      { stage: 'decision', touchpoint: 'security-badges', message: 'Security signals are crucial for online purchasing confidence' }
    ]
  }
};

// Gap detection logic
const detectGaps = (journey, industry) => {
  const gaps = [];
  
  // Check for industry benchmarks
  const benchmarks = industryBenchmarks[industry]?.critical || [];
  benchmarks.forEach(benchmark => {
    const stageCards = journey[benchmark.stage] || [];
    const hasTouchpoint = stageCards.some(card => card.id === benchmark.touchpoint);
    
    if (!hasTouchpoint) {
      gaps.push({
        type: 'industry_standard',
        stage: benchmark.stage,
        severity: 'high',
        message: benchmark.message,
        icon: BarChart3,
        color: 'red'
      });
    }
  });
  
  // Check sequence logic - trust before conversion
  const decisionCards = journey.decision || [];
  const considerationCards = journey.consideration || [];
  
  const hasDirectConversion = decisionCards.some(card => 
    card.tags.conversion_proximity === 'direct-conversion'
  );
  const hasHighTrust = considerationCards.some(card => 
    card.tags.trust_level === 'high-trust'
  );
  
  if (hasDirectConversion && !hasHighTrust) {
    gaps.push({
      type: 'sequence_violation',
      stage: 'consideration',
      severity: 'medium',
      message: "You're asking customers to convert before building enough trust",
      icon: AlertTriangle,
      color: 'yellow'
    });
  }
  
  // Check for social proof in consideration
  const hasSocialProof = considerationCards.some(card => 
    card.tags.communication_type === 'social-proof'
  );
  
  if (considerationCards.length > 2 && !hasSocialProof) {
    gaps.push({
      type: 'missing_social_proof',
      stage: 'consideration', 
      severity: 'medium',
      message: 'Customers need validation from others before making decisions',
      icon: MessageSquare,
      color: 'orange'
    });
  }
  
  return gaps;
};

const UXGapFinder = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('ecommerce');
  const [journey, setJourney] = useState({
    awareness: [],
    consideration: [],
    decision: [],
    retention: []
  });
  const [gaps, setGaps] = useState([]);
  const [draggedCard, setDraggedCard] = useState(null);

  // Update gaps whenever journey changes
  useEffect(() => {
    const detectedGaps = detectGaps(journey, selectedIndustry);
    setGaps(detectedGaps);
  }, [journey, selectedIndustry]);

  const handleDragStart = (card) => {
    setDraggedCard(card);
  };

  const handleDrop = (stage) => {
    if (draggedCard) {
      setJourney(prev => ({
        ...prev,
        [stage]: [...prev[stage], draggedCard]
      }));
      setDraggedCard(null);
    }
  };

  const removeCard = (stage, cardId) => {
    setJourney(prev => ({
      ...prev,
      [stage]: prev[stage].filter(card => card.id !== cardId)
    }));
  };

  const getStageGaps = (stage) => {
    return gaps.filter(gap => gap.stage === stage);
  };

  const getGapColor = (severity) => {
    switch(severity) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300';
    }
  };

  const getGapIcon = (type) => {
    switch(type) {
      case 'industry_standard': return BarChart3;
      case 'sequence_violation': return AlertTriangle;
      case 'missing_social_proof': return MessageSquare;
      default: return Lightbulb;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">UX Gap Finder</h1>
          <p className="text-gray-600 mb-4">Build your customer journey and discover hidden friction points</p>
          
          <select 
            value={selectedIndustry} 
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ecommerce">eCommerce</option>
            <option value="nonprofit">Nonprofit</option>
            <option value="service">Service-Based</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Touchpoint Cards Library */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Touchpoint Cards</h2>
            
            {Object.entries(touchpointCards[selectedIndustry]).map(([stage, cards]) => (
              <div key={stage} className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium mb-3 capitalize text-gray-700">{stage}</h3>
                <div className="space-y-2">
                  {cards.map(card => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card)}
                      className="p-3 bg-blue-50 border border-blue-200 rounded cursor-move hover:bg-blue-100 transition-colors"
                    >
                      <div className="text-sm font-medium text-blue-900">{card.name}</div>
                      <div className="text-xs text-blue-600 mt-1">
                        {card.tags.communication_type} • {card.tags.trust_level}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Journey Builder */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4">Your Customer Journey</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['awareness', 'consideration', 'decision', 'retention'].map(stage => {
                const stageGaps = getStageGaps(stage);
                
                return (
                  <div key={stage} className="bg-white rounded-lg p-4 shadow-sm min-h-[400px]">
                    <h3 className="font-medium mb-4 capitalize text-gray-700 flex items-center justify-between">
                      {stage}
                      {stageGaps.length > 0 && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                          {stageGaps.length} issue{stageGaps.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </h3>
                    
                    {/* Drop Zone */}
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] mb-4"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(stage)}
                    >
                      {journey[stage].length === 0 ? (
                        <p className="text-gray-500 text-center">Drop touchpoint cards here</p>
                      ) : (
                        <div className="space-y-2">
                          {journey[stage].map((card, index) => (
                            <div
                              key={`${card.id}-${index}`}
                              className="p-3 bg-green-50 border border-green-200 rounded relative group"
                            >
                              <div className="text-sm font-medium text-green-900">{card.name}</div>
                              <button
                                onClick={() => removeCard(stage, card.id)}
                                className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Gap Indicators */}
                    {stageGaps.map((gap, index) => {
                      const IconComponent = getGapIcon(gap.type);
                      return (
                        <div key={index} className={`p-3 rounded-lg border-l-4 ${getGapColor(gap.severity)} mb-2`}>
                          <div className="flex items-start space-x-2">
                            <IconComponent className="w-4 h-4 mt-0.5 text-gray-600" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {gap.type === 'industry_standard' && 'Missing Industry Standard'}
                                {gap.type === 'sequence_violation' && 'Flow Issue'}
                                {gap.type === 'missing_social_proof' && 'Missing Social Proof'}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">{gap.message}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            
            {/* Overall Journey Insights */}
            {gaps.length > 0 && (
              <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Journey Insights
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {gaps.filter(g => g.severity === 'high').length}
                    </div>
                    <div className="text-sm text-red-700">Critical Issues</div>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {gaps.filter(g => g.severity === 'medium').length}
                    </div>
                    <div className="text-sm text-yellow-700">Opportunities</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.max(0, Object.values(journey).flat().length - gaps.length)}
                    </div>
                    <div className="text-sm text-green-700">Strong Touchpoints</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UXGapFinder;