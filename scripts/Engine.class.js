var Engine =
{
    'ctx': null,
    'Render': true,
    'Elements': [],
    'Zones': [],
    'ZonesX': 20,
    'ZonesY': 10,
    'ZonesXW': 10,
    'ZonesYW': 10,
    'GameSpeed': 500000,
    'FpsT': 0,
    'Fps': 0,
    'LastFrame': 0,
    'DeltaD': 0,
    'lastId': 0,
    'G': 6.67384E-11,
    'Gt': 9.81,
    'MpP': 200000000,
    'requestAnimationFrame': null,
    'addClass': function (c) {
        //We define a function: our future class
        window[c.name] = function () {
            c.parent = (c.parent == undefined) ? ['Element'] : c.parent;

            if (typeof c.parent == 'string') {
                c.parent = [c.parent];
            }

            c.abstract = (c.abstract == undefined) ? false : c.abstract;

            if (window[c.name].isLoaded == undefined) {
                window[c.name].isLoaded = true;
                for (var i = 0, l = c.parent.length; i < l; i++) {
                    window[c.parent[i]].call(this); //We call the parent constructor
                }

                //We get the parent's properties
                for (var i = 0, l = c.parent.length; i < l; i++) {
                    var thisParent = window[c.parent[i]];
                    for (var e in thisParent.prototype) {
                        window[c.name].prototype[e] = thisParent.prototype[e];
                        this[e] = thisParent.prototype[e];
                    }
                }

                //And we add our own properties!
                for (var e in c) {
                    if (e != 'name' && e != 'parent' && e != 'abstract') {
                        window[c.name].prototype[e] = c[e];
                        this[e] = c[e];
                    }
                }
            }
        }
        window[c.name].abstract = c.abstract;
    },
    'instanceCreate': function (x, y, type) {
        if (typeof type == 'string') {
            type = window[type];
        }

        if (type == undefined) { alert('Erreur <intanceCreate> : impossible d\'instancier une classe non définie.'); return null; }
        if (type.abstract) { alert('Erreur <intanceCreate> : impossible d\'instancier une classe abstraite.'); return null; }

        x = parseInt(x, 10) || 0;
        y = parseInt(y, 10) || 0;

        var obj = new type();
        obj.Position = new Engine.Vec2(x, y);
        obj.StartPosition = new Engine.Vec2(x, y);
        obj.OldPosition = new Engine.Vec2(x, y);
        obj.CenterPosition = new Engine.Vec2(x, y);
		obj.OldCenterPosition = new Engine.Vec2(x, y);
        obj.AllreadyColide = [];
        obj.ApplyForce = function (force) {
            //var deltaVelocity =;//*Engine.MpP
            obj.Velocity.addSelf(force.copyDivideScalar(obj.Mass));//deltaVelocity.multiplyScalar(Engine.DeltaD*Engine.GameSpeed)
        };
        // obj.IsGravityPoint= { isgp:false,

        // get IsGravityPoint (){return this._IsGravityPoint;},
        // set IsGravityPoint (val){this._IsGravityPoint=val;}
        // };

        Engine.Elements.push(obj);
        obj.id = ++Engine.lastId;
        // obj.maxV=0;
        // obj.minV=11111111110;

        if (obj.eventCreate != undefined) {
            obj.eventCreate();
        }

        return obj;

    },
    'Vec2': function (x, y) {
        this.set(
			x || 0,
			y || 0
		);
    },
    'init': function (id) {
        var canvas = document.getElementById('monCanvas');
        if (canvas) {
            Engine.canvas = canvas;
            if (canvas.getContext) {
                canvas.width = 1024;
                canvas.height = 768;
                Engine.ctx = canvas.getContext('2d');

                window.requestAnimationFrame = function ( /* function FrameRequestCallback */ callback) {
                    window.setTimeout(callback, 1000 / 250);
                };
                Engine.LastFrame = new Date().getTime();
                Engine.ZonesXW = Math.ceil(canvas.width / Engine.ZonesX);
                Engine.ZonesYW = Math.ceil(canvas.height / Engine.ZonesY);
                Engine.ZonesX += 2;
                Engine.ZonesY += 2;
                Engine.PhysicWolrd.InitZones(Engine.Zones);
            }
            else {
                alert('Votre navigateur ne gère pas le canvas :(');
            }
        }
        else {
            alert('Le canvas d\'id ' + id + ' est introuvable !');
        }
    },
    'run': function () {
        if (Engine.ctx == null) {
            alert('ID canvas Invalide');
            return false;
        }

        var tempZones = [];
        //init tempZones
        Engine.PhysicWolrd.InitZones(tempZones);

        Engine.ctx.clearRect(0, 0, 2000, 2000);
        var cT = new Date();
        //last draw Timer
        var ctms = cT.getTime();
        var deltaD = ((ctms - Engine.LastFrame) / 1000);
        Engine.DeltaD = deltaD < 0.003 ? deltaD : 0.003;
        Engine.LastFrame = ctms;
        //fps calcule
        if (cT.getSeconds() == Engine.FpsT)
            Engine.Fps++;
        else {
            document.getElementById('fps').innerHTML = "Fps:" + Engine.Fps + "<br/>";
            Engine.Fps = 0;
            Engine.FpsT = cT.getSeconds();
        }

        //Physic round init
        for (var i = 0, l = Engine.Elements.length; i < l; i++) {
            var elm = Engine.Elements[i];
            elm.AllreadyColide = []; 
            elm._hasPlay = false;
            // move the object
            // elm.OldPosition.copy(elm.Position);
            // elm.Position.addSelf(elm.Velocity.copyMultiplyScalar(Engine.DeltaD*Engine.GameSpeed));
					// elm.OldPosition.copy(elm.Position);
                    // elm.Position.addSelf(elm.Velocity.copyMultiplyScalar(Engine.DeltaD * Engine.GameSpeed));
                    // elm.CenterPosition.copy(elm.Position).addScalar(elm.Size);
					var nextPos =     elm.Position.clone().addSelf(elm.Velocity.copyMultiplyScalar(Engine.DeltaD * Engine.GameSpeed));
            //change his zone
			Engine.PhysicWolrd.CalculeZones(elm.Position,elm,tempZones);
			Engine.PhysicWolrd.CalculeZones(nextPos,elm,tempZones); 
			
            // var zoneX = Math.floor(elm.Position.x / Engine.ZonesXW) + 1;

            // if (zoneX >= 0 && zoneX <= Engine.ZonesX) {
                // var zoneY = Math.floor(elm.Position.y / Engine.ZonesYW) + 1;
                // if (zoneY >= 0 && zoneY <= Engine.ZonesY) {
                    // tempZones[zoneX][zoneY].push(elm);
                // }
            // }
        }
        //ecrasement de l'ancien tableau de zones
        Engine.Zones = tempZones;
        //pour tout les objets actifs
        //alert('var _x=0;_x<='+Engine.zoneX+';_x++');
        for (var _x = 0; _x <= Engine.ZonesX; _x++) {
            for (var _y = 0; _y <= Engine.ZonesY; _y++) {
                for (i = 0, l = Engine.Zones[_x][_y].length; i < l; i++) {
                    var elm = Engine.Zones[_x][_y][i];
                    var colide = false;
					if(!elm._hasPlay)
                   {
						elm.PositionChanged();
						elm.Position.addSelf(elm.Velocity.copyMultiplyScalar(Engine.DeltaD * Engine.GameSpeed));
						
						for (g = 0; g < Engine.PhysicWolrd.GravityPoints.length; g++) {
							var gravityPoint = Engine.PhysicWolrd.GravityPoints[g];
							if (elm.id != gravityPoint.id) {
								if (gravityPoint.IsGravityPoint()) {
									var puissance = Engine.G * (elm.Mass * gravityPoint.Mass) / (gravityPoint.Position.clone().multiplyScalar(Engine.MpP).distanceToSquared(elm.Position.clone().multiplyScalar(Engine.MpP)));
									var vecDirUnit = gravityPoint.CenterPosition.subCopy(elm.CenterPosition).GetGormalize();
									var force = vecDirUnit.copyMultiplyScalar(puissance); //Engine.G*(elm.Mass*gravityPoint.Mass)*(gravityPoint.Position.subCopy(elm.Position).GetGormalize())/gravityPoint.Position.distanceToSquared(elm.Position);
									//	var deltaVelocity =force.divideScalar(elm.Mass*Engine.MpP);
									//	elm.Velocity.addSelf(deltaVelocity.multiplyScalar(Engine.DeltaD*Engine.GameSpeed)); //gravityPoint.Position.subCopy(elm.Position).divideScalar(30*30)
									elm.ApplyForce(force.multiplyScalar((Engine.DeltaD * Engine.GameSpeed) / Engine.MpP));
								}
							}
						}
					}
                  
                            for (j = 0, l2 = Engine.Zones[_x][_y].length; j < l2; j++) {
                                var gravityPoint = Engine.Zones[_x][_y][j];
                                if (elm.id != gravityPoint.id) {
                                    if (gravityPoint.CenterPosition.distanceTo(elm.CenterPosition) <= (gravityPoint.Size + elm.Size) ) {
                                        if (!gravityPoint.AllreadyColide.contain(elm.id)) {
                                            var oldvecDirUnit = gravityPoint.CenterPosition.subCopy(elm.OldCenterPosition).GetGormalize();
                                            //elm.Position.copy(elm.OldPosition).addSelf(oldvecDirUnit.multiplyScalar(elm.OldCenterPosition.distanceTo(gravityPoint.CenterPosition) - (gravityPoint.Size + elm.Size+1)));
                                            elm.Position.copy(elm.OldPosition).addSelf(oldvecDirUnit.multiplyScalar(elm.OldCenterPosition.distanceTo(gravityPoint.CenterPosition) - (gravityPoint.Size + elm.Size+2)));
                                            Engine.PhysicWolrd.Colide(elm, gravityPoint);
											elm.RefreshCenterPos();
                                            colide = true;
											
                                        }
                                        else { //if (gravityPoint.CenterPosition.distanceTo(elm.CenterPosition) < (gravityPoint.Size + elm.Size) && !elm._hasPlay)
                                          var oldvecDirUnit = gravityPoint.CenterPosition.subCopy(elm.OldCenterPosition).GetGormalize();
                                            //elm.Position.copy(elm.OldPosition).addSelf(oldvecDirUnit.multiplyScalar(elm.OldCenterPosition.distanceTo(gravityPoint.CenterPosition) - (gravityPoint.Size + elm.Size+1)));
                                             elm.Position.copy(elm.OldPosition).addSelf(oldvecDirUnit.multiplyScalar(elm.OldCenterPosition.distanceTo(gravityPoint.CenterPosition) - (gravityPoint.Size + elm.Size+2)));
											elm.RefreshCenterPos();
                                            colide = true;
                                        }
                                    }
                                }
                            }
                 
                    
              //      if (colide)
               //         elm.CenterPosition.copy(elm.Position).addScalar(elm.Size);

                    if ((elm.Position.x <= 0 && elm.Velocity.x < 0) || (elm.CenterPosition.x >= Engine.canvas.width - elm.Size && elm.Velocity.x > 0)) {
                        elm.Velocity.x *= -0.7;//1.0;
                    }

                    if ((elm.Position.y <= 0 && elm.Velocity.y < 0) || (elm.CenterPosition.y >= Engine.canvas.height - elm.Size && elm.Velocity.y > 0)) {
                        elm.Velocity.y *= -0.7;//1.0;
                    }
					if(!elm._hasPlay)
					{
						elm._hasPlay=true;
						if (Engine.Render )
						   {
							elm.Draw();
						   }
					 }
					
                }
            }
        }
        //modifie les forces sur l'objet
        // for(var j=0;j<l;j++)
        // {
        // var gravityPoint= Engine.Elements[j];
        // if(elm.id!=gravityPoint.id)
        // {
        // if( gravityPoint.IsGravityPoint())
        // {
        // var puissance= Engine.G*(elm.Mass*gravityPoint.Mass)/(gravityPoint.Position.clone().multiplyScalar(Engine.MpP).distanceToSquared(elm.Position.clone().multiplyScalar(Engine.MpP)));
        // var vecDirUnit = gravityPoint.Position.subCopy(elm.Position).GetGormalize();
        // var force = vecDirUnit.copyMultiplyScalar(puissance); //Engine.G*(elm.Mass*gravityPoint.Mass)*(gravityPoint.Position.subCopy(elm.Position).GetGormalize())/gravityPoint.Position.distanceToSquared(elm.Position);
        //	var deltaVelocity =force.divideScalar(elm.Mass*Engine.MpP);
        //	elm.Velocity.addSelf(deltaVelocity.multiplyScalar(Engine.DeltaD*Engine.GameSpeed)); //gravityPoint.Position.subCopy(elm.Position).divideScalar(30*30)
        // elm.ApplyForce(force.multiplyScalar((Engine.DeltaD*Engine.GameSpeed)/Engine.MpP));
        // }

        // if(gravityPoint.Position.distanceTo(elm.Position)<=(gravityPoint.Size+elm.Size))
        // {
        // if(!gravityPoint.AllreadyColide.contain(elm.id))
        // {
        // var oldvecDirUnit=gravityPoint.Position.subCopy(elm.OldPosition).GetGormalize();
        // elm.Position.copy(elm.OldPosition).addSelf(oldvecDirUnit.multiplyScalar(elm.OldPosition.distanceTo(gravityPoint.Position)-(gravityPoint.Size+elm.Size+1)));
        // Engine.PhysicWolrd.Colide(elm,gravityPoint);
        // }
        // else if(gravityPoint.Position.distanceTo(elm.Position)<(gravityPoint.Size+elm.Size))
        // {
        // var oldvecDirUnit=gravityPoint.Position.subCopy(elm.OldPosition).GetGormalize();
        // elm.Position.copy(elm.OldPosition).addSelf(oldvecDirUnit.multiplyScalar(elm.OldPosition.distanceTo(gravityPoint.Position)-(gravityPoint.Size+elm.Size+1)));
        // }
        // }
        // }
        // }
        ////fake colision wall

        // if((elm.Position.x<=elm.Size && elm.Velocity.x<0) || (elm.Position.x>=Engine.canvas.width-elm.Size && elm.Velocity.x>0) )
        // {
        // elm.Velocity.x*=-0.9;//1.0;
        // }

        // if((elm.Position.y<=elm.Size && elm.Velocity.y<0) || (elm.Position.y>=Engine.canvas.height-elm.Size  && elm.Velocity.y>0))
        // {
        // elm.Velocity.y*=-0.9;//1.0;
        // }



        //on applique les forces sur l'objet
        // elm.OldPosition.copy(elm.Position);
        // elm.Position.addSelf(elm.Velocity.copyMultiplyScalar(Engine.DeltaD*Engine.GameSpeed));
        //}



        //render
        // for(var i=0,l=Engine.Elements.length;i<l;i++)
        // {
        //	//Engine.ctx.fillRect(Engine.Elements[i].Position.x,Engine.Elements[i].Position.y,16,16);
        //	//Engine.ctx.fillStyle="rgb(255,"+ (50/(Engine.Elements[i].Velocity.length()/0.00026))+",0)"

        // Engine.ctx.beginPath();
        // Engine.ctx.arc(Engine.Elements[i].Position.x, Engine.Elements[i].Position.y, 10, 0, Math.PI*2, true);
        // Engine.ctx.closePath();
        // Engine.ctx.fill();
        // Engine.Elements[i].Draw();
        // }
		var min = document.getElementById('min').value;
		var max = document.getElementById('max').value;
		for(x = 0, l =  Engine.PhysicWolrd.Linked.length; x < l; x++)
		{
		var elm=Engine.PhysicWolrd.Linked[x];
			for(y = 0; y < l; y++)
			{
				var elm2=Engine.PhysicWolrd.Linked[y];
				if(elm==elm2)
					continue;
				var vecDirUnit = elm2.CenterPosition.subCopy(elm.CenterPosition).GetGormalize();
				var dist =elm.CenterPosition.distanceTo(elm2.CenterPosition);
				 if(dist>max)
				{
				
					elm.ApplyForce(vecDirUnit.multiplyScalar(0.0001* elm.Mass));
				}
				   else if(dist<min)
				   {
				    elm.ApplyForce(vecDirUnit.multiplyScalar(-0.0001* elm.Mass));
				   }
			}
			elm.Velocity.multiplyScalar(0.70);
		}
		
		//Engine.drawZones();
        window.requestAnimationFrame(Engine.run);
    },
	'drawZones': function()
	{
		Engine.ctx.strokeStyle='#000';
		for(x=0,max_x=1024; x<max_x; x+=Engine.ZonesXW)
		{
			Engine.ctx.beginPath();
			Engine.ctx.moveTo(x,0);
			Engine.ctx.lineTo(x,768);
			Engine.ctx.stroke();
			Engine.ctx.closePath();
		}
		
		for(y=0,max_y=768; y<max_y; y+=Engine.ZonesYW)
		{
			Engine.ctx.beginPath();
			Engine.ctx.moveTo(0,y)
			Engine.ctx.lineTo(1024,y);
			Engine.ctx.stroke();
			Engine.ctx.closePath();
		}
	},
    'PhysicWolrd':
		{
		    'GravityPoints': [],
		    'Colide': function (elm1, elm2) {
		        var MAB = elm1.Mass + elm2.Mass;



		        var UN = elm2.CenterPosition.subCopy(elm1.CenterPosition).GetGormalize();
		        var UT = UN.clone().ToNormal();

		        var V1N = UN.dot(elm1.Velocity);
		        var V2N = UN.dot(elm2.Velocity);
		        var V1T = UT.dot(elm1.Velocity);
		        var V2T = UT.dot(elm2.Velocity);

		        var VP1T = V1T;
		        var VP2T = V2T;
		        var VP1N = ((elm1.Mass - elm2.Mass) * V1N + (elm2.Mass * 2 * V2N)) / MAB;
		        var VP2N = ((elm2.Mass - elm1.Mass) * V2N + (elm1.Mass * 2 * V1N)) / MAB;

		        var VVP1N = UN.copyMultiplyScalar(VP1N);
		        var VVP2N = UN.copyMultiplyScalar(VP2N);
		        var VVP1T = UT.copyMultiplyScalar(VP1T);
		        var VVP2T = UT.copyMultiplyScalar(VP2T);

		        elm1.Velocity.copy(VVP1N.addSelf(VVP1T));
		        elm2.Velocity.copy(VVP2N.addSelf(VVP2T));

		        elm1.AllreadyColide.push(elm2.id);
				elm2.AllreadyColide.push(elm1.id);
		        //backup2
		        // var MAB= elm1.Mass+elm2.Mass;
		        // var vecDirUnit = elm2.Position.subCopy(elm1.Position).GetGormalize().ToNormal();
		        // var U1=elm1.Velocity.length();
		        // var U2=elm2.Velocity.length();
		        // var V1=(elm1.Mass - elm2.Mass)*U1+(elm2.Mass*2*U2);
		        // var V2=(elm2.Mass - elm1.Mass)*U2+(elm1.Mass*2*U1);
		        // V1/=MAB;
		        // V2/=MAB;
		        // elm1.Velocity.copy(vecDirUnit.copyMultiplyScalar(V1*-1));
		        // elm2.Velocity.copy(vecDirUnit.copyMultiplyScalar(V2));
		        // elm1.AllreadyColide.push(elm2.id);
		        //endbackup2
		        //backup
		        // var MAB= elm1.Mass+elm2.Mass;
		        // var V1=elm1.Velocity.copyMultiplyScalar(elm1.Mass - elm2.Mass).addSelf(elm2.Velocity.copyMultiplyScalar(elm2.Mass*2));
		        // var V2=elm2.Velocity.copyMultiplyScalar(elm2.Mass - elm1.Mass).addSelf(elm1.Velocity.copyMultiplyScalar(elm1.Mass*2));
		        // V1.divideScalar(MAB);
		        // V2.divideScalar(MAB);
		        // elm1.Velocity.copy(V1);
		        // elm2.Velocity.copy(V2);
		        // elm1.AllreadyColide.push(elm2.id);
		        //endbackup

		        // var puissance = elm1.Velocity.copyMultiplyScalar(elm1.Mass/1.5);
		        // var vecDirUnit = elm2.Position.subCopy(elm1.Position).GetGormalize();
		        // var force = puissance.multiplySelf(vecDirUnit);
		        // elm2.ApplyForce(force);
		        // force.divideScalar(-1);
		        // elm1.ApplyForce(force);
		    },
		    'InitZones': function (zones) {
		        for (var i = 0; i <= Engine.ZonesX; i++) {
		            zones[i] = [];
		            for (var j = 0; j <= Engine.ZonesY; j++) {
		                zones[i][j] = [];
		            }
		        }
		    },
			'CalculeZones': function (pos,elm,tabZones)
			{
				for(X=pos.x,mX=(pos.x+elm.Size*2+Engine.ZonesXW);X<mX;X+=Engine.ZonesXW)
				{
					var zoneX = Math.floor(X / Engine.ZonesXW) + 1;

					if (zoneX >= 0 && zoneX <= Engine.ZonesX) {
				
						for(Y=pos.y,mY=(pos.y+elm.Size*2+Engine.ZonesYW);Y<mY;Y+=Engine.ZonesYW)
						{
							var zoneY = Math.floor(Y / Engine.ZonesYW) + 1;
							if (zoneY >= 0 && zoneY <= Engine.ZonesY) {
							//	if(elm.Color=='yellow'){
							//	elm.Draw();
								//Engine.drawZones();
								// alert('tabZones['+zoneX+']['+zoneY+']')
								//}
								if(!tabZones[zoneX][zoneY].contain(elm))
									tabZones[zoneX][zoneY].push(elm);
							}
						}
					}
				}
			},
			'Linked':[]

		}
};
Engine.ToogleRender = function (elm) {
    Engine.Render = !Engine.Render;
    if (Engine.Render) {
        elm.innerHTML = "Disable Render"
    }
    else {
        elm.innerHTML = "Enable Render"
    }
};
Engine.Vec2.prototype =
{

    constructor: Engine.Vec2,

    set: function (x, y) {

        this.x = x;
        this.y = y;

        return this;

    },

    copy: function (v) {

        this.x = v.x;
        this.y = v.y;

        return this;

    },

    clone: function () {

        return new Engine.Vec2(this.x, this.y);

    },


    add: function (v1, v2) {

        this.x = v1.x + v2.x;
        this.y = v1.y + v2.y;
        return this;

    },

    addSelf: function (v) {

        this.x += v.x;
        this.y += v.y;

        return this;

    },

    addScalar: function (s) {

        this.x += s;
        this.y += s;

        return this;

    },

    sub: function (v1, v2) {

        this.x = v1.x - v2.x;
        this.y = v1.y - v2.y;

        return this;

    },
    subCopy: function (v) {



        return this.clone().subSelf(v);

    },
    subSelf: function (v) {

        this.x -= v.x;
        this.y -= v.y;

        return this;

    },

    multiply: function (a, b) {

        this.x = a.x * b.x;
        this.y = a.y * b.y;

        return this;

    },

    multiplySelf: function (v) {

        this.x *= v.x;
        this.y *= v.y;

        return this;

    },

    multiplyScalar: function (s) {

        this.x *= s;
        this.y *= s;

        return this;

    },
    copyMultiplyScalar: function (v) {

        return this.clone().multiplyScalar(v);

    },
    divide: function (a, b) {

        this.x = a.x / b.x;
        this.y = a.y / b.y;
        return this;

    },
    copyDivideScalar: function (v) {

        return this.clone().divideScalar(v);

    },
    divideSelf: function (v) {

        return this.divide(this, v);

    },

    divideScalar: function (s) {

        if (s) {

            this.x /= s;
            this.y /= s;

        } else {

            this.set(0, 0, 0);

        }

        return this;

    },


    negate: function () {

        return this.multiplyScalar(-1);

    },

    dot: function (v) {

        return this.x * v.x + this.y * v.y;

    },

    lengthSq: function () {

        return this.x * this.x + this.y * this.y;

    },

    length: function () {

        return Math.sqrt(this.lengthSq());

    },

    lengthManhattan: function () {

        // correct version
        // return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

        return this.x + this.y;

    },

    normalize: function () {

        return this.divideScalar(this.length());

    },
    GetGormalize: function () {

        return this.copyDivideScalar(this.length());

    },
    setLength: function (l) {

        return this.normalize().multiplyScalar(l);

    },
    ToNormal: function () {
        var _x = this.x;
        this.x = -this.y;
        this.y = _x;
        return this;

    },

    distanceTo: function (v) {

        return Math.sqrt(this.distanceToSquared(v));

    },

    distanceToSquared: function (v) {

        return new Engine.Vec2().sub(this, v).lengthSq();

    },

    isZero: function () {

        return (this.lengthSq() < 0.0001 /* almostZero */);

    }

};
Array.prototype.remove = function (s) {
    var i = this.indexOf(s);
    if (i != -1) this.splice(i, 1);
};
Array.prototype.contain = function (obj) {
    return (this.indexOf(obj) != -1);
} 