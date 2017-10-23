var DbMonQueryList = /** @class */ (function () {
    function DbMonQueryList(elem, props) {
        this.template = makeTemplate("\n      @queryComponent\n  ");
        this.root = new Renderer(elem);
    }
    DbMonQueryList.prototype.update = function (props) {
        var container = this.root.elem.parentElement;
        var pos = this.root.elem;
        this.root.repeatEx("row", this.template, container, pos, props, function (query, queryModel) {
            query.send(queryModel).into("@queryComponent", DbMonQuery);
        });
    };
    return DbMonQueryList;
}());
