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
var DbMonQuery = /** @class */ (function (_super) {
    __extends(DbMonQuery, _super);
    function DbMonQuery() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.template = makeTemplate("\n      <td class=\"Query @elapsedClass\">\n        @formatElapsed\n        <div class=\"popover left\">\n          <div class=\"popover-content\">@query</div>\n          <div class=\"arrow\"/>\n        </div>\n      </td>\n  ");
        return _this;
    }
    DbMonQuery.prototype.initialize = function (root) {
        root.elem = replaceFromTempalte(root.elem, this.template);
        this.root = root;
    };
    DbMonQuery.prototype.update = function (queryModel) {
        this.root.set("@formatElapsed", queryModel.formatElapsed);
        this.root.set("@query", queryModel.query);
        this.root.set("@elapsedClass", queryModel.elapsedClassName);
    };
    return DbMonQuery;
}(AltComponent));
