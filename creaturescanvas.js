var canvas = document.querySelector('canvas');

cw = window.innerWidth;
canvas.width = cw;
ch = window.innerHeight;
canvas.height = ch;

var c = canvas.getContext('2d');

left = false;
right = false;
up = false;
down = false;

//config
stepsPerFrame = 4;
reproduceThreshold = 50;
reproductionCost = 20;
decayrate = .005;
foodPerSecond = 60;
foodValue = 4;
massPerRadius = 30;



let Circles = [];

window.addEventListener('keydown', function(event) {
    console.log(event);
    if (event.keyCode == 37 && !left) {
        left = true;
        //Circles[0].addforcex(-10);
    }
    if (event.keyCode == 38 && !up) {
        up = true;
        //Circles[0].addforcey(-10);
    }
    if (event.keyCode == 39 && !right) {
        right = true;
        //Circles[0].addforcex(10)
    }
    if (event.keyCode == 40 && !down) {
        down = true;
        for(var c of Circles) {
            console.log(c.fx);
            console.log(c.fy);    
        }
        
        //Circles[0].addforcey(10);
    }
    if (event.keyCode == 32) {
        var rad = Math.random()*50
        Circles.push(new Circle(rad, 100, 100, 10, 50, 1));
    }
});

window.addEventListener('keyup', function(event) {
    if (event.keyCode == 37 && left) {
        //Circles[0].addforcex(10);
        left = false;
    }
    if (event.keyCode == 38 && up) {
        //Circles[0].addforcey(10);
        up = false;
    }
    if (event.keyCode == 39 && right) {
        //Circles[0].addforcex(-10)
        right = false;
    }
    if (event.keyCode == 40 && down) {
        //Circles[0].addforcey(-10);
        down = false;
    }
});

