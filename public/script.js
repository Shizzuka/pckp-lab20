document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.edit-input');
    const deleteBtn = document.getElementById('deleteBtn');
    
    if (inputs.length > 0 && deleteBtn) {
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                deleteBtn.disabled = true; // Заблокирована при вводе 
            });
        });
    }
});