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
var DbMonQueryList = /** @class */ (function (_super) {
    __extends(DbMonQueryList, _super);
    function DbMonQueryList() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.template = makeTemplate("\n      @queryComponent\n  ");
        return _this;
    }
    DbMonQueryList.prototype.initialize = function (root) {
        this.root = root;
    };
    DbMonQueryList.prototype.update = function (quries) {
        this.root.mount(AltRepeat).repeatEx(quries, {
            template: this.template,
            container: this.root.elem.parentElement,
            insertBefore: this.root.elem,
            update: function (query, queryModel) {
                query.findNode("@queryComponent").mount(DbMonQuery).update(queryModel);
            }
        });
    };
    return DbMonQueryList;
}(AltComponent));
