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
    <div className="flex-1 flex flex-col bg-[#070b14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
            <TableProperties className="w-3.5 h-3.5 text-cyan-400" />
            <span>Practical Notebook & Error Analysis</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Observation Table & Calculations
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Verify the thin lens formula through experimental data points, statistical variance analysis, and reciprocal linear regression.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Entry</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/report"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center gap-1.5 shadow-md"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Lab Report</span>
          </Link>
        </div>
      </div>

      {/* Statistical Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#090e1a] border border-cyan-900/40 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Nominal Lens Focal Length
          </span>
          <div className="text-2xl font-mono font-bold text-cyan-400">
            f₀ = {nominalF.toFixed(1)} cm
          </div>
          <span className="text-xs text-slate-500">Benchmark laboratory specification</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090e1a] border border-emerald-900/40 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Mean Experimental Focal Length
          </span>
          <div className="text-2xl font-mono font-bold text-emerald-400">
            f̄ = {stats.meanF.toFixed(2)} cm
          </div>
          <span className="text-xs text-slate-500">Calculated over {stats.count} readings</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Standard Deviation (σ)
          </span>
          <div className="text-2xl font-mono font-bold text-amber-300">
            ±{stats.stdDev.toFixed(2)} cm
          </div>
          <span className="text-xs text-slate-500">Experimental scatter & precision</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Percentage Error
          </span>
          <div
            className={`text-2xl font-mono font-bold ${
              stats.percentError < 3 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {stats.percentError.toFixed(2)}%
          </div>
          <span className="text-xs text-slate-500">
            {stats.percentError < 3 ? 'Within acceptable lab limit (< 3%)' : 'Slight experimental error'}
          </span>
        </div>
      </div>

      {/* Observation Table */}
      <div className="p-5 rounded-2xl bg-[#090e1a] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Recorded Practical Observations</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
              {observations.length} rows
            </span>
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleResetDefaults}
              className="px-2.5 py-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Load Sample Data
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={handleClear}
              className="px-2.5 py-1 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/40 transition-colors"
            >
              Clear Table
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-[#0f172a]/60">
                <th className="py-3 px-3 font-semibold">S.No</th>
                <th className="py-3 px-3 font-semibold">xₒ (cm)</th>
                <th className="py-3 px-3 font-semibold">xₗ (cm)</th>
                <th className="py-3 px-3 font-semibold">xₛ (cm)</th>
                <th className="py-3 px-3 font-semibold text-amber-300">u (cm)</th>
                <th className="py-3 px-3 font-semibold text-emerald-300">v (cm)</th>
                <th className="py-3 px-3 font-semibold text-slate-400 font-mono">1/u (cm⁻¹)</th>
                <th className="py-3 px-3 font-semibold text-slate-400 font-mono">1/v (cm⁻¹)</th>
                <th className="py-3 px-3 font-semibold text-cyan-300 font-bold">f = uv/(u+v)</th>
                <th className="py-3 px-3 font-semibold">m</th>
                <th className="py-3 px-3 font-semibold">Nature</th>
                <th className="py-3 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {observations.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500 font-sans">
                    No observations recorded yet. Go to the{' '}
                    <Link href="/lab" className="text-cyan-400 underline font-bold">
                      Virtual Lab
                    </Link>{' '}
                    to record live bench data, or click &quot;Load Sample Data&quot;.
                  </td>
                </tr>
              ) : (
                observations.map((obs) => (
                  <tr key={obs.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-400 font-sans">{obs.serialNumber}</td>
                    <td className="py-3 px-3 text-slate-300">{obs.objectPos.toFixed(1)}</td>
                    <td className="py-3 px-3 text-slate-300">{obs.lensPos.toFixed(1)}</td>
                    <td className="py-3 px-3 text-slate-300">{obs.screenPos.toFixed(1)}</td>
                    <td className="py-3 px-3 font-bold text-amber-300">{obs.u.toFixed(1)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-300">{obs.v.toFixed(1)}</td>
                    <td className="py-3 px-3 text-slate-400">{(1 / obs.u).toFixed(4)}</td>
                    <td className="py-3 px-3 text-slate-400">{(1 / obs.v).toFixed(4)}</td>
                    <td className="py-3 px-3 font-bold text-cyan-300 text-sm">
                      {obs.fCalculated.toFixed(2)} cm
                    </td>
                    <td className="py-3 px-3 text-purple-300">{obs.magnification.toFixed(2)}</td>
                    <td className="py-3 px-3 font-sans text-[11px] text-slate-300">
                      {obs.imageNature.split('—')[0]}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDelete(obs.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0f1d] border border-cyan-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add Custom Bench Reading</span>
            </h3>

            <form onSubmit={handleAddManualRow} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Object Position xₒ (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newObjPos}
                  onChange={(e) => setNewObjPos(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Lens Position xₗ (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newLensPos}
                  onChange={(e) => setNewLensPos(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Screen Position xₛ (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newScreenPos}
                  onChange={(e) => setNewScreenPos(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
                <p>Calculated u = {(newLensPos - newObjPos).toFixed(1)} cm</p>
                <p>Calculated v = {(newScreenPos - newLensPos).toFixed(1)} cm</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
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
