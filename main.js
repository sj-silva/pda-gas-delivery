let clientsData = [];
let currentEditingId = null;

// Função para formatar póliza
function formatPoliza(poliza) {
  if (!poliza || poliza.length !== 10) return poliza;
  return `${poliza.substring(0, 3)}.${poliza.substring(
    3,
    6
  )}.${poliza.substring(6, 10)}`;
}

// Função para obter classe do badge por tipo de gás
function getGasBadgeClass(gasType) {
  const classes = {
    P35: "badge-p35",
    P11: "badge-p11",
    Butano: "badge-butano",
    GLP: "badge-glp",
    Camping901: "badge-camping",
    Camping907: "badge-camping",
  };
  return classes[gasType] || "badge-p11";
}

// Carregar dados
function loadData() {
  const stored = localStorage.getItem("gasClientsData");
  if (stored) {
    clientsData = JSON.parse(stored);
  } else {
    clientsData = initialData.clients;
    saveData();
  }
}

// Salvar dados
function saveData() {
  localStorage.setItem("gasClientsData", JSON.stringify(clientsData));
}

// Renderizar clientes
function renderClients(clients = clientsData) {
  const container = document.getElementById("clientsList");

  if (clients.length === 0) {
    container.innerHTML = `
                    <div class="no-results">
                        <i class="bi bi-search"></i>
                        <p>Nenhum cliente encontrado</p>
                    </div>
                `;
    return;
  }

  clients.sort((a, b) => a.name.localeCompare(b.name));

  container.innerHTML = clients
    .map(
      (client) => `
                <div class="client-card" onclick="toggleDetails(${client.id})">
                    <div class="client-header">
                        <div>
                            <div class="client-name">${client.name}</div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="client-type-badge ${getGasBadgeClass(
                              client.gasType
                            )}">
                                ${client.gasType}${
        client.quantity ? ` (${client.quantity}x)` : ""
      }
                            </span>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-outline-primary" onclick="editClient(${
                                  client.id
                                }); event.stopPropagation();">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteClient(${
                                  client.id
                                }); event.stopPropagation();">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="client-details" id="details-${client.id}">
                        <div class="detail-row">
                            <span class="detail-label"><i class="bi bi-building me-2"></i>Nome na PDA:</span>
                            <span class="detail-value">${client.pdaName}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label"><i class="bi bi-file-text me-2"></i>Número da Póliza:</span>
                            <span class="poliza-display">${formatPoliza(
                              client.poliza
                            )}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label"><i class="bi bi-fuel-pump me-2"></i>Tipo de Gás:</span>
                            <span class="detail-value">${client.gasType}</span>
                        </div>
                        
                        ${
                          client.quantity
                            ? `
                        <div class="detail-row">
                            <span class="detail-label"><i class="bi bi-123 me-2"></i>Quantidade:</span>
                            <span class="quantity-badge">${client.quantity} bombonas</span>
                        </div>
                        `
                            : ""
                        }
                        
                        ${
                          client.phone
                            ? `
                        <div class="detail-row">
                            <span class="detail-label"><i class="bi bi-telephone me-2"></i>Telefone:</span>
                            <span class="detail-value">${client.phone}</span>
                        </div>
                        `
                            : ""
                        }
                        
                        ${
                          client.location
                            ? `
                        <div class="detail-row">
                            <span class="detail-label"><i class="bi bi-geo-alt me-2"></i>Localização:</span>
                            <span class="detail-value">${client.location}</span>
                        </div>
                        `
                            : ""
                        }
                        
                        ${
                          client.notes
                            ? `
                        <div class="detail-row">
                            <span class="detail-label"><i class="bi bi-sticky me-2"></i>Notas:</span>
                            <span class="detail-value">${client.notes}</span>
                        </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            `
    )
    .join("");
}

// Toggle detalhes
function toggleDetails(id) {
  const details = document.getElementById(`details-${id}`);
  details.classList.toggle("active");
}

// Pesquisa
function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", function () {
    const term = this.value.toLowerCase();
    const filtered = clientsData.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.pdaName.toLowerCase().includes(term) ||
        client.poliza.includes(term)
    );
    renderClients(filtered);

    // Resetar navegação alfabética
    document
      .querySelectorAll(".alphabet-btn")
      .forEach((btn) => btn.classList.remove("active"));
  });
}

// Gerar navegação alfabética
function generateAlphabetNav() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const nav = document.getElementById("alphabetNav");

  nav.innerHTML =
    '<button class="alphabet-btn active" onclick="showAllClients()">Todos</button>' +
    alphabet
      .map(
        (letter) =>
          `<button class="alphabet-btn" onclick="filterByLetter('${letter}')">${letter}</button>`
      )
      .join("");
}

// Filtrar clientes por letra
function filterByLetter(letter) {
  document.getElementById("searchInput").value = "";

  document
    .querySelectorAll(".alphabet-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  const filtered = clientsData.filter((client) =>
    client.name.toUpperCase().startsWith(letter)
  );

  renderClients(filtered);
}

// Mostrar todos os clientes
function showAllClients() {
  document.getElementById("searchInput").value = "";

  document
    .querySelectorAll(".alphabet-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.querySelector(".alphabet-btn").classList.add("active");

  renderClients();
}

// Controle do campo quantidade
document.getElementById("gasType").addEventListener("change", function () {
  const quantityField = document.getElementById("quantityField");
  quantityField.style.display = this.value === "P35" ? "block" : "none";
  if (this.value !== "P35") {
    document.getElementById("quantity").value = "";
  }
});

// Salvar cliente
function saveClient() {
  const name = document.getElementById("clientName").value.trim();
  const pdaName = document.getElementById("pdaName").value.trim();
  const poliza = document.getElementById("poliza").value.trim();
  const gasType = document.getElementById("gasType").value;
  const quantity = document.getElementById("quantity").value;
  const phone = document.getElementById("clientPhone").value.trim();
  const location = document.getElementById("clientLocation").value.trim();
  const notes = document.getElementById("clientNotes").value.trim();

  if (!name || !pdaName || !poliza || !gasType) {
    alert("Por favor, preencha todos os campos obrigatórios!");
    return;
  }

  if (poliza.length !== 10 || !/^\d+$/.test(poliza)) {
    alert("A póliza deve ter exatamente 10 dígitos numéricos!");
    return;
  }

  const clientData = {
    name,
    pdaName,
    poliza,
    gasType,
    quantity: gasType === "P35" && quantity ? parseInt(quantity) : null,
    phone,
    location,
    notes,
  };

  if (currentEditingId) {
    const index = clientsData.findIndex((c) => c.id === currentEditingId);
    if (index !== -1) {
      clientsData[index] = { ...clientsData[index], ...clientData };
    }
    currentEditingId = null;
  } else {
    const newId = Math.max(...clientsData.map((c) => c.id), 0) + 1;
    clientsData.push({ id: newId, ...clientData });
  }

  saveData();
  renderClients();

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("addClientModal")
  );
  modal.hide();
  resetForm();
}

// Editar cliente
function editClient(id) {
  const client = clientsData.find((c) => c.id === id);
  if (!client) return;

  currentEditingId = id;

  document.getElementById("modalTitle").innerHTML =
    '<i class="bi bi-pencil me-2"></i>Editar Cliente';
  document.getElementById("clientName").value = client.name;
  document.getElementById("pdaName").value = client.pdaName;
  document.getElementById("poliza").value = client.poliza;
  document.getElementById("gasType").value = client.gasType;
  document.getElementById("quantity").value = client.quantity || "";
  document.getElementById("clientPhone").value = client.phone || "";
  document.getElementById("clientLocation").value = client.location || "";
  document.getElementById("clientNotes").value = client.notes || "";

  const quantityField = document.getElementById("quantityField");
  quantityField.style.display = client.gasType === "P35" ? "block" : "none";

  new bootstrap.Modal(document.getElementById("addClientModal")).show();
}

// Deletar cliente
function deleteClient(id) {
  if (confirm("Tem certeza que deseja deletar este cliente?")) {
    clientsData = clientsData.filter((c) => c.id !== id);
    saveData();
    renderClients();
  }
}

// Resetar formulário
function resetForm() {
  document.getElementById("clientForm").reset();
  document.getElementById("quantityField").style.display = "none";
}

// Resetar modal ao fechar
document
  .getElementById("addClientModal")
  .addEventListener("hidden.bs.modal", function () {
    currentEditingId = null;
    document.getElementById("modalTitle").innerHTML =
      '<i class="bi bi-person-plus me-2"></i>Adicionar Cliente';
    resetForm();
  });

// Inicializar
document.addEventListener("DOMContentLoaded", function () {
  loadData();
  generateAlphabetNav();
  renderClients();
  setupSearch();
});
