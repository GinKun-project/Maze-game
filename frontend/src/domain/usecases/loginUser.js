import AuthRepositoryImpl from "../../data/repositories/AuthRepositoryImpl.js";

const repo = new AuthRepositoryImpl();

export default async function loginUser(username, password) {
  // simple validation
  if (!username || !password) {
    throw new Error("Username and password are required");
  }

  // delegate to repository
  const user = await repo.login(username, password);
  return user;
}
