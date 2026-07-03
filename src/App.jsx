// src/App.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ROUNDS, FINAL } from './data';
import { initialWinners, teamsFor, clearDownstream, frontierRoundIndex } from './bracketLogic';
import Flag from './Flag';
import './App.css';

export default function App() {
  const [winners, setWinners] = useState(initialWinners);

  const scrollRef = useRef(null);
  const trackRef = useRef(null);
  const nodeRefs = useRef({}); // matchId -> element
  const championRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const champion = winners[FINAL.id] || null;

  const pickWinner = useCallback((matchId, team) => {
    setWinners((prev) => {
      if (prev[matchId] && prev[matchId].name === team.name) return prev;
      const cleared = clearDownstream(matchId, prev);
      return { ...cleared, [matchId]: team };
    });
  }, []);

  const resetAll = () => setWinners(initialWinners());

  const setNodeRef = (id) => (el) => {
    if (el) nodeRefs.current[id] = el;
  };

  // ---- Recalcular líneas conectoras ----
  const recomputeLines = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const trackBox = track.getBoundingClientRect();
    setSvgSize({ w: track.scrollWidth, h: track.scrollHeight });

    const newLines = [];

    for (let i = 0; i < ROUNDS.length - 1; i++) {
      const nextRound = ROUNDS[i + 1];
      nextRound.matches.forEach((m) => {
        if (!m.from) return;
        m.from.forEach((sourceId) => {
          const sourceEl = nodeRefs.current[sourceId];
          const targetEl = nodeRefs.current[m.id];
          if (!sourceEl || !targetEl) return;
          const sBox = sourceEl.getBoundingClientRect();
          const tBox = targetEl.getBoundingClientRect();
          const x1 = sBox.right - trackBox.left + track.scrollLeft;
          const y1 = sBox.top + sBox.height / 2 - trackBox.top + track.scrollTop;
          const x2 = tBox.left - trackBox.left + track.scrollLeft;
          const y2 = tBox.top + tBox.height / 2 - trackBox.top + track.scrollTop;
          const active = !!winners[sourceId];
          newLines.push({ key: `${sourceId}-${m.id}`, x1, y1, x2, y2, active });
        });
      });
    }

    // Final -> Campeón
    const finalEl = nodeRefs.current[FINAL.id];
    const champEl = championRef.current;
    if (finalEl && champEl) {
      const sBox = finalEl.getBoundingClientRect();
      const tBox = champEl.getBoundingClientRect();
      const x1 = sBox.right - trackBox.left + track.scrollLeft;
      const y1 = sBox.top + sBox.height / 2 - trackBox.top + track.scrollTop;
      const x2 = tBox.left - trackBox.left + track.scrollLeft;
      const y2 = tBox.top + tBox.height / 2 - trackBox.top + track.scrollTop;
      newLines.push({ key: `${FINAL.id}-champion`, x1, y1, x2, y2, active: !!champion });
    }

    setLines(newLines);
  }, [winners, champion]);

  useLayoutEffect(() => {
    recomputeLines();
  }, [recomputeLines]);

  useEffect(() => {
    const onResize = () => recomputeLines();
    window.addEventListener('resize', onResize);
    const track = trackRef.current;
    const ro = new ResizeObserver(onResize);
    if (track) ro.observe(track);
    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, [recomputeLines]);

  // ---- Desplazamiento automático hacia la ronda activa ----
  // OJO: el elemento con overflow-x es scrollRef (.track-scroll); trackRef
  // (.track-inner) es solo el contenido medido, no scrollea por sí mismo.
  const frontier = useMemo(() => frontierRoundIndex(ROUNDS, winners), [winners]);

  const scrollToRoundIndex = useCallback((index) => {
    const scrollEl = scrollRef.current;
    const track = trackRef.current;
    if (!scrollEl || !track) return;
    const roundEl = track.querySelectorAll('.round-col')[index];
    if (!roundEl) return;
    const scrollBox = scrollEl.getBoundingClientRect();
    const roundBox = roundEl.getBoundingClientRect();
    const delta = roundBox.left - scrollBox.left;
    const targetLeft = scrollEl.scrollLeft + delta - 24;
    scrollEl.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // pequeño delay para no pelear con el gesto táctil que acaba de disparar el cambio
    const t = setTimeout(() => scrollToRoundIndex(frontier), 120);
    return () => clearTimeout(t);
  }, [frontier, scrollToRoundIndex]);

  const scrollByRound = (dir) => {
    const scrollEl = scrollRef.current;
    const track = trackRef.current;
    if (!scrollEl || !track) return;
    const col = track.querySelector('.round-col');
    const gapStr = getComputedStyle(track).columnGap || getComputedStyle(track).gap || '56';
    const gap = parseFloat(gapStr) || 56;
    const step = col ? col.offsetWidth + gap : 320;
    scrollEl.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  // ---- Estado de scroll: para flechas visibles/deshabilitadas y puntos activos ----
  const [scrollInfo, setScrollInfo] = useState({ canLeft: false, canRight: true });
  const [activeDot, setActiveDot] = useState(0);

  const updateScrollInfo = useCallback(() => {
    const scrollEl = scrollRef.current;
    const track = trackRef.current;
    if (!scrollEl) return;
    const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
    setScrollInfo({
      canLeft: scrollEl.scrollLeft > 8,
      canRight: scrollEl.scrollLeft < maxScroll - 8,
    });
    if (track) {
      const cols = Array.from(track.querySelectorAll('.round-col'));
      const scrollBox = scrollEl.getBoundingClientRect();
      let closest = 0;
      let closestDist = Infinity;
      cols.forEach((col, i) => {
        const dist = Math.abs(col.getBoundingClientRect().left - scrollBox.left - 24);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      setActiveDot(closest);
    }
  }, []);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        updateScrollInfo();
        raf = null;
      });
    };
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    updateScrollInfo();
    return () => {
      scrollEl.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [updateScrollInfo]);

  useEffect(() => {
    updateScrollInfo();
  }, [lines, updateScrollInfo]);

  // Rueda del mouse: convierte el scroll vertical en horizontal sobre el cuadro
  const onWheel = useCallback((e) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
      const atLeftEdge = scrollEl.scrollLeft <= 0 && e.deltaY < 0;
      const atRightEdge = scrollEl.scrollLeft >= maxScroll && e.deltaY > 0;
      if (!atLeftEdge && !atRightEdge) {
        e.preventDefault();
        scrollEl.scrollLeft += e.deltaY;
      }
    }
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <div className="eyebrow">Copa Mundial · 2026</div>
        <h1>Cuadro de eliminación directa</h1>
        <p className="sub">
          Tocá un equipo para definirlo como ganador. Usá las flechas, la rueda del mouse
          o arrastrá para recorrer el cuadro de rondas.
        </p>
        <button className="reset-btn" onClick={resetAll}>
          Reiniciar cuadro
        </button>
      </header>

      <div className="round-dots">
        {ROUNDS.concat([{ key: 'campeon', title: 'Campeón' }]).map((round, i) => (
          <button
            key={round.key}
            className={`dot ${i === activeDot ? 'is-active' : ''}`}
            onClick={() => scrollToRoundIndex(i)}
            aria-label={`Ir a ${round.title}`}
            title={round.title}
          />
        ))}
      </div>

      <div className="track-wrap">
        <button
          className={`nav-arrow nav-arrow-left ${scrollInfo.canLeft ? '' : 'is-hidden'}`}
          aria-label="Desplazar hacia rondas anteriores"
          onClick={() => scrollByRound(-1)}
        >
          ‹
        </button>
        <button
          className={`nav-arrow nav-arrow-right ${scrollInfo.canRight ? '' : 'is-hidden'}`}
          aria-label="Desplazar hacia rondas siguientes"
          onClick={() => scrollByRound(1)}
        >
          ›
        </button>

        <div className="track-scroll" ref={scrollRef} onWheel={onWheel}>
          <div className="track-inner" ref={trackRef}>
          <svg
            className="connectors"
            width={svgSize.w}
            height={svgSize.h}
            style={{ width: svgSize.w, height: svgSize.h }}
          >
            {lines.map((l) => {
              const dx = Math.max(28, (l.x2 - l.x1) / 2);
              const path = `M ${l.x1} ${l.y1} C ${l.x1 + dx} ${l.y1}, ${l.x2 - dx} ${l.y2}, ${l.x2} ${l.y2}`;
              return (
                <path
                  key={l.key}
                  d={path}
                  className={l.active ? 'line line-active' : 'line'}
                  fill="none"
                />
              );
            })}
          </svg>

          {ROUNDS.map((round, ri) => (
            <div className={`round-col ${ri === frontier ? 'is-frontier' : ''}`} key={round.key}>
              <div className="round-title">{round.title}</div>
              <div className="round-slots">
                {round.matches.map((m) => (
                  <MatchNode
                    key={m.id}
                    match={m}
                    teams={teamsFor(m, winners)}
                    winner={winners[m.id]}
                    onPick={(team) => pickWinner(m.id, team)}
                    setRef={setNodeRef(m.id)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="round-col champion-col">
            <div className="round-title">Campeón</div>
            <div className="round-slots" style={{ justifyContent: 'center' }}>
              <div className="champion-node" ref={championRef}>
                <span className="cup">🏆</span>
                {champion ? (
                  <div className="champion-name">
                    <Flag code={champion.code} name={champion.name} />
                    <span>{champion.name}</span>
                  </div>
                ) : (
                  <div className="champion-name empty">Por definir</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <footer className="page-footer">Cuadro ilustrativo · elegí ganadores para avanzar</footer>
    </div>
  );
}

function MatchNode({ match, teams, winner, onPick, setRef }) {
  const locked = !!match.locked;
  return (
    <div className={`node ${locked ? 'node-locked' : ''}`} ref={setRef}>
      <div className="node-date">
        <span>{match.date}</span>
        {match.status && <span className="node-status">{match.status}</span>}
      </div>
      {teams.map((team, idx) => (
        <TeamRow
          key={idx}
          team={team}
          isWinner={winner && team && winner.name === team.name}
          isLoser={winner && team && winner.name !== team.name}
          locked={locked}
          onPick={onPick}
        />
      ))}
      <span className="port port-in" />
      <span className="port port-out" />
    </div>
  );
}

function TeamRow({ team, isWinner, isLoser, locked, onPick }) {
  if (!team) {
    return (
      <div className="team tbd">
        <span className="flag-placeholder">🛡️</span>
        <span className="name">A definir</span>
      </div>
    );
  }
  const cls = ['team', locked ? 'locked' : '', isWinner ? 'is-winner' : '', isLoser ? 'is-loser' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div
      className={cls}
      onClick={() => !locked && onPick(team)}
      role={locked ? undefined : 'button'}
      tabIndex={locked ? -1 : 0}
    >
      <Flag code={team.code} name={team.name} />
      <span className="name">{team.name}</span>
      {typeof team.score === 'number' && <span className="score">{team.score}</span>}
      <span className="check">✓</span>
    </div>
  );
}
