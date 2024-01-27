let searchform = document.getElementById("sf-search-talks");
let button_fp = document.getElementById("sf-order-fp");
let button_pf = document.getElementById("sf-order-pf");

let talk_container = document.querySelector(".sf-talks");
let talk_cards = talk_container.querySelectorAll(".sf-talk-card");

let talks = Array.from(talk_cards).map((card) => {return {element: card, date: card.dataset.date}});

button_fp.addEventListener("pointerup", () => { button_pf.classList.remove("bg-primary"); button_fp.classList.add("bg-primary"); reorder_talks(false);});
button_pf.addEventListener("pointerup", () => { button_fp.classList.remove("bg-primary"); button_pf.classList.add("bg-primary"); reorder_talks(true);});

function reorder_talks(anti = false) {
    let num = anti ? -1 : 1;
    talks.sort((a, b) => a.date >= b.date ? -num: num);
    talks.forEach((x, i) => x.element.style.order = i);
}

let search_input = searchform.querySelector("input");
search_input.addEventListener("input", ()=>{
    talks.forEach((x)=> {
        if( x.element.innerHTML.toLowerCase().includes(search_input.value.toLowerCase()) ){
            x.element.style.display = "";
        }else{
            x.element.style.display = "None";
        }
    });
});

let delete_input = searchform.querySelector("button");
delete_input.addEventListener("pointerup", ()=>{
    search_input.value = "";
    talks.forEach((x)=> x.element.style.display="");
});
