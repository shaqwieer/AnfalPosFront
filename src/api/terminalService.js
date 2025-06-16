import apiClient from './apiClient';

export const terminalService = {
  /**
   * Get terminal information for POS
   * @param {string} ianaZone - IANA timezone (e.g., "Africa/Cairo")
   * @returns {Promise<Object>} - Terminal information including session status and cash journal
   */
  async getTerminalInformationForPos(ianaZone = 'Africa/Cairo') {
    try {
      const response = await apiClient.post('/Branches/GetTerminalInformationForPos', {
        ianaZone: ianaZone
      });
      return response.data.data || {};
    } catch (error) {
      console.error('Error fetching terminal information:', error);
      throw error;
    }
  },

  /**
   * Open a new shift session
   * @returns {Promise<Object>} - Session information
   */
  async openShiftSession() {
    try {
      const response = await apiClient.post('/ShiftSessions/OpenShiftSession', {});
      return response.data.data || {};
    } catch (error) {
      console.error('Error opening shift session:', error);
      throw error;
    }
  },

  /**
   * Get current active sessions to find the session ID
   * @returns {Promise<Object>} - Sessions data
   */
  async getCurrentSessions() {
    try {
      const response = await apiClient.post('/ShiftSessions/GetSessionsManagment', {
        pageNumber: 1,
        pageSize: 10,
        isActive: true // Get only active sessions
      });
      return response.data.data || {};
    } catch (error) {
      console.error('Error fetching current sessions:', error);
      throw error;
    }
  },

  /**
   * Get session details before closing (to get expected cash amounts)
   * @returns {Promise<Object>} - Session details including expected cash amounts
   */
  async getSessionDetailsForClosing() {
    try {
      const response = await apiClient.get('/ShiftSessions/GetBeforeCloseShiftSession');
      return response.data.data || {};
    } catch (error) {
      console.error('Error fetching session details before closing:', error);
      throw error;
    }
  },

  /**
   * Get current active session details before closing
   * @returns {Promise<Object>} - Current session details
   */
  async getCurrentActiveSessionDetails() {
    try {
      const sessionDetails = await this.getSessionDetailsForClosing();

      // Return the session details with proper structure
      return {
        ...sessionDetails,
        sessionId: sessionDetails.id,
        expectedCashEndAmount: sessionDetails.expectedCashEndAmount || 0,
        discrepancyAmount: sessionDetails.discrepancyAmount || 0
      };
    } catch (error) {
      console.error('Error fetching current active session details:', error);
      throw error;
    }
  },

  /**
   * Close shift session
   * @param {Object} params - Close session parameters
   * @param {number} params.shiftSessionId - Session ID
   * @param {Object} params.shiftCashDeposits - Cash deposit information
   * @param {string} params.Notes - Session notes
   * @param {File} [params.attachment] - Optional attachment file
   * @returns {Promise<Object>} - Close session response
   */
  async closeShiftSession(params) {
    try {
      const formData = new FormData();
      formData.append('shiftSessionId', params.shiftSessionId.toString());
      formData.append('shiftCashDeposits', JSON.stringify(params.shiftCashDeposits));
      formData.append('Notes', params.Notes || '');

      if (params.attachment) {
        formData.append('attachment', params.attachment);
      }

      const response = await apiClient.put('/ShiftSessions/CloseShiftSession', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data || {};
    } catch (error) {
      console.error('Error closing shift session:', error);
      throw error;
    }
  }
};
