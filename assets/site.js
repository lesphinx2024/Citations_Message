
document.addEventListener('DOMContentLoaded', function(){
  // nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');
  if(navToggle && navList){
    navToggle.addEventListener('click', ()=> {
      navList.style.display = (navList.style.display === 'block') ? '' : 'block';
    });
  }

  // search (client-side) - if input exists
  const searchInput = document.getElementById('site-search');
  const clearButton = document.getElementById('clear-search');

  if(searchInput){
    // Clear search functionality
    if(clearButton){
      clearButton.addEventListener('click', ()=>{
        searchInput.value = '';
        performSearch('');
        // Remove highlights
        document.querySelectorAll('.highlight').forEach(el=>{
          const parent = el.parentNode;
          parent.replaceChild(document.createTextNode(el.textContent), el);
          parent.normalize();
        });
      });
    }

    searchInput.addEventListener('input', (e)=>{
      const q = e.target.value.trim();
      performSearch(q);
      highlightSearchResults(q);
    });

    // Check URL parameters for search term
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if(searchParam){
      searchInput.value = searchParam;
      performSearch(searchParam);
      highlightSearchResults(searchParam);
    }
  }

  function performSearch(q){
    const query = q.toLowerCase();

    // filter page cards on index
    document.querySelectorAll('.pages-list .page-card').forEach(card=>{
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(query) ? '' : 'none';
    });

    // filter nav links
    document.querySelectorAll('#nav-list a').forEach(a=>{
      const text = a.innerText.toLowerCase();
      a.style.display = text.includes(query) ? '' : 'none';
    });
  }

  function highlightSearchResults(query){
    if(!query) return;

    // Remove existing highlights
    document.querySelectorAll('.highlight').forEach(el=>{
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });

    // Highlight in main content (excluding navigation and headers)
    const mainContent = document.querySelector('main');
    if(mainContent){
      highlightTextInElement(mainContent, query);
    }
  }

  function highlightTextInElement(element, query){
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const nodes = [];
    let node;
    while(node = walker.nextNode()){
      if(node.textContent.toLowerCase().includes(query.toLowerCase())){
        nodes.push(node);
      }
    }

    nodes.forEach(node=>{
      const span = document.createElement('span');
      span.className = 'highlight';

      // Escape special regex characters properly
      const escapedQuery = query.replace(/[.*+?^${}()|[\]]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      const newText = node.textContent.replace(regex, '<span class="highlight">$1</span>');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newText;

      const parent = node.parentNode;
      while(tempDiv.firstChild){
        parent.insertBefore(tempDiv.firstChild, node);
      }
      parent.removeChild(node);
    });
  }

  // create floating button if not present
  if(!document.querySelector('.float-btn')){
    const f = document.createElement('div');
    f.className = 'float-btn';
    f.innerHTML = '<button id="btn-top" title="Haut">↑</button><button id="btn-main" title="Page principale">📑</button><button id="btn-index" title="Index">🏠</button>';
    document.body.appendChild(f);
    document.getElementById('btn-top').addEventListener('click', ()=> window.scrollTo({top:0, behavior:"smooth"}));
    document.getElementById('btn-index').addEventListener('click', ()=> {
      // navigate to root index relative
      const root = (() => {
        if(location.pathname.split('/').filter(Boolean).length > 1) location.href = location.pathname.split('/').slice(0, -2).concat('index.html').join('/');
        else location.href = '/index.html';
      })();
    });
    document.getElementById('btn-main').addEventListener('click', ()=> {
      const parts = location.pathname.split('/');
      if(parts.length > 2){
        const parent = parts.slice(0, parts.length-1).join('/');
        location.href = parent + '/index.html';
      } else {
        location.href = '/index.html';
      }
    });
  }
});
