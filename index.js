var GitHubApi = require("github");
var _ = require('lodash');

module.exports = {
    /**
     * Pick API result.
     *
     * @param pullRequests
     * @returns {Array}
     */
    pickResultData: function (pullRequests) {
        var result = [];

        _.map(pullRequests, function (pullRequest, requestKey) {

            if (pullRequest._links) {
                result.push(pullRequest._links);
            }
        });

        return result;
    },

    /**
     * Authenticate gitHub user.
     *
     * @param dexter
     * @param github
     */
    gitHubAuthenticate: function (dexter, github) {

        if (dexter.environment('GitHubUserName') && dexter.environment('GitHubPassword')) {

            github.authenticate({
                type: dexter.environment('GitHubType') || "basic",
                username: dexter.environment('GitHubUserName'),
                password: dexter.environment('GitHubPassword')
            });
        } else {
            this.fail('A GitHubUserName and GitHubPassword environment variable is required for this module');
        }
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        var github = new GitHubApi({
            // required 
            version: "3.0.0"
        });

        this.gitHubAuthenticate(dexter, github);

        if (step.input('owner').first() && step.input('repo').first()) {

            github.pullRequests.getAll({
                user: step.input('owner').first(),
                repo: step.input('repo').first()
            }, function (err, pullRequests) {

                err? this.fail(err) : this.complete(this.pickResultData(pullRequests));
            }.bind(this));
        } else {

            this.fail('A owner input variable is required for this module');
        }
    }
};
