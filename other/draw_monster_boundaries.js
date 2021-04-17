const draw_text = (text, x, y) => {
    let t = new PIXI.Text(text,{fontFamily : parent.SZ.font, fontSize: 36, fontWeight: "bold", fill : 0x005500, align : 'center'});
    t.x = x;
    t.y = y;
    t.type = "text";
    t.scale = new PIXI.Point(0.5, 0.5);
    t.parentGroup = parent.text_layer;
    t.anchor.set(0.5, 1);
    parent.drawings.push(t)
    parent.map.addChild(t);
}

let areas = G.maps[character.map].monsters;
let colors = {
    boundary: 0x005500,
    rage: 0xaa0000
}
for (const i in areas) {
    const current = areas[i];
    for (const area in colors) {
        if (area in current) {
            const x0 = current[area][0];
            const y0 = current[area][1];
            const x1 = current[area][2];
            const y1 = current[area][3];
            const tx = Math.round((x0+x1)/2);
            const ty = Math.round(y0+Math.random()*(y1-y0));
            if (area === "boundary") draw_text(current.type+": "+current.count, tx, ty);
            draw_line(x0, y0, x1, y0, 2, colors[area]);
            draw_line(x1, y0, x1, y1, 2, colors[area]);
            draw_line(x1, y1, x0, y1, 2, colors[area]);
            draw_line(x0, y1, x0, y0, 2, colors[area]);

        }
    }
}