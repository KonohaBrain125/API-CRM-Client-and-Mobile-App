import { postTokenService, getTokenService, uploadImageService } from "../../utils/commonService";

export class UserService {
  async getUserProfile(id, ctx) {
    let url = `${process.env.SERVER_BASE_URL}/api/user/${id}`
    let data = getTokenService(url, 'GET', ctx);
    return data;
  }

  async addAddress(body) {
    let url = `${process.env.SERVER_BASE_URL}/api/user/add-address`
    let data = postTokenService(url, 'POST', body);
    return data;
  }

  async editAddress(id, body) {
    let url = `${process.env.SERVER_BASE_URL}/api/user/edit-address/${id}`
    let data = postTokenService(url, 'PUT', body);
    return data;
  }

  async toggleActiveAddress(query) {
    let url = `${process.env.SERVER_BASE_URL}/api/user/toggle-address-activeness?${query}`
    let data = getTokenService(url, 'PATCH', ctx);
    return data;
  }

  async updateProfilePicture(body) {
    let url = `${process.env.SERVER_BASE_URL}/api/user`
    let data = uploadImageService(url, 'PATCH', body);
    return data;
  }

  async getMyReviews(query) {
    let url = `${process.env.SERVER_BASE_URL}/api/review-qna/my-reviews?${query}&perPage=5`
    let data = uploadImageService(url, 'GET');
    return data;
  }
  
}
