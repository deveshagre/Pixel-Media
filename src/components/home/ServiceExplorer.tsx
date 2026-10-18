import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SERVICES_CATALOG } from '../../data/portfolioData';
import { ServiceCategory } from '../../types';

interface ServiceExplorerProps {
  onStartServiceProject: (category: ServiceCategory) => void;
}

export const ServiceExplorer: React.FC<ServiceExplorerProps> = ({
  onStartServiceProject,
}) => {
  return (
    <section id="services" className="studio-section" aria-label="Services">
      <div className="studio-container">
        {/* Editorial Header */}
        <div style={{ maxWidth: 720, marginBottom: 56 }}>
          <span className="editorial-label">Core Capabilities</span>
          <h2 className="editorial-headline">
            End-to-end post-production disciplines.
          </h2>
          <p className="editorial-subhead">
            From initial footage assembly to final sound mastering and color delivery, we handle the full spectrum of creative finishing.
          </p>
        </div>

        {/* Clean Editorial Service Rows */}
        <div className="services-list-container">
          {SERVICES_CATALOG.map((svc, index) => (
            <article key={svc.id} className="service-row-item">
              {/* Index Column */}
              <div className="service-index">
                0{index + 1}
              </div>

              {/* Title & SLA Column */}
              <div className="service-title-col">
                <h3>{svc.title}</h3>
                <span>{svc.turnaround}</span>
              </div>

              {/* Description & Deliverables Column */}
              <div className="service-desc-col">
                <p>{svc.description}</p>
                <div className="service-deliverables-pills">
                  {svc.deliverables.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="deliverable-pill">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Column */}
              <div className="service-action-col">
                <button
                  onClick={() => onStartServiceProject(svc.id)}
                  className="studio-btn-subtle"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#ffffff',
                    padding: 0,
                  }}
                >
                  <span>Inquire</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
