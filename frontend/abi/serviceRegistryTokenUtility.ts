export const SERVICE_REGISTRY_TOKEN_UTILITY_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_serviceRegistry', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [{ internalType: 'address', name: 'operator', type: 'address' }],
    name: 'AgentInstanceRegistered',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'serviceId', type: 'uint256' }],
    name: 'AgentInstancesSlotsFilled',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'agentId', type: 'uint256' }],
    name: 'AgentNotFound',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'agentId', type: 'uint256' },
      { internalType: 'uint256', name: 'serviceId', type: 'uint256' },
    ],
    name: 'AgentNotInService',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'componentId', type: 'uint256' }],
    name: 'ComponentNotFound',
    type: 'error',
  },
  { inputs: [], name: 'HashExists', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'sent', type: 'uint256' },
      { internalType: 'uint256', name: 'expected', type: 'uint256' },
      { internalType: 'uint256', name: 'serviceId', type: 'uint256' },
    ],
    name: 'IncorrectAgentBondingValue',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'sent', type: 'uint256' },
      { internalType: 'uint256', name: 'expected', type: 'uint256' },
      { internalType: 'uint256', name: 'serviceId', type: 'uint256' },
    ],
    name: 'IncorrectRegistrationDepositValue',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'address', name: 'manager', type: 'address' },
    ],
    name: 'ManagerOnly',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'provided', type: 'address' },
      { internalType: 'address', name: 'expected', type: 'address' },
      { internalType: 'uint256', name: 'serviceId', type: 'uint256' },
    ],
    name: 'OnlyOwnServiceMultisig',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'uint256', name: 'serviceId', type: 'uint256' },
    ],
    name: 'OperatorHasNoInstances',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'provided', type: 'uint256' },
      { internalType: 'uint256', name: 'max', type: 'uint256' },
    ],
    name: 'Overflow',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'address', name: 'owner', type: 'address' },
    ],
    name: 'OwnerOnly',
    type: 'error',
  },
  { inputs: [], name: 'Paused', type: 'error' },
  { inputs: [], name: 'ReentrancyGuard', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'serviceId', type: 'uint256' }],
    name: 'ServiceMustBeInactive',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'TokenRejected',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'TransferFailed',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'multisig', type: 'address' }],
    name: 'UnauthorizedMultisig',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'agentId', type: 'uint256' }],
    name: 'WrongAgentId',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'numValues1', type: 'uint256' },
      { internalType: 'uint256', name: 'numValues2', type: 'uint256' },
    ],
    name: 'WrongArrayLength',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'serviceId', type: 'uint256' }],
    name: 'WrongOperator',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'state', type: 'uint256' },
      { internalType: 'uint256', name: 'serviceId', type: 'uint256' },
    ],
    name: 'WrongServiceState',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'currentThreshold', type: 'uint256' },
      { internalType: 'uint256', name: 'minThreshold', type: 'uint256' },
      { internalType: 'uint256', name: 'maxThreshold', type: 'uint256' },
    ],
    name: 'WrongThreshold',
    type: 'error',
  },
  { inputs: [], name: 'ZeroAddress', type: 'error' },
  { inputs: [], name: 'ZeroValue', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'drainer',
        type: 'address',
      },
    ],
    name: 'DrainerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'manager',
        type: 'address',
      },
    ],
    name: 'ManagerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'serviceId',
        type: 'uint256',
      },
    ],
    name: 'OperatorTokenSlashed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'OwnerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'TokenDeposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'drainer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'TokenDrain',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'TokenRefund',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'serviceId', type: 'uint256' }],
    name: 'activateRegistrationTokenDeposit',
    outputs: [{ internalType: 'bool', name: 'isTokenSecured', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newDrainer', type: 'address' }],
    name: 'changeDrainer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newManager', type: 'address' }],
    name: 'changeManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'changeOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'serviceId', type: 'uint256' },
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint32[]', name: 'agentIds', type: 'uint32[]' },
      { internalType: 'uint256[]', name: 'bonds', type: 'uint256[]' },
    ],
    name: 'createWithToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'drain',
    outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'drainer',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'serviceId', type: 'uint256' },
      { internalType: 'uint256', name: 'agentId', type: 'uint256' },
    ],
    name: 'getAgentBond',
    outputs: [{ internalType: 'uint256', name: 'bond', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'uint256', name: 'serviceId', type: 'uint256' },
    ],
    name: 'getOperatorBalance',
    outputs: [{ internalType: 'uint256', name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'serviceId', type: 'uint256' }],
    name: 'isTokenSecuredService',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'manager',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'mapOperatorAndServiceIdOperatorBalances',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'mapServiceAndAgentIdAgentBond',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'mapServiceIdTokenDeposit',
    outputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint96', name: 'securityDeposit', type: 'uint96' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'mapSlashedFunds',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'uint256', name: 'serviceId', type: 'uint256' },
      { internalType: 'uint32[]', name: 'agentIds', type: 'uint32[]' },
    ],
    name: 'registerAgentsTokenDeposit',
    outputs: [{ internalType: 'bool', name: 'isTokenSecured', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'serviceId', type: 'uint256' }],
    name: 'resetServiceToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'serviceRegistry',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'agentInstances', type: 'address[]' },
      { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
      { internalType: 'uint256', name: 'serviceId', type: 'uint256' },
    ],
    name: 'slash',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'serviceId', type: 'uint256' }],
    name: 'terminateTokenRefund',
    outputs: [
      { internalType: 'uint256', name: 'securityRefund', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'uint256', name: 'serviceId', type: 'uint256' },
    ],
    name: 'unbondTokenRefund',
    outputs: [{ internalType: 'uint256', name: 'refund', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
