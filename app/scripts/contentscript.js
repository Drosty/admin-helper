'use strict';
/**
 * Admin Helper
 *
 * @module AdminHelper
 */

/**
 * A wrapper for XPathResult, providing forEach and map methods
 *
 * @class QueryResult
 * @constructor
 * @param {XPathResult} result XPathResult wrap and query
 */
var QueryResult = function(result) {
    this.result = result;

    this.length = result.snapshotLength;
};

/**
 * Iterate over results, running callback on each item
 *
 * @method forEach
 * @param {callback} callback Method to run against each result item
 * @chainable
 * @example
 *     result.forEach(function(item) {
 *         console.log(item.getAttribute('href'));
 *     });
 */
QueryResult.prototype.forEach = function(callback) {
    for (var i = 0, l = this.result.snapshotLength; i < l; i++) {
        callback(this.result.snapshotItem(i));
    }

    return this;
};

/**
 * Iterate over results, returning an array of callback results for items
 *
 * @method map
 * @param {callback} callback Method to run agains each result item
 * @return {Array} Mapped result array
 * @example
 *     var allHrefs = result.map(function(item) {
 *         return item.getAttribute('href');
 *     });
 */
QueryResult.prototype.map = function(callback) {
    var result = [];

    this.forEach(function(item) {
        result.push(callback(item));
    });

    return result;
};

/**
 * Immediately fetch all query result items
 *
 * @method all
 * @returns {Array} Query items
 */
QueryResult.prototype.all = function() {
    return this.map(function(item) {
        return item;
    });
};

/**
 * Simplified Xpath query interface
 *
 * @class Xpath
 * @static
 */
var Xpath = {
    /**
     * Find multiple dom nodes for an xpath query
     *
     * @method findAll
     * @param {String} path XPath query
     * @param {null|HTMLElement} source=document.body Root element for xpath query
     * @return {QueryResult} Iterable query results
     * @example
     *     Xpath.findAll('td', myTableElement).forEach(function(tableCell) {
     *         ...
     *     });
     */
    findAll: function(path, source) {
        return this._evaluate(path, source, true);
    },

    /**
     * Find multiple dom nodes for an xpath query
     *
     * @method find
     * @param {String} path XPath query
     * @param {null|HTMLElement} source=document.body Root element for xpath query
     * @return {HTMLElement|null} The single result node
     * @example
     *     var firstSidebarLink = Xpath.find('a[0]', sidebarElement);
     */
    find: function(path, source) {
        return this._evaluate(path, source, false);
    },

    /**
     * Run an xpath query
     *
     * @method _evaluate
     * @param {String} path
     * @param {null|HTMLElement} source=document.body Root element for xpath query
     * @param {Boolean} multi=false Whether to query for and return multiple results
     * @return {QueryResult|HTMLElement|null} Result of xpath query, depending on `multi`
     * @private
     */
    _evaluate: function(path, source, multi) {
        source = (source === null || source === undefined) ? document.body : source;

        var queryType = multi ? XPathResult.ORDERED_NODE_SNAPSHOT_TYPE : XPathResult.FIRST_ORDERED_NODE_TYPE;

        var result = document.evaluate(path, source, null, queryType);

        if (multi) {
            return new QueryResult(result);
        } else {
            return result.singleNodeValue;
        }
    }
};


/**
 * Tiny templating class
 *
 * Original source: http://mir.aculo.us/2011/03/09/little-helpers-a-tweet-sized-javascript-templating-engine/
 *
 * @class Template
 * @static
 */
var Template = {
    /**
     * Render template string with provided arguments
     *
     * Variables are wrapped in single braces
     *
     * @method render
     * @param {String} template Template
     * @param {Object|Array} data Template variables
     * @param {Boolean} raw If true, input will not be HTML escaped
     * @return {String}
     * @example
     *     var html = Template.render(
     *         '<b>{name}</b> - {title}',
     *         {
     *             name: 'Rudy',
     *             title: 'Sysop'
     *         }
     *     );
     *     console.log(html);
     *     //> <b>Rudy</b> - Sysop
     */
    render: function (template, data, raw) {
        for(var key in data) {
            if(data.hasOwnProperty(key)) {
                var value = raw ? data[key] : this._escape(data[key]);

                template=template.replace(new RegExp('{'+key+'}','g'), value);
            }
        }
        return template;
    },

    /**
     * Render each object key as a separate template
     *
     * @method renderObject
     * @param {String} template Template
     * @param {Object|Array} data Template variables
     * @param {Boolean} raw If true, input will not be HTML escaped
     * @return {String}
     * @example
     *     var html = Template.renderObject(
     *         '<span><b>{key}</b> - {value}</span>',
     *         {
     *             Rudy: 'Sysop',
     *             Charles: 'DBA'
     *         }
     *     );
     *     console.log(html);
     *     //> <span><b>Rudy</b> - Sysop</span><span><b>Charles</b> - DBA</span>
     */
    renderObject: function(template, data, raw) {
        var output = '';
        for (var key in data) {
            if(data.hasOwnProperty(key)) {
                output += Template.render(template, {key: key, value:data[key]}, raw);
            }
        }
        return output;
    },

    /**
     * Escape an html string
     *
     * @param {String} html
     * @returns {string}
     * @private
     */
    _escape: function(html) {
        return String(html)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\//g, '&#x2F;');
    }
};

/**
 * Admin row highlighter class
 *
 * @class Highlight
 * @static
 */
