// src/main.js

// --- 1. Definição do Estado da Aplicação (O Copo) ---
class CocktailShaker {
  constructor() {
    this.ingredients = []; 
    this.rewardLevel = 0;  
    this.toxicityLevel = 0; 
  }

  addIngredient(name, reward, toxicity) {
    if (this.ingredients.length >= 5) {
      console.warn("[Shaker] O copo já está cheio!");
      return;
    }
    this.ingredients.push(name);
    this.rewardLevel += reward;
    this.toxicityLevel += toxicity;
    this.updateUI();
  }

  reset() {
    this.ingredients = [];
    this.rewardLevel = 0;
    this.toxicityLevel = 0;
    this.updateUI();
  }

  updateUI() {
    const cupStatusElement = document.getElementById("cup-status");
    if (this.ingredients.length === 0) {
      cupStatusElement.textContent = "Vazio";
    } else {
      cupStatusElement.textContent = this.ingredients.join(" + ");
    }
  }
}

// --- 2. Inicialização e Conexão dos Eventos ---
const myShaker = new CocktailShaker();

document.getElementById("btn-sugar").addEventListener("click", () => {
  myShaker.addIngredient("Açúcar", 10, 0); 
});

document.getElementById("btn-alcohol").addEventListener("click", () => {
  myShaker.addIngredient("Álcool Puro", 2, 15); 
});

document.getElementById("btn-water").addEventListener("click", () => {
  myShaker.addIngredient("Água", 0, 0); 
});

const cupStatusElement = document.getElementById("cup-status");
const brainActivityElement = document.getElementById("brain-activity");

