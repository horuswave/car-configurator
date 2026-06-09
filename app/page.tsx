"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BODY_COLORS, BodyColor, EnvMode } from "./components/CarModel";

const Scene = dynamic(() => import("./components/Scene"), { ssr: false });

const ENVS: { id: EnvMode; label: string; icon: string }[] = [
  { id: "showroom", label: "No Environment", icon: "" },
  { id: "outdoor", label: "Day Time", icon: "" },
  { id: "night", label: "Night Time", icon: "" },
];

export default function Configurator() {
  const [bodyColor, setBodyColor] = useState<BodyColor>(BODY_COLORS[0]);
  const [headlightsOn, setHeadlightsOn] = useState(false);
  const [envMode, setEnvMode] = useState<EnvMode>("showroom");

  return (
    <div className="configurator-root">
      <header className="hud-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-mark">◈</span>
            <div>
              <div className="brand-name orbitron">AUTOCFG</div>
              <div className="brand-sub">3D CONFIGURATOR</div>
            </div>
          </div>
          <div className="header-center orbitron">
            <span
              className="color-live"
              style={{ background: bodyColor.color }}
            />
            {bodyColor.name.toUpperCase()}
          </div>
          <div className="header-right">
            <span className="tag">Output II</span>
            <span className="tag">Three.js</span>
          </div>
        </div>
      </header>

      <div className="canvas-area">
        <Scene
          bodyColor={bodyColor}
          headlightsOn={headlightsOn}
          envMode={envMode}
        />
        <div className="canvas-hint">
          <span>⊙ drag to orbit</span>
          <span>⊕ scroll to zoom</span>
        </div>
      </div>

      <aside className="panel panel-left">
        <div className="panel-title orbitron">
          <span className="panel-icon">◐</span>
          BODY COLOR
        </div>
        <div className="color-grid">
          {BODY_COLORS.map((c) => (
            <button
              key={c.name}
              className={`color-swatch ${bodyColor.name === c.name ? "active" : ""}`}
              onClick={() => setBodyColor(c)}
              title={c.name}
            >
              <span className="swatch-dot" style={{ background: c.color }} />
              <span className="swatch-label">{c.name}</span>
              <div className="swatch-props">
                <span>M {Math.round(c.metalness * 100)}%</span>
                <span>R {Math.round(c.roughness * 100)}%</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <aside className="panel panel-right">
        <div className="panel-title orbitron">
          <span className="panel-icon">◈</span>
          CONTROLS
        </div>

        <div className="section-label orbitron">ENVIRONMENT</div>
        <div className="env-tabs">
          {ENVS.map((e) => (
            <button
              key={e.id}
              className={`env-tab ${envMode === e.id ? "active" : ""}`}
              onClick={() => setEnvMode(e.id)}
            >
              <span className="env-icon">{e.icon}</span>
              <span>{e.label}</span>
            </button>
          ))}
        </div>

        <div className="section-label orbitron">FEATURES</div>
        <div className="toggle-list">
          {[
            {
              label: "Headlights",
              sublabel: "Dynamic shadows",
              value: headlightsOn,
              set: setHeadlightsOn,
              icon: "💡",
            },
          
           
          ].map((item) => (
            <button
              key={item.label}
              className={`toggle-row ${item.value ? "on" : "off"}`}
              onClick={() => item.set(!item.value)}
            >
              <div className="toggle-info">
                <span className="toggle-icon">{item.icon}</span>
                <div>
                  <div className="toggle-label">{item.label}</div>
                  <div className="toggle-sub">{item.sublabel}</div>
                </div>
              </div>
              <div className="toggle-pill">
                <div className="toggle-knob" />
              </div>
            </button>
          ))}
        </div>

        <div
          className="section-label orbitron"
          style={{ marginTop: "auto", paddingTop: "1rem" }}
        >
          SPECS
        </div>
        <div className="specs-list">
          {[
            ["Engine", "V8 Twin-Turbo"],
            ["Power", "620 hp"],
            ["0–100", "3.2 sec"],
            ["Top Speed", "310 km/h"],
          ].map(([k, v]) => (
            <div key={k} className="spec-row">
              <span className="spec-key">{k}</span>
              <span className="spec-val orbitron">{v}</span>
            </div>
          ))}
        </div>
      </aside>

      <style jsx>{`
        .configurator-root {
          position: fixed;
          inset: 0;
          background: var(--bg);
          display: grid;
          grid-template-rows: 52px 1fr;
          grid-template-columns: 240px 1fr 240px;
          grid-template-areas:
            "header header header"
            "left   canvas right";
        }
        .hud-header {
          grid-area: header;
          background: var(--panel);
          border-bottom: 1px solid var(--panel-border);
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
        }
        .header-inner {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .brand-mark {
          font-size: 1.5rem;
          color: var(--accent);
        }
        .brand-name {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--accent);
        }
        .brand-sub {
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          color: var(--muted);
          font-family: "Rajdhani", sans-serif;
        }
        .header-center {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          color: var(--text);
        }
        .color-live {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: inline-block;
        }
        .header-right {
          display: flex;
          gap: 0.5rem;
        }
        .tag {
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          border: 1px solid var(--panel-border);
          color: var(--muted);
          padding: 0.2rem 0.5rem;
          border-radius: 2px;
        }
        .canvas-area {
          grid-area: canvas;
          position: relative;
          overflow: hidden;
        }
        .canvas-hint {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1.5rem;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          color: var(--muted);
          pointer-events: none;
        }
        .panel {
          background: var(--panel);
          border-color: var(--panel-border);
          padding: 1.25rem 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .panel-left {
          grid-area: left;
          border-right: 1px solid var(--panel-border);
        }
        .panel-right {
          grid-area: right;
          border-left: 1px solid var(--panel-border);
        }
        .panel-title {
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--panel-border);
        }
        .panel-icon {
          font-size: 0.9rem;
        }
        .section-label {
          font-size: 0.55rem;
          letter-spacing: 0.3em;
          color: var(--muted);
          margin-top: 0.25rem;
        }
        .color-grid {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .color-swatch {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: transparent;
          border: 1px solid var(--panel-border);
          border-radius: 4px;
          padding: 0.5rem 0.65rem;
          cursor: pointer;
          transition:
            border-color 0.2s,
            background 0.2s;
          text-align: left;
          width: 100%;
        }
        .color-swatch:hover {
          border-color: var(--accent);
          background: rgba(0, 212, 255, 0.04);
        }
        .color-swatch.active {
          border-color: var(--accent);
          background: rgba(0, 212, 255, 0.08);
        }
        .swatch-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          flex-shrink: 0;
        }
        .swatch-label {
          font-size: 0.8rem;
          color: var(--text);
          flex: 1;
        }
        .swatch-props {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 0.55rem;
          color: var(--muted);
          letter-spacing: 0.05em;
          gap: 1px;
        }
        .env-tabs {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .env-tab {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: transparent;
          border: 1px solid var(--panel-border);
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          color: var(--muted);
          font-family: "Rajdhani", sans-serif;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .env-tab:hover {
          border-color: var(--accent);
          color: var(--text);
        }
        .env-tab.active {
          border-color: var(--accent);
          background: rgba(0, 212, 255, 0.08);
          color: var(--accent);
        }
        .env-icon {
          font-size: 1rem;
        }
        .toggle-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          border: 1px solid var(--panel-border);
          border-radius: 4px;
          padding: 0.55rem 0.75rem;
          cursor: pointer;
          transition:
            border-color 0.2s,
            background 0.2s;
          width: 100%;
        }
        .toggle-row:hover {
          border-color: var(--accent);
        }
        .toggle-row.on {
          border-color: var(--accent);
          background: rgba(0, 212, 255, 0.06);
        }
        .toggle-info {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-align: left;
        }
        .toggle-icon {
          font-size: 1rem;
          width: 1.2rem;
          text-align: center;
        }
        .toggle-label {
          font-size: 0.82rem;
          color: var(--text);
        }
        .toggle-sub {
          font-size: 0.6rem;
          color: var(--muted);
        }
        .toggle-pill {
          width: 32px;
          height: 16px;
          border-radius: 8px;
          border: 1px solid var(--muted);
          background: transparent;
          position: relative;
          transition:
            background 0.2s,
            border-color 0.2s;
          flex-shrink: 0;
        }
        .toggle-row.on .toggle-pill {
          background: var(--accent);
          border-color: var(--accent);
        }
        .toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--muted);
          transition:
            transform 0.2s,
            background 0.2s;
        }
        .toggle-row.on .toggle-knob {
          transform: translateX(16px);
          background: var(--bg);
        }
        .specs-list {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .spec-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.3rem 0;
          border-bottom: 1px solid var(--panel-border);
          font-size: 0.75rem;
        }
        .spec-key {
          color: var(--muted);
        }
        .spec-val {
          color: var(--accent);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
        }
      `}</style>
    </div>
  );
}
