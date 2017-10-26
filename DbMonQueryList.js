var DbMonQueryList = /** @class */ (function () {
    function DbMonQueryList() {
        this.template = makeTemplate("\n      @queryComponent\n  ");
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
}());
