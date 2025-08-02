// dapp.js
// Ethers.js를 사용해 스마트 컨트랙트와 상호작용

import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js';

// 스마트 컨트랙트 주소 & ABI (배포한 주소로 바꿔주세요)
const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS';
const ABI = [
  'function clickLink(string url) external',
  'function vote(address target, bool support) external',
  'event LinkClicked(address indexed user, string url, uint256 timestamp)',
  'event VoteCast(address indexed voter, address indexed target, bool support)'
];

let provider, signer, contract;

/**
 * 메타마스크 지갑 연결 & Contract 초기화
 * @returns {Promise<string>} 연결된 지갑 주소
 */
export async function connectWallet() {
  if (!window.ethereum) {
    alert('MetaMask를 설치해주세요.');
    throw new Error('MetaMask not found');
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  signer   = provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  const addr = await signer.getAddress();
  console.log('Ethereum initialized:', addr);
  return addr;
}

/**
 * 온체인에 링크 클릭 기록 (clickLink)
 * @param {string} url
 */
export async function sendOnChainClick(url) {
  if (!contract) {
    await connectWallet();
  }
  try {
    const tx = await contract.clickLink(url);
    console.log('clickLink tx sent:', tx.hash);
    await tx.wait();
    console.log('clickLink tx mined');
  } catch (err) {
    console.error('clickLink error:', err);
  }
}

/**
 * 온체인에 신뢰 투표 기록 (vote)
 * @param {string} targetAddress  투표 대상의 이더리움 주소
 * @param {boolean} support       찬성 여부
 */
export async function voteOnChain(targetAddress, support) {
  if (!contract) {
    await connectWallet();
  }
  try {
    const tx = await contract.vote(targetAddress, support);
    console.log('vote tx sent:', tx.hash);
    await tx.wait();
    console.log('vote tx mined');
  } catch (err) {
    console.error('vote error:', err);
  }
}

/**
 * LinkClicked 이벤트 리스닝
 * @param {(evt: {user: string, url: string, timestamp: Date})=>void} cb
 */
export function listenClickEvents(cb) {
  if (!contract) return;
  contract.on('LinkClicked', (user, url, timestamp) => {
    cb({
      user,
      url,
      timestamp: new Date(timestamp.toNumber() * 1000)
    });
  });
}

/**
 * VoteCast 이벤트 리스닝
 * @param {(evt: {voter: string, target: string, support: boolean})=>void} cb
 */
export function listenVoteEvents(cb) {
  if (!contract) return;
  contract.on('VoteCast', (voter, target, support) => {
    cb({ voter, target, support });
  });
}
