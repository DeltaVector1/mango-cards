// Global variables
let cards = [];
let extraInfo = '';
// Fetch and load cards
async function loadCards() {
    try {
        const response = await fetch('cards.txt');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        for (let i = 0; i < lines.length; i += 5) {
            const card = {
                catboxLink: getValueFromLine(lines[i] || '', 'Catbox link'),
                chubLink: getValueFromLine(lines[i + 1] || '', 'Chub link'),
                imagePath: getValueFromLine(lines[i + 2] || '', 'Path_to_image'),
                name: getValueFromLine(lines[i + 3] || '', 'name'),
                description: getValueFromLine(lines[i + 4] || '', 'Description')
            };
            if (Object.values(card).every(value => value !== null && value !== '')) {
                cards.push(card);
            }
        }
        renderCards();
    } catch (error) {
        console.error('Error loading cards:', error);
    }
}
// Helper function to extract value from a line
function getValueFromLine(line, key) {
    const parts = line.split(':');
    if (parts.length >= 2 && parts[0].trim().toLowerCase() === key.toLowerCase()) {
        return parts.slice(1).join(':').trim();
    }
    return null;
}
// Render cards in the grid
function renderCards() {
    const cardGrid = document.getElementById('card-grid');
    cardGrid.innerHTML = cards.map((card, index) => `
        <div class="card" data-index="${index}">
            <img src="${card.imagePath}" alt="${card.name}" loading="lazy">
            <h2>${card.name}</h2>
        </div>
    `).join('');
    cardGrid.addEventListener('click', handleCardClick);
}
// Handle card click
function handleCardClick(event) {
    const card = event.target.closest('.card');
    if (card) {
        const index = parseInt(card.dataset.index);
        showCardDetails(index);
    }
}
// Modify the showCardDetails function
function showCardDetails(index) {
    const card = cards[index];
    const cardDetails = document.getElementById('card-details');
    cardDetails.innerHTML = `
        <div class="card-details-content">
            <h2>${card.name}</h2>
            <img src="${card.imagePath}" alt="${card.name}" class="card-details-image">
            <div class="card-details-description">
                <p>${card.description}</p>
            </div>
            <div class="card-details-buttons">
                <a href="${card.catboxLink}" class="button" target="_blank">Catbox</a>
                <a href="${card.chubLink}" class="button" target="_blank">Chub</a>
                <button id="close-details" class="button">Close</button>
            </div>
        </div>
    `;
    cardDetails.classList.add('active');
    document.body.classList.add('no-scroll');  // Add this line
    document.getElementById('close-details').addEventListener('click', closeCardDetails);
    document.addEventListener('click', closeCardDetailsOutside);
}
// Modify the closeCardDetails function
function closeCardDetails(event) {
    if (event) event.stopPropagation();
    const cardDetails = document.getElementById('card-details');
    cardDetails.classList.remove('active');
    document.body.classList.remove('no-scroll');  // Add this line
    document.removeEventListener('click', closeCardDetailsOutside);
}
// Close card details when clicking outside
function closeCardDetailsOutside(event) {
    const cardDetails = document.getElementById('card-details');
    if (!cardDetails.contains(event.target) && !event.target.closest('.card')) {
        closeCardDetails();
    }
}
// Load extra info
async function loadExtraInfo() {
    try {
        const response = await fetch('NOTICE.txt');
        extraInfo = await response.text();
        document.getElementById('extra-info-content').textContent = extraInfo;
    } catch (error) {
        console.error('Error loading extra info:', error);
    }
}
// Toggle light/dark mode
function toggleMode() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('mode', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}
// Fetch Cards Todo count
async function fetchCardsTodo() {
    try {
        const response = await fetch('https://api.github.com/repos/DeltaVector1/MangyMangoCards/issues?state=open');
        const data = await response.json();
        document.getElementById('cards-todo-count').textContent = data.length;
    } catch (error) {
        console.error('Error fetching Cards Todo:', error);
        document.getElementById('cards-todo-count').textContent = 'Error';
    }
}
// Scroll to top functionality
function handleScroll() {
    const scrollToTop = document.getElementById('scroll-to-top');
    if (window.pageYOffset > 100) {
        scrollToTop.classList.add('visible');
    } else {
        scrollToTop.classList.remove('visible');
    }
}
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.querySelector('.loader');
    Promise.all([loadCards(), loadExtraInfo(), fetchCardsTodo()]).then(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    });
    const savedMode = localStorage.getItem('mode');
    if (savedMode === 'light') {
        document.body.classList.add('light-mode');
    }
    document.getElementById('mode-toggle').addEventListener('click', toggleMode);
    document.getElementById('scroll-to-top').addEventListener('click', scrollToTop);
    window.addEventListener('scroll', handleScroll);
    setInterval(fetchCardsTodo, 300000);
});
