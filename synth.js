button = document.getElementById("togglesynth");
button.onclick = function() {
    if(button.innerHTML == "Synth On") {
        button.innerHTML = "Synth Off";
        button.style.backgroundColor = "grey";
    } else {
        button.innerHTML = "Synth On";
        button.style.backgroundColor = "green";
    }
};