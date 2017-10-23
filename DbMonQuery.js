var DbMonQuery = /** @class */ (function () {
    function DbMonQuery(elem, props) {
        this.template = makeTemplate("\n      <template>\n          <td class=\"Query @elapsedClass\">\n            @formatElapsed\n            <div class=\"popover left\">\n              <div class=\"popover-content\">@query</div>\n              <div class=\"arrow\"/>\n            </div>\n          </td>\n      </template>                \n  ");
        var rootElem = replaceFromTempalte(elem, this.template);
        this.root = new Renderer(rootElem);
    }
    DbMonQuery.prototype.update = function (props) {
        this.root.set("@formatElapsed", props.formatElapsed);
        this.root.set("@query", props.query);
        this.root.set("@elapsedClass", props.elapsedClassName);
    };
    return DbMonQuery;
}());
