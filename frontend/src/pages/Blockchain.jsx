// src/pages/Blockchain.jsx
// Blockchain ledger viewer — shows all immutable records (Admin/Staff)

import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Blockchain.css';

const TYPE_CONFIG = {
  GENESIS:              { emoji: '🌱', color: 'var(--color-text-muted)' },
  ANIMAL_REGISTERED:    { emoji: '🐾', color: 'var(--color-primary)' },
  ANIMAL_UPDATED:       { emoji: '✏️', color: 'var(--color-secondary)' },
  VACCINATION_UPDATED:  { emoji: '💉', color: 'var(--color-success)' },
  ADOPTION_APPLIED:     { emoji: '📋', color: 'var(--color-warning)' },
  ADOPTION_CONFIRMED:   { emoji: '🏠', color: 'var(--color-success)' },
  ADOPTION_REJECTED:    { emoji: '❌', color: 'var(--color-danger)' },
};

const Blockchain = () => {
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [expandedBlock, setExpandedBlock] = useState(null);

  useEffect(() => {
    fetchChain();
  }, []);

  const fetchChain = async () => {
    try {
      const { data } = await api.get('/blockchain/log');
      setChain(data.chain || []);
    } catch (err) {
      toast.error('Failed to load blockchain ledger');
    } finally {
      setLoading(false);
    }
  };

  const verifyChain = async () => {
    setVerifying(true);
    try {
      const { data } = await api.get('/blockchain/verify');
      setVerifyResult(data);
      if (data.valid) {
        toast.success('✅ Blockchain integrity verified!');
      } else {
        toast.error('⚠️ Blockchain integrity compromised!');
      }
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const filtered = filterType ? chain.filter((b) => b.type === filterType) : chain;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">
              🔗 <span className="text-gradient">Blockchain Ledger</span>
            </h1>
            <p className="section-subtitle">
              Immutable hash-linked record of all system events · {chain.length} blocks
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-secondary" onClick={fetchChain}>↻ Refresh</button>
            <button className="btn btn-primary" onClick={verifyChain} disabled={verifying}>
              {verifying ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Verifying...</> : '🔒 Verify Integrity'}
            </button>
          </div>
        </div>

        {/* Verify Result Banner */}
        {verifyResult && (
          <div className={`verify-banner animate-fade-up ${verifyResult.valid ? 'valid' : 'invalid'}`} style={{ marginBottom: 24 }}>
            {verifyResult.valid ? (
              <>✅ <strong>Blockchain is Valid</strong> — All {verifyResult.blocks} blocks are properly linked and unmodified.</>
            ) : (
              <>⚠️ <strong>Integrity Issue Detected</strong> — Block {verifyResult.tampered_at_index || verifyResult.broken_link_at_index} may have been modified.</>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="blockchain-stats" style={{ marginBottom: 24 }}>
          {Object.entries(TYPE_CONFIG).filter(([k]) => k !== 'GENESIS').map(([type, config]) => {
            const count = chain.filter((b) => b.type === type).length;
            return (
              <div key={type} className="blockchain-stat-chip" onClick={() => setFilterType(filterType === type ? '' : type)}>
                <span>{config.emoji}</span>
                <span style={{ fontWeight: 700 }}>{count}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {type.replace(/_/g, ' ').toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Filter */}
        <div className="filter-bar" style={{ marginBottom: 24 }}>
          <select className="form-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Events</option>
            <option value="ANIMAL_REGISTERED">🐾 Animal Registered</option>
            <option value="ANIMAL_UPDATED">✏️ Animal Updated</option>
            <option value="VACCINATION_UPDATED">💉 Vaccination Updated</option>
            <option value="ADOPTION_APPLIED">📋 Adoption Applied</option>
            <option value="ADOPTION_CONFIRMED">🏠 Adoption Confirmed</option>
            <option value="ADOPTION_REJECTED">❌ Adoption Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner"></div><p>Loading blockchain...</p></div>
        ) : (
          <div className="blockchain-chain">
            {[...filtered].reverse().map((block, i) => {
              const config = TYPE_CONFIG[block.type] || { emoji: '📦', color: 'var(--color-text-muted)' };
              const isExpanded = expandedBlock === block.index;

              return (
                <div key={block.index} className={`blockchain-block animate-fade-up ${isExpanded ? 'expanded' : ''}`}>
                  {/* Block header */}
                  <div className="blockchain-block-header" onClick={() => setExpandedBlock(isExpanded ? null : block.index)}>
                    <div className="blockchain-block-icon" style={{ color: config.color }}>
                      {config.emoji}
                    </div>
                    <div className="blockchain-block-meta">
                      <div className="flex items-center gap-2">
                        <span className="blockchain-block-index">Block #{block.index}</span>
                        <span className="blockchain-block-type" style={{ color: config.color }}>
                          {block.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="blockchain-block-time">
                        {new Date(block.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="blockchain-block-hash">
                      <code>{block.hash.substring(0, 20)}...</code>
                    </div>
                    <div className="blockchain-block-toggle">{isExpanded ? '▲' : '▼'}</div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="blockchain-block-details">
                      <div className="blockchain-detail-row">
                        <span className="blockchain-detail-label">Full Hash</span>
                        <code className="blockchain-detail-hash">{block.hash}</code>
                      </div>
                      <div className="blockchain-detail-row">
                        <span className="blockchain-detail-label">Previous Hash</span>
                        <code className="blockchain-detail-hash">{block.previousHash}</code>
                      </div>
                      <div className="blockchain-detail-row">
                        <span className="blockchain-detail-label">Timestamp</span>
                        <span>{new Date(block.timestamp).toISOString()}</span>
                      </div>
                      <div className="blockchain-detail-row">
                        <span className="blockchain-detail-label">Data</span>
                        <pre className="blockchain-detail-data">
                          {JSON.stringify(block.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Chain link indicator */}
                  {i < filtered.length - 1 && (
                    <div className="blockchain-link-line">
                      <span>↓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blockchain;
