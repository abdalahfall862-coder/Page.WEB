// reviews.js — Avis boutique MethShop

let selectedRating = 0;

// ── Étoiles interactives ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('#star-selector i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.value);
            document.getElementById('review-rating').value = selectedRating;
            stars.forEach((s, i) => {
                s.classList.toggle('text-[#F5A623]', i < selectedRating);
                s.classList.toggle('text-[#D1CFC9]', i >= selectedRating);
            });
        });
    });

    loadShopReviews();
});

// ── Toggle formulaire ─────────────────────────
function toggleReviewForm() {
    const form = document.getElementById('review-form');
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) {
        document.getElementById('review-author').focus();
    }
}

// ── Charger les avis ──────────────────────────
async function loadShopReviews() {
    const container = document.getElementById('reviews-container');
    try {
        const data = await getShopReviews();
        const { reviews, average, total } = data;

        // Résumé
        if (total > 0) {
            document.getElementById('avg-rating').textContent = average.toFixed(1);
            document.getElementById('avg-stars').innerHTML = renderStars(average);
            document.getElementById('avg-total').textContent = `${total} avis`;
            document.getElementById('reviews-summary').classList.remove('hidden');
        }

        // Liste
        if (!reviews.length) {
            container.innerHTML = '<p class="text-center py-12 col-span-full text-sm text-[#8A8885]">Aucun avis pour l\'instant. Soyez le premier !</p>';
            return;
        }

        container.innerHTML = reviews.map(r => `
            <div class="bg-white border border-[#E3E1DC] rounded-2xl p-5 space-y-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-9 h-9 rounded-full bg-[#6B7A4F] text-white flex items-center justify-center text-sm font-bold">
                            ${r.authorName.charAt(0).toUpperCase()}
                        </div>
                        <span class="font-semibold text-sm text-[#1A1A1A]">${r.authorName}</span>
                    </div>
                    <span class="text-xs text-[#8A8885]">${formatDate(r.createdAt)}</span>
                </div>
                <div class="text-[#F5A623] text-sm">${renderStars(r.rating)}</div>
                ${r.title ? `<p class="font-semibold text-sm text-[#1A1A1A]">${r.title}</p>` : ''}
                ${r.comment ? `<p class="text-xs text-[#686663] leading-relaxed">${r.comment}</p>` : ''}
            </div>
        `).join('');

    } catch (e) {
        container.innerHTML = '<p class="text-center py-12 col-span-full text-sm text-red-400">Impossible de charger les avis.</p>';
    }
}

// ── Soumettre un avis ─────────────────────────
async function submitShopReview() {
    const authorName = document.getElementById('review-author').value.trim();
    const rating     = parseInt(document.getElementById('review-rating').value);
    const title      = document.getElementById('review-title').value.trim();
    const comment    = document.getElementById('review-comment').value.trim();
    const msgEl      = document.getElementById('review-form-msg');

    if (!authorName) return showFormMsg('Veuillez entrer votre nom.', 'red');
    if (!rating)     return showFormMsg('Veuillez sélectionner une note.', 'red');

    try {
        showFormMsg('Envoi en cours...', '#6B7A4F');
        await addReview({ authorName, rating, title, comment, type: 'shop' });
        showFormMsg('Merci pour votre avis ! 🎉', 'green');
        setTimeout(() => {
            toggleReviewForm();
            resetForm();
            loadShopReviews();
        }, 1500);
    } catch (e) {
        showFormMsg(e.message || 'Erreur lors de l\'envoi.', 'red');
    }
}

// ── Helpers ───────────────────────────────────
function renderStars(rating) {
    return Array.from({ length: 5 }, (_, i) =>
        `<i class="fa-${i < Math.round(rating) ? 'solid' : 'regular'} fa-star"></i>`
    ).join('');
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showFormMsg(text, color) {
    const el = document.getElementById('review-form-msg');
    el.textContent = text;
    el.style.color = color;
    el.classList.remove('hidden');
}

function resetForm() {
    document.getElementById('review-author').value = '';
    document.getElementById('review-title').value = '';
    document.getElementById('review-comment').value = '';
    document.getElementById('review-rating').value = '0';
    selectedRating = 0;
    document.querySelectorAll('#star-selector i').forEach(s => {
        s.classList.add('text-[#D1CFC9]');
        s.classList.remove('text-[#F5A623]');
    });
    document.getElementById('review-form-msg').classList.add('hidden');
}