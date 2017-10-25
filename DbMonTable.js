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
        _this.inputValue = "";
        _this.started = true;
        _this.template = makeTemplate("\n    <div>\n        <div>\n          <input disabled=\"@toggled\" oninput=@inputChange /> \n          You entered: @inputText\n          <button onclick=@onStartStopClick >@startStopButtonText</button>\n        </div>\n        <table class=\"table table-striped latest-data\">\n          <tbody>\n            <template id=\"row\">\n                <tr>\n                    <td class=\"dbname @dbclass xx @dbclass2\">It is @dbname! Yes @dbname!</td>\n                    <td class=\"query-count\">\n                      <span class=\"@countClass\">\n                        @queryCount\n                      </span>\n                    </td>\n                    <!-- @queries -->\n                </tr>                  \n            </template>\n          </tbody>\n        </table>\n    </div>\n  ");
        _this.onInputChange = function (ev) {
            _this.inputValue = ev.target.value;
            _this.update();
        };
        _this.onStartStop = function () {
            if (_this.started) {
                _this.stop();
            }
            else {
                _this.run();
            }
            _this.update();
        };
        _this.databases = [];
        // this.template = document.getElementById("component-template");
        _this.appendChild(fromTemplate(_this.template));
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
        this.root.update("@toggled", !this.toggle);
        this.root.update("@inputChange", this.onInputChange);
        this.root.update("@inputText", this.inputValue);
        this.root.update("@onStartStopClick", this.onStartStop);
        this.root.update("@startStopButtonText", this.started ? "Стоп" : "Старт");
        this.root.querySelector("input").on(this.toggle, function (input) {
            input.nodeAs().style.backgroundColor = _this.toggle ? "white" : "yellow";
        });
        this.root.repeat("#row", this.databases, this.root.once && (function (row, db) {
            row.update("@dbname", db.dbname);
            row.update("@countClass", db.lastSample.countClassName);
            row.update("@queryCount", db.lastSample.nbQueries);
            row.update("@dbclass", _this.toggle ? "dbtestclass1" : null);
            row.update("@dbclass2", _this.toggle ? "dbtestclass2" : "");
            row.componentOnNode("@queries", DbMonQueryList).update(db.lastSample.topFiveQueries);
        }));
    };
    DbMonTable.prototype.connectedCallback = function () {
        this.run();
    };
    DbMonTable.prototype.run = function () {
        this.databases = window["ENV"].generateData().toArray();
        this.update();
        window["Monitoring"].renderRate.ping();
        this.timeout = setTimeout(this.run.bind(this), window["ENV"].timeout);
        this.started = true;
    };
    DbMonTable.prototype.stop = function () {
        clearTimeout(this.timeout);
        this.started = false;
    };
    return DbMonTable;
}(HTMLElement));
customElements.define('db-mon-table', DbMonTable);
