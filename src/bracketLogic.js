// src/bracketLogic.js
import { ROUNDS } from './data';

function allMatches() {
  return ROUNDS.flatMap((r) => r.matches);
}

export function initialWinners() {
  const w = {};
  allMatches().forEach((m) => {
    if (m.locked && m.winner) {
      w[m.id] = m.teams.find((t) => t.name === m.winner);
    }
  });
  return w;
}

// Devuelve los dos equipos (o null) que le corresponden a un partido.
// Si el partido tiene equipos fijos (sin ronda previa) los devuelve tal cual;
// si depende de otros partidos ('from'), resuelve los ganadores actuales.
export function teamsFor(match, winners) {
  if (!match.from) return match.teams;
  return match.from.map((id) => winners[id] || null);
}

// Limpia en cascada todos los resultados que dependían de matchId,
// sin importar en qué ronda estén.
export function clearDownstream(matchId, winners) {
  const next = { ...winners };
  const all = allMatches();
  const dependents = (id) => all.filter((m) => m.from && m.from.includes(id));

  function cascade(id) {
    dependents(id).forEach((m) => {
      if (next[m.id]) {
        delete next[m.id];
        cascade(m.id);
      }
    });
  }
  cascade(matchId);
  return next;
}

// Índice de la ronda "frontera": la primera ronda (de izq a der) que aún tiene
// partidos sin definir. Se usa para desplazar el foco automáticamente.
export function frontierRoundIndex(rounds, winners) {
  for (let i = 0; i < rounds.length; i++) {
    const allDecided = rounds[i].matches.every((m) => {
      if (m.locked) return true;
      return !!winners[m.id];
    });
    if (!allDecided) return i;
  }
  return rounds.length - 1;
}
