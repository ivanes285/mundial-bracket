// src/data.js
// Cada equipo tiene su código ISO (usado para la bandera vía flagcdn.com)

// Dieciseisavos de final: esta rama del cuadro todavía tiene partidos por
// resolver que alimentan a los octavos (Suiza ya está definida por goleada).
export const DIECISEISAVOS = [
  {
    id: 'd1',
    date: 'Ayer',
    status: 'Fin',
    teams: [
      { name: 'Suiza', code: 'ch', score: 2 },
      { name: 'Argelia', code: 'dz', score: 0 },
    ],
    winner: 'Suiza',
    locked: true,
  },
  {
    id: 'd2',
    date: 'Hoy, 8:30 p.m.',
    teams: [
      { name: 'Colombia', code: 'co' },
      { name: 'Ghana', code: 'gh' },
    ],
  },
  {
    id: 'd3',
    date: 'Hoy, 1:00 p.m.',
    teams: [
      { name: 'Australia', code: 'au' },
      { name: 'Egipto', code: 'eg' },
    ],
  },
  {
    id: 'd4',
    date: 'Hoy, 5:00 p.m.',
    teams: [
      { name: 'Argentina', code: 'ar' },
      { name: 'Cabo Verde', code: 'cv' },
    ],
  },
];

export const OCTAVOS = [
  {
    id: 'o1',
    date: 'Mañana, 12:00 p.m.',
    teams: [
      { name: 'Canadá', code: 'ca' },
      { name: 'Marruecos', code: 'ma' },
    ],
  },
  {
    id: 'o2',
    date: 'Mañana, 4:00 p.m.',
    teams: [
      { name: 'Paraguay', code: 'py' },
      { name: 'Francia', code: 'fr' },
    ],
  },
  {
    id: 'o3',
    date: 'Lun, 6/7, 7:00 p.m.',
    teams: [
      { name: 'Estados Unidos', code: 'us' },
      { name: 'Bélgica', code: 'be' },
    ],
  },
  {
    id: 'o4',
    date: 'Lun, 6/7, 2:00 p.m.',
    teams: [
      { name: 'Portugal', code: 'pt' },
      { name: 'España', code: 'es' },
    ],
  },
  {
    id: 'o5',
    date: 'Dom, 5/7, 3:00 p.m.',
    teams: [
      { name: 'Brasil', code: 'br' },
      { name: 'Noruega', code: 'no' },
    ],
  },
  {
    id: 'o6',
    date: 'Dom, 5/7, 7:00 p.m.',
    teams: [
      { name: 'México', code: 'mx' },
      { name: 'Inglaterra', code: 'gb-eng' },
    ],
  },
  // o7 y o8 ya no tienen equipos fijos: se resuelven desde dieciseisavos
  { id: 'o7', date: 'Mar, 7/7, 3:00 p.m.', from: ['d1', 'd2'] },
  { id: 'o8', date: 'Mar, 7/7, 11:00 a.m.', from: ['d3', 'd4'] },
];

export const CUARTOS = [
  { id: 'c1', date: 'Jue, 9/7, 3:00 p.m.', from: ['o1', 'o2'] },
  { id: 'c2', date: 'Vie, 10/7, 2:00 p.m.', from: ['o3', 'o4'] },
  { id: 'c3', date: 'Sáb, 11/7, 4:00 p.m.', from: ['o5', 'o6'] },
  { id: 'c4', date: 'Sáb, 11/7, 8:00 p.m.', from: ['o7', 'o8'] },
];

export const SEMIS = [
  { id: 's1', date: 'Mar, 14/7, 2:00 p.m.', from: ['c1', 'c2'] },
  { id: 's2', date: 'Mié, 15/7', from: ['c3', 'c4'] },
];

export const FINAL = { id: 'f1', date: 'Domingo, 19/7', from: ['s1', 's2'] };

export const ROUNDS = [
  { key: 'dieciseisavos', title: 'Dieciseisavos de final', matches: DIECISEISAVOS, isRoot: true },
  { key: 'octavos', title: 'Octavos de final', matches: OCTAVOS },
  { key: 'cuartos', title: 'Cuartos de final', matches: CUARTOS },
  { key: 'semis', title: 'Semifinales', matches: SEMIS },
  { key: 'final', title: 'Final', matches: [FINAL] },
];
