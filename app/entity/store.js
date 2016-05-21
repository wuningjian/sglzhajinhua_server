/**
 * Created by WTF Wei on 2016/4/6.
 * Function :
 */

var Store = function(opts){
    this.id       = opts.id;
    this.itemId   = opts.itemId;
    this.itemName = opts.itemName;
    this.number   = opts.number;
    this.gift     = opts.gift;
    this.cost     = opts.cost;
    this.note     = opts.note;
    this.type     = opts.type;
}

module.exports = Store;
