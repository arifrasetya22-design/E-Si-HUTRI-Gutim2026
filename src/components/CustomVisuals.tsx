/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface VisualProps {
  value: string;
  className?: string;
  size?: number;
}

/**
 * Generates an elegant Code 128 / Code 39 style SVG Barcode
 */
export const Barcode: React.FC<VisualProps> = ({ value, className = "" }) => {
  // Simple algorithm to generate standard vertical line patterns based on characters
  const patternSeed = value || "HUT81-0001";
  
  // Create a pseudo-random bar pattern based on the string hash
  const generateBars = () => {
    let hash = 0;
    for (let i = 0; i < patternSeed.length; i++) {
      hash = patternSeed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const bars: boolean[] = [];
    // Always start with standard quiet zone / guard bars
    bars.push(true, false, true, true, false);
    
    for (let i = 0; i < 45; i++) {
      const bit = ((hash >> (i % 32)) & 1) === 1;
      // alternate or repeat with some constraints to keep it looking like a barcode
      if (i % 3 === 0) {
        bars.push(true, false);
      } else {
        bars.push(bit, !bit);
      }
    }
    
    // Always end with quiet zone
    bars.push(true, true, false, true, true);
    return bars;
  };

  const bars = generateBars();
  const barWidth = 2.5;
  const totalWidth = bars.length * barWidth;
  const height = 65;

  return (
    <div className={`flex flex-col items-center p-2 bg-white rounded-md border border-gray-100 shadow-xs ${className}`}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        preserveAspectRatio="none"
        className="text-gray-900"
      >
        <g fill="currentColor">
          {bars.map((isBar, idx) => {
            if (isBar) {
              return (
                <rect
                  key={idx}
                  x={idx * barWidth}
                  y={0}
                  width={barWidth * 1.5} // slightly thicker for realistic code
                  height={height}
                />
              );
            }
            return null;
          })}
        </g>
      </svg>
      <span className="mt-1 font-mono text-xxs tracking-widest text-gray-500 uppercase">
        {value}
      </span>
    </div>
  );
};

/**
 * Generates a beautiful dynamic QR Code SVG with Indonesian flag in center
 */
export const QRCode: React.FC<VisualProps> = ({ value, className = "", size = 120 }) => {
  const seedString = value || "HUT81-0001";
  
  // Generate a deterministic 21x21 QR matrix based on a string hash
  const matrixSize = 21;
  
  const generateMatrix = () => {
    const matrix: boolean[][] = Array(matrixSize).fill(null).map(() => Array(matrixSize).fill(false));
    
    // 1. Finder patterns (three corners)
    const drawFinder = (x: number, y: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuterBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInnerBlock = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          if (isOuterBorder || isInnerBlock) {
            matrix[y + r][x + c] = true;
          }
        }
      }
    };
    
    drawFinder(0, 0); // top left
    drawFinder(matrixSize - 7, 0); // top right
    drawFinder(0, matrixSize - 7); // bottom left
    
    // 2. Alignment patterns & timing lines
    for (let i = 7; i < matrixSize - 7; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }
    
    // 3. Populate other areas deterministically using a string hash
    let hash = 5381;
    for (let i = 0; i < seedString.length; i++) {
      hash = ((hash << 5) + hash) + seedString.charCodeAt(i);
    }
    
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        // Skip finder areas
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= matrixSize - 8;
        const inBottomLeft = r >= matrixSize - 8 && c < 8;
        // Skip timing line areas partially or center area (for logo)
        const inCenter = r >= 9 && r <= 11 && c >= 9 && c <= 11;
        
        if (!inTopLeft && !inTopRight && !inBottomLeft && !inCenter) {
          const val = (hash >> ((r * c + r + c) % 31)) & 1;
          matrix[r][c] = val === 1;
        }
      }
    }
    
    return matrix;
  };
  
  const matrix = generateMatrix();
  const cellSize = size / matrixSize;

  return (
    <div className={`relative flex flex-col items-center p-2.5 bg-white rounded-md border border-gray-100 shadow-xs ${className}`} style={{ width: size + 20, height: size + 20 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Draw modules */}
        <g fill="currentColor">
          {matrix.map((row, r) => 
            row.map((active, c) => {
              if (active) {
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={c * cellSize}
                    y={r * cellSize}
                    width={cellSize - 0.2}
                    height={cellSize - 0.2}
                    rx={cellSize * 0.15} // slightly rounded modules for AI/Modern feel
                  />
                );
              }
              return null;
            })
          )}
        </g>
        
        {/* Draw a gorgeous Indonesian flag shield in the center */}
        <g transform={`translate(${size / 2 - 12}, ${size / 2 - 12})`}>
          {/* White border circle */}
          <circle cx="12" cy="12" r="11" fill="white" stroke="#E2E8F0" strokeWidth="1" />
          {/* Merah / Red top half */}
          <path d="M 12 1 A 11 11 0 0 1 23 12 L 1 12 A 11 11 0 0 1 12 1 Z" fill="#EF4444" />
          {/* Putih / White bottom half */}
          <path d="M 12 23 A 11 11 0 0 1 1 12 L 23 12 A 11 11 0 0 1 12 23 Z" fill="#FFFFFF" />
          {/* Outer gold ring border */}
          <circle cx="12" cy="12" r="11" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
};
