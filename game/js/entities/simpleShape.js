/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4 */
/*global define */
define(['game/js/entity.js', 'game/js/vector.js', 'game/js/input.js'], function (Entity, Vector, Input) {
    
    "use strict";
    
    function SimpleShape(x, y, w, h, color, pg) {
        Entity.call(this, x, y, w, h);
        this.MAX_SPEED = 0.5;
        this.color = color;
        this.Playground = pg;
        this.sollVelocity = new Vector(0, 0);
        this.istVelocity = new Vector(0, 0);
        this.VELOCITY_DAMP = 20; // Je größer umso langsamer fällt vel ab
        this.sollAngle = 0;
        this.istAngle = 0;
        this.ANGULAR_DAMP = 5; // Je größer umso langsamer fällt angle  ab
    }
    
    SimpleShape.prototype = Object.create(Entity.prototype, SimpleShape.prototype);
    
    SimpleShape.prototype.constructor = SimpleShape;
    
    SimpleShape.prototype.update = function (time) {
        
        // Positionsberechnung
        
        var i = new Vector(
            (Input.isPressed(Input.LEFT) ? -1 : 0) + (Input.isPressed(Input.RIGHT) ? 1 : 0),
            (Input.isPressed(Input.UP) ? -1 : 0) + (Input.isPressed(Input.DOWN) ? 1 : 0));
        
        if(i.lengthSquare() !== 0){
            this.sollVelocity.add(i.div(this.VELOCITY_DAMP));
        }else{
            this.sollVelocity.sub(new Vector(this.sollVelocity.x, this.sollVelocity.y).div(this.VELOCITY_DAMP)); // Jedes Mal was von der Geschwindigkeit abziehen
        }
        
        if(this.sollVelocity.lengthSquare() < 0.001){
            this.sollVelocity.mul(0);
        }else if(this.sollVelocity.length() > this.MAX_SPEED){
            this.sollVelocity.div(this.sollVelocity.length() / this.MAX_SPEED);
        }
        
        var delta = {abs: Math.abs(this.sollVelocity.length() - this.istVelocity.length()),
                     x: this.sollVelocity.x - this.istVelocity.x,
                     y: this.sollVelocity.y - this.istVelocity.y};
        
        if(delta.abs > 0.1){
            this.istVelocity.add(new Vector(delta.x, delta.y).div(this.VELOCITY_DAMP)); // Beschleunigen
        }else{
            this.istVelocity = this.sollVelocity;
        }
        
            
        if(this.istVelocity.lengthSquare() !== 0){
            this.sollAngle = this.istVelocity.angle();
            this.pos.add(new Vector(this.istVelocity.x, this.istVelocity.y).mul(time));
        }
        
        if(this.pos.x - this.getCenter().x < 0) this.pos.x = this.getCenter().x;
        if(this.pos.x + this.getCenter().x > this.Playground.width) this.pos.x = this.Playground.width - this.getCenter().x;

        if(this.pos.y - this.getCenter().y < 0) this.pos.y = this.getCenter().y;
        if(this.pos.y + this.getCenter().y > this.Playground.height) this.pos.y = this.Playground.height - this.getCenter().y;
            
        //
        // Blickrichtungberechnung
        
        var delta = {abs: Math.abs(this.sollAngle - this.istAngle),
                     absCW: 0,
                     absCCW: 0,
                     cw: true};
        
        if(delta.abs > 0){
            if(this.sollAngle > this.istAngle){
                delta.absCW = this.sollAngle - this.istAngle;
                delta.absCCW = 2 * Math.PI + this.istAngle - this.sollAngle;
            }else{
                delta.absCW = 2 * Math.PI + this.sollAngle - this.istAngle;
                delta.absCCW = this.istAngle - this.sollAngle;
            }

            if(delta.absCW > delta.absCCW){
                delta.abs = delta.absCCW;
                delta.cw = false;
            }else{
                delta.abs = delta.absCW;
                delta.cw = true;
            }

            if  (delta.abs < 0.001) {
                this.istAngle = this.sollAngle;
            }else{
                if(delta.cw){
                    this.istAngle += Math.min(delta.abs / this.ANGULAR_DAMP, delta.abs);
                }else{
                    this.istAngle -= Math.min(delta.abs / this.ANGULAR_DAMP, delta.abs);
                }
            }
        }

        if(this.istAngle < -Math.PI) this.istAngle += 2 * Math.PI;
        if(this.istAngle > Math.PI) this.istAngle -= 2 * Math.PI;
        
        //
    }
    
    /* @override */
    SimpleShape.prototype.render = function(ctx) {
        // var sector = Math.floor(((this.angle * 360) / (2 * Math.PI) + 180 + 45) / 90); // Gibt Sektor der Richtung: 2 ist 45 bis -45 ist Rechts bspw.
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.istAngle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.getCenter().x, -this.getCenter().y, this.width, this.height);
        ctx.restore();
    };
    
    return SimpleShape;
    
});