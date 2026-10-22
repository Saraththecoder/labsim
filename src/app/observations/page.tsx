'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TableProperties,
  FlaskConical,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  Sparkles,
  FileText,
  Calculator,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { LabObservation } from '@/lib/types';
import {
  getSavedObservations,
  saveObservations,
  deleteObservation,
  clearObservations,
  resetToDefaultObservations,
  computeStatistics,
  exportObservationsCSV,
  addObservation,
} from '@/lib/storage';
import { OpticsGraph } from '@/components/OpticsGraph';

export default function ObservationsPage() {
  const [observations, setObservations] = useState<LabObservation[]>([]);
  const [nominalF] = useState<number>(15);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New row form state
  const [newObjPos, setNewObjPos] = useState<number>(18);
  const [newLensPos, setNewLensPos] = useState<number>(50);
  const [newScreenPos, setNewScreenPos] = useState<number>(78);

  useEffect(() => {
    setObservations(getSavedObservations());
  }, []);

  const stats = computeStatistics(observations, nominalF);

  const handleDelete = (id: string) => {
    const updated = deleteObservation(id);
    setObservations(updated);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all observations from your notebook?')) {
      clearObservations();
      setObservations([]);
    }
  };

  const handleResetDefaults = () => {
    const defaults = resetToDefaultObservations();
    setObservations(defaults);
  };

  const handleExportCSV = () => {
    const csvContent = exportObservationsCSV(observations);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Optics_Lab_Observations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddManualRow = (e: React.FormEvent) => {
    e.preventDefault();
    const u = Math.max(0.1, newLensPos - newObjPos);
    const v = Math.max(0.1, newScreenPos - newLensPos);
    const fCalc = Number(((u * v) / (u + v)).toFixed(2));
    const m = Number((-v / u).toFixed(2));

    const created = addObservation({
      objectPos: newObjPos,
      lensPos: newLensPos,
      screenPos: newScreenPos,
      u: Number(u.toFixed(2)),
      v: Number(v.toFixed(2)),
      fCalculated: fCalc,
      ho: 5,
      hi: Number((5 * m).toFixed(2)),
      magnification: m,
      imageNature: v > 0 ? 'Real, Inverted' : 'Virtual, Erect',
      isFocused: true,
      notes: 'Manually logged observation',
    });

    setObservations((prev) => [...prev, created]);
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B] text-xs font-semibold shadow-xs">
            <TableProperties className="w-3.5 h-3.5 text-[#17231B]" />
            <span>Practical Notebook & Error Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-[#17231B] tracking-tight font-serif">
            Observation Table & Calculations
          </h1>
          <p className="text-sm text-[#647067] max-w-2xl leading-relaxed">
            Verify the thin lens formula through experimental data points, statistical variance analysis, and reciprocal linear regression.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#17231B]" />
            <span>Add Manual Entry</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] border border-[#E2E8DF] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#17231B]" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/report"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#17231B] hover:bg-[#25392c] text-[#FFFFFF] flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-4 h-4 text-[#B8D96B]" />
            <span>Generate Lab Report</span>
          </Link>
        </div>
      </div>

      {/* Statistical Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#647067] tracking-wider">
            Nominal Lens Focal Length
          </span>
          <div className="text-2xl font-mono font-bold text-[#17231B]">
            f₀ = {nominalF.toFixed(1)} cm
          </div>
          <span className="text-xs text-[#647067]">Benchmark laboratory specification</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#647067] tracking-wider">
            Mean Experimental Focal Length
          </span>
          <div className="text-2xl font-mono font-bold text-[#17231B]">
            f̄ = {stats.meanF.toFixed(2)} cm
          </div>
          <span className="text-xs text-[#647067]">Calculated over {stats.count} readings</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#647067] tracking-wider">
            Standard Deviation (σ)
          </span>
          <div className="text-2xl font-mono font-bold text-[#17231B]">
            ±{stats.stdDev.toFixed(2)} cm
          </div>
          <span className="text-xs text-[#647067]">Experimental scatter & precision</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#647067] tracking-wider">
            Percentage Error
          </span>
          <div className="text-2xl font-mono font-bold text-[#17231B]">
            {stats.percentError.toFixed(2)}%
          </div>
          <span className="text-xs text-[#647067]">
            {stats.percentError < 3 ? 'Within acceptable lab limit (< 3%)' : 'Slight experimental error'}
          </span>
        </div>
      </div>

      {/* Observation Table */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E8DF]">
          <h3 className="text-sm font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
            <span>Recorded Practical Observations</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#B8D96B]/30 text-[#17231B] font-mono font-bold">
              {observations.length} rows
            </span>
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleResetDefaults}
              className="px-2.5 py-1 text-[#647067] hover:text-[#17231B] rounded-lg hover:bg-[#F4F7F2] transition-colors cursor-pointer"
            >
              Load Sample Data
            </button>
            <span className="text-[#E2E8DF]">|</span>
            <button
              onClick={handleClear}
              className="px-2.5 py-1 text-rose-600 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Clear Table
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8DF] text-[#647067] bg-[#F4F7F2]">
                <th className="py-3 px-3 font-semibold">S.No</th>
                <th className="py-3 px-3 font-semibold">xₒ (cm)</th>
                <th className="py-3 px-3 font-semibold">xₗ (cm)</th>
                <th className="py-3 px-3 font-semibold">xₛ (cm)</th>
                <th className="py-3 px-3 font-semibold text-[#17231B]">u (cm)</th>
                <th className="py-3 px-3 font-semibold text-[#17231B]">v (cm)</th>
                <th className="py-3 px-3 font-semibold text-[#647067] font-mono">1/u (cm⁻¹)</th>
                <th className="py-3 px-3 font-semibold text-[#647067] font-mono">1/v (cm⁻¹)</th>
                <th className="py-3 px-3 font-semibold text-[#17231B] font-bold">f = uv/(u+v)</th>
                <th className="py-3 px-3 font-semibold">m</th>
                <th className="py-3 px-3 font-semibold">Nature</th>
                <th className="py-3 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8DF] font-mono">
              {observations.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-[#647067] font-sans">
                    No observations recorded yet. Go to the{' '}
                    <Link href="/lab" className="text-[#17231B] underline font-bold">
                      Virtual Lab
                    </Link>{' '}
                    to record live bench data, or click &quot;Load Sample Data&quot;.
                  </td>
                </tr>
              ) : (
                observations.map((obs) => (
                  <tr key={obs.id} className="hover:bg-[#F4F7F2] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#17231B] font-sans">{obs.serialNumber}</td>
                    <td className="py-3 px-3 text-[#17231B]">{obs.objectPos.toFixed(1)}</td>
                    <td className="py-3 px-3 text-[#17231B]">{obs.lensPos.toFixed(1)}</td>
                    <td className="py-3 px-3 text-[#17231B]">{obs.screenPos.toFixed(1)}</td>
                    <td className="py-3 px-3 font-bold text-[#17231B]">{obs.u.toFixed(1)}</td>
                    <td className="py-3 px-3 font-bold text-[#17231B]">{obs.v.toFixed(1)}</td>
                    <td className="py-3 px-3 text-[#647067]">{(1 / obs.u).toFixed(4)}</td>
                    <td className="py-3 px-3 text-[#647067]">{(1 / obs.v).toFixed(4)}</td>
                    <td className="py-3 px-3 font-bold text-[#17231B] text-sm">
                      {obs.fCalculated.toFixed(2)} cm
                    </td>
                    <td className="py-3 px-3 text-[#647067]">{obs.magnification.toFixed(2)}</td>
                    <td className="py-3 px-3 font-sans text-[11px] text-[#647067]">
                      {obs.imageNature.split('—')[0]}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDelete(obs.id)}
                        className="p-1 text-[#647067] hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete reading"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integrated Optics Graphs */}
      <OpticsGraph observations={observations} focalLength={nominalF} />

      {/* Add Manual Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8DF] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#17231B] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#17231B]" />
              <span>Add Custom Bench Reading</span>
            </h3>

            <form onSubmit={handleAddManualRow} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#17231B] font-medium">Object Position xₒ (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newObjPos}
                  onChange={(e) => setNewObjPos(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] text-[#17231B] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#17231B] font-medium">Lens Position xₗ (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newLensPos}
                  onChange={(e) => setNewLensPos(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] text-[#17231B] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#17231B] font-medium">Screen Position xₛ (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newScreenPos}
                  onChange={(e) => setNewScreenPos(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] text-[#17231B] font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] text-[11px] font-mono space-y-1 text-[#647067]">
                <p>Calculated u = {(newLensPos - newObjPos).toFixed(1)} cm</p>
                <p>Calculated v = {(newScreenPos - newLensPos).toFixed(1)} cm</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#647067]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] font-bold"
                >
                  Add Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
