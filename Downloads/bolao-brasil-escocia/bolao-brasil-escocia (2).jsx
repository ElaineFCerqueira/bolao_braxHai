import { useState, useEffect, useCallback } from "react";

const ADMIN_PASSWORD = "elaine2024";
const MATCH_DATE = new Date("2026-06-24T22:00:00Z");
const PIX_KEY = "71 992790879";
const PIX_NAME = "Elaine Cerqueira";
const BET_VALUE = 10;
const MAX_SAME_SCORE = 2;

const C = {
  green: "#009C3B",
  greenDark: "#007a2e",
  greenLight: "#e8f5e9",
  yellow: "#FFD700",
  yellowDark: "#c8a600",
  yellowLight: "#fffde7",
  yellowMid: "#fff59d",
  white: "#FFFFFF",
  light: "#f9fbe7",
  border: "#c8e6c9",
  borderYellow: "#ffe082",
  text: "#1a2e1a",
  muted: "#5a7a5a",
  danger: "#c62828",
  success: "#2e7d32",
  warning: "#f57f17",
};

async function storageGet(key) {
  try { const r = await window.storage.get(key, true); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function storageSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), true); } catch {}
}

function Countdown() {
  const [tl, setTl] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [exp, setExp] = useState(false);
  useEffect(() => {
    function calc() {
      const diff = MATCH_DATE - new Date();
      if (diff <= 0) { setExp(true); return; }
      setTl({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    }
    calc(); const t = setInterval(calc, 1000); return () => clearInterval(t);
  }, []);
  if (exp) return <div style={{ background: C.danger, color: "#fff", borderRadius: 12, padding: "12px 20px", textAlign: "center", fontWeight: 600, fontSize: 14 }}>⏰ Palpites encerrados! O jogo já começou.</div>;
  const box = (v, l) => (
    <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "8px 12px", minWidth: 52, textAlign: "center" }}>
      <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{String(v).padStart(2, "0")}</div>
      <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>{l}</div>
    </div>
  );
  return (
    <div style={{ background: `linear-gradient(135deg,${C.green},${C.greenDark})`, color: "#fff", borderRadius: 14, padding: "14px 16px", textAlign: "center", border: `3px solid ${C.yellow}` }}>
      <div style={{ fontSize: 11, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase", color: C.yellow, fontWeight: 700 }}>⏳ Palpites encerram em</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {box(tl.d, "dias")}{box(tl.h, "horas")}{box(tl.m, "min")}{box(tl.s, "seg")}
      </div>
      <div style={{ fontSize: 11, opacity: 0.8, marginTop: 8 }}>24/06/2026 às 19h — Brasília</div>
    </div>
  );
}

function PaymentModal({ bet, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "24px 20px", maxWidth: 360, width: "100%", textAlign: "center", border: `3px solid ${C.yellow}` }}>
        <div style={{ fontSize: 38, marginBottom: 6 }}>💸</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px", color: C.text }}>Faça o PIX para confirmar!</h2>
        <p style={{ color: C.muted, fontSize: 13, margin: "0 0 16px" }}>Após o pagamento, envie o comprovante.</p>
        <div style={{ background: C.greenLight, borderRadius: 12, padding: "14px", marginBottom: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: C.green, marginBottom: 4 }}>R$ 10,00</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Chave PIX:</div>
          <div style={{ background: "#fff", border: `2px dashed ${C.green}`, borderRadius: 10, padding: "8px 12px", fontSize: 17, fontWeight: 700, letterSpacing: 1 }}>{PIX_KEY}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Para: {PIX_NAME}</div>
        </div>
        <div style={{ background: C.yellowLight, border: `1px solid ${C.borderYellow}`, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#6d4c00", marginBottom: 16, textAlign: "left" }}>
          📲 Envie o comprovante para confirmar seu palpite.
        </div>
        <div style={{ background: C.greenLight, borderRadius: 10, padding: "10px 12px", fontSize: 13, marginBottom: 16, textAlign: "left", border: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: C.text }}>Seu palpite:</div>
          <div>🇧🇷 Brasil {bet.brazilGoals} × {bet.scotlandGoals} Escócia 🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
          <div style={{ color: C.muted, marginTop: 2 }}>👤 {bet.name}</div>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: 13, borderRadius: 12, background: `linear-gradient(135deg,${C.green},${C.greenDark})`, color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          Entendido, vou pagar! ✅
        </button>
      </div>
    </div>
  );
}

function BetCard({ bet, onConfirm, isAdmin }) {
  const s = bet.status === "confirmed" ? { color: C.success, label: "Confirmado", icon: "🟢" } : { color: C.warning, label: "Aguardando PIX", icon: "🟡" };
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderLeft: `4px solid ${bet.status === "confirmed" ? C.green : C.yellow}`, borderRadius: 12, padding: "11px 13px", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{bet.name}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 1 }}>
          🇧🇷 Brasil <strong style={{ color: C.green }}>{bet.brazilGoals}</strong> × <strong style={{ color: C.greenDark }}>{bet.scotlandGoals}</strong> Escócia 🏴󠁧󠁢󠁳󠁣󠁴󠁿
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.icon} {s.label}</span>
        {isAdmin && bet.status === "pending" && (
          <button onClick={() => onConfirm(bet.id)} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, border: `1px solid ${C.success}`, background: "transparent", color: C.success, cursor: "pointer", fontWeight: 600 }}>Confirmar ✓</button>
        )}
      </div>
    </div>
  );
}

