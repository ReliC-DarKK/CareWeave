import { get } from './api';

export const DEMO_PATIENT_ID = 'fd2a1b68-f434-48d0-a8e1-e613216238ac';

/**
 * Fetches the P1 care-logic calculation from the P2 backend.
 * Path: /patients/:patientId/care-logic
 *
 * @param {string} patientId
 * @param {string} [referenceDate]
 * @returns {Promise<{
 *   timeline: any[],
 *   careState: any,
 *   interactions: any[],
 *   nextActions: any[],
 *   summary: any
 * }>}
 */
export async function getPatientCareLogic(patientId = DEMO_PATIENT_ID, referenceDate) {
  const query = referenceDate ? `?referenceDate=${encodeURIComponent(referenceDate)}` : '';
  const response = await get(`/patients/${patientId}/care-logic${query}`);
  // P2 response envelope: { data: { timeline, careState, interactions, nextActions, summary } }
  return response.data;
}

/**
 * Presentation-level adaptors for existing UI components.
 * Strictly formats data for component prop requirements without calculating or altering clinical logic.
 */
export function adaptCareStateForGlance(careState) {
  if (!careState) return null;

  const rawStatus = careState.overallStatus || 'stable';
  const statusLabel = rawStatus
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    ...careState,
    status: statusLabel,
    statusLabel,
    activeConditionsCount: careState.activeConditions?.length || 0,
    attentionItemsCount: careState.attentionSignals?.length || 0,
  };
}

export function adaptConditionsForGlance(activeConditions) {
  if (!Array.isArray(activeConditions) || activeConditions.length === 0) {
    return [];
  }

  return activeConditions.map((condition) => ({
    id: condition.id || condition.name,
    name: condition.name,
    shortName: condition.name.replace(/\s*\(.*?\)\s*/g, '').trim(),
    status: condition.status || 'Active',
  }));
}

export function adaptNextActionsForUI(nextActions) {
  if (!Array.isArray(nextActions) || nextActions.length === 0) {
    return [];
  }

  return nextActions.map((action, idx) => ({
    id: action.id || `action-${idx}`,
    tier: action.category || (action.priority ? `${action.priority.toUpperCase()} PRIORITY` : 'Recommended Action'),
    title: action.title,
    description: action.description,
    relatedCondition: action.relatedConditions?.[0] || action.relatedCondition || 'General Care',
    targetDate: action.dueDate || action.targetDate || 'Upcoming',
    assignedCareLead: action.assignedRole || action.assignedCareLead || 'Care Team',
    priority: action.priority,
  }));
}

export function adaptTimelineEventsForUI(timeline) {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return [];
  }

  const typeToCategory = {
    diagnosis: 'Clinical Encounter',
    treatment: 'Clinical Encounter',
    lab: 'Diagnostic Lab',
    medication: 'Medication Adherence',
    appointment: 'Clinical Encounter',
    symptom: 'Vitals & Biometrics',
  };

  return timeline.map((event, idx) => {
    let formattedDate = event.date;
    if (event.date && event.date.includes('-')) {
      const parts = event.date.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }
    }

    return {
      id: event.id || `event-${idx}`,
      date: formattedDate,
      time: event.time || '',
      title: event.title,
      summary: event.description || event.title,
      category: typeToCategory[event.type] || 'Clinical Encounter',
      relatedCondition: event.conditionId || 'Clinical Record',
    };
  });
}
