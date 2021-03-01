const roles = ['user', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], ['transferAmount']);
roleRights.set(roles[1], ['getUsers', 'manageUsers', 'getAccount', 'manageAccount', 'transferAmount']);

module.exports = {
  roles,
  roleRights,
};
