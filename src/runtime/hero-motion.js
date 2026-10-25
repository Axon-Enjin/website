// One GPU surface, sampled by the existing canvas scheduler. No extra RAF loop.
export function createHeroMotion({ artwork, lowPower }) {
  let surface, gl, program, texture, buffer, locations, layout, startedAt;
  let failed = false;
  const vertex = `
    attribute vec2 position;
    varying vec2 uv;
    void main(){uv=vec2(position.x*.5+.5,.5-position.y*.5);gl_Position=vec4(position,0.,1.);}
  `;
  const fragment = `
    precision mediump float;
    uniform sampler2D art;
    uniform float time;
    uniform vec4 crop;
    varying vec2 uv;
    float cluster(vec2 p,vec2 center,vec2 radius){vec2 q=(p-center)/radius;return exp(-dot(q,q)*2.);}
    void main(){
      vec2 p=mix(crop.xy,crop.zw,uv);
      float anchor=smoothstep(.48,.8,p.x);
      float top=cluster(p,vec2(.82,.24),vec2(.31,.31))*anchor;
      float middle=cluster(p,vec2(.88,.51),vec2(.32,.22))*anchor;
      float bottom=cluster(p,vec2(.82,.82),vec2(.3,.26))*anchor;
      float ease=smoothstep(0.,2.2,time);
      vec2 offset=vec2(
        top*sin(time*.58+p.y*5.)*.012+middle*sin(time*.43+1.8)*.009+bottom*sin(time*.52+3.7)*.014,
        top*sin(time*.71+p.x*3.)*.021+middle*sin(time*.62+3.)*.014+bottom*sin(time*.49+1.)*.022
      )*ease;
      // One continuous sample avoids double edges around the bright fibre tips.
      gl_FragColor=texture2D(art,clamp(p+offset,vec2(.001),vec2(.999)));
    }
  `;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error("Hero motion shader unavailable");
    }
    return shader;
  }
  function initialize() {
    surface = document.createElement("canvas");
    gl = surface.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
    if (!gl) throw new Error("WebGL unavailable");
    const vs = compile(gl.VERTEX_SHADER, vertex);
    const fs = compile(gl.FRAGMENT_SHADER, fragment);
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error("Hero motion unavailable");
    gl.useProgram(program);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      artwork,
    );
    locations = {
      time: gl.getUniformLocation(program, "time"),
      crop: gl.getUniformLocation(program, "crop"),
    };
  }
  return {
    resize(rect) {
      const artRect = artwork.getBoundingClientRect();
      const style = getComputedStyle(artwork);
      layout = {
        x: artRect.left - rect.left,
        y: artRect.top - rect.top,
        width: artRect.width,
        height: artRect.height,
        cover: style.objectFit === "cover",
        positionX: parseFloat(style.objectPosition) / 100 || 0.5,
      };
    },
    draw(ctx, clock, paused) {
      if (
        failed ||
        paused ||
        !layout ||
        !artwork.complete ||
        !artwork.naturalWidth
      )
        return false;
      try {
        if (!gl) initialize();
        if (gl.isContextLost()) return false;
        if (startedAt === undefined) startedAt = clock;
        const ratio = Math.min(
          1,
          (lowPower || innerWidth <= 760 ? 850 : 1600) / layout.width,
        );
        const w = Math.max(1, Math.round(layout.width * ratio)),
          h = Math.max(1, Math.round(layout.height * ratio));
        if (surface.width !== w || surface.height !== h) {
          surface.width = w;
          surface.height = h;
          gl.viewport(0, 0, w, h);
        }
        let left = 0,
          top = 0,
          right = 1,
          bottom = 1;
        if (layout.cover) {
          const scale = Math.max(
            layout.width / artwork.naturalWidth,
            layout.height / artwork.naturalHeight,
          );
          const visibleX = layout.width / (artwork.naturalWidth * scale),
            visibleY = layout.height / (artwork.naturalHeight * scale);
          left = (1 - visibleX) * layout.positionX;
          right = left + visibleX;
          top = (1 - visibleY) * 0.5;
          bottom = top + visibleY;
        }
        gl.uniform1f(locations.time, clock - startedAt);
        gl.uniform4f(locations.crop, left, top, right, bottom);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        ctx.drawImage(surface, layout.x, layout.y, layout.width, layout.height);
        return true;
      } catch {
        failed = true;
        return false;
      }
    },
    dispose() {
      if (!gl) return;
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl = null;
      surface = null;
    },
  };
}
