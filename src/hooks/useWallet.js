import { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, INVESTMENT_ESCROW_ABI, ERC20_ABI, hasAddress } from '../contracts/contractConfig';

const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum', hex: '0x1' },
  137: { name: 'Polygon', hex: '0x89' },
  8453: { name: 'Base', hex: '0x2105' },
  11155111: { name: 'Sepolia', hex: '0xaa36a7' },
  80002: { name: 'Polygon Amoy', hex: '0x13882' },
};

const DEFAULT_REQUIRED_CHAIN_ID = Number(import.meta.env.VITE_REQUIRED_CHAIN_ID || 0); // 0 = allow any wallet network for demo
const INVESTMENT_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.investmentEscrow;
const PAYMENT_TOKEN_ADDRESS = CONTRACT_ADDRESSES.paymentToken;
const NATIVE_WEI_PER_SHARE = import.meta.env.VITE_NATIVE_WEI_PER_SHARE || '0'; // example: 1000000000000000 = 0.001 ETH/MATIC per share
const TOKEN_DECIMALS = Number(import.meta.env.VITE_PAYMENT_TOKEN_DECIMALS || 6);
const TOKEN_UNITS_PER_SHARE = import.meta.env.VITE_TOKEN_UNITS_PER_SHARE || ''; // example: 10000000 for 10 USDC if decimals=6
const DEMO_ADDRESS = '0xDemo000000000000000000000000000000000001';

function getEthereum() {
  if (typeof window === 'undefined') return null;
  return window.ethereum || null;
}

function shortAddress(address) {
  if (!address) return '';
  if (address.startsWith('0xDemo')) return 'Demo Wallet';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function buildInvestmentMessage({ account, chainId, property, quantity, totalUsd }) {
  return [
    'RealFraction Investment Intent',
    '',
    `Wallet: ${account}`,
    `Chain ID: ${chainId || 'demo'}`,
    `Property ID: ${property.id}`,
    `Property: ${property.title}`,
    `Token Symbol: ${property.tokenSymbol}`,
    `Token Quantity: ${quantity}`,
    `Estimated Total USD: ${totalUsd}`,
    `Nonce: ${crypto?.randomUUID ? crypto.randomUUID() : Date.now()}`,
    `Timestamp: ${new Date().toISOString()}`,
    '',
    'I confirm that I want to create an investment intent for this property.'
  ].join('\n');
}

function makeDemoSignature(message) {
  const encoded = typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(message))).slice(0, 96) : Date.now().toString(16);
  return `demo-signature-${encoded}`;
}

