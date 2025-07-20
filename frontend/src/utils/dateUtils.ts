// Date utility functions for handling timezone issues

/**
 * Format date string for display with proper timezone handling
 * @param dateString - ISO date string from backend
 * @returns Formatted date string in Vietnamese locale
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  });
};

/**
 * Format date string for datetime-local input
 * @param dateString - ISO date string from backend
 * @returns Formatted date string for HTML datetime-local input
 */
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Convert to local timezone and format as YYYY-MM-DDTHH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Convert local datetime to UTC for sending to backend
 * @param localDateTime - Local datetime string from input (YYYY-MM-DDTHH:mm)
 * @returns ISO string in UTC
 */
export const convertLocalToUTC = (localDateTime: string): string => {
  if (!localDateTime) return '';
  
  // Create a date object from the local datetime string
  const localDate = new Date(localDateTime);
  
  // Convert to UTC ISO string
  return localDate.toISOString();
};

/**
 * Get current datetime in local timezone for input
 * @returns Current datetime formatted for datetime-local input
 */
export const getCurrentLocalDateTime = (): string => {
  const now = new Date();
  return formatDateForInput(now.toISOString());
}; 