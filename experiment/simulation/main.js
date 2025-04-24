

const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);


const tableOverlay = document.getElementById("tableOverlay");
const particlesOverlay = document.getElementById("particlesOverlay");
const trialTable = document.getElementById("trialTable");
const addParticlesBtn = document.getElementById("addParticlesBtn");
const speedBtn = document.getElementById("speedBtn");
const startBtn = document.getElementById("startBtn");


let particles = [];
let speed = 2;
let animationFrameId;
let scatteredCount = 0;
let straightCount = 0;
let simulationRunning = false;
let tableDrawn = false;
let currentTrial = 0;


const table = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};

const nucleus = {
  x: 0,
  y: 0,
  width: 30,
  height: 30
};

const source = {
  x: 20,
  y: 0,
  width: 50,
  height: 100
};

function updateSimulationElements() {
  table.width = canvas.width * 0.5;
  table.height = canvas.height * 0.5;
  table.x = canvas.width / 2 - table.width / 2;
  table.y = canvas.height / 2 - table.height / 2;

  nucleus.x = table.x + table.width / 2 - nucleus.width / 2;
  nucleus.y = table.y + table.height / 2 - nucleus.height / 2;

  source.y = canvas.height / 2 - source.height / 2;
}


tableOverlay.addEventListener("click", () => {
  tableOverlay.style.display = "none";
  tableDrawn = true;
  updateSimulationElements();
  drawTable();
  updateMessage("Table added. Select particles for trial.");
  document.getElementById("addTableBtn").disabled = true;
  addParticlesBtn.disabled = false;
});

function updateMessage(text) {
document.getElementById("message").innerText = `${text}`;
}


function updateParticleStats(scattered, straight) {
document.getElementById("particleStats").innerText = 
`Scattered: ${scattered} | Straight: ${straight} | Total: ${scattered + straight}`;
}

function drawTable() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#854F23";
  ctx.fillRect(table.x, table.y, table.width, table.height);
  ctx.fillStyle = "#dea233";
  ctx.fillRect(nucleus.x, nucleus.y, nucleus.width, nucleus.height);
}

async function createParticles(throws, scattered) {
  particles = [];
  scatteredCount = 0;
  straightCount = 0;

  
  for (let i = 0; i < scattered; i++) {
    const x = source.x;
    const y = source.y + Math.random() * source.height;

    const targetX = nucleus.x + nucleus.width / 2;
    const targetY = nucleus.y + nucleus.height / 2;
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    particles.push({
      x,
      y,
      dx: (dx / distance) * speed,
      dy: (dy / distance) * speed,
      scattered: false,
      passed: false,
      alpha: 1,
      delay: Math.random() * 50
    });
  }

  for (let i = 0; i < throws - scattered; i++) {
    const x = source.x;
    let y;

    do {
      y = source.y + Math.random() * source.height;
    } while (
      y > nucleus.y - nucleus.height/2 && 
      y < nucleus.y + nucleus.height * 1.5
    );

    particles.push({
      x,
      y,
      dx: speed,
      dy: (Math.random() - 0.5) * 0.2,
      scattered: false,
      passed: false,
      alpha: 1,
      delay: Math.random() * 50
    });
  }
}

// First, let's modify the collision detection to be resolution-independent
function animate() {
    if (!simulationRunning) return;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTable();
  
    ctx.fillStyle = "rgba(0,0,255,0.2)";
    ctx.fillRect(source.x, source.y, source.width, source.height);
  
    let allPassed = true;
  
    particles.forEach((p) => {
      if (p.delay > 0) {
        p.delay--;
        allPassed = false;
        return;
      }
  
      if (!p.passed) {
        allPassed = false;
        
        p.x += p.dx;
        p.y += p.dy;
  
        // Update collision detection to be resolution-independent
        const nx = nucleus.x + nucleus.width / 2;
        const ny = nucleus.y + nucleus.height / 2;
        const dx = p.x - nx;
        const dy = p.y - ny;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Don't count collisions, just animate them for visual effect
        if (distance < nucleus.width / 2 && !p.scattered) {
          p.dx *= -0.8;
          p.dy = (Math.random() - 0.5) * speed * 2;
          p.scattered = true;
        }
  
        if (p.x > canvas.width) {
          p.passed = true;
        }
  
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.scattered ? "#ff0000" : "#0000ff";
        ctx.fill();
      }
    });
  
    if (allPassed) {
      simulationRunning = false;
      showFinalResults();
    } else {
      // Update display with table values instead of counted values
      let totalParticles, scatteredParticles;
      if (currentTrial === 0) {
        totalParticles = parseInt(document.getElementById('numParticles').value);
        scatteredParticles = parseInt(document.getElementById('expectedScattered').textContent);
      } else {
        totalParticles = parseInt(trialTable.rows[currentTrial].cells[1].textContent);
        scatteredParticles = parseInt(trialTable.rows[currentTrial].cells[2].textContent);
      }
      const straightParticles = totalParticles - scatteredParticles;
      updateParticleStats(scatteredParticles, straightParticles);
      animationFrameId = requestAnimationFrame(animate);
    }
  }
  
  // Update particle stats display to always use table data
  function updateParticleStats(scattered, straight) {
    document.getElementById("particleStats").innerText = 
      `Scattered: ${scattered} | Straight: ${straight} | Total: ${scattered + straight}`;
  }
  
  // Ensure final results always use table data
  function showFinalResults() {
    let totalParticles, scatteredCount;
    
    if (currentTrial === 0) {
      totalParticles = parseInt(document.getElementById('numParticles').value);
      scatteredCount = parseInt(document.getElementById('expectedScattered').textContent);
    } else {
      totalParticles = parseInt(trialTable.rows[currentTrial].cells[1].textContent);
      scatteredCount = parseInt(trialTable.rows[currentTrial].cells[2].textContent);
    }
    
    const straightCount = totalParticles - scatteredCount;
    const scatteredPercentage = ((scatteredCount / totalParticles) * 100).toFixed(1);
    
    document.getElementById("finalResultText").innerHTML = 
     `Total Particles: ${totalParticles}<br>
      Scattered: ${scatteredCount} (${scatteredPercentage}%)<br>
      Straight: ${straightCount}`
    ;
    
    document.getElementById("finalResultPopup").style.display = "block";
  }


