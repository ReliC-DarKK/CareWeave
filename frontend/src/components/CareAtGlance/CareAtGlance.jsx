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
              {conditions.map((condition) => (
                <ConditionCard key={condition.id} condition={condition} />
              ))}
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