// --- 3. Configuração do Motor Gráfico (Canvas) ---
const canvas = document.getElementById("world-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); 

// --- 4. O Cérebro Neural (Micro Connectome) ---
class MicroConnectome {
  constructor() {
    // Matriz de Pesos: [Açúcar, Toxina, Água] x [Atração, Fuga, Beber]
    this.baseWeights = [
      [  2.0,   0.0,   1.5 ], // Açúcar
      [ -1.0,   2.0,  -2.0 ], // Toxina
      [  0.5,   0.0,   1.0 ]  // Água
    ];
  }

  relu(x) { return Math.max(0, x); }

  processSensors(sugarLevel, toxinLevel, waterLevel, hungerLevel) {
    const inputs = [sugarLevel, toxinLevel, waterLevel];
    let outputs = [0, 0, 0]; 

    // Modulação Hormonal da Fome (Hackeia os pesos originais)
    let currentWeights = JSON.parse(JSON.stringify(this.baseWeights)); 
    
    // Se a fome for altíssima, o peso inibitório da toxina cai drasticamente
    currentWeights[1][2] *= (1.0 - (hungerLevel * 0.95)); 
    
    // A fome aumenta o desespero por atração de líquidos
    currentWeights[2][0] += hungerLevel * 3.0; 

    // Multiplicação da Matriz
    for (let i = 0; i < inputs.length; i++) {
      for (let j = 0; j < outputs.length; j++) {
        outputs[j] += inputs[i] * currentWeights[i][j];
      }
    }

    return {
      attraction: this.relu(outputs[0]),
      fleeing: this.relu(outputs[1]),
      drinking: this.relu(outputs[2])
    };
  }
}

// --- 5. A Entidade Biológica Modificada ---
class VirtualFly {
  constructor(x, y) {
    // Fisiologia de Voo
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0; 
    
    // Memória e Estado Interno
    this.satiation = 50; // Começa com metade da fome
    this.wanderAngle = Math.random() * Math.PI * 2; 
    this.inebriationLevel = 0.0; 
    
    // Conectoma
    this.brain = new MicroConnectome(); 
    this.color = "#ffffff";
    this.baseSpeed = 4;
    this.desiredAngle = 0;
  }

  evaluateEnvironment(shaker, targetX, targetY) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 1. Metabolismo Base
    this.satiation = Math.max(0, this.satiation - 0.1); 
    if (distance > 60) {
        this.inebriationLevel = Math.max(0.0, this.inebriationLevel - 0.001); 
    }

    // 2. Leitura Sensorial (Fome inverte a saciedade para a matemática neural)
    const hungerLevel = 1.0 - (this.satiation / 100);
    
    // O cheiro só chega se ela estiver a menos de 150px
    const inRange = distance < 150;
    const sensedSugar = inRange ? shaker.rewardLevel : 0;
    const sensedToxin = inRange ? shaker.toxicityLevel : 0;
    const sensedWater = inRange ? (shaker.ingredients.includes("Água") ? 5 : 0) : 0;

    // A matriz neural calcula os impulsos baseados nos sensores e no hormônio da fome
    const impulses = this.brain.processSensors(sensedSugar, sensedToxin, sensedWater, hungerLevel);

    // Atualiza o ângulo de exploração para caso ela decida voar livremente
    this.wanderAngle += (Math.random() - 0.5) * 0.3; 

    // 3. Interação Fisiológica (Se beber, soma calorias ou toxinas na corrente sanguínea)
    if (distance < 30 && impulses.drinking > 0) {
       this.satiation = Math.min(100, this.satiation + (impulses.drinking * 0.5));
       if (shaker.toxicityLevel > 0) {
         this.inebriationLevel = Math.min(1.0, this.inebriationLevel + (shaker.toxicityLevel * 0.002));
       }
    }

    // 4. Decisão Motora (Para onde voar)
    if (impulses.fleeing > impulses.attraction && impulses.fleeing > 0.5) {
      this.color = "#ff4444"; 
      brainActivityElement.textContent = "PÂNICO (Rede Neural)";
      this.desiredAngle = Math.atan2(dy, dx) + Math.PI; 
      this.baseSpeed = 4 + impulses.fleeing; 
    } 
    else if (impulses.attraction > impulses.fleeing && impulses.attraction > 0.5) {
      this.color = "#44ff44"; 
      brainActivityElement.textContent = "ATRAÇÃO (Rede Neural)";
      this.desiredAngle = Math.atan2(dy, dx); 
      this.baseSpeed = 3 + (impulses.attraction * 0.5);
    } 
    else {
      // Voo livre/errante
      this.color = this.satiation > 70 ? "#88ff88" : "#aaaaaa"; 
      brainActivityElement.textContent = this.satiation > 70 ? "Saciada e Explorando" : "Buscando estímulos";
      this.desiredAngle = this.wanderAngle;
      this.baseSpeed = 2;
      
      // Sensores de colisão com a parede do Canvas
      if (this.x < 50 || this.x > canvas.width - 50 || this.y < 50 || this.y > canvas.height - 50) {
         this.desiredAngle = Math.atan2(canvas.height/2 - this.y, canvas.width/2 - this.x);
         this.wanderAngle = this.desiredAngle; 
      }
    }
  }

  updatePhysics(canvasWidth, canvasHeight) {
    // Cálculo do Erro Angular (Sensor Vestibular)
    let errorAngle = this.desiredAngle - this.angle;
    errorAngle = Math.atan2(Math.sin(errorAngle), Math.cos(errorAngle));

    // A toxina derruba o peso do controle neural sobre os motores
    const motorControlWeight = 1.0 - this.inebriationLevel; 
    
    let leftWingPulse = this.baseSpeed + (errorAngle * motorControlWeight * 3);
    let rightWingPulse = this.baseSpeed - (errorAngle * motorControlWeight * 3);

    // Toxina causa espasmos nas asas
    const spasm = () => (Math.random() - 0.5) * this.inebriationLevel * 15;
    leftWingPulse += spasm();
    rightWingPulse += spasm();

    // Cinemática Diferencial
    const angularVelocity = (leftWingPulse - rightWingPulse) * 0.1;
    const linearVelocity = (leftWingPulse + rightWingPulse) / 2;

    this.angle += angularVelocity;
    this.vx = Math.cos(this.angle) * linearVelocity;
    this.vy = Math.sin(this.angle) * linearVelocity;

    this.x += this.vx;
    this.y += this.vy;

    // Limites absolutos do vidro (Canvas)
    if (this.x < 15 || this.x > canvasWidth - 15) {
        this.angle = Math.PI - this.angle; 
        this.x = Math.max(15, Math.min(this.x, canvasWidth - 15));
    }
    if (this.y < 15 || this.y > canvasHeight - 15) {
        this.angle = -this.angle; 
        this.y = Math.max(15, Math.min(this.y, canvasHeight - 15));
    }
  }

  draw(ctx) {
    ctx.save(); 
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Desenho anatômico
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(10, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = this.inebriationLevel > 0.5 ? "#8a2be2" : "#ff0000"; 
    ctx.fill();
    ctx.closePath();
    ctx.restore(); 

    // Telemetria Visual (HUD)
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";
    ctx.fillText(`Fome: ${(100 - this.satiation).toFixed(0)}`, this.x - 25, this.y - 20);
    if(this.inebriationLevel > 0.05) {
      ctx.fillStyle = "#8a2be2";
      ctx.fillText(`Álcool: ${(this.inebriationLevel * 100).toFixed(0)}%`, this.x - 30, this.y - 35);
    }
  }
}

// --- 6. O Game Loop (Motor da Simulação) ---
const myFly = new VirtualFly(canvas.width / 4, canvas.height / 4);

function animate() {
  ctx.fillStyle = "#111111"; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cupX = canvas.width / 2;
  const cupY = canvas.height / 2;

  // Copo
  ctx.beginPath();
  ctx.arc(cupX, cupY, 30, 0, Math.PI * 2);
  ctx.fillStyle = myShaker.ingredients.length > 0 ? "rgba(255, 255, 255, 0.15)" : "rgba(100, 100, 100, 0.1)";
  ctx.fill();
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  // Execução
  myFly.evaluateEnvironment(myShaker, cupX, cupY);
  myFly.updatePhysics(canvas.width, canvas.height);
  myFly.draw(ctx);

  requestAnimationFrame(animate);
}

// Inicializa a renderização
animate();