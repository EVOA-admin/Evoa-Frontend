import apiClient from './apiClient';

/** Schedule a meeting with a startup */
export const scheduleMeeting = (startupId, { scheduledAt, notes }) =>
  apiClient.post(`/meetings/schedule/${startupId}`, { scheduledAt, notes });

/** Get all meetings for the current user */
export const getUserMeetings = () =>
  apiClient.get('/meetings');

/** Get a single meeting by ID */
export const getMeetingById = (meetingId) =>
  apiClient.get(`/meetings/${meetingId}`);

/** Accept a meeting (founder only) */
export const acceptMeeting = (meetingId) =>
  apiClient.post(`/meetings/${meetingId}/accept`);

/** Cancel/reject a meeting (founder only) */
export const cancelMeeting = (meetingId) =>
  apiClient.post(`/meetings/${meetingId}/reject`);

export default {
  scheduleMeeting,
  getUserMeetings,
  getMeetingById,
  acceptMeeting,
  cancelMeeting,
};