function closePopup() {
  document.getElementById("finalResultPopup").style.display = "none";
}
function setSpeed() {
speed = Math.random() * 3 + 1;
updateMessage(`Speed set to ${speed.toFixed(2)}`);
}

function startSimulation() {
if (!tableDrawn) {
updateMessage("Add table first!");
return;
}
if (particles.length === 0) {
updateMessage("Select trial first!");
return;
}
if (!simulationRunning) {
simulationRunning = true;
startBtn.textContent = "Pause";
animate();
updateMessage("Simulation running...");
} else {
simulationRunning = false;
startBtn.textContent = "Resume";
cancelAnimationFrame(animationFrameId);
updateMessage("Simulation paused");
}
}

function resetSimulation() {

cancelAnimationFrame(animationFrameId);


particles = [];
scatteredCount = 0;
straightCount = 0;
simulationRunning = false;
tableDrawn = false;
currentTrial = 0;
speed = 2;


tableOverlay.style.display = "none";
particlesOverlay.style.display = "none";
document.getElementById("addTableBtn").disabled = false;
addParticlesBtn.disabled = true;
speedBtn.disabled = true;
startBtn.disabled = true;
startBtn.textContent = "Start Simulation";


ctx.clearRect(0, 0, canvas.width, canvas.height);


updateMessage("Simulation reset");
updateParticleStats(0, 0);


closePopup();
}

function addTable() {
if (tableDrawn) {
updateMessage("Table already added!");
return;
}
tableOverlay.style.display = "flex";
updateMessage("Select table type");
}

function showParticlesOverlay() {
if (!tableDrawn) {
updateMessage("Add table first!");
return;
}
particlesOverlay.style.display = "flex";
updateMessage("Select trial number");
}


function handleResize() {
resizeCanvas();
if (tableDrawn) {
updateSimulationElements();
drawTable();
}
}


window.addEventListener('resize', handleResize);
window.addEventListener('load', () => {
updateMessage("Welcome! Start by adding a table.");
resizeCanvas();
updateSimulationElements();
});

document.addEventListener('keydown', (e) => {
switch(e.key) {
case ' ':  
if (!startBtn.disabled) startSimulation();
break;
case 'r':  
case 'R':
resetSimulation();
break;
case 'Escape':  
closePopup();
break;
}
});


window.addEventListener('error', (e) => {
console.error('Simulation error:', e.error);
updateMessage("An error occurred. Please reset the simulation.");
simulationRunning = false;
cancelAnimationFrame(animationFrameId);
});

function calculateCustomTrial() {
const numParticles = parseInt(document.getElementById('numParticles').value);


if (isNaN(numParticles) || numParticles < 1 || numParticles > 10000) {
updateMessage("Please enter a valid number between 1 and 10000");
return;
}

const scatteringProbability = 0.057;
const expectedScattered = Math.round(numParticles * scatteringProbability);


document.getElementById('totalParticles').textContent = numParticles;
document.getElementById('expectedScattered').textContent = expectedScattered;


createParticles(numParticles, expectedScattered);
updateMessage('Custom trial loaded - ${numParticles} particles');
updateParticleStats(0, 0); 


speedBtn.disabled = false;
startBtn.disabled = false;
addParticlesBtn.disabled = false;
}


particlesOverlay.addEventListener("click", async () => {
if (!tableDrawn) {
updateMessage("Please add table first!");
return;
}

const trialChoice = prompt("Enter trial number (1-8) or 'C' for custom trial:");

if (trialChoice.toLowerCase() === 'c') {
particlesOverlay.style.display = "none";
document.getElementById('numParticles').focus();
updateMessage("Enter number of particles for custom trial");
return;
}

const trialNumber = parseInt(trialChoice);
if (isNaN(trialNumber) || trialNumber < 1 || trialNumber > 8) {
updateMessage("Invalid trial number!");
return;
}

particlesOverlay.style.display = "none";
currentTrial = trialNumber;
const throws = parseInt(trialTable.rows[trialNumber].cells[1].textContent);
const scattered = parseInt(trialTable.rows[trialNumber].cells[2].textContent);

await createParticles(throws, scattered);
updateMessage(`Trial ${trialNumber} loaded - ${throws} particles`);
updateParticleStats(scattered, throws - scattered);

speedBtn.disabled = false;
startBtn.disabled = false;
addParticlesBtn.disabled = false;
});