class Circle {
    constructor(radius, x, y, f, reproduceThreshold, carnivorousness) {
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.fx = 0;
        this.fy = 0;
        this.airres = .99;
        this.force = f;
        this.updatemass();
        this.carnivore = false;
        this.reproduceThreshold = reproduceThreshold;
        this.carnivorousness = carnivorousness;
    }
    updatemass() {
        this.m = this.radius * massPerRadius;
    }
    draw() {
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.fillStyle = "rgba(" + this.carnivorousness * 255 + ", 0," + (255 - this.carnivorousness * 255)  +  ",.2)";
        if(this.carnivore) {
            c.strokeStyle = "rgb(" + this.force * 12.75 + ", 0," + (255 - this.force * 12.75) +  ")"; 
        }
        else {
            c.strokeStyle = "rgb(" + this.force * 12.75 + ", 255," + (255 - this.force * 12.75) +  ")";   
        }
        c.fill();
        c.stroke();
    }
    setforce() { 
        var nearest = null; 
        var neardist;
        for (var food of Foods) {
            var d = (food.x-this.x)*(food.x-this.x) + (food.y-this.y)*(food.y-this.y)
            if(nearest==null) {
                nearest = food;
                neardist = d;
            }
            else if(d < neardist) {
                neardist = d;
                nearest = food;
            }
        }

        if(nearest) {
            //draw line between
            //c.beginPath();
            //c.strokeStyle = 'white';
            //c.moveTo(this.x, this.y);
            //c.lineTo(nearest.x, nearest.y);
            //c.stroke();        

            //set force
            neardist = Math.sqrt(neardist);
            this.fx = (nearest.x - this.x)*this.force / neardist;
            this.fy = (nearest.y - this.y)*this.force / neardist;
            //c.beginPath();
            //c.strokeStyle = 'white';
            //c.moveTo(this.x, this.y);
            //c.lineTo(this.x+(this.fx*10), this.y+(this.fy*10));
            //c.stroke();
        }
        else{
            this.fx = 0;
            this.fy = 0;
        }

    }
    update(Circles) {
        //check for outside bounds
        if (this.x+this.radius>cw) {
            this.vx = -this.vx;
            this.x = cw-this.radius;
        }
        if (this.x-this.radius<0) {
            this.vx = -this.vx;            
           this.x=this.radius;
        }
        if (this.y+this.radius>ch) {
            this.vy = -this.vy;
            this.y = ch-this.radius;
        }
        if (this.y-this.radius<0) {
            this.vy = -this.vy;            
            this.y=this.radius;
        }
        for(const circle of Circles) {
            var distsq = (Math.pow(this.x-circle.x,2) + Math.pow(this.y-circle.y,2));
            if(distsq < Math.pow((this.radius + circle.radius),2) && circle != this && !this.carnivore && !circle.carnivore) {
                //collision

                //resolve static collision
                var dist = Math.sqrt(distsq);
                var overlap = .5*(dist-this.radius - circle.radius)

                if(dist == 0) {
                    circle.x+=.05;                
                    dist = Math.sqrt(Math.pow(this.x-circle.x,2) + Math.pow(this.y-circle.y,2));
                    overlap = .5*(dist-this.radius - circle.radius);
                }

                //this ball
                this.x -= overlap * (this.x - circle.x) / dist;
                this.y -= overlap * (this.y - circle.y) / dist;

                //other ball
                circle.x += overlap * (this.x - circle.x) / dist;
                circle.y += overlap * (this.y - circle.y) / dist;

                //resolve dynamic collision

                //recalculate dist
                dist = Math.sqrt(Math.pow(this.x-circle.x,2) + Math.pow(this.y-circle.y,2));

                //normal
                var nx = (circle.x-this.x) / dist;
                var ny = (circle.y-this.y) / dist;
                
                //tangent
                var tx = -ny;
                var ty = nx;

                //tangential response / tangent dot velocity
                var tan1 = this.vx*tx + this.vy*ty;
                var tan2 = circle.vx*tx + circle.vy*ty;

                //tangential response / tangent dot velocity
                var norm1 = this.vx*nx + this.vy*ny;
                var norm2 = circle.vx*nx + circle.vy*ny;

                //conservation of momentum in 1d - wikipedia
                var m1 = (norm1*(this.m-circle.m) + 2*circle.m*norm2) / (this.m + circle.m);
                var m2 = (norm2*(circle.m-this.m) + 2*this.m*norm1) / (this.m + circle.m);
                
                this.vx = tx*tan1 + nx*m1;
                this.vy = ty*tan1 + ny*m1;
                circle.vx = tx*tan2 + nx*m2;
                circle.vy = ty*tan2 + ny*m2;
                
            }
        }
        for(const f in Foods) {
            var food = Foods[f];
            var distsq = (Math.pow(this.x-food.x,2) + Math.pow(this.y-food.y,2));
            if(distsq < Math.pow((this.radius + food.radius),2)) {
                //ate a food
                Foods.splice(f,1);
                if(this.radius < this.reproduceThreshold) {
                    if(this.carnivore) {
                        this.radius += .025*foodValue;
                    }
                    else {
                        this.radius += (1-this.carnivorousness) * foodValue;
                    }
                    this.carnivore = Math.random() < this.carnivorousness;
                }
                this.updatemass();
            }
        }
        if(this.carnivore) {
            for(const f in Circles) {
                var circle = Circles[f];
                var distsq = (Math.pow(this.x-circle.x,2) + Math.pow(this.y-circle.y,2));
                if(distsq < Math.pow((this.radius),2) && (circle.radius < this.radius) ) {
                    //ate a circle
                    Circles.splice(f,1);
                    if(this.radius < this.reproduceThreshold * 2) {
                        this.radius += circle.radius * this.carnivorousness;
                    }
                    else {
                        this.carnivore = false;
                    }
                    this.updatemass();

                }
            }
        }
        //move based on kinematics
        this.x += this.vx;
        this.y += this.vy;
        this.vx += this.fx / this.m;
        this.vx = this.airres * this.vx;
        this.vy += this.fy / this.m;
        this.vy = this.airres * this.vy;

        //decay
        this.radius -= (Math.abs(this.vx) + Math.abs(this.vy))*decayrate
        this.updatemass();

        //delete self if tiny (death)
        if(this.radius < 2) {
            for(var circ in Circles) {
                if(Circles[circ] == this) {
                    Circles.splice(circ, 1);
                }
            }
        }

        //reproduce if large
        if(this.radius > this.reproduceThreshold && !this.carnivore) {
            this.radius -= reproductionCost;
            this.updatemass();
            var force = this.force + Math.random() * 5 - 2.5;
            if(force > 20 || force < 0) {force = this.force};
            var reproduceThreshold = this.reproduceThreshold + Math.random() * 10 - 5;
            if(reproduceThreshold > 200) {reproduceThreshold = this.reproduceThreshold};
            var carnivorousness = this.carnivorousness + Math.random() * .20 - .1;
            if(carnivorousness > 1 || carnivorousness < 0) {carnivorousness = this.carnivorousness};
            Circles.push(new Circle(30, this.x, this.y-this.radius-30, force, reproduceThreshold, carnivorousness));
        }

        //c.beginPath();
        //c.strokeStyle = 'yellow';
        //c.moveTo(this.x, this.y);
        //c.lineTo(this.x+(this.vx*10), this.y+(this.vy*10));
        //c.stroke();


        //if velocity small (and no force), stop
        if (Math.abs(this.vx) < .05 && this.fx == 0) { this.vx = 0;}
        if (Math.abs(this.vy) < .05 && this.fy == 0) { this.vy = 0;}
        //this.setforce();
        this.draw();
    }
}

class Food {
    constructor(x, y) {
        this.radius = 2;
        this.x = x;
        this.y = y;
    }
    draw() {
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.strokeStyle = 'green';
        c.stroke();
    }
}

Circles.push(new Circle(30, 100, 100, 10, 50, 0));

let Foods = [];

t = Date.now();

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, cw, ch);
    for (i=1;i<stepsPerFrame;i++) {
        for (circle of Circles) {
            circle.update(Circles);
        }       
        for (food of Foods) {
            food.draw();
        }
    }
    for(circle of Circles) {
        circle.setforce();
    }
    dt = Date.now() - t;
    if(dt > (1000 / foodPerSecond)) {
        Foods.push(new Food(Math.random()*cw, Math.random()*ch))
        t = Date.now();
    }
}


animate();