import { Chain } from '@/client';
import { BACKEND_URL } from '@/constants';

/**
 * Returns a list of available wallets
 */
const getWallets = async () =>
  fetch(`${BACKEND_URL}/wallet`).then((res) => res.json());

const createEoa = async (chain: Chain) =>
  fetch(`${BACKEND_URL}/wallet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chain_type: chain }),
  }).then((res) => res.json());

const createSafe = async (chain: Chain, owner?: string) =>
  fetch(`${BACKEND_URL}/wallet/safe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chain_type: chain, owner: owner }),
  }).then((res) => res.json());

const addBackupOwner = async (chain: Chain, owner: string) =>
  fetch(`${BACKEND_URL}/wallet/safe`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chain_type: chain, owner: owner }),
  }).then((res) => res.json());

export const WalletService = {
  getWallets,
  createEoa,
  createSafe,
  addBackupOwner
};
