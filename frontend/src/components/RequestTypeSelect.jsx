export const requestTypes = {
  message: 'General enquiry',
  meeting: 'Appointment request',
  speaking: 'Speaking invitation',
  partnership: 'Partnership discussion',
  media: 'Media / verification enquiry',
};

export const requestTypeDescriptions = {
  message: 'General questions, greetings, and portfolio enquiries.',
  meeting: 'Request time with the Office of the Vice Chancellor or a delegated staff member.',
  speaking: 'Invite Rev. Professor Mageto for an address, panel, lecture, or institutional event.',
  partnership: 'Share a collaboration, institutional partnership, or strategic engagement proposal.',
  media: 'Request verification, media follow-up, biography confirmation, or source clarification.',
};

export function getRequestTypeLabel(value) {
  return requestTypes[value] || requestTypes.message;
}

export default function RequestTypeSelect({ value, onChange }) {
  return (
    <label>
      Request type
      <select name="requestType" value={value} onChange={onChange}>
        {Object.entries(requestTypes).map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>{label}</option>
        ))}
      </select>
      <small className="field-hint">{requestTypeDescriptions[value] || requestTypeDescriptions.message}</small>
    </label>
  );
}
