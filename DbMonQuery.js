var DbMonQuery = /** @class */ (function () {
    function DbMonQuery() {
        this.template = makeTemplate("\n      <td class=\"Query @elapsedClass\">\n        @formatElapsed\n        <div class=\"popover left\">\n          <div class=\"popover-content\">@query</div>\n          <div class=\"arrow\"/>\n        </div>\n      </td>\n  ");
    }
    DbMonQuery.prototype.initialize = function (elem, props) {
        var rootElem = replaceFromTempalte(elem, this.template);
        this.root = new Renderer(rootElem);
        return rootElem;
    };
    DbMonQuery.prototype.update = function (props) {
        this.root.set("@formatElapsed", props.formatElapsed);
        this.root.set("@query", props.query);
        this.root.set("@elapsedClass", props.elapsedClassName);
    };
    return DbMonQuery;
}());
