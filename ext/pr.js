var github;

function setupPR(ghHandle) {
    github = ghHandle;
    if (/pull\/\d+/.test(window.location.href)) {
        PR();
    }
}
function PR() {
    var firstComment = document.querySelectorAll('.js-discussion .timeline-comment-wrapper')[0];
    newNode = document.createElement('div');
    newNode.innerHTML = "testing testing";
    firstComment.parentNode.insertBefore(newNode, firstComment.nextSibling);
}
