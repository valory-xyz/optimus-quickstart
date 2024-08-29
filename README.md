<h1 align="center">
<b>Optimus Quickstart</b>
</h1>


<h2 align="left">
<b>Compatible Systems</b>
</h2>

- Windows 10/11: WSL2 / Git BASH
- Mac ARM / Intel
- Linux
- Raspberry Pi 4

<h2 align="left">
<b>System Requirements</b>
</h2>

Ensure your machine satisfies the requirements:

- Python ==3.10
- Poetry >=1.4.0
- Docker Engine <25.0.0
- Docker Compose


<h2 align="left">
<b>Run Optimus</b>
</h2>

Execute the following commands to get started with Optimus:

1. Clone locally this git repository.

2. From within the corresponding folder, run with:
```bash
chmod +x run_service.sh
./run_service.sh
```
3. Eventually you will be asked for 3 RPCs (for Ethereum Mainnet, Optimism Mainnet, and Base Mainnet). You can use your own or leverage the following public ones:
  - Ethereum Mainnet RPC: https://virtual.mainnet.rpc.tenderly.co/4b1b935c-2ad1-4f63-88c4-f74eaae37123
  - Optimism Mainnet RPC: https://virtual.optimism.rpc.tenderly.co/2ba819d3-6ee1-4075-a145-6eaaeb58e5b7
  - Base Mainnet RPC: https://virtual.base.rpc.tenderly.co/a5594f32-3ec3-4ea5-8a91-6d5d7d9e290b
4. Next you will be asked for the Tenderly API Key. Please copy-paste the following: <b>We should change this password thinghi to a final one?! del this message and update below once we do</b>
```bash
test123
```
5. Finally, you will be asked to add necessary funds as shown below:
```bash
   Please make sure main wallet <address> [...]
```

Transferr the necessary funds to _address_ and you are good to go.


<h2 align="left">
<b>Stopping your agent</b>
</h2>
To stop your agent, use:

```bash
  ./stop_service.sh
```


