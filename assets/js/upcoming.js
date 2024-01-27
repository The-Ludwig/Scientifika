let talk_containers = document.querySelectorAll("#sf-upcoming .sf-talk-card");
let now = new Date();
talk_containers.forEach((c)=>{
    let date = new Date(c.dataset.date);
    let dif = (date - now)/1000/60/60/24;
    // Check if it is in the next 8 days
    if (dif > 0 && dif < 8) {
        c.classList.remove("d-none");
    }
});
