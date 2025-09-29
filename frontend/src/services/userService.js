import { apiClient } from './api/apiClient.js';
import API_ENDPOINTS from './api/endpoints.js';

class UserService {

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @param {string} [profileData.username] - Username
   * @param {string} [profileData.email] - Email address
   * @param {number} [profileData.yearofbirth] - Year of birth
   * @param {string} [profileData.educational_level] - Educational level
   * @returns {Promise<Object>} Updated user data
   */
  async updateUserProfile(profileData) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.USER.UPDATE_PROFILE, profileData);

      const { data } = response.data;
      const { user, updated_fields } = data;

      return {
        success: true,
        data: {
          user,
          updated_fields,
        },
        message: response.data.message,
      };
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   * @private
   * @param {Error} error - The error object
   * @returns {Object} Standardized error response
   */
  _handleError(error) {
    let message = 'Đã xảy ra lỗi không xác định';

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const serverMessage = error.response.data?.message;

      if (status === 401) {
        message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (status === 403) {
        message = 'Bạn không có quyền thực hiện thao tác này.';
      } else if (status === 404) {
        message = 'Không tìm thấy thông tin người dùng.';
      } else if (status === 409) {
        message = serverMessage || 'Dữ liệu bị trùng lặp. Vui lòng kiểm tra lại.';
      } else if (status === 422) {
        message = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      } else if (serverMessage) {
        message = serverMessage;
      }
    } else if (error.request) {
      // Network error
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    }

    return {
      success: false,
      message,
      error: error.response?.data || error.message,
    };
  }
}

// Create and export singleton instance
const userService = new UserService();
export default userService;
