var DbMonQueryList = /** @class */ (function () {
    function DbMonQueryList() {
        this.template = makeTemplate("\n      @queryComponent\n  ");
    }
    DbMonQueryList.prototype.initialize = function (root) {
        this.root = root;
    };
    DbMonQueryList.prototype.update = function (quries) {
        this.root.component("queries", AltRepeat).repeatEx(quries, this.root.once && {
            template: this.template,
            container: this.root.elem.parentElement,
            insertBefore: this.root.elem,
            update: function (query, queryModel) {
                query.componentOnNode("@queryComponent", DbMonQuery).update(queryModel);
            }
        });
    };
    return DbMonQueryList;
}());
