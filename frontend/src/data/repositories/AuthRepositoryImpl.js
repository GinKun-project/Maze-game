import apiClient from "../../infrastructure/http/apiClient.js";
import User from "../../domain/entities/User.js";

export default class AuthRepositoryImpl {
  async login(username, password) {
    const res = await apiClient.post("/auth/login", { username, password });
    const data = res.data;

    return new User({
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      token: data.token,
    });
  }

  async register(username, email, password) {
    const res = await apiClient.post("/auth/register", {
      username,
      email,
      password,
    });
    const data = res.data;

    return new User({
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      token: data.token,
    });
  }
}
