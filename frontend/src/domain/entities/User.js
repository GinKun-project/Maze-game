export default class User {
  constructor({ id = null, username, email = null, token = null }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.token = token;
  }
}
