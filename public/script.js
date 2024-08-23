// script.js

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        
        // Form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Simple form validation
        if (name && email && message) {
            alert('Thank you for your message, ' + name + '!');
            form.reset(); // Reset form fields
        } else {
            alert('Please fill in all fields.');
        }
    });
});
