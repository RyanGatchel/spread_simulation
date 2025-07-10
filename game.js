const gridSize = 100;
const gridWidth = 10;
let people = [];
const gridEl = document.getElementById('grid');
const statsEl = document.getElementById('stats');

function resetGrid() {
  gridEl.innerHTML = '';
  people = [];

  const vaxRate = parseFloat(document.getElementById('scenario').value);

  for (let i = 0; i < gridSize; i++) {
    const r = Math.random();
    let type = 'immune';
    if (r > vaxRate) {
      type = Math.random() < 0.5 ? 'partial' : 'not-immune';
    }

    people.push({ id: i, type, status: 'healthy' });

    const div = document.createElement('div');
    div.className = 'dot ' + getClass(type);
    div.dataset.id = i;
    gridEl.appendChild(div);
  }

  // Infect one random person
  const candidates = people.filter(p => p.status === 'healthy');
  const first = candidates[Math.floor(Math.random() * candidates.length)];
  first.status = 'infected';
  updateDot(first.id, 'infected', true);

  updateStats();
}

function getClass(type, status) {
  if (status === 'dead') return 'dead';
  if (status === 'hospitalized') return 'hospitalized';
  if (status === 'infected') return 'infected';
  if (type === 'not-immune') return 'not-immune';
  if (type === 'partial') return 'partial';
  return 'immune';
}

function updateDot(id, status, flash = false) {
  const dot = gridEl.children[id];
  dot.className = 'dot ' + getClass(people[id].type, status);
  if (flash) {
    dot.classList.add('flash');
    setTimeout(() => dot.classList.remove('flash'), 400);
  }
}

function nextStep() {
  const newInfected = [];

  people.forEach((p, i) => {
    if (p.status === 'infected') {
      getNeighbors(i).forEach(n => {
        const neighbor = people[n];
        if (neighbor.status === 'healthy') {
          let chance = 0;
          if (neighbor.type === 'not-immune') chance = 0.9;
          else if (neighbor.type === 'partial') chance = 0.07;
          else if (neighbor.type === 'immune') chance = 0.03;

          if (Math.random() < chance) {
            neighbor.status = 'infected';
            newInfected.push(n);
          }
        }
      });

      // Add death or hospitalization after infection
      const roll = Math.random();
      if (roll < 0.01) p.status = 'dead';
      else if (roll < 0.1) p.status = 'hospitalized';
    }
  });

  newInfected.forEach(i => updateDot(i, 'infected', true));
  people.forEach((p, i) => {
    if (p.status === 'dead') updateDot(i, 'dead');
    else if (p.status === 'hospitalized') updateDot(i, 'hospitalized');
  });

  updateStats();
}

function getNeighbors(i) {
  const neighbors = [];
  const top = i - gridWidth;
  const bottom = i + gridWidth;
  const left = i % gridWidth !== 0 ? i - 1 : null;
  const right = i % gridWidth !== gridWidth - 1 ? i + 1 : null;

  if (top >= 0) neighbors.push(top);
  if (bottom < gridSize) neighbors.push(bottom);
  if (left !== null) neighbors.push(left);
  if (right !== null) neighbors.push(right);

  return neighbors;
}

function updateStats() {
  let infected = 0, immune = 0, partial = 0, notImmune = 0;
  let hospitalized = 0, dead = 0;

  for (const p of people) {
    if (p.status === 'infected') infected++;
    if (p.status === 'hospitalized') hospitalized++;
    if (p.status === 'dead') dead++;
    if (p.status === 'healthy') {
      if (p.type === 'immune') immune++;
      else if (p.type === 'partial') partial++;
      else notImmune++;
    }
  }

  statsEl.innerText =
    `Infected: ${infected} | Immune: ${immune} | Partial: ${partial} | Not Immune: ${notImmune} | Hospitalized: ${hospitalized} | Dead: ${dead}`;
}

resetGrid();