function GoalInput({ value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
      <button onClick={() => onChange(Math.max(0, value - 1))} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, background: C.greenLight, fontSize: 18, cursor: "pointer", fontWeight: 700, color: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
      <div style={{ width: 42, height: 34, borderRadius: 8, border: `2px solid ${C.yellow}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: C.text }}>{value}</div>
      <button onClick={() => onChange(Math.min(20, value + 1))} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, background: C.greenLight, fontSize: 18, cursor: "pointer", fontWeight: 700, color: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
    </div>
  );
}

export default function Bolao() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [brazilGoals, setBrazilGoals] = useState(0);
  const [scotlandGoals, setScotlandGoals] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminIn, setAdminIn] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const [closed, setClosed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    storageGet("bolao-bets-v2").then(d => { setBets(d || []); setLoading(false); });
    setClosed(new Date() >= MATCH_DATE);
  }, []);

  async function save(nb) { setBets(nb); await storageSet("bolao-bets-v2", nb); }

  async function handleSubmit() {
    setError("");
    if (!name.trim()) { setError("Por favor, informe seu nome completo."); return; }
    if (closed) { setError("Os palpites estão encerrados!"); return; }
    const sk = `${brazilGoals}-${scotlandGoals}`;
    if (bets.find(b => b.name.toLowerCase().trim() === name.toLowerCase().trim())) { setError("Esse nome já foi registrado."); return; }
    if (bets.filter(b => `${b.brazilGoals}-${b.scotlandGoals}` === sk).length >= MAX_SAME_SCORE) { setError(`⚠️ O placar ${brazilGoals}×${scotlandGoals} já atingiu o limite! Escolha outro.`); return; }
    setSubmitting(true);
    const cur = (await storageGet("bolao-bets-v2")) || [];
    if (cur.filter(b => `${b.brazilGoals}-${b.scotlandGoals}` === sk).length >= MAX_SAME_SCORE) { setError("⚠️ Alguém acabou de pegar esse placar!"); setBets(cur); setSubmitting(false); return; }
    if (cur.find(b => b.name.toLowerCase().trim() === name.toLowerCase().trim())) { setError("Esse nome já foi registrado."); setBets(cur); setSubmitting(false); return; }
    const nb = { id: Date.now().toString(), name: name.trim(), brazilGoals, scotlandGoals, status: "pending", createdAt: new Date().toISOString() };
    await save([...cur, nb]);
    setPending(nb); setName(""); setBrazilGoals(0); setScotlandGoals(0); setSubmitting(false);
  }

  async function handleConfirm(id) {
    const cur = (await storageGet("bolao-bets-v2")) || bets;
    await save(cur.map(b => b.id === id ? { ...b, status: "confirmed" } : b));
  }

  function handleAdmin() {
    if (adminIn === ADMIN_PASSWORD) { setIsAdmin(true); setAdminErr(""); }
    else setAdminErr("Senha incorreta.");
  }

  const confirmed = bets.filter(b => b.status === "confirmed");
  const total = confirmed.length * BET_VALUE;
  const scoreMap = {};
  bets.forEach(b => { const k = `${b.brazilGoals}-${b.scotlandGoals}`; scoreMap[k] = (scoreMap[k] || 0) + 1; });
  const curCount = scoreMap[`${brazilGoals}-${scotlandGoals}`] || 0;

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg,${C.greenLight},${C.yellowLight},${C.greenLight})` }}>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg,${C.green},${C.greenDark})`, color: "#fff", padding: "22px 20px 16px", textAlign: "center", borderBottom: `5px solid ${C.yellow}` }}>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.yellowMid, fontWeight: 700, marginBottom: 5 }}>⚽ Bolão Oficial ⚽</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 34 }}>🇧🇷</span>
          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "6px 20px", border: `2px solid ${C.yellow}` }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>BRASIL</div>
            <div style={{ fontSize: 11, color: C.yellow, margin: "2px 0", fontWeight: 700 }}>vs</div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>ESCÓCIA</div>
          </div>
          <span style={{ fontSize: 34 }}>🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
        </div>
        <div style={{ background: C.yellow, borderRadius: 20, display: "inline-block", padding: "5px 20px", fontSize: 14, fontWeight: 800, color: C.greenDark }}>💰 Entrada: R$ 10,00</div>
        <div style={{ fontSize: 11, color: C.yellowMid, marginTop: 8, opacity: 0.9 }}>24 de Junho de 2026 • 19h (Brasília)</div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px 14px 40px" }}>

        <div style={{ marginBottom: 16 }}><Countdown /></div>

        {/* STATS */}
        <div style={{ background: "#fff", borderRadius: 14, border: `2px solid ${C.yellow}`, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase" }}>Total Arrecadado</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.green }}>R$ {total.toFixed(2).replace(".", ",")}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{confirmed.length} pag. confirmado{confirmed.length !== 1 ? "s" : ""}</div>
          </div>
          <div style={{ width: 1, height: 50, background: C.border }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase" }}>Participantes</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.greenDark }}>{bets.length}</div>
            <div style={{ fontSize: 11, color: C.muted }}>palpite{bets.length !== 1 ? "s" : ""} registrado{bets.length !== 1 ? "s" : ""}</div>
          </div>
        </div>

        {/* FORM */}
        {!closed && (
          <div style={{ background: "#fff", borderRadius: 16, border: `2px solid ${C.border}`, padding: "18px", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 14px", color: C.text }}>📝 Faça seu palpite</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 5 }}>Nome Completo</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, outline: "none", background: C.greenLight, color: C.text }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8 }}>Placar do Jogo</label>
              <div style={{ background: `linear-gradient(135deg,${C.greenLight},${C.yellowLight})`, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: 22 }}>🇧🇷</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 6 }}>BRASIL</div>
                    <GoalInput value={brazilGoals} onChange={setBrazilGoals} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.yellow, paddingBottom: 16 }}>×</div>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: 22 }}>🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.greenDark, marginBottom: 6 }}>ESCÓCIA</div>
                    <GoalInput value={scotlandGoals} onChange={setScotlandGoals} />
                  </div>
                </div>
                {curCount > 0 && (
                  <div style={{ marginTop: 10, textAlign: "center", fontSize: 12, fontWeight: 600, color: curCount >= 2 ? C.danger : C.warning }}>
                    {curCount >= 2 ? "🚫 Placar lotado! Escolha outro." : `⚠️ 1 pessoa já escolheu esse placar (máx. 2)`}
                  </div>
                )}
              </div>
            </div>
            {error && <div style={{ background: "#fff8e1", border: `1px solid ${C.borderYellow}`, borderRadius: 9, padding: "8px 11px", fontSize: 13, color: "#e65100", marginBottom: 12 }}>{error}</div>}
            <button onClick={handleSubmit} disabled={submitting || curCount >= 2} style={{ width: "100%", padding: "13px", borderRadius: 12, background: curCount >= 2 ? "#bdbdbd" : `linear-gradient(135deg,${C.green},${C.greenDark})`, color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: curCount >= 2 ? "not-allowed" : "pointer", boxShadow: curCount >= 2 ? "none" : `0 3px 0 ${C.greenDark}` }}>
              {submitting ? "Registrando..." : `✅ Confirmar Palpite — R$ ${BET_VALUE},00`}
            </button>
          </div>
        )}

        {closed && (
          <div style={{ background: "#fff", borderRadius: 14, border: `2px solid ${C.border}`, padding: "16px", marginBottom: 16, textAlign: "center", color: C.muted }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>🔒</div>
            <div style={{ fontWeight: 600, color: C.text, marginBottom: 4 }}>Palpites encerrados!</div>
            <div style={{ fontSize: 13 }}>O período de apostas foi encerrado.</div>
          </div>
        )}

        {/* BETS LIST */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text }}>🏆 Palpites Registrados</h2>
            <div style={{ background: C.yellow, color: C.greenDark, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{bets.length}</div>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 20, color: C.muted }}>Carregando...</div>
          ) : bets.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "22px", textAlign: "center", color: C.muted }}>Nenhum palpite ainda. Seja o primeiro! 🎯</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...bets].reverse().map(b => <BetCard key={b.id} bet={b} onConfirm={handleConfirm} isAdmin={isAdmin} />)}
            </div>
          )}
        </div>

        {/* ADMIN */}
        <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
          {!isAdmin ? (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 7 }}>🔐 Área do Administrador</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="password" value={adminIn} onChange={e => setAdminIn(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdmin()} placeholder="Senha admin" style={{ flex: 1, padding: "9px 11px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.greenLight }} />
                <button onClick={handleAdmin} style={{ padding: "9px 14px", borderRadius: 8, background: C.green, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Entrar</button>
              </div>
              {adminErr && <div style={{ color: C.danger, fontSize: 12, marginTop: 5 }}>{adminErr}</div>}
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.success }}>✅ Admin logado</div>
                <button onClick={() => setIsAdmin(false)} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer" }}>Sair</button>
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>Clique em "Confirmar ✓" para validar pagamentos PIX.</div>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 28, fontSize: 12, color: C.muted }}>
          Desenvolvido por <strong>Zuvinha</strong> ⚽
        </div>
      </div>

      {pending && <PaymentModal bet={pending} onClose={() => setPending(null)} />}
    </div>
  );
}
