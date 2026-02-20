import { useState } from 'react';
import { ExternalLink, CheckCircle2, FileText, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { toast } from 'react-hot-toast';

const SCHEMES = [
  {
    id: 'pmmvy',
    title: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    category: 'Pregnancy',
    description: 'Cash incentive scheme for pregnant and lactating mothers for first live birth.',
    eligibility: 'Pregnant women and lactating mothers for first live birth, meeting income and registration criteria.',
    benefits: 'Cash assistance in instalments for early registration, antenatal check-ups, and child birth registration.',
    applyUrl: 'https://pmmvy.nic.in/'
  },
  {
    id: 'jsy',
    title: 'Janani Suraksha Yojana (JSY)',
    category: 'Maternity',
    description: 'Safe motherhood intervention under the National Health Mission.',
    eligibility: 'Pregnant women belonging to BPL/SC/ST and institutional deliveries in public health facilities.',
    benefits: 'Cash incentive for institutional delivery and support for transportation and care.',
    applyUrl: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309'
  },
  {
    id: 'jssk',
    title: 'Janani Shishu Suraksha Karyakram (JSSK)',
    category: 'Post pregnancy',
    description: 'Free and cashless services to pregnant women and newborns up to 30 days after birth.',
    eligibility: 'All pregnant women and sick newborns accessing public health institutions.',
    benefits: 'Free drugs, diagnostics, diet, blood, user charges exemption and transport.',
    applyUrl: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=842&lid=309'
  },
  {
    id: 'icds',
    title: 'Integrated Child Development Services (ICDS) - Supplementary Nutrition',
    category: 'Nutrition',
    description: 'Supplementary nutrition through Anganwadi centres for pregnant and lactating mothers.',
    eligibility: 'Registered pregnant and lactating women under Anganwadi centres.',
    benefits: 'Take-home rations / hot cooked meals and nutrition counselling.',
    applyUrl: 'https://wcd.nic.in/schemes/integrated-child-development-services-icds'
  },
  {
    id: 'pmjjby',
    title: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
    category: 'Financial aid',
    description: 'Life insurance cover scheme accessible through bank accounts.',
    eligibility: 'All savings bank account holders aged 18–50 years.',
    benefits: 'Life cover of ₹2 lakh at very low premium, auto-debited from bank account.',
    applyUrl: 'https://jansuraksha.gov.in/PMJJBY.aspx'
  },
  {
    id: 'pmmvy-bank',
    title: 'Jan Dhan Yojana (PMJDY) for Direct Benefit Transfer',
    category: 'Banking benefits',
    description: 'Basic banking access for receiving government maternity benefits directly.',
    eligibility: 'Individuals without a formal bank account as per PMJDY norms.',
    benefits: 'Zero-balance account, RuPay card and direct benefit transfer eligibility.',
    applyUrl: 'https://pmjdy.gov.in'
  }
];

const CERTIFICATION_LINKS = [
  {
    id: 'birth-cert',
    title: 'Birth Certificate Application',
    description: 'Apply for a legal birth certificate for your newborn.',
    url: 'https://crs.org.in/'
  },
  {
    id: 'mother-card',
    title: 'Mother & Child Protection Card',
    description: 'Access guidelines and documentation for MCP card.',
    url: 'https://nhm.gov.in/index1.php?lang=1&level=3&lid=308&sublinkid=1181'
  }
];

const GovernmentSupport = () => {
  const [activeTab, setActiveTab] = useState('schemes');
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestClick = (schemeId) => {
    setSelectedSchemeId(schemeId);
  };

  const handleConfirmRequest = async () => {
    if (!selectedSchemeId) return;
    const scheme = SCHEMES.find((s) => s.id === selectedSchemeId);
    if (!scheme) return;

    try {
      setIsSubmitting(true);
      await api.post('/anganwadi/scheme-request', {
        schemeId: scheme.id,
        schemeTitle: scheme.title
      });
      toast.success('Request sent to your Anganwadi center');
      setSelectedSchemeId(null);
    } catch (error) {
      console.error('Scheme request failed', error);
      toast.error(error.response?.data?.message || 'Could not send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16 space-y-10">
      <div className="text-center space-y-3 pt-4">
        <h1 className="text-4xl font-serif font-bold text-text-dark">
          Government Support
        </h1>
        <p className="text-text-muted max-w-2xl mx-auto">
          Access trusted maternity, nutrition and financial schemes. Apply directly
          on official portals or request guided support from your Anganwadi worker.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 bg-white/60 rounded-2xl p-2 w-full max-w-md mx-auto shadow-sm">
        <button
          onClick={() => setActiveTab('schemes')}
          className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'schemes'
              ? 'bg-pink-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-pink-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Schemes
        </button>
        <button
          onClick={() => setActiveTab('certifications')}
          className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'certifications'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-sky-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Certification
        </button>
      </div>

      {activeTab === 'schemes' && (
        <div className="grid md:grid-cols-2 gap-6">
          {SCHEMES.map((scheme) => {
            const isSelected = selectedSchemeId === scheme.id;
            return (
              <GlassCard
                key={scheme.id}
                className="p-6 space-y-4 border border-pink-50 bg-white/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-600 mb-2">
                      {scheme.category}
                    </span>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {scheme.title}
                    </h2>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  )}
                </div>
                <p className="text-sm text-gray-700">{scheme.description}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-500">
                    <span className="font-semibold text-gray-700">Eligibility:</span>{' '}
                    {scheme.eligibility}
                  </p>
                  <p className="text-gray-500">
                    <span className="font-semibold text-gray-700">Benefits:</span>{' '}
                    {scheme.benefits}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <a
                    href={scheme.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      Apply on Government Site
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRequestClick(scheme.id)}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
                    }`}
                  >
                    Request Anganwadi Help
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {isSelected && (
                  <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center justify-between gap-3">
                    <p>
                      Confirm you want your linked Anganwadi center to help you
                      apply for <span className="font-semibold">{scheme.title}</span>.
                    </p>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmRequest}
                      className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {isSubmitting ? 'Sending...' : 'Confirm'}
                    </button>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {activeTab === 'certifications' && (
        <div className="grid md:grid-cols-2 gap-6">
          {CERTIFICATION_LINKS.map((item) => (
            <GlassCard
              key={item.id}
              className="p-6 flex flex-col justify-between bg-white/70 border border-sky-50"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <div className="mt-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold shadow-md hover:bg-sky-600 transition-colors"
                >
                  Open Official Portal
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default GovernmentSupport;

