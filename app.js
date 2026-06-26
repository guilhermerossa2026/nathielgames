/* 
   ==========================================================================
   NATHIEL GAMES — LOGIC & COMPONENT CONTROLLER (VANILLA JS)
   ========================================================================== 
*/

document.addEventListener('DOMContentLoaded', () => {
  // ── INICIALIZAÇÃO DO CLIENTE SUPABASE ──
  if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
    window.supabase = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  } else {
    console.error('Configuração do Supabase ausente.');
  }

  let products = [];

  // Carregar produtos do Supabase
  async function loadProducts() {
    try {
      const { data, error } = await window.supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      products = data;
    } catch (error) {
      console.error("Erro ao carregar produtos do Supabase:", error.message);
    }
    renderProducts('todos');
    initVitrine();
  }

  // Chamar carga inicial
  loadProducts();

  // Helper para obter renderização de imagem/URL/Emoji
  function getProductImageHtml(icon, size = '56px') {
    if (!icon) return `<span style="font-size:${size};">📦</span>`;
    const isUrl = icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/') || icon.includes('.') || icon.startsWith('data:image');
    if (isUrl) {
      return `<img src="${icon}" style="width: 100%; height: 100%; object-fit: contain; padding: 12px;" alt="Foto">`;
    }
    return `<span style="font-size:${size}; line-height: 1;">${icon}</span>`;
  }

  // Renderização de cards de produtos
  window.renderProducts = function(cat) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const filtered = cat === 'todos' ? products : products.filter(p => p.cat === cat);
    
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 48px 0;">
          <p style="font-size: 16px;">Nenhum produto disponível nesta categoria no momento.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => `
      <div class="product-card">
        <div class="product-img">
          ${p.badge ? `
            <div class="product-badge-tag" style="${p.sale ? 'background:var(--red);color:#fff' : 'background:var(--bg3);border:1px solid var(--primary);color:var(--primary)'}">
              ${p.badge}
            </div>` : ''
          }
          ${getProductImageHtml(p.icon, '56px')}
        </div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-cat">${p.cat}</div>
          <div class="product-price-note">${p.link ? 'Disponível na Loja Oficial' : 'Consulte disponibilidade'}</div>
          <div class="product-price">${p.price}</div>
          ${p.link ? `
            <button class="product-buy" onclick="window.open('${p.link}', '_blank')" style="border-color: var(--primary); color: var(--primary);">
              <svg class="svg-icon" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
              Ir para Loja
            </button>
          ` : `
            <button class="product-buy" onclick="buyProduct('${p.name}','${p.price}')">
              <svg class="svg-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
              Pedir no WhatsApp
            </button>
          `}
        </div>
      </div>
    `).join('');
  };

  // Filtrar Categorias
  window.filterCat = function(cat, btn) {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(cat);
  };

  // Redirecionamento WhatsApp de Compra
  window.buyProduct = function(name, price) {
    const msg = encodeURIComponent(`Olá! Gostaria de consultar a disponibilidade do produto: ${name} (${price}).`);
    window.open(`https://api.whatsapp.com/send?phone=5548984739035&text=${msg}`, '_blank');
  };

  // ── VITRINE ROTATIVA (DADOS E EVENTOS) ──
  const vitrineItems = [
    { icon: '🕹️', cat: 'Console', name: 'PlayStation 5 Slim', price: 'R$ 4.200', badge: 'NOVO', badgeSale: false },
    { icon: '🎯', cat: 'Console', name: 'Xbox Series S', price: 'R$ 2.800', badge: 'DESTAQUE', badgeSale: false },
    { icon: '🎰', cat: 'Console', name: 'Nintendo Switch OLED', price: 'R$ 1.900', badge: 'OFERTA', badgeSale: true },
    { icon: '🪑', cat: 'Cadeira', name: 'Cadeira Gamer Pro V2', price: 'R$ 890', badge: 'PROMO', badgeSale: true },
    { icon: '🎧', cat: 'Periférico', name: 'Headset Gamer Corsair', price: 'R$ 280', badge: 'TOP', badgeSale: false },
    { icon: '🖱️', cat: 'Periférico', name: 'Mouse Razer Cobra', price: 'R$ 180', badge: 'NOVO', badgeSale: false },
  ];

  let vitrineIdx = 0;
  let vitrineTimer;

  // Icones SVG para Vitrine dependendo da categoria
  const categorySvgs = {
    'Console': `<svg viewBox="0 0 24 24"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
    'Cadeira': `<svg viewBox="0 0 24 24"><path d="M19 10h-1V3c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v7H5c-1.1 0-2 .9-2 2v3h2v5h14v-5h2v-3c0-1.1-.9-2-2-2zM8 3h8v7H8V3zm10 12H6v-3h12v3z"/></svg>`,
    'Periférico': `<svg viewBox="0 0 24 24"><path d="M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-9 12H4v-4h7v4zm9 0h-7v-4h7v4zm0-6H4V9h16v4z"/></svg>`
  };

  function initVitrine() {
    const dotsWrap = document.getElementById('vitrineDotsWrap');
    if (!dotsWrap) return;
    
    dotsWrap.innerHTML = '';
    vitrineItems.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'v-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', `Ver item ${i + 1}`);
      btn.onclick = () => { setVitrine(i); resetTimer(); };
      dotsWrap.appendChild(btn);
    });
    setVitrine(0);
    resetTimer();
  }

  window.setVitrine = function(i) {
    vitrineIdx = i;
    const it = vitrineItems[i];
    
    const iconContainer = document.getElementById('v-icon');
    if (iconContainer) {
      iconContainer.innerHTML = categorySvgs[it.cat] || categorySvgs['Console'];
    }

    const elements = {
      'v-cat': it.cat,
      'v-name': it.name,
      'v-price': it.price
    };

    for (const [id, value] of Object.entries(elements)) {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    }

    const badge = document.getElementById('v-badge');
    if (badge) {
      badge.textContent = it.badge;
      badge.style.background = it.badgeSale ? 'var(--red)' : 'rgba(0, 229, 255, 0.15)';
      badge.style.color = it.badgeSale ? '#fff' : 'var(--primary)';
    }
    
    const pMatch = products.find(p => p.name === it.name);
    const wppBtn = document.getElementById('v-wpp');
    
    if (wppBtn) {
      if (pMatch && pMatch.link) {
        wppBtn.innerHTML = `🛒 Ir para Loja`;
        wppBtn.href = pMatch.link;
        wppBtn.style.borderColor = 'var(--primary)';
        wppBtn.style.color = 'var(--primary)';
      } else {
        wppBtn.innerHTML = `
          <svg class="svg-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
          Pedir no WhatsApp
        `;
        const wppMsg = encodeURIComponent(`Olá! Tenho interesse no item: ${it.name} (${it.price}). Está disponível?`);
        wppBtn.href = `https://api.whatsapp.com/send?phone=5548984739035&text=${wppMsg}`;
      }
    }
    
    document.querySelectorAll('.v-dot').forEach((d, j) => {
      d.className = 'v-dot' + (j === i ? ' active' : '');
    });
  };

  function resetTimer() {
    clearInterval(vitrineTimer);
    vitrineTimer = setInterval(() => {
      if (vitrineItems.length > 0) {
        setVitrine((vitrineIdx + 1) % vitrineItems.length);
      }
    }, 4500);
  }

  // ── PC CONFIGURADOR INTERATIVO (MONTE SEU PC) ──
  window.selectOption = function(btn, group) {
    btn.closest('.step-options-grid').querySelectorAll('.step-card-option').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const slider = document.getElementById('budgetSlider');
    if (slider) {
      updateBudget(slider.value);
    }
  };

  window.updateBudget = function(val) {
    const budgetValEl = document.getElementById('budgetVal');
    const resTotalEl = document.getElementById('res-total');
    
    if (budgetValEl) budgetValEl.textContent = 'R$ ' + parseInt(val).toLocaleString('pt-BR');
    if (resTotalEl) resTotalEl.textContent = 'R$ ' + parseInt(val).toLocaleString('pt-BR');
    
    const v = parseInt(val);
    const cpuEl = document.getElementById('res-cpu');
    const gpuEl = document.getElementById('res-gpu');
    const ramEl = document.getElementById('res-ram');
    const ssdEl = document.getElementById('res-ssd');
    const mbEl = document.getElementById('res-mb');
    const psuEl = document.getElementById('res-psu');
    const badgeEl = document.getElementById('res-badge');

    // Mapear opções selecionadas para personalizar a sugestão
    const selectedUsoEl = document.querySelector('.step-card-option.selected[data-group="uso"]');
    const uso = selectedUsoEl ? selectedUsoEl.dataset.value : 'jogar';

    const selectedGpuBrandEl = document.querySelector('.step-card-option.selected[data-group="gpu"]');
    const gpuBrand = selectedGpuBrandEl ? selectedGpuBrandEl.dataset.value : 'tanto-faz';

    // Lógica inteligente de hardware por faixas de preço e preferências
    if (v < 2500) {
      if (cpuEl) cpuEl.textContent = 'Ryzen 5 4500';
      if (gpuEl) gpuEl.textContent = gpuBrand === 'nvidia' ? 'GTX 1650 4GB' : 'Radeon RX 580 8GB';
      if (ramEl) ramEl.textContent = '8GB DDR4 3200MHz';
      if (ssdEl) ssdEl.textContent = 'SSD 240GB Sata III';
      if (mbEl) mbEl.textContent = 'A520M Pro';
      if (psuEl) psuEl.textContent = '500W 80 Plus';
      
      if (badgeEl) {
        badgeEl.textContent = 'Entrada';
        badgeEl.className = 'result-badge badge-entrada';
      }
    } 
    else if (v < 4500) {
      if (cpuEl) cpuEl.textContent = uso === 'edicao' ? 'Intel Core i5-12400F' : 'Ryzen 5 5600';
      if (gpuEl) gpuEl.textContent = gpuBrand === 'amd' ? 'Radeon RX 6600 8GB' : 'GeForce RTX 3050 8GB';
      if (ramEl) ramEl.textContent = '16GB (2x8GB) DDR4 3200MHz';
      if (ssdEl) ssdEl.textContent = 'SSD 512GB M.2 NVMe';
      if (mbEl) mbEl.textContent = 'B550M DS3H';
      if (psuEl) psuEl.textContent = '550W 80+ Bronze';
      
      if (badgeEl) {
        badgeEl.textContent = 'Intermediário';
        badgeEl.className = 'result-badge badge-intermediario';
      }
    } 
    else if (v < 8000) {
      if (cpuEl) cpuEl.textContent = uso === 'edicao' ? 'Intel Core i7-13700F' : 'Ryzen 5 7600 (AM5)';
      if (gpuEl) gpuEl.textContent = gpuBrand === 'amd' ? 'Radeon RX 7700 XT 12GB' : 'GeForce RTX 4060 Ti 8GB';
      if (ramEl) ramEl.textContent = '16GB (2x8GB) DDR5 5600MHz';
      if (ssdEl) ssdEl.textContent = 'SSD 1TB M.2 NVMe Gen4';
      if (mbEl) mbEl.textContent = 'B650M Gaming Wifi';
      if (psuEl) psuEl.textContent = '650W 80+ Gold';
      
      if (badgeEl) {
        badgeEl.textContent = 'High-End';
        badgeEl.className = 'result-badge badge-high';
      }
    } 
    else {
      if (cpuEl) cpuEl.textContent = uso === 'jogar' ? 'Ryzen 7 7800X3D (AM5)' : 'Intel Core i9-14900K';
      if (gpuEl) gpuEl.textContent = gpuBrand === 'amd' ? 'Radeon RX 7900 XTX 24GB' : 'GeForce RTX 4080 Super 16GB';
      if (ramEl) ramEl.textContent = '32GB (2x16GB) DDR5 6000MHz';
      if (ssdEl) ssdEl.textContent = 'SSD 2TB M.2 NVMe Gen4 High-Speed';
      if (mbEl) mbEl.textContent = 'X670E Asus TUF Gaming';
      if (psuEl) psuEl.textContent = '850W Full Modular 80+ Gold';
      
      if (badgeEl) {
        badgeEl.textContent = 'Ultra';
        badgeEl.className = 'result-badge badge-ultra';
      }
    }

    // Atualizar o link do WhatsApp dinamicamente
    const wppBtn = document.getElementById('res-wpp-link');
    if (wppBtn) {
      const cpu = cpuEl ? cpuEl.textContent : '';
      const gpu = gpuEl ? gpuEl.textContent : '';
      const total = resTotalEl ? resTotalEl.textContent : '';
      const message = `Olá Nathiel Games! Montei uma máquina no configurador do site com orçamento de ${total}.\n\n*Especificações desejadas:*\n- Processador: ${cpu}\n- Placa de Vídeo: ${gpu}\n\nQuero orçamento completo desta build!`;
      wppBtn.href = `https://api.whatsapp.com/send?phone=5548984739035&text=${encodeURIComponent(message)}`;
    }
  };

  // Inicializar o configurador
  const budgetSlider = document.getElementById('budgetSlider');
  if (budgetSlider) {
    updateBudget(budgetSlider.value);
  }

  // ── FORMULÁRIO DE CONTATO ──
  window.enviarContato = function() {
    const nome = document.getElementById('c-nome').value.trim();
    const contato = document.getElementById('c-contato').value.trim();
    const msg = document.getElementById('c-msg').value.trim();
    
    if (!nome || !contato || !msg) {
      alert("Por favor, preencha todos os campos do formulário.");
      return;
    }
    
    const text = encodeURIComponent(`Olá! Enviei uma mensagem de contato pelo site da loja.\n\n*Nome:* ${nome}\n*Contato:* ${contato}\n*Mensagem:* ${msg}`);
    window.open(`https://api.whatsapp.com/send?phone=5548984739035&text=${text}`, '_blank');
  };

  // ── MARCADOR DE MENU ATIVO (INTERSECTION OBSERVER) ──
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[data-section]');

  if (sections.length > 0 && navLinks.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => {
            a.classList.toggle('active', a.dataset.section === entry.target.id);
          });
        }
      });
    }, { threshold: 0.25 });

    sections.forEach(s => sectionObserver.observe(s));
  }

  // ── DRAWER RESPONSIVO MOBILE ──
  window.toggleDrawer = function() {
    const h = document.getElementById('hamburger');
    const d = document.getElementById('navDrawer');
    if (!h || !d) return;
    
    h.classList.toggle('open');
    d.classList.toggle('open');
    document.body.style.overflow = d.classList.contains('open') ? 'hidden' : '';
  };

  window.closeDrawer = function() {
    const h = document.getElementById('hamburger');
    const d = document.getElementById('navDrawer');
    if (!h || !d) return;
    
    h.classList.remove('open');
    d.classList.remove('open');
    document.body.style.overflow = '';
  };

  // ── ANIMATION ON SCROLL ──
  const fadeUpObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach(el => fadeUpObserver.observe(el));
});
