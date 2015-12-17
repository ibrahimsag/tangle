function setupPR() {
    PR()
}

function setup() {
    if (/pull\/\d+/.test(window.location.href)) {
        setupPR();
        // setTimeout(setupPR, 100);
    }
}

window.onload = setup;

console.log(window.location.href);
console.log("testing testing");
