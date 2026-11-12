/* Leitura de STL (binário e ASCII) e métricas geométricas: caixa, volume e área. */
(function () {
  function isBinary(buf) {
    if (buf.byteLength < 84) return false;
    var n = new DataView(buf).getUint32(80, true);
    if (84 + n * 50 === buf.byteLength) return true;
    // Alguns exportadores escrevem "solid" no cabeçalho binário; checa por texto
    var head = new TextDecoder().decode(new Uint8Array(buf, 0, Math.min(512, buf.byteLength)));
    return !/^\s*solid[\s\S]*facet/.test(head);
  }

  function parseBinary(buf) {
    var dv = new DataView(buf), n = dv.getUint32(80, true);
    var pos = new Float32Array(n * 9), o = 84;
    for (var i = 0; i < n; i++) {
      o += 12; // normal do arquivo é ignorada; recalculamos
      for (var j = 0; j < 9; j++) { pos[i * 9 + j] = dv.getFloat32(o, true); o += 4; }
      o += 2;
    }
    return pos;
  }

  function parseAscii(buf) {
    var txt = new TextDecoder().decode(buf), re = /vertex\s+([-+\d.eE]+)\s+([-+\d.eE]+)\s+([-+\d.eE]+)/g, m, a = [];
    while ((m = re.exec(txt))) a.push(+m[1], +m[2], +m[3]);
    a.length -= a.length % 9;
    return new Float32Array(a);
  }

  function parse(buf) {
    var pos = isBinary(buf) ? parseBinary(buf) : parseAscii(buf);
    if (!pos.length) throw new Error("Não encontramos triângulos neste arquivo. Exporte novamente como STL (binário ou ASCII).");
    return pos;
  }

  // Métricas em unidades do arquivo multiplicadas por "escala" (1 = mm; 25,4 = polegada→mm)
  function metrics(pos, escala) {
    escala = escala || 1;
    var min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity], vol = 0, area = 0;
    for (var i = 0; i < pos.length; i += 9) {
      var ax = pos[i], ay = pos[i + 1], az = pos[i + 2],
          bx = pos[i + 3], by = pos[i + 4], bz = pos[i + 5],
          cx = pos[i + 6], cy = pos[i + 7], cz = pos[i + 8];
      for (var k = 0; k < 9; k += 3) for (var d = 0; d < 3; d++) {
        var v = pos[i + k + d]; if (v < min[d]) min[d] = v; if (v > max[d]) max[d] = v;
      }
      // volume assinado do tetraedro com a origem
      vol += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
      var ux = bx - ax, uy = by - ay, uz = bz - az, wx = cx - ax, wy = cy - ay, wz = cz - az;
      var nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
      area += Math.sqrt(nx * nx + ny * ny + nz * nz) / 2;
    }
    var s3 = escala * escala * escala, s2 = escala * escala;
    return {
      triangulos: pos.length / 9,
      min: min, max: max,
      dimMm: [0, 1, 2].map(function (d) { return (max[d] - min[d]) * escala; }),
      volumeCm3: Math.abs(vol) * s3 / 1000,
      areaCm2: area * s2 / 100,
      fechado: vol !== 0
    };
  }

  window.ZircSTL = { parse: parse, metrics: metrics };
})();
