function Pick(commit) {
    this.commit = commit;
    this.apply = function(base) {
        if(this.commit.parent == base) {
            return this.commit;
        }
        if(this.commit.parent.tree == base.tree) {
            return newCommit(base, this.commit.message, this.commit.tree);
        }
        else {
            throw Error("pick for different bases not implemented yet");
        }
    }
}

function FixUp(commit) {
    this.commit = commit;
    this.apply = function(newParent) {
        return newCommit(newParent, newParent.message, this.commit.tree);
    }
}

function Squash(commit) {
    this.commit = commit;
    this.apply = function(newParent) {
        return newCommit(newParent, newParent.message + this.commit.message, this.commit.tree);
    }
}

function Reword(commit, newMessage) {
    this.commit = commit;
    this.apply = function(newParent) {
        return newCommit(newParent, newMessage, this.commit.tree);
    }
}

function Drop(commit) {
    this.commit = commit;
    this.apply = function(newParent) {
        return newParent;
    }
}

function Rebase(base, commands) {
    var _this = this;
    this.base = base;
    this.commands = commands;

    this.apply = function() {
        var commit = Rx.Observable.empty().single({defaultValue: this.base});
        for(var i = 0; i < _this.commands.length; i++)  {
            function x(i) {
                return ((c) => _this.commands[i].apply(c))
            }
            commit = commit.flatMap(x(i));
        }
        return commit;
    }
}

function Branch(base, commits) {
    this.base = base;
    this.commits = commits;

    this.generateCommandList = function(command) {
        return this.commits.map((commit) => {
            if(command && commit.sha == command.commit.sha) {
                return command;
            }
            else {
                return new Pick(commit);
            }
        })
    }
}

function rebase(command, branch, base) {
    if( base === undefined )
        base = branch.base;
    var commands = branch.generateCommandList(command);
    var rebase = new Rebase(base, commands);
    var head = rebase.apply();
}
