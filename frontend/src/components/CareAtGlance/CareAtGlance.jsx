import React from 'react';
import ConditionCard from '../ConditionCard/ConditionCard';
import CareState from '../CareState/CareState';
import './CareAtGlance.css';

export default function CareAtGlance({ data }) {
  const { heading = 'Your Care at a Glance', subtitle = 'Multiple conditions. One unified view.', conditions = [], careState } = data || {};

  return (
    <section className="cw-care-glance-section" aria-labelledby="care-glance-heading">
      <div className="cw-care-glance-container">
        <div className="cw-glance-card-surface">
          {/* Left Content: Title, Subtitle, and 3 Condition Cards */}
          <div className="cw-glance-left-content">
            <div className="cw-glance-heading-group">
              <h2 id="care-glance-heading" className="cw-glance-heading">
                {heading}
              </h2>
              <p className="cw-glance-subheading">{subtitle}</p>
            </div>

            <div className="cw-glance-conditions-row">
              {conditions && conditions.length > 0 ? (
                conditions.map((condition) => (
                  <ConditionCard key={condition.id} condition={condition} />
                ))
              ) : (
                <div className="cw-glance-empty-condition">
                  <div className="cw-condition-icon-box cw-cond-empty-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="cw-condition-meta">
                    <h3 className="cw-condition-name">No Active Chronic Conditions</h3>
                    <span className="cw-condition-sub">All records currently within expected parameters</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content: Care State Arc & Context */}
          <div className="cw-glance-right-content">
            <CareState careState={careState} />
          </div>
        </div>
      </div>
    </section>
  );
}
