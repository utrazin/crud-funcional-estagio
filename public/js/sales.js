// Clientes Mockados
var MOCK_CUSTOMERS = [
  { id: 'customer-001', name: 'João Silva' },
  { id: 'customer-002', name: 'Maria Oliveira' },
  { id: 'customer-003', name: 'Carlos Santos' },
  { id: 'customer-004', name: 'Ana Costa' },
  { id: 'customer-005', name: 'Pedro Almeida' }
]

var productsMap = {}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function populateCustomerSelect() {
  var select = document.getElementById('sale-customer')
  select.innerHTML = '<option value="">Selecione um cliente</option>'
  MOCK_CUSTOMERS.forEach(function(c) {
    var option = document.createElement('option')
    option.value = c.id
    option.textContent = c.name
    select.appendChild(option)
  })
}

async function populateProductSelect() {
  var select = document.getElementById('sale-product')
  select.innerHTML = '<option value="">Carregando produtos...</option>'

  try {
    var allProducts = await getAllProducts()
    productsMap = {}
    allProducts.forEach(function(p) {
      productsMap[p.id] = p
    })

    var activeProducts = allProducts.filter(function(p) { return !p.deletedAt })

    select.innerHTML = '<option value="">Selecione um produto</option>'
    activeProducts.forEach(function(p) {
      var option = document.createElement('option')
      option.value = p.id
      option.textContent = p.name + ' — R$ ' + p.price.toFixed(2) + ' (estoque: ' + p.stockQuantity + ')'
      select.appendChild(option)
    })
  } catch (err) {
    select.innerHTML = '<option value="">Erro ao carregar produtos</option>'
  }
}

function onProductChange() {
  var productId = document.getElementById('sale-product').value
  var unitPriceInput = document.getElementById('sale-unit-price')

  if (productId && productsMap[productId]) {
    unitPriceInput.value = productsMap[productId].price.toFixed(2)
  } else {
    unitPriceInput.value = ''
  }
  updateTotalValue()
}

function updateTotalValue() {
  var quantity = parseInt(document.getElementById('sale-quantity').value) || 0
  var unitPrice = parseFloat(document.getElementById('sale-unit-price').value) || 0
  var total = quantity * unitPrice
  document.getElementById('sale-total-display').textContent = 'R$ ' + total.toFixed(2)
}

function getCustomerName(id) {
  var customer = MOCK_CUSTOMERS.find(function(c) { return c.id === id })
  return customer ? customer.name : id
}

function formatDate(dateStr) {
  var parts = dateStr.substring(0, 10).split('-')
  return parts[2] + '/' + parts[1] + '/' + parts[0]
}

async function loadSales() {
  var tbody = document.getElementById('sales-tbody')
  tbody.innerHTML = '<tr><td colspan="7" class="loading">Carregando...</td></tr>'

  try {
    var sales = await getSales()

    if (sales.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="padding:12px;color:#888;">Nenhuma venda registrada.</td></tr>'
      return
    }

    tbody.innerHTML = ''
    sales.forEach(function(s) {
      var productName = productsMap[s.productId] ? productsMap[s.productId].name : 'Produto removido'
      var customerName = getCustomerName(s.customerId)

      var tr = document.createElement('tr')
      tr.innerHTML =
        '<td>' + formatDate(s.createdAt) + '</td>' +
        '<td>' + productName + '</td>' +
        '<td>' + customerName + '</td>' +
        '<td>' + s.quantity + '</td>' +
        '<td>R$ ' + s.unitPrice.toFixed(2) + '</td>' +
        '<td>R$ ' + s.totalPrice.toFixed(2) + '</td>' +
        '<td><button class="btn btn-danger" onclick="handleCancelSale(\'' + s.id + '\')">Cancelar</button></td>'
      tbody.appendChild(tr)
    })
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="padding:12px;color:red;">Erro ao carregar vendas.</td></tr>'
    console.error(err)
  }
}

async function handleSaleSubmit(event) {
  event.preventDefault()

  var productId = document.getElementById('sale-product').value
  var customerId = document.getElementById('sale-customer').value
  var quantity = parseInt(document.getElementById('sale-quantity').value)
  var unitPrice = parseFloat(document.getElementById('sale-unit-price').value)
  var saleDate = document.getElementById('sale-date').value

  if (!productId) {
    showMsg('sales-msg', 'Selecione um produto.', 'error')
    return
  }
  if (!customerId) {
    showMsg('sales-msg', 'Selecione um cliente.', 'error')
    return
  }
  if (!unitPrice || unitPrice <= 0) {
    showMsg('sales-msg', 'Valor unitário deve ser maior que zero.', 'error')
    return
  }

  var product = productsMap[productId]
  if (product && quantity > product.stockQuantity) {
    showMsg('sales-msg', 'Estoque insuficiente (disponível: ' + product.stockQuantity + ').', 'error')
    return
  }

  try {
    await createSale({ productId, customerId, quantity, unitPrice, saleDate })
    showMsg('sales-msg', 'Venda registrada com sucesso!', 'success')
    document.getElementById('sale-form').reset()
    document.getElementById('sale-date').value = todayISO()
    document.getElementById('sale-total-display').textContent = 'R$ 0,00'
    await populateProductSelect()
    loadSales()
  } catch (err) {
    showMsg('sales-msg', err.message, 'error')
  }
}

async function handleCancelSale(id) {
  if (!confirm('Cancelar esta venda? O estoque será restaurado.')) return

  try {
    await cancelSale(id)
    showMsg('sales-msg', 'Venda cancelada com sucesso!', 'success')
    await populateProductSelect()
    loadSales()
  } catch (err) {
    showMsg('sales-msg', err.message, 'error')
  }
}
