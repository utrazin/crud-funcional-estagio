let editingProductId = null

async function loadProducts() {
  const tbody = document.getElementById('products-tbody')
  tbody.innerHTML = '<tr><td colspan="6" class="loading">Carregando...</td></tr>'

  try {
    const products = await getProducts()

    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="padding:12px;color:#888;">Nenhum produto cadastrado.</td></tr>'
      return
    }

    tbody.innerHTML = ''
    products.forEach(function(p) {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>R$ ${p.price.toFixed(2)}</td>
        <td>${p.stockQuantity}</td>
        <td>${p.salesCount}</td>
        <td>${p.description || '-'}</td>
        <td>
          <button class="btn btn-warning" onclick="startEditProduct('${p.id}', '${escapeAttr(p.name)}', ${p.price}, ${p.stockQuantity}, '${escapeAttr(p.description || '')}')">Editar</button>
          <button class="btn btn-danger" onclick="handleDeleteProduct('${p.id}', '${escapeAttr(p.name)}')">Excluir</button>
        </td>
      `
      tbody.appendChild(tr)
    })
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="padding:12px;color:red;">Erro ao carregar produtos.</td></tr>'
    console.error(err)
  }
}

function startEditProduct(id, name, price, stockQuantity, description) {
  editingProductId = id
  document.getElementById('product-name').value = name
  document.getElementById('product-price').value = price
  document.getElementById('product-stock').value = stockQuantity
  document.getElementById('product-description').value = description
  document.getElementById('product-form-title').textContent = 'Editar Produto'
  document.getElementById('product-cancel-btn').style.display = 'inline-block'
  document.getElementById('product-submit-btn').textContent = 'Salvar'
  showMsg('products-msg', '', '')
}

function cancelEditProduct() {
  editingProductId = null
  document.getElementById('product-form').reset()
  document.getElementById('product-form-title').textContent = 'Novo Produto'
  document.getElementById('product-cancel-btn').style.display = 'none'
  document.getElementById('product-submit-btn').textContent = 'Cadastrar'
  showMsg('products-msg', '', '')
}

async function handleProductSubmit(event) {
  event.preventDefault()

  const name = document.getElementById('product-name').value.trim()
  const price = parseFloat(document.getElementById('product-price').value)
  const stockQuantity = parseInt(document.getElementById('product-stock').value)
  const description = document.getElementById('product-description').value.trim()

  const data = { name, price, stockQuantity }
  if (description) data.description = description

  try {
    if (editingProductId) {
      await updateProduct(editingProductId, data)
      showMsg('products-msg', 'Produto atualizado com sucesso!', 'success')
    } else {
      await createProduct(data)
      showMsg('products-msg', 'Produto cadastrado com sucesso!', 'success')
    }
    cancelEditProduct()
    loadProducts()
  } catch (err) {
    showMsg('products-msg', err.message, 'error')
  }
}

async function handleDeleteProduct(id, name) {
  if (!confirm(`Excluir o produto "${name}"?`)) return

  try {
    await deleteProduct(id)
    showMsg('products-msg', 'Produto excluído com sucesso!', 'success')
    loadProducts()
  } catch (err) {
    showMsg('products-msg', err.message, 'error')
  }
}

function escapeAttr(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;')
}
