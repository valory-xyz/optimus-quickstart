import { BACKEND_URL } from '@/constants/urls';

/**
 * Gets account status "is_setup"
 */
const getAccount = () =>
  fetch(`${BACKEND_URL}/account`).then((res) => res.json());

/**
 * Creates a local user account
 */
const createAccount = (password: string) =>
  fetch(`${BACKEND_URL}/account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  }).then((res) => res.json());

/**
 * Updates user's password
 */
const updateAccount = (oldPassword: string, newPassword: string) =>
  fetch(`${BACKEND_URL}/account`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  }).then((res) => res.json());

/**
 * Logs in a user
 */
const loginAccount = (password: string) =>
  fetch(`${BACKEND_URL}/account/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password,
    }),
  }).then((res) => {
    if (![200, 201].includes(res.status)) throw new Error('Login failed');
    res.json();
  });

export const AccountService = {
  getAccount,
  createAccount,
  updateAccount,
  loginAccount,
};
