/**
 * Services Index
 * Central export point for all API services
 */

export { default as apiClient, setAuthToken, setUserData, getUserData, clearAuthData } from './apiClient';
export { default as authService } from './authService';
export { default as reelsService } from './reelsService';
export { default as pitchService } from './pitchService';
export { default as meetingsService } from './meetingsService';
export { default as startupsService } from './startupsService';
export { default as exploreService } from './exploreService';
export { default as notificationsService } from './notificationsService';
export { default as usersService } from './usersService';
export { default as pricingService } from './pricingService';

// Named exports for convenience
export {
  signup,
  login,
  googleAuth,
  forgotPassword,
  logout,
  isAuthenticated,
  USER_ROLES,
  VALID_ROLES,
} from './authService';

export {
  getFeed,
  likeReel,
  unlikeReel,
  commentOnReel,
  getReelComments,
  shareReel,
} from './reelsService';

export {
  getPitchDetails,
  getAIAnalysis,
  scheduleMeeting,
} from './pitchService';

export {
  getMeetings,
  acceptMeeting,
  rejectMeeting,
} from './meetingsService';

export {
  getStartupDetails,
  followStartup,
  unfollowStartup,
  getFollowedStartups,
} from './startupsService';

export {
  search,
  getTrendingHashtags,
  getTopStartups,
  getStartupsOfWeek,
  getInvestorSpotlight,
  getLiveBattleground,
} from './exploreService';

export {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './notificationsService';

export {
  getCurrentUserProfile,
  updateUserProfile,
} from './usersService';
