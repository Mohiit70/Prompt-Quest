document.addEventListener("DOMContentLoaded", function() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            localStorage.setItem('selectedCategory', category);
            window.location.href = 'image_generation.html';
        });
    });
});
