import AuthRepositoryImpl from "../../data/repositories/AuthRepositoryImpl.js";

const repo = new AuthRepositoryImpl();

export default async function registerUser(username, email, password) {
  if (!username || !email || !password) {
    throw new Error("All fields are required");
  }
  const user = await repo.register(username, email, password);
  return user;
}
