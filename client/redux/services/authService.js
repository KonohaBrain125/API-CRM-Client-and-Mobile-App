import { postService } from "../../utils/commonService";
import { USER_AUTH_BASE_URL } from "../../utils/constants";

export class AuthService {
  async loginUser(body) {
    let url = `${USER_AUTH_BASE_URL}/signin`
    let data = postService(url, 'POST', body);
    return data;
  }

  async loginUserSocialLogin(body) {
    let url = `${USER_AUTH_BASE_URL}/social-login`
    let data = postService(url, 'POST', body);
    return data;
  }
  
  async registerUser(body) {
    let url = `${USER_AUTH_BASE_URL}/signup`
    let data = postService(url, 'POST', body);
    return data;
  }
}