var Highlight = {
    /**
     * Classname to add to highlighted DOM nodes
     *
     * @property HIGHLIGHT_CLASS
     * @type String
     * @static
     * @final
     * @default 'admin_helper_highlight'
     */
    HIGHLIGHT_CLASS: 'admin_helper_highlight',

    /**
     * Apply highlight class to DOM nodes
     *
     * @method run
     * @param {QueryResult} rows Elements to highlight
     * @chainable
     */
    run: function(rows) {
        var self = this;
        rows.forEach(function(row) {
            row.classList.add(self.HIGHLIGHT_CLASS);
        });

        return this;
    }
};

/**
 * Admin time summarizer class
 *
 * @class Summarize
 * @static
 */
var Summarize = {
    /**
     * Xpath selector for hour table cells relative to admin entry rows
     *
     * @property HOUR_CELL
     * @type String
     * @static
     * @final
     * @default 'td[contains(@class, "hours")]'
     */
    HOUR_CELL: 'td[contains(@class, "hours")]',

    /**
     * Xpath selector for comment table cells relative to admin entry rows
     *
     * @property NOTE_CELL
     * @type String
     * @static
     * @final
     * @default 'td[@class="notes"]'
     */
    NOTE_CELL: 'td[contains(@class, "notes")]',

    /**
     * Dom node ID to insert output before
     *
     * @property TARGET_OUTPUT
     * @type String
     * @static
     * @final
     * @default 'TSEntryInline'
     */
    TARGET_OUTPUT: 'TSEntryInline',

    /**
     * Summary output ID
     *
     * @property OUTPUT_ID
     * @type String
     * @static
     * @final
     * @default 'admin_helper'
     */
    OUTPUT_ID: 'admin_helper',

    /**
     * Total admin entries by note field prefix
     *
     * Renders output above `TARGET_OUTPUT` node
     *
     * @method run
     * @param {QueryResult} rows Rows to summarize
     * @chainable
     */
    run: function(rows) {
        var totals = {};
        var self = this;

        rows.forEach(function(row) {
            var noteNode = Xpath.find(self.NOTE_CELL, row);
            var label = noteNode.textContent.match(/(.+?): .+/);

            if (label) {
                var hourNode = Xpath.find(self.HOUR_CELL, row);
                var hours = hourNode.textContent * 1;
                if (totals[label[1]] === undefined) {
                    totals[label[1]] = 0;
                }

                totals[label[1]] += hours;
            }
        });

        this._render(totals);

        return this;
    },

    /**
     * Create a new data object with fixed decimal values
     *
     * @method _formatTotals
     * @param {Object} totals Hour totals object to clone
     * @param {Number} [decimals=2] Number of decimal places for new total object
     * @returns {Object} Formatted totals object
     * @private
     */
    _formatTotals: function(totals, decimals) {
        if (decimals === undefined) {
            decimals = 2;
        }

        var formattedTotals = {};

        for(var key in totals) {
            if (totals.hasOwnProperty(key)) {
                formattedTotals[key] = totals[key].toFixed(decimals);
            }
        }

        return formattedTotals;
    },

    /**
     * Whether total summary data should be rendered on the page
     *
     * @method _shouldRender
     * @param {Object} totals
     * @returns {Boolean}
     * @private
     */
    _shouldRender: function(totals) {
        for(var item in totals) {
            if (Object.prototype.hasOwnProperty.call(totals, item)) {
                return true;
            }
        }

        return false;
    },

    /**
     * Generate HTML for hour output and insert into the DOM
     *
     * @method _render
     * @param {Object} totals Summarized data as a `type`: `hours` object
     * @private
     * @chainable
     */
    _render: function(totals) {
        var entries = document.getElementById(this.TARGET_OUTPUT);

        if(entries && this._shouldRender(totals)) {
            var summary = document.createElement('div');
            summary.setAttribute('id', this.OUTPUT_ID);
            var formattedTotals = this._formatTotals(totals);

            summary.innerHTML = Template.render('<ul>{items}</ul>', {
                items: Template.renderObject('<li>{key}: <span class="admin_helper_hours">{value}</span>', formattedTotals)
            }, true);

            entries.parentNode.insertBefore(summary, entries);
        }
        return this;
    }
};

/**
 * Finds Admin entry rows and delegates actions to provided hooks
 *
 * @class AdminHelper
 * @static
 */
var AdminHelper = {
    /**
     * Xpath query for admin rows
     *
     * @property ADMIN_ROWS
     * @type String
     * @static
     * @final
     * @default '//tr[td[@class='project']/span[text()='ADMIN']]'
     */
    ADMIN_ROWS: '//tr[td[contains(@class, "project")]/span[text()="ADMIN"]]',

    /**
     * Admin helper initialization
     *
     * @method init
     * @param {Object[]} hooks Array of classes with `run` methods
     */
    init: function(hooks) {
        this._iterateRows(hooks);
    },

    /**
     * Admin row iteration, delegate to provided hooks
     *
     * @method _iterateRows
     * @param {Object[]} hooks Array of classes with `run` methods
     * @private
     */
    _iterateRows: function(hooks) {
        var rows = Xpath.findAll(this.ADMIN_ROWS);

        hooks.forEach(function(hook) {
            if (typeof hook.run === 'function') {
                hook.run(rows);
            }
        });
    }
};

AdminHelper.init([
    Highlight,
    Summarize
]);