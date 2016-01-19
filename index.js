var _ = require('lodash'),
    util = require('./util.js'),
    GitHubApi = require("github"),
    github = new GitHubApi({ version: '3.0.0' });

var pickInputs = {
        'owner': { key: 'user', validate: { req: true } },
        'repo': { key: 'repo', validate: { req: true } }
    },
    pickOutputs = {
        'self': { key: 'data', fields: ['_links.self'] },
        'html': { key: 'data', fields: ['_links.html'] },
        'issue': { key: 'data', fields: ['_links.issue'] },
        'comments': { key: 'data', fields: ['_links.comments'] },
        'review_comments': { key: 'data', fields: ['_links.review_comments'] },
        'review_comment': { key: 'data', fields: ['_links.review_comment'] },
        'commits': { key: 'data', fields: ['_links.commits'] },
        'statuses': { key: 'data', fields: ['_links.statuses'] }
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('github').credentials(),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        // check params.
        if (validateErrors)
            return this.fail(validateErrors);

        github.authenticate({
            type: 'oauth',
            token: _.get(credentials, 'access_token')
        });

        github.pullRequests.getAll(inputs, function (error, dataInfo) {

            error ? this.fail(error) : this.complete(util.pickOutputs({data: dataInfo}, pickOutputs));
        }.bind(this));
    }
};