export function useWallet() {
  const [status, setStatus] = useState('disconnected');
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [txState, setTxState] = useState('idle');
  const [txHash, setTxHash] = useState('');
  const [signature, setSignature] = useState('');
  const [investmentReceipt, setInvestmentReceipt] = useState(null);

  const hasProvider = typeof window !== 'undefined' && Boolean(window.ethereum);

  const refreshAccountAndNetwork = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;
    try {
      const provider = new ethers.providers.Web3Provider(ethereum, 'any');
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();
      setChainId(network.chainId);
      if (accounts?.[0]) {
        setAddress(accounts[0]);
        setStatus('connected');
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    refreshAccountAndNetwork();
    const ethereum = getEthereum();
    if (!ethereum) return undefined;

    const onAccountsChanged = (accounts) => {
      if (!accounts?.length) {
        setAddress('');
        setStatus('disconnected');
      } else {
        setAddress(accounts[0]);
        setStatus('connected');
      }
    };
    const onChainChanged = (hexChainId) => setChainId(Number.parseInt(hexChainId, 16));

    ethereum.on?.('accountsChanged', onAccountsChanged);
    ethereum.on?.('chainChanged', onChainChanged);
    return () => {
      ethereum.removeListener?.('accountsChanged', onAccountsChanged);
      ethereum.removeListener?.('chainChanged', onChainChanged);
    };
  }, [refreshAccountAndNetwork]);

  const connect = useCallback(async () => {
    setError('');
    setWarning('');
    const ethereum = getEthereum();

    // Works in Chrome without MetaMask too, so the demo never gets stuck.
    if (!ethereum) {
      setStatus('demo_connected');
      setAddress(DEMO_ADDRESS);
      setChainId(0);
      setWarning('MetaMask was not detected, so demo wallet mode is active. Install MetaMask for real wallet signing.');
      return DEMO_ADDRESS;
    }

    try {
      setStatus('connecting');
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(ethereum, 'any');
      const network = await provider.getNetwork();
      setAddress(accounts[0]);
      setChainId(network.chainId);
      setStatus('connected');
      return accounts[0];
    } catch (err) {
      setStatus('disconnected');
      setError(err?.code === 4001 ? 'Wallet connection rejected by user.' : (err?.message || 'Wallet connection failed.'));
      return null;
    }
  }, []);

  const switchNetwork = useCallback(async (targetChainId = DEFAULT_REQUIRED_CHAIN_ID) => {
    setError('');
    const ethereum = getEthereum();
    if (!ethereum || !targetChainId) return true;
    const chain = SUPPORTED_CHAINS[targetChainId];
    if (!chain) {
      setWarning(`Required chain ${targetChainId} is not configured. Continuing in demo signature mode.`);
      return true;
    }
    try {
      await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chain.hex }] });
      setChainId(targetChainId);
      return true;
    } catch (err) {
      // Do not block signing just because the test chain is not added to MetaMask.
      setWarning(`Could not switch to ${chain.name}. Continuing with current wallet network for signature-only demo.`);
      return true;
    }
  }, []);

  const signInvestment = useCallback(async ({ property, quantity, totalUsd, requiredChainId = DEFAULT_REQUIRED_CHAIN_ID }) => {
    setError('');
    setWarning('');
    setTxHash('');
    setSignature('');
    setInvestmentReceipt(null);

    try {
      let currentAddress = address;
      if (!currentAddress) {
        currentAddress = await connect();
        if (!currentAddress) return null;
      }

      const ethereum = getEthereum();
      let activeChainId = chainId || 0;

      // Demo mode when MetaMask/browser wallet is not present.
      if (!ethereum || currentAddress === DEMO_ADDRESS) {
        setTxState('signature_pending');
        const message = buildInvestmentMessage({ account: DEMO_ADDRESS, chainId: 'demo', property, quantity, totalUsd });
        const signed = makeDemoSignature(message);
        setSignature(signed);
        setTxState('confirmed');
        const receipt = { mode: 'demo-signed-intent', propertyId: property.id, propertyTitle: property.title, tokenSymbol: property.tokenSymbol, quantity, totalUsd, wallet: DEMO_ADDRESS, signature: signed, message, createdAt: new Date().toISOString() };
        localStorage.setItem('realfraction:lastInvestmentIntent', JSON.stringify(receipt));
        setInvestmentReceipt(receipt);
        return receipt;
      }

      const provider = new ethers.providers.Web3Provider(ethereum, 'any');
      const network = await provider.getNetwork();
      activeChainId = network.chainId;
      setChainId(activeChainId);

      if (requiredChainId && activeChainId !== Number(requiredChainId)) {
        setTxState('wrong_network');
        await switchNetwork(Number(requiredChainId));
      }

      const refreshedProvider = new ethers.providers.Web3Provider(ethereum, 'any');
      const signer = refreshedProvider.getSigner();
      const signerAddress = await signer.getAddress();
      setAddress(signerAddress);
      setStatus('connected');

      setTxState('signature_pending');
      const message = buildInvestmentMessage({ account: signerAddress, chainId: activeChainId, property, quantity, totalUsd });
      let signed;
      try {
        signed = await signer.signMessage(message);
      } catch (signErr) {
        // Some injected wallets prefer raw personal_sign.
        signed = await ethereum.request({ method: 'personal_sign', params: [message, signerAddress] });
      }
      setSignature(signed);

      if (hasAddress(INVESTMENT_CONTRACT_ADDRESS)) {
        setTxState('submitted_onchain');
        const contract = new ethers.Contract(INVESTMENT_CONTRACT_ADDRESS, INVESTMENT_ESCROW_ABI, signer);

        let tx;
        // If a payment token address is configured, approve the escrow and call investWithToken().
        // Otherwise call investNative() with optional native value from VITE_NATIVE_WEI_PER_SHARE.
        if (hasAddress(PAYMENT_TOKEN_ADDRESS)) {
          const token = new ethers.Contract(PAYMENT_TOKEN_ADDRESS, ERC20_ABI, signer);
          const unitsPerShare = TOKEN_UNITS_PER_SHARE
            ? ethers.BigNumber.from(TOKEN_UNITS_PER_SHARE)
            : ethers.utils.parseUnits(String(property.tokenPrice || 0), TOKEN_DECIMALS);
          const totalTokenAmount = unitsPerShare.mul(ethers.BigNumber.from(quantity));
          const allowance = await token.allowance(signerAddress, INVESTMENT_CONTRACT_ADDRESS);
          if (allowance.lt(totalTokenAmount)) {
            const approveTx = await token.approve(INVESTMENT_CONTRACT_ADDRESS, totalTokenAmount);
            setTxHash(approveTx.hash);
            setTxState('pending_confirmation');
            await approveTx.wait(1);
            setTxState('submitted_onchain');
          }
          tx = await contract.investWithToken(property.id, quantity);
        } else {
          const weiPerShare = ethers.BigNumber.from(NATIVE_WEI_PER_SHARE || '0');
          const value = weiPerShare.mul(ethers.BigNumber.from(quantity));
          tx = await contract.investNative(property.id, quantity, { value });
        }

        setTxHash(tx.hash);
        setTxState('pending_confirmation');
        const receipt = await tx.wait(1);
        setTxState('confirmed');
        const finalReceipt = { mode: hasAddress(PAYMENT_TOKEN_ADDRESS) ? 'contract-usdc-investment' : 'contract-native-investment', contract: INVESTMENT_CONTRACT_ADDRESS, propertyId: property.id, quantity, totalUsd, txHash: receipt.transactionHash, signature: signed, blockNumber: receipt.blockNumber, createdAt: new Date().toISOString() };
        localStorage.setItem('realfraction:lastInvestmentIntent', JSON.stringify(finalReceipt));
        setInvestmentReceipt(finalReceipt);
        return finalReceipt;
      }

      setTxState('confirmed');
      const localReceipt = { mode: 'wallet-signed-intent', propertyId: property.id, propertyTitle: property.title, tokenSymbol: property.tokenSymbol, quantity, totalUsd, wallet: signerAddress, chainId: activeChainId, signature: signed, message, createdAt: new Date().toISOString() };
      localStorage.setItem('realfraction:lastInvestmentIntent', JSON.stringify(localReceipt));
      setInvestmentReceipt(localReceipt);
      return localReceipt;
    } catch (err) {
      setTxState(err?.code === 4001 || err?.code === 'ACTION_REJECTED' ? 'rejected' : 'failed');
      setError(err?.reason || err?.message || 'Investment signing failed. Check MetaMask popup, unlock wallet, and retry.');
      return null;
    }
  }, [address, chainId, connect, switchNetwork]);

  const disconnect = useCallback(() => {
    setStatus('disconnected');
    setAddress('');
    setError('');
    setWarning('');
    setTxState('idle');
    setTxHash('');
    setSignature('');
    setInvestmentReceipt(null);
  }, []);

  const chain = chainId === 0 ? 'Demo mode' : chainId ? (SUPPORTED_CHAINS[chainId]?.name || `Chain ${chainId}`) : 'Not connected';

  return useMemo(() => ({
    status,
    address,
    shortAddress: shortAddress(address),
    chain,
    chainId,
    requiredChainId: DEFAULT_REQUIRED_CHAIN_ID,
    requiredChainName: DEFAULT_REQUIRED_CHAIN_ID ? (SUPPORTED_CHAINS[DEFAULT_REQUIRED_CHAIN_ID]?.name || `Chain ${DEFAULT_REQUIRED_CHAIN_ID}`) : 'Any wallet network',
    error,
    warning,
    txState,
    txHash,
    signature,
    investmentReceipt,
    hasProvider,
    connect,
    disconnect,
    switchNetwork,
    signInvestment,
  }), [status, address, chain, chainId, error, warning, txState, txHash, signature, investmentReceipt, hasProvider, connect, disconnect, switchNetwork, signInvestment]);
}
