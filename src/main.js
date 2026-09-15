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
// --- 5. A Entidade Biológica (Mosca) ---
class VirtualFly {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = "#ffffff";
    this.state = "idle"; // Estados: idle, drinking, fleeing
  }

  // O Sistema Sensorial: Lê o estado do mundo (o copo)
  evaluateEnvironment(shaker) {
    if (shaker.ingredients.length === 0) {
      this.state = "idle";
      this.color = "#aaaaaa"; // Cinza (entediada)
      brainActivityElement.textContent = "Inativa (Aguardando)";
      return;
    }

    // Regra biológica de sobrevivência: Toxina tem prioridade sobre recompensa
    if (shaker.toxicityLevel > shaker.rewardLevel) {
      this.state = "fleeing";
      this.color = "#ff4444"; // Vermelho (pânico)
      brainActivityElement.textContent = "PÂNICO! Fuga ativada pelas toxinas.";
    } 
    // Se a recompensa for alta e a toxina baixa
    else if (shaker.rewardLevel >= 10) {
      this.state = "drinking";
      this.color = "#44ff44"; // Verde (dopamina alta)
      brainActivityElement.textContent = "DOPAMINA: A mosca aprova o drink!";
    } 
    else {
      this.state = "curious";
      this.color = "#ffff44"; // Amarelo (analisando)
      brainActivityElement.textContent = "Curiosa... precisa de mais ingredientes.";
    }
  }

  // Renderiza a mosca no Canvas
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

const myFly = new VirtualFly(canvas.width / 2, canvas.height / 2);
// --- 6. O Game Loop (Motor da Simulação) ---
function animate() {
  // 1. Limpa o frame anterior (fundo escuro)
  ctx.fillStyle = "#222222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. A mosca avalia o copo continuamente
  myFly.evaluateEnvironment(myShaker);

  // 3. Desenha a mosca atualizada
  myFly.draw(ctx);

  // 4. Pede ao navegador para chamar essa função no próximo frame
  requestAnimationFrame(animate);
}

// Ligar o motor!
animate();