import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FAQ_ITEMS } from '../../data/helpData';
import { TicketCategory, TicketPriority, ServiceCategory } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useClientData } from '../../context/ClientDataContext';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Inbox,
  Clock,
} from 'lucide-react';

interface OutletContextType {
  openRequestModal: (category?: ServiceCategory) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HelpCenterSection: React.FC = () => {
  const { t } = useLanguage();
  const { supportTickets, createSupportTicket } = useClientData();
  const { showToast } = useOutletContext<OutletContextType>();

  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'tickets'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(FAQ_ITEMS[0].id);

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('general');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { subject?: string; message?: string } = {};

    if (!subject.trim()) {
      newErrors.subject = 'Please specify an inquiry subject.';
    }
    if (!message.trim()) {
      newErrors.message = 'Please provide details for your support request.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await createSupportTicket({
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
      });

      setSubject('');
      setMessage('');
      showToast(t.help.ticketSuccess, 'success');
      setActiveTab('tickets');
    } catch (err: any) {
      setErrors({ message: err.message || 'Failed to submit ticket.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 className="text-title-1" style={{ marginBottom: 6 }}>
          {t.help.title}
        </h2>
        <p className="text-body">{t.help.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('faq')}
          className={`filter-tab ${activeTab === 'faq' ? 'active' : ''}`}
        >
          {t.help.faqTab}
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`filter-tab ${activeTab === 'contact' ? 'active' : ''}`}
        >
          {t.help.contactTab}
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`filter-tab ${activeTab === 'tickets' ? 'active' : ''}`}
        >
          {t.help.myTicketsTab} ({supportTickets.length})
        </button>
      </div>

      {/* FAQ Tab Content */}
      {activeTab === 'faq' && (
        <div>
          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 24, maxWidth: 540 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: 42 }}
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    borderColor: isExpanded ? 'var(--border-default)' : 'var(--border-subtle)',
                  }}
                >
                  <button
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    style={{
                      width: '100%',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: 15,
                      color: isExpanded ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <span>{faq.question}</span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 20px 20px',
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: 'var(--text-secondary)',
                        borderTop: '1px solid var(--border-subtle)',
                        marginTop: 4,
                        paddingTop: 16,
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact Form Tab Content */}
      {activeTab === 'contact' && (
        <div style={{ maxWidth: 680 }}>
          <div className="card">
            <h3 className="text-title-2" style={{ marginBottom: 6 }}>
              {t.help.contactTab}
            </h3>
            <p className="text-body" style={{ marginBottom: 20 }}>
              Need custom technical specifications, revision guidance, or contract questions? Submit your request below.
            </p>

            <form onSubmit={handleSubmitTicket}>
              <div className="form-group">
                <label htmlFor="ticket-subject" className="form-label">{t.help.formSubject} *</label>
                <input
                  id="ticket-subject"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Stem export questions or urgent turnaround request"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={submitting}
                />
                {errors.subject && <span className="form-error-msg">{errors.subject}</span>}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 16,
                }}
              >
                <div className="form-group">
                  <label htmlFor="ticket-category" className="form-label">{t.help.formCategory}</label>
                  <select
                    id="ticket-category"
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    disabled={submitting}
                  >
                    <option value="general">General Support</option>
                    <option value="project_revision">Project Revisions</option>
                    <option value="deadline">Urgent Deadline Request</option>
                    <option value="billing">Billing & Invoicing</option>
                    <option value="technical">Technical Codecs & Uploads</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ticket-priority" className="form-label">{t.help.formPriority}</label>
                  <select
                    id="ticket-priority"
                    className="form-control"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    disabled={submitting}
                  >
                    <option value="low">{t.help.priorityLow}</option>
                    <option value="normal">{t.help.priorityNormal}</option>
                    <option value="high">{t.help.priorityHigh}</option>
                    <option value="urgent">{t.help.priorityUrgent}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ticket-message" className="form-label">{t.help.formMessage} *</label>
                <textarea
                  id="ticket-message"
                  className="form-control"
                  rows={5}
                  placeholder="Describe your inquiry or revision notes in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                />
                {errors.message && <span className="form-error-msg">{errors.message}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2
                        size={16}
                        style={{ animation: 'spin 1s linear infinite' }}
                      />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>{t.help.submitTicket}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket History Tab */}
      {activeTab === 'tickets' && (
        <div>
          {supportTickets.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={t.help.noTickets}
              description={t.help.noTicketsDesc}
              actionText={t.help.contactTab}
              onAction={() => setActiveTab('contact')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="card">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 600 }}>{ticket.subject}</h4>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {ticket.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Badge status={ticket.status} />
                    </div>
                  </div>

                  <p
                    className="text-body"
                    style={{ fontSize: 13.5, lineHeight: 1.5, marginBottom: 12 }}
                  >
                    {ticket.message}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Clock size={12} />
                    <span>Submitted on {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span>• Priority: {ticket.priority.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
