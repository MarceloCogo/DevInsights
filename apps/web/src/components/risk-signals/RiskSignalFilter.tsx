/**
 * RiskSignalFilter Component
 * 
 * Filter dropdown for filtering PRs by risk signal.
 * 
 * @see Requirements 4.6
 */

import { useState, useRef, useEffect } from 'react';
import { RiskSignalBadge } from './RiskSignalBadge';
import type { RiskSignalType } from '../../types/components';

interface RiskSignalFilterProps {
  selectedSignals: RiskSignalType[];
  onChange: (signals: RiskSignalType[]) => void;
}

const ALL_SIGNAL_TYPES: RiskSignalType[] = ['stale', 'large', 'long-lived', 'security', 'bug', 'maintainability'];

export function RiskSignalFilter({ selectedSignals, onChange }: RiskSignalFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSignal = (signal: RiskSignalType) => {
    if (selectedSignals.includes(signal)) {
      onChange(selectedSignals.filter((s) => s !== signal));
    } else {
      onChange([...selectedSignals, signal]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectAll = () => {
    onChange([...ALL_SIGNAL_TYPES]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-text hover:border-muted focus:outline-none focus:ring-2 focus:ring-cyan"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>🔍</span>
        <span>Risk Filters</span>
        {selectedSignals.length > 0 && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan text-xs font-bold text-ink">
            {selectedSignals.length}
          </span>
        )}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-64 rounded-lg border border-line bg-panel p-3 shadow-lg"
          role="listbox"
          aria-label="Risk signal filters"
        >
          <div className="mb-2 flex justify-between gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-cyan hover:text-cyan/80"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted hover:text-text"
            >
              Clear
            </button>
          </div>

          <div className="space-y-1">
            {ALL_SIGNAL_TYPES.map((signal) => {
              const isSelected = selectedSignals.includes(signal);
              return (
                <button
                  key={signal}
                  type="button"
                  onClick={() => toggleSignal(signal)}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-cyan/10 text-cyan'
                      : 'text-text hover:bg-panelSoft'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      isSelected
                        ? 'border-cyan bg-cyan text-ink'
                        : 'border-line'
                    }`}
                  >
                    {isSelected && (
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                  <RiskSignalBadge type={signal} size="sm" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
