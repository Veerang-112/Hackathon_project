var tl = gsap.timeline();
var open = document.querySelector(".ri-menu-3-line");
var close = document.querySelector(".ri-close-line");
var photo = document.getElementById("photo");
var sidebarOpen = false;  // track sidebar state

// menu buttons for content switching
var reportBtn = document.getElementById('reportBtn');
var complaintsBtn = document.getElementById('complaintsBtn');
var profileBtn = document.getElementById('profile_menu');

// content panels
var issueSection = document.getElementById('issue');
var complaintsSection = document.getElementById('complaints');
var profileSection = document.getElementById('profile_card');

// animate sidebar in/out
// both sidebar and photo move together for perfect sync
 tl.to("#side",{
    left: "0",
    duration: 0.3
}, 0);

// slide photo div off screen at the same time
 tl.to("#photo",{
    x: "20%",
    duration: 0.3
}, 0);

// animate complaints-list and profile_detail with same timing
 tl.to("#complaints-list",{
    x: "20%",
    duration: 0.3
}, 0);

 tl.to("#profile_detail",{
    x: "20%",
    duration: 0.3
}, 0);

tl.from("#side #contain h1",{
    x: -150,
    opacity: 0, 
    duration: 1,
    stagger: 0.3
});

tl.from(".ri-close-line",{
    opacity: 0
});

// prevent automatic playback until the user clicks
tl.pause();

// when timeline begins opening, send photo behind sidebar
 tl.eventCallback("onStart", function(){
    photo.classList.add('behind');
});
// once the timeline has reversed completely, restore z-index
 tl.eventCallback("onReverseComplete", function(){
    photo.classList.remove('behind');
});

open.addEventListener("click", function(){
    // open sidebar (photo movement handled by timeline)
    tl.play();
    sidebarOpen = true;  // mark sidebar as open
});

close.addEventListener("click", function(){
    // close sidebar
    tl.reverse();
    sidebarOpen = false;  // mark sidebar as closed
});

// content switching helper
function showSection(id) {
    issueSection.style.display = 'none';
    complaintsSection.style.display = 'none';
    profileSection.style.display = 'none';
    
    // set animation positions based on sidebar state
    var xPosition = sidebarOpen ? "20%" : 0;
    gsap.set("#photo, #complaints-list, #profile_detail", { x: xPosition });

    var el = document.getElementById(id);
    if (el) {
        // all sections now use flex for proper layout
        el.style.display = 'flex';
    }
}

// associate buttons
reportBtn && reportBtn.addEventListener('click', () => showSection('issue'));
complaintsBtn && complaintsBtn.addEventListener('click', () => showSection('complaints'));
profileBtn && profileBtn.addEventListener('click', () => showSection('profile_card'));

// ensure correct initial state when page loads
window.addEventListener('DOMContentLoaded', function(){
    photo.classList.remove('behind');
    sidebarOpen = false;  // ensure sidebar starts closed
    // show profile card by default
    showSection('profile_card');
});


