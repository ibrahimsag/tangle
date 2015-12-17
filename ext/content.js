function setup() {
    var github = new Github({
        token: "<OAUTH_TOKEN>",
        auth: "oauth"
    });

    setupPR(github);
    setupVIS(github);
}

window.onload = setup;

console.log(window.location.href);
console.log("testing testing");
