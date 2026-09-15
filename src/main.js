// src/main.js

// 1. Definição do Estado da Aplicação (O Backend do nosso Frontend)
class CocktailShaker {
  constructor() {
    this.ingredients = []; // Guarda o que tem no copo
    this.rewardLevel = 0;  // Quão doce/gostoso está (atrai a mosca)
    this.toxicityLevel = 0; // Quão alcoólico/amargo está (afasta a mosca)
  }

  // Método para adicionar um ingrediente e recalcular os estímulos
  addIngredient(name, reward, toxicity) {
    if (this.ingredients.length >= 5) {
      console.warn("[Shaker] O copo já está cheio!");
      return;
    }

    this.ingredients.push(name);
    this.rewardLevel += reward;
    this.toxicityLevel += toxicity;
    
    console.log(`[Shaker] Adicionado: ${name} | Recompensa: ${this.rewardLevel} | Toxina: ${this.toxicityLevel}`);
    
    // Sempre que o estado muda, atualizamos a interface
    this.updateUI();
  }

  // Método para limpar o copo
  reset() {
    this.ingredients = [];
    this.rewardLevel = 0;
    this.toxicityLevel = 0;
    this.updateUI();
  }

  // 2. Sincronização com o DOM (O Espelho)
  updateUI() {
    const cupStatusElement = document.getElementById("cup-status");
    
    if (this.ingredients.length === 0) {
      cupStatusElement.textContent = "Vazio";
    } else {
      cupStatusElement.textContent = this.ingredients.join(" + ");
    }
  }
}

// 3. Inicialização e Conexão dos Eventos
const myShaker = new CocktailShaker();

// Mapeando os botões do HTML
document.getElementById("btn-sugar").addEventListener("click", () => {
  // Açúcar dá muita recompensa e nenhuma toxina
  myShaker.addIngredient("Açúcar", 10, 0); 
});

document.getElementById("btn-alcohol").addEventListener("click", () => {
  // Álcool puro dá toxina altíssima e pouca recompensa
  myShaker.addIngredient("Álcool Puro", 2, 15); 
});

document.getElementById("btn-water").addEventListener("click", () => {
  // Água dilui, não dá recompensa nem toxina
  myShaker.addIngredient("Água", 0, 0); 
});
// Vamos guardar as referências do DOM para uso futuro
const cupStatusElement = document.getElementById("cup-status");
const brainActivityElement = document.getElementById("brain-activity");

// --- 4. Configuração do Motor Gráfico (Canvas) ---
const canvas = document.getElementById("world-canvas");
const ctx = canvas.getContext("2d");

// Ajustar o tamanho interno do canvas para corresponder ao CSS
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Chama a primeira vez para inicializar
// --- 5. A Entidade Biológica (Mosca com Consciência Espacial) ---
class VirtualFly {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.color = "#ffffff";
    this.state = "idle";
    this.speedLimit = 2;
    
    // Forças que vão agir sobre a mosca
    this.attractionForce = 0;
  }

  evaluateEnvironment(shaker) {
    if (shaker.ingredients.length === 0) {
      this.state = "idle";
      this.color = "#aaaaaa"; 
      brainActivityElement.textContent = "Inativa (Aguardando)";
      this.attractionForce = 0;
      this.speedLimit = 1.5;
      return;
    }

    if (shaker.toxicityLevel > shaker.rewardLevel) {
      this.state = "fleeing";
      this.color = "#ff4444"; 
      brainActivityElement.textContent = "PÂNICO! Fugindo do alvo.";
      // Força negativa = Repulsão (foge do copo)
      this.attractionForce = -0.5; 
      this.speedLimit = 8; 
    } 
    else if (shaker.rewardLevel >= 10) {
      this.state = "drinking";
      this.color = "#44ff44"; 
      brainActivityElement.textContent = "DOPAMINA: Focada na recompensa!";
      // Força positiva forte = Atração (vai direto para o copo)
      this.attractionForce = 0.8; 
      this.speedLimit = 5;
    } 
    else {
      this.state = "curious";
      this.color = "#ffff44"; 
      brainActivityElement.textContent = "Curiosa... investigando o ambiente.";
      // Força positiva fraca = Atração lenta
      this.attractionForce = 0.1; 
      this.speedLimit = 2;
    }
  }

  updatePhysics(canvasWidth, canvasHeight, targetX, targetY) {
    // 1. O Rastreamento Espacial (Seu raciocínio aplicado vetorialmente)
    if (this.attractionForce !== 0) {
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Evita divisão por zero se a mosca estiver exatamente no centro
      if (distance > 0) {
        // Normaliza e multiplica pela força de atração/repulsão
        const forceX = (dx / distance) * this.attractionForce;
        const forceY = (dy / distance) * this.attractionForce;

        this.vx += forceX;
        this.vy += forceY;
      }
    } else {
      // Movimento caótico neutro se não houver alvo interessante
      this.vx += (Math.random() - 0.5) * 0.5;
      this.vy += (Math.random() - 0.5) * 0.5;
    }

    // 2. Limite de Velocidade
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.speedLimit) {
      this.vx = (this.vx / speed) * this.speedLimit;
      this.vy = (this.vy / speed) * this.speedLimit;
    }

    // 3. Aplica Posição e Atrito
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.95;
    this.vy *= 0.95;

    // 4. Bordas
    if (this.x < 10 || this.x > canvasWidth - 10) this.vx *= -1;
    if (this.y < 10 || this.y > canvasHeight - 10) this.vy *= -1;
    this.x = Math.max(10, Math.min(this.x, canvasWidth - 10));
    this.y = Math.max(10, Math.min(this.y, canvasHeight - 10));
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}
const myFly = new VirtualFly(canvas.width / 4, canvas.height / 4);

// --- 6. O Game Loop (Motor da Simulação) ---
function animate() {
  ctx.fillStyle = "#222222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Define onde o copo está (Centro da tela)
  const cupX = canvas.width / 2;
  const cupY = canvas.height / 2;

  // Desenha o Copo no Canvas para referência visual
  ctx.beginPath();
  ctx.arc(cupX, cupY, 30, 0, Math.PI * 2);
  ctx.fillStyle = myShaker.ingredients.length > 0 ? "rgba(255, 255, 255, 0.2)" : "rgba(100, 100, 100, 0.1)";
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
  ctx.closePath();

  // Ciclo da mosca
  myFly.evaluateEnvironment(myShaker);
  myFly.updatePhysics(canvas.width, canvas.height, cupX, cupY);
  myFly.draw(ctx);

  requestAnimationFrame(animate);
}

// Ligar o motor!
animate();