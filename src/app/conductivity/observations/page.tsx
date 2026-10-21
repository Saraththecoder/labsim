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
  Zap,
} from 'lucide-react';
import { ConductivityObservation } from '@/lib/conductivityTypes';
import {
  getConductivityObservations,
  deleteConductivityObservation,
  clearConductivityObservations,
  resetConductivityObservations,
  exportConductivityCSV,
  addConductivityObservation,
} from '@/lib/conductivityStorage';
import { ConductivityGraph } from '@/components/ConductivityGraph';
import { SOLUTIONS_DATABASE } from '@/lib/conductivityPhysics';

export default function ConductivityObservationsPage() {
  const [observations, setObservations] = useState<ConductivityObservation[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal form state
  const [solId, setSolId] = useState('nacl');
  const [conc, setConc] = useState(0.05);
  const [lDist, setLDist] = useState(2.0);
  const [area, setArea] = useState(4.0);
  const [volt, setVolt] = useState(6.0);

  useEffect(() => {
    setObservations(getConductivityObservations());
  }, []);

  const handleDelete = (id: string) => {
    const updated = deleteConductivityObservation(id);
    setObservations(updated);
  };

  const handleClear = () => {
    if (confirm('Clear all conductivity observations?')) {
      clearConductivityObservations();
      setObservations([]);
    }
  };

  const handleResetDefaults = () => {
    const d = resetConductivityObservations();
    setObservations(d);
  };

  const handleExportCSV = () => {
    const csv = exportConductivityCSV(observations);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Conductivity_Lab_Observations_${Date.now()}.csv`;
    a.click();
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const sol = SOLUTIONS_DATABASE.find((s) => s.id === solId) || SOLUTIONS_DATABASE[1];
    const cellConstant = lDist / area;
    const kappa = (sol.lambda0 * conc) / 1000;
    const G = kappa / cellConstant;
    const R = G > 0 ? 1 / G : 999999;
    const I = volt / (R + 16);

    const created = addConductivityObservation({
      solutionId: sol.id,
      solutionName: `${sol.name} (${sol.formula})`,
      concentration: conc,
      temperature: 25,
      electrodeDistance: lDist,
      electrodeArea: area,
      cellConstant: Number(cellConstant.toFixed(3)),
      appliedVoltage: volt,
      current_mA: Number((I * 1000).toFixed(1)),
      resistance_ohm: Number(R.toFixed(1)),
      conductance_mS: Number((G * 1000).toFixed(2)),
      specificConductivity_mS_cm: Number((kappa * 1000).toFixed(2)),
      molarConductivity: Number(sol.lambda0.toFixed(1)),
      degreeOfDissociation: sol.type === 'strong' ? 1.0 : 0.05,
      bulbGlow: I > 0.05 ? 'Bright (100%)' : 'Dim',
      notes: 'Manually logged observation',
    });

    setObservations((prev) => [...prev, created]);
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-semibold">
            <TableProperties className="w-3.5 h-3.5 text-amber-400" />
            <span>Practical Notebook & Graphical Extrapolations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Conductivity Observations & Kohlrausch Plots
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Record cell resistance, conductance, and molar conductivity across varying electrolyte concentrations and electrode geometries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Entry</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/conductivity/report"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-md"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Lab Report</span>
          </Link>
        </div>
      </div>

      {/* Observation Table */}
      <div className="p-5 rounded-2xl bg-[#090e1a] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Logged Conductivity Data</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
              {observations.length} rows
            </span>
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <button onClick={handleResetDefaults} className="text-slate-400 hover:text-white px-2 py-1">
              Load Sample Readings
            </button>
            <span className="text-slate-700">|</span>
            <button onClick={handleClear} className="text-rose-400 hover:text-rose-300 px-2 py-1">
              Clear Table
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-[#0f172a]/60">
                <th className="py-3 px-3 font-semibold">S.No</th>
                <th className="py-3 px-3 font-semibold">Solution</th>
                <th className="py-3 px-3 font-semibold">C (M)</th>
                <th className="py-3 px-3 font-semibold">l (cm)</th>
                <th className="py-3 px-3 font-semibold">A (cm²)</th>
                <th className="py-3 px-3 font-semibold">G* (cm⁻¹)</th>
                <th className="py-3 px-3 font-semibold text-amber-300">I (mA)</th>
                <th className="py-3 px-3 font-semibold text-white">R (Ω)</th>
                <th className="py-3 px-3 font-semibold text-cyan-300">κ (mS/cm)</th>
                <th className="py-3 px-3 font-semibold text-purple-300">Λₘ</th>
                <th className="py-3 px-3 font-semibold">Bulb State</th>
                <th className="py-3 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {observations.map((obs) => (
                <tr key={obs.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-400 font-sans">{obs.serialNumber}</td>
                  <td className="py-3 px-3 font-sans font-medium text-slate-200">{obs.solutionName}</td>
                  <td className="py-3 px-3 text-cyan-300">{obs.concentration}</td>
                  <td className="py-3 px-3 text-slate-400">{obs.electrodeDistance}</td>
                  <td className="py-3 px-3 text-slate-400">{obs.electrodeArea}</td>
                  <td className="py-3 px-3 text-slate-300 font-bold">{obs.cellConstant}</td>
                  <td className="py-3 px-3 text-amber-300 font-bold">{obs.current_mA}</td>
                  <td className="py-3 px-3 text-white">{obs.resistance_ohm}</td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">{obs.specificConductivity_mS_cm}</td>
                  <td className="py-3 px-3 text-purple-300 font-bold">{obs.molarConductivity}</td>
                  <td className="py-3 px-3 font-sans text-[11px] text-emerald-300">{obs.bulbGlow}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDelete(obs.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Debye-Hückel-Onsager Graphical Plots */}
      <ConductivityGraph observations={observations} />

      {/* Manual Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0f1d] border border-amber-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Custom Electrolyte Reading</span>
            </h3>

            <form onSubmit={handleAddManual} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Reagent:</label>
                <select
                  value={solId}
                  onChange={(e) => setSolId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium"
                >
                  {SOLUTIONS_DATABASE.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.formula})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Concentration C (M):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={conc}
                    onChange={(e) => setConc(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Voltage (V):</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={volt}
                    onChange={(e) => setVolt(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
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
