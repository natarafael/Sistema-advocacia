import { supabase } from './supabaseClient';

// Default session settings
const DEFAULT_SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
const ACTIVITY_CHECK_INTERVAL = 1 * 60 * 1000; // Check every minute

class SessionManager {
  constructor() {
    this.lastActivity = Date.now();
    this.sessionTimeout = DEFAULT_SESSION_TIMEOUT;
    this.isActive = true;
    this.activityCheckInterval = null;
  }

  // Start monitoring user activity
  startTracking() {
    this.resetTimer();
    this.setupActivityListeners();
    this.startActivityCheck();
  }

  // Stop monitoring user activity
  stopTracking() {
    this.clearActivityCheck();
    this.removeActivityListeners();
  }

  // Setup event listeners for user activity
  setupActivityListeners() {
    window.addEventListener('mousemove', this.handleUserActivity);
    window.addEventListener('keypress', this.handleUserActivity);
    window.addEventListener('click', this.handleUserActivity);
    window.addEventListener('scroll', this.handleUserActivity);
  }

  // Remove event listeners
  removeActivityListeners() {
    window.removeEventListener('mousemove', this.handleUserActivity);
    window.removeEventListener('keypress', this.handleUserActivity);
    window.removeEventListener('click', this.handleUserActivity);
    window.removeEventListener('scroll', this.handleUserActivity);
  }

  // Handle user activity
  handleUserActivity = () => {
    this.resetTimer();
  };

  // Reset the activity timer
  resetTimer() {
    this.lastActivity = Date.now();
    this.isActive = true;
  }

  // Start checking for inactivity
  startActivityCheck() {
    this.activityCheckInterval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity;
      if (timeSinceLastActivity >= this.sessionTimeout && this.isActive) {
        this.handleSessionTimeout();
      }
    }, ACTIVITY_CHECK_INTERVAL);
  }

  // Clear the activity check interval
  clearActivityCheck() {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }
  }

  // Handle session timeout
  async handleSessionTimeout() {
    this.isActive = false;
    try {
      await supabase.auth.signOut();
      window.location.href = '/login'; // Or use your router navigation
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // Get current session status
  getSessionStatus() {
    return {
      isActive: this.isActive,
      lastActivity: this.lastActivity,
      timeRemaining: Math.max(
        0,
        this.sessionTimeout - (Date.now() - this.lastActivity),
      ),
    };
  }
}

export const sessionManager = new SessionManager();
