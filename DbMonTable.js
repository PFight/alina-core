var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var DbMonTable = /** @class */ (function (_super) {
    __extends(DbMonTable, _super);
    function DbMonTable() {
        var _this = _super.call(this) || this;
        _this.template = makeTemplate("\n    <div>\n        <input disabled=\"@toggled\" />\n        <table class=\"table table-striped latest-data\">\n          <tbody>\n            <template id=\"row\">\n                <tr>\n                    <td class=\"dbname @dbclass xx @dbclass2\">It is @dbname! Yes @dbname!</td>\n                    <td class=\"query-count\">\n                      <span class=\"@countClass\">\n                        @queryCount\n                      </span>\n                    </td>\n                    <!-- @queries -->\n                </tr>                  \n            </template>\n          </tbody>\n        </table>\n    </div>\n  ");
        _this.databases = [];
        // this.template = document.getElementById("component-template");
        _this.appendChild(instantiateTemplate(_this.template));
        _this.root = new Renderer(_this);
        _this.update();
        _this.toggle = true;
        setInterval(function () {
            _this.toggle = !_this.toggle;
            _this.update();
        }, 3000);
        return _this;
    }
    DbMonTable.prototype.update = function () {
        var _this = this;
        this.root.set("@toggled", this.toggle);
        this.root.repeat("#row", this.databases, function (row, db) {
            row.set("@dbname", db.dbname);
            row.set("@countClass", db.lastSample.countClassName);
            row.set("@queryCount", db.lastSample.nbQueries);
            row.set("@dbclass", _this.toggle ? "dbtestclass1" : null);
            row.set("@dbclass2", _this.toggle ? "dbtestclass2" : "");
            row.send(db.lastSample.topFiveQueries).into("@queries", DbMonQueryList);
        });
    };
    DbMonTable.prototype.connectedCallback = function () {
        this.run();
    };
    DbMonTable.prototype.run = function () {
        this.databases = window["ENV"].generateData().toArray();
        this.update();
        window["Monitoring"].renderRate.ping();
        setTimeout(this.run.bind(this), window["ENV"].timeout);
    };
    return DbMonTable;
}(HTMLElement));
window["customElements"].define('db-mon-table', DbMonTable);
