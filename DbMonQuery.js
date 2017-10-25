var DbMonQuery = /** @class */ (function () {
    function DbMonQuery() {
        this.template = makeTemplate("\n      <td class=\"Query @elapsedClass\">\n        @formatElapsed\n        <div class=\"popover left\">\n          <div class=\"popover-content\">@query</div>\n          <div class=\"arrow\"/>\n        </div>\n      </td>\n  ");
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
}());
