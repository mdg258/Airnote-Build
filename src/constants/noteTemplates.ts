export type LeaveNoteCategory = 'issue' | 'warning' | 'info' | 'lostfound' | 'other';

export const LEAVE_NOTE_CATEGORIES = [
  { id: 'issue' as LeaveNoteCategory, label: 'Issue', icon: '⚠️', color: '#FF6B6B' },
  { id: 'warning' as LeaveNoteCategory, label: 'Warning', icon: '⚡', color: '#FFA500' },
  { id: 'info' as LeaveNoteCategory, label: 'Info', icon: 'ℹ️', color: '#4A90E2' },
  { id: 'lostfound' as LeaveNoteCategory, label: 'Lost & Found', icon: '🔍', color: '#9B59B6' },
  { id: 'other' as LeaveNoteCategory, label: 'Other', icon: '💬', color: '#95A5A6' },
];
