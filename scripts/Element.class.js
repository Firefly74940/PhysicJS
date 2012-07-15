function Element() {
    this.id = 0;//Id of the element
    this.CenterPosition = new Engine.Vec2();
    this.Position = new Engine.Vec2();
    this.StartPosition = new Engine.Vec2();
    this.OldPosition = new Engine.Vec2();
    this._hasPlay = false;

    if (Element.isLoaded == undefined) {
        Element.isLoaded = true;

        /*== Method calling a parent method ==*/
        Element.prototype.callParent = function (methode, parent, args) {
            if (parent == undefined) {
                alert('Erreur <callParent> (Méthode [' + methode + '] : parent non défini !');
                return false;
            }

            if (typeof parent == 'string') {
                parent = window[parent];
            }

            if (parent.prototype[methode] == undefined) {
                alert('Erreur <callParent> (Méthode [' + methode + '] : méthode non définie !');
                return false;
            }

            args = (args == undefined) ? [] : args;
            return parent.prototype[methode].apply(this, args);
        };
    }
};