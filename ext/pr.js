var github;

function setupPR(ghHandle) {
    github = ghHandle;
    if (/pull\/\d+/.test(window.location.href)) {
        var username, reponame, prid, pr;
        loc = window.location.href;
        urlparts = loc.match(/github.com\/(.*)\/(.*)\/pull\/(\d*)/)
        if(urlparts.length >= 4) {
            username = urlparts[1];
            reponame = urlparts[2];
            prid = urlparts[3];
            pr = new PR(username, reponame, prid);
        }
    }
}

function getPull(repo, prid) {
    return Rx.Observable.fromNodeCallback(repo.getPull)(prid).map(function(res) {
        return res[0];
    });
}

function getCommitsOfPr(pr) {
    return Rx.Observable.fromNodeCallback(github._request)(
        'GET', pr.commits_url, null
    ).map(function(res) {
        // flatten the list
        return res[0];
    });
}

function getCommit(repo, sha) {
    return Rx.Observable.fromNodeCallback(repo.getCommit)(
        null, sha
    ).map(function(res) {
        return res[0];
    });
}

function newCommit(parent, tree, message) {
    return Rx.observable.fromNodeCallback(repo.commit)(
        parent, tree, message
    ).map(function(res) {
        return res[0];
    });
}

function PR(username, reponame, prid) {
    var _this = this;

    this.repo = github.getRepo(username, reponame);
    this.pr = getPull(this.repo, prid);

    var firstComment = $('.js-discussion .timeline-comment-wrapper')[0];
    this.canvas = $('<div />'); 
    this.canvas.insertAfter(firstComment);
    this.init();
}

PR.prototype.getCommits = function() {
    return this.pr.flatMap(getCommitsOfPr).flatMap((res) => res);
}

PR.prototype.squash = function(commitItem) {
    // need to have only one parent to be able to squash
    if(commitItem.commit.parents.length != 1) {
        throw Error("can not squash commits more than one parent");
    }
    this.pr.flatMap(getCommitsOfPr).subscribe((commits) => {
        baseSha = commits[0].parents[0].sha;
        getCommit(this.repo, baseSha).subscribe((baseCommit) => {
            var branch = new Branch(baseCommit, commits);
            var newHead = rebase(new FixUp(commitItem.commit), branch);
        });
    });

}

PR.prototype.init = function() {
    this.getCommits()
    .subscribe(
        (commit) => {
            var commitItem = new CommitItem(this, commit);
            commitItem.appendTo(this.canvas);
        },
        (error) => {
            console.log(error);
        }
    );
};

function CommitItem(pr, commit) {
    this.pr = pr;
    this.commit = commit;
    this.squashButton = $('<a>S</a>');
    this.elem = $('<li> ' + this.commit.commit.message + '</li>');
    this.elem.prepend(this.squashButton);
    Rx.DOM.click(this.squashButton[0]).subscribe((click) => {
        this.pr.squash(this);
    });
}

CommitItem.prototype.appendTo = function (canvas) {
    canvas.append(this.elem);
}
