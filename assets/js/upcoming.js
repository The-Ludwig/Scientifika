let talk_containers = document.querySelectorAll("#sf-upcoming .sf-talk-card");
let now = new Date();
let total = 0;
talk_containers.forEach((c)=>{
    let date = new Date(c.dataset.date);
    let dif = (date - now)/1000/60/60/24;
    // Check if it is in the next 8 days
    if (dif > -1 && dif < 8) {
        c.classList.remove("d-none");
        total += 1;
    }
});

if (total == 0){
    let upcoming_section = document.getElementById("sf-upcoming-section");
    upcoming_section.classList.add("d-none");
}
