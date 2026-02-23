/**
 * Paradise Delivery - AI-Powered Onboarding System
 * Main Entry Point
 */

// Types
export * from './types';

// Services
export { 
  DocumentVerificationService, 
  createDocumentVerificationService,
  DocumentVerificationError,
} from './services/documentVerification';

// Hooks
export {
  useDriverApplication,
  useAdminApplications,
  useOnboardingMetrics,
  useDocumentUpload,
  useBackgroundCheck,
  useNotifications,
} from './hooks';

// Utils
export {
  // Progress
  calculateDriverProgress,
  calculateRestaurantProgress,
  getDriverNextSteps,
  getDocumentStatus,
  
  // Validation
  validateDriverBasicInfo,
  validateVehicleInfo,
  
  // Formatting
  formatPhoneNumber,
  formatSSN,
  formatDate,
  formatDateTime,
  formatDuration,
  formatCurrency,
  formatPercent,
  
  // Helpers
  calculateAge,
  getStatusColor,
  getStatusLabel,
  
  // Orientation
  ORIENTATION_SECTIONS,
  
  // Export
  exportApplicationsToCSV,
  downloadCSV,
  
  // ID Generation
  generateApplicationId,
  generateDocumentId,
} from './utils';

// Components
export { DriverApplicationsList } from './components/DriverApplicationsList';
export { DriverApplicationReview } from './components/DriverApplicationReview';
export { RestaurantApplicationsList } from './components/RestaurantApplicationsList';

// API (for Next.js route handlers)
export * as driverApi from './api/driver';
export * as restaurantApi from './api/restaurant';
