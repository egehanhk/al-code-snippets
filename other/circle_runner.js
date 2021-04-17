/* Sum two of 2D vectors */
function vector_sum(a, b) {
    return {x: a.x + b.x, y: a.y + b.y};
}

/* Convert polar vector coordiantes to cartesian */
function polar2cartesian(v) {
    return {x: v.r*Math.cos(v.a), y: v.r*Math.sin(v.a)};
}

/* Finds the angle of point p relative to center c */
function angle_to_point(c, p) {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    return Math.atan2(dy, dx);
}

setInterval(()=>{
	const center = {x: 0, y: 0};
	const radius = 50;
	const angle_speed = -character.speed/radius * 0.2;
	
	const current_angle = angle_to_point(center, character);
	const next_angle = current_angle + angle_speed;

	const next_position = vector_sum(center, polar2cartesian({r: radius, a: next_angle}));
	move(next_position.x, next_position.y);
}, 200);