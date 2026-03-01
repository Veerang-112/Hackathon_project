const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');
const adminBtn = document.querySelector('.admin-btn');
// determine initial state from button text
let isAdmin = adminBtn.querySelector('h1').textContent.trim().toLowerCase() === 'admin';

// role hidden inputs in the forms
const loginRoleInput = document.getElementById('login-role');
const signupRoleInput = document.getElementById('signup-role');

if (loginRoleInput) loginRoleInput.value = isAdmin ? 'admin' : 'citizen';
if (signupRoleInput) signupRoleInput.value = isAdmin ? 'admin' : 'citizen';

// ensure unique-id field visibility matches state
const uniqueIdBox = document.querySelector('.unique-id-box');
if (isAdmin) {
    uniqueIdBox.style.display = 'flex';
    uniqueIdBox.style.opacity = '1';
    uniqueIdBox.style.height = 'auto';
} else {
    uniqueIdBox.style.display = 'none';
    uniqueIdBox.style.opacity = '0';
    uniqueIdBox.style.height = '0';
}
// set initial button background to match text
adminBtn.style.background = isAdmin ? '#7494EC' : '#556daf';

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// Admin Button Animation
adminBtn.addEventListener('click', () => {
    // Animate the button with GSAP
    // gsap.timeline()
    //     .to(adminBtn, {
    //         duration: 0.3,
    //         scale: 1.1,
    //         rotation: 5,
    //         ease: "back.out"
    //     })
    //     .to(adminBtn, {
    //         duration: 0.3,
    //         scale: 0.95,
    //         rotation: -5,
    //         ease: "back.out"
    //     }, 0.15)
    //     .to(adminBtn, {
    //         duration: 0.3,
    //         scale: 1,
    //         rotation: 0,
    //         ease: "back.out"
    //     }, 0.3);

    // Toggle text and background color
    isAdmin = !isAdmin;
    const h1 = adminBtn.querySelector('h1');
    const uniqueIdBox = document.querySelector('.unique-id-box');
    
    gsap.to(h1, {
        duration: 0.15,
        opacity: 0,
        y: -10,
        ease: "power2.inOut",
        onComplete: () => {
            h1.textContent = isAdmin ? 'Admin' : 'Citizen';
            adminBtn.style.background = isAdmin ? '#7494EC' : '#556daf';
            
            // Show/hide unique ID input based on admin mode
            if (isAdmin) {
                gsap.to(uniqueIdBox, {
                    duration: 0.3,
                    opacity: 1,
                    height: 'auto',
                    ease: "power2.inOut"
                });
                uniqueIdBox.style.display = 'flex';
            } else {
                gsap.to(uniqueIdBox, {
                    duration: 0.3,
                    opacity: 0,
                    height: 0,
                    ease: "power2.inOut",
                    onComplete: () => {
                        uniqueIdBox.style.display = 'none';
                    }
                });
            }

            // update hidden role inputs for forms
            if (loginRoleInput) loginRoleInput.value = isAdmin ? 'admin' : 'citizen';
            if (signupRoleInput) signupRoleInput.value = isAdmin ? 'admin' : 'citizen';
            
            gsap.to(h1, {
                duration: 0.15,
                opacity: 1,
                y: 0,
                ease: "power2.inOut"
            });
        }
    });
});

// show error if URL has ?error=invalid
const params = new URLSearchParams(window.location.search);
if (params.get("error") === "invalid") {
    const err = document.getElementById("login-error");
    if (err) err.style.display = "block";
}

// ===== AJAX LOGIN =====
const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // ❗ stop page reload

        const formData = new FormData(loginForm);

        const res = await fetch("/login", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        const err = document.getElementById("login-error");

        if (data.status === "success") {
            window.location.href = data.redirect;
        } else {
            // 🔥 GSAP ERROR ANIMATION
            err.style.display = "block";

            gsap.fromTo(err,
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        }
    });
}
// ===== REGISTER BUTTON CLICK =====
registerBtn.addEventListener('click', () => {
    container.classList.add('active');

    // swap buttons
    registerBtn.style.display = "none";
    loginBtn.style.display = "block";
});

// ===== LOGIN BUTTON CLICK =====
loginBtn.addEventListener('click', () => {
    container.classList.remove('active');

    // swap buttons back
    loginBtn.style.display = "none";
    registerBtn.style.display = "block";
});