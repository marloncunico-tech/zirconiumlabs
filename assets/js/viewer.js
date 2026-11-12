/* Visualizador 3D em WebGL puro: modelo + caixa delimitadora com cotas. Sem dependências. */
(function () {
  // ---------- matemática mínima (matrizes coluna-maior) ----------
  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function lookAt(eye, c, up) {
    var z = norm(sub(eye, c)), x = norm(cross(up, z)), y = cross(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
  }
  function mul(a, b) {
    var o = new Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }

  var VS = "attribute vec3 p;attribute vec3 n;uniform mat4 m;varying vec3 vn;void main(){vn=n;gl_Position=m*vec4(p,1.0);}";
  var FS = "precision mediump float;varying vec3 vn;uniform vec3 col;uniform float flat_;" +
    "void main(){if(flat_>0.5){gl_FragColor=vec4(col,1.0);return;}" +
    "vec3 N=normalize(vn);float k=0.38+0.55*max(dot(N,normalize(vec3(0.5,-0.7,0.9))),0.0)+0.22*max(dot(N,normalize(vec3(-0.8,0.6,0.2))),0.0);" +
    "gl_FragColor=vec4(min(col*k,vec3(1.0)),1.0);}";

  function Viewer(canvas, overlay) {
    this.canvas = canvas; this.overlay = overlay;
    var gl = this.gl = canvas.getContext("webgl", { antialias: true, preserveDrawingBuffer: true }) || canvas.getContext("experimental-webgl");
    if (!gl) throw new Error("Seu navegador não suporta WebGL. As medidas e o preço continuam funcionando.");
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; }
    var pr = this.prog = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    this.loc = { p: gl.getAttribLocation(pr, "p"), n: gl.getAttribLocation(pr, "n"), m: gl.getUniformLocation(pr, "m"), col: gl.getUniformLocation(pr, "col"), flat: gl.getUniformLocation(pr, "flat_") };
    gl.enable(gl.DEPTH_TEST);
    this.theta = -Math.PI / 4; this.phi = 0.55; this.zoom = 1; this.color = [0.66, 0.69, 0.72];
    this.labels = ["", "", ""];
    this._bind();
    var self = this;
    if (window.ResizeObserver) new ResizeObserver(function () { self.draw(); }).observe(canvas);
  }

  Viewer.prototype.setMesh = function (pos) {
    var gl = this.gl, nrm = new Float32Array(pos.length);
    var min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (var i = 0; i < pos.length; i += 9) {
      var u = [pos[i + 3] - pos[i], pos[i + 4] - pos[i + 1], pos[i + 5] - pos[i + 2]];
      var w = [pos[i + 6] - pos[i], pos[i + 7] - pos[i + 1], pos[i + 8] - pos[i + 2]];
      var nn = norm(cross(u, w));
      for (var k = 0; k < 9; k += 3) { nrm[i + k] = nn[0]; nrm[i + k + 1] = nn[1]; nrm[i + k + 2] = nn[2]; }
      for (k = 0; k < 9; k++) { var d = k % 3, v = pos[i + k]; if (v < min[d]) min[d] = v; if (v > max[d]) max[d] = v; }
    }
    this.min = min; this.max = max;
    this.center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
    this.radius = Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 2 || 1;
    this.count = pos.length / 3;
    this.pBuf = this.pBuf || gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.pBuf); gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
    this.nBuf = this.nBuf || gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuf); gl.bufferData(gl.ARRAY_BUFFER, nrm, gl.STATIC_DRAW);
    // 12 arestas da caixa
    var a = min, b = max, C = [[a[0], a[1], a[2]], [b[0], a[1], a[2]], [b[0], b[1], a[2]], [a[0], b[1], a[2]], [a[0], a[1], b[2]], [b[0], a[1], b[2]], [b[0], b[1], b[2]], [a[0], b[1], b[2]]];
    var E = [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7], L = [];
    E.forEach(function (ix) { L.push(C[ix][0], C[ix][1], C[ix][2]); });
    this.corners = C;
    this.lBuf = this.lBuf || gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.lBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(L), gl.STATIC_DRAW);
    this.lnBuf = this.lnBuf || gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.lnBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(L.length), gl.STATIC_DRAW);
    this.draw();
  };

  Viewer.prototype.setColor = function (c) { this.color = c; this.draw(); };
  Viewer.prototype.setLabels = function (l) { this.labels = l; this.draw(); };

  Viewer.prototype._mvp = function () {
    var w = this.canvas.clientWidth, h = this.canvas.clientHeight, d = this.radius * 2.9 / this.zoom, c = this.center;
    var eye = [c[0] + d * Math.cos(this.phi) * Math.cos(this.theta), c[1] + d * Math.cos(this.phi) * Math.sin(this.theta), c[2] + d * Math.sin(this.phi)];
    return mul(perspective(0.7, w / Math.max(h, 1), this.radius * 0.05, this.radius * 20), lookAt(eye, c, [0, 0, 1]));
  };

  Viewer.prototype._project = function (m, p) {
    var x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
    return [(x / w * 0.5 + 0.5) * this.canvas.clientWidth, (1 - (y / w * 0.5 + 0.5)) * this.canvas.clientHeight];
  };

  Viewer.prototype.draw = function () {
    if (!this.count) return;
    var gl = this.gl, cv = this.canvas, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = Math.round(cv.clientWidth * dpr), H = Math.round(cv.clientHeight * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    gl.viewport(0, 0, W, H); gl.clearColor(0.106, 0.153, 0.192, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var m = this._mvp(), L = this.loc;
    gl.uniformMatrix4fv(L.m, false, new Float32Array(m));
    function attr(buf, loc) { gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0); }
    attr(this.pBuf, L.p); attr(this.nBuf, L.n);
    gl.uniform3fv(L.col, this.color); gl.uniform1f(L.flat, 0); gl.drawArrays(gl.TRIANGLES, 0, this.count);
    attr(this.lBuf, L.p); attr(this.lnBuf, L.n);
    gl.uniform3fv(L.col, [0.949, 0.62, 0.122]); gl.uniform1f(L.flat, 1); gl.drawArrays(gl.LINES, 0, 24);
    // cotas: meio das arestas X (0-1), Y (1-2) e Z (0-4) da caixa
    if (this.overlay) {
      var C = this.corners, self = this, pairs = [[0, 1], [1, 2], [0, 4]];
      var spans = this.overlay.querySelectorAll("span");
      pairs.forEach(function (pr, i) {
        var a = C[pr[0]], b = C[pr[1]], mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
        var s = self._project(m, mid), el = spans[i];
        if (!el) return;
        el.textContent = self.labels[i]; el.style.transform = "translate(" + Math.round(s[0]) + "px," + Math.round(s[1]) + "px) translate(-50%,-50%)";
      });
    }
  };

  Viewer.prototype._bind = function () {
    var self = this, cv = this.canvas, drag = null, pinch = null;
    cv.addEventListener("pointerdown", function (e) { drag = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", function (e) {
      if (!drag || pinch) return;
      self.theta -= (e.clientX - drag[0]) * 0.01; self.phi = Math.max(-1.5, Math.min(1.5, self.phi + (e.clientY - drag[1]) * 0.01));
      drag = [e.clientX, e.clientY]; self.draw();
    });
    cv.addEventListener("pointerup", function () { drag = null; });
    cv.addEventListener("wheel", function (e) { e.preventDefault(); self.zoom = Math.max(0.4, Math.min(5, self.zoom * (e.deltaY < 0 ? 1.1 : 0.9))); self.draw(); }, { passive: false });
    cv.addEventListener("touchmove", function (e) {
      if (e.touches.length !== 2) { pinch = null; return; }
      var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (pinch) { self.zoom = Math.max(0.4, Math.min(5, self.zoom * d / pinch)); self.draw(); }
      pinch = d; e.preventDefault();
    }, { passive: false });
    cv.addEventListener("touchend", function () { pinch = null; });
    cv.addEventListener("keydown", function (e) {
      var k = e.key, step = 0.15;
      if (k === "ArrowLeft") self.theta += step; else if (k === "ArrowRight") self.theta -= step;
      else if (k === "ArrowUp") self.phi = Math.min(1.5, self.phi + step); else if (k === "ArrowDown") self.phi = Math.max(-1.5, self.phi - step);
      else if (k === "+" || k === "=") self.zoom = Math.min(5, self.zoom * 1.1); else if (k === "-") self.zoom = Math.max(0.4, self.zoom * 0.9);
      else return;
      e.preventDefault(); self.draw();
    });
  };

  window.ZircViewer = Viewer;
})();
