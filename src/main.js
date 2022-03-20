define(function (require, exports, module) {
  require("game-shim");
  require("dat.gui");
  // only when optimized

  var Loader = require("engine/loader"),
    Clock = require("engine/clock").Clock,
    InputHandler = require("engine/input").Handler,
    debounce = require("engine/utils").debounce,
    ShaderManager = require("engine/gl/shader").Manager,
    geometry = require("engine/gl/geometry"),
    FBO = require("engine/gl/texture").FBO,
    Mesh = require("engine/gl/mesh").Mesh,
    glcontext = require("engine/gl/context"),
    glm = require("gl-matrix"),
    ComputeKernel = require("compute").Kernel,
    vec2 = glm.vec2;

  var canvas = document.getElementById("c"),
    gl = glcontext.initialize(
      canvas,
      {
        context: {
          depth: false,
        },
        debug: false,
        extensions: {
          texture_float: true,
        },
      },
      fail
    ),
    options = {
      iterations: 16,
      cursor_size: 200,
    },
    gui = new dat.GUI(),
    clock = new Clock(canvas),
    input = new InputHandler(canvas),
    loader = new Loader(),
    resources = loader.resources,
    shaders = new ShaderManager(gl, resources);

  window.gl = gl;

  function fail(el, msg, id) {
    document.getElementById("video").style.display = "block";
  }

  function hasFloatLuminanceFBOSupport() {
    var fbo = new FBO(gl, 32, 32, gl.FLOAT, gl.LUMINANCE);
    return fbo.supported;
  }

  function init() {
    // just load it when it's there. If it's not there it's hopefully not needed.
    gl.getExtension("OES_texture_float_linear");
    var format = hasFloatLuminanceFBOSupport() ? gl.LUMINANCE : gl.RGBA,
      onresize;
    window.addEventListener(
      "resize",
      debounce(
        (onresize = function () {
          var rect = canvas.getBoundingClientRect(),
            width = rect.width,
            height = rect.height;
          input.updateOffset();
          setup(width, height, format);
        }),
        250
      )
    );
    gui.add(options, "iterations", 2, 128).step(2);
    gui.add(options, "cursor_size", 50, 400).step(10).onFinishChange(onresize);
    gui.close();
    onresize();
    clock.start();
  }

  function setup(width, height, singleComponentFboFormat) {
    (canvas.width = width), (canvas.height = height);

    gl.viewport(0, 0, width, height);
    gl.lineWidth(1.0);

    var px_x = 1.0 / canvas.width;
    var px_y = 1.0 / canvas.height;
    var px = vec2.create([px_x, px_y]);
    (px1 = vec2.create([1, canvas.width / canvas.height])),
      (inside = new Mesh(gl, {
        vertex: geometry.screen_quad(1.0 - px_x * 2.0, 1.0 - px_y * 2.0),
        attributes: {
          position: {},
        },
      })),
      (all = new Mesh(gl, {
        vertex: geometry.screen_quad(1.0, 1.0),
        attributes: {
          position: {},
        },
      })),
      (velocityFBO0 = new FBO(gl, width, height, gl.FLOAT)),
      (velocityFBO1 = new FBO(gl, width, height, gl.FLOAT)),
      (divergenceFBO = new FBO(
        gl,
        width,
        height,
        gl.FLOAT,
        singleComponentFboFormat
      )),
      (pressureFBO0 = new FBO(
        gl,
        width,
        height,
        gl.FLOAT,
        singleComponentFboFormat
      )),
      (pressureFBO1 = new FBO(
        gl,
        width,
        height,
        gl.FLOAT,
        singleComponentFboFormat
      )),
      (advectVelocityKernel = new ComputeKernel(gl, {
        shader: shaders.get("kernel", "advect"),
        mesh: inside,
        uniforms: {
          px: px,
          px1: px1,
          scale: 1.0,
          velocity: velocityFBO0,
          source: velocityFBO0,
          dt: 0.1,
        },
        output: velocityFBO1,
      })),
      (cursor = new Mesh(gl, {
        vertex: geometry.screen_quad(
          px_x * options.cursor_size * 2,
          px_y * options.cursor_size * 2
        ),
        attributes: {
          position: {},
        },
      })),
      (addForceKernel = new ComputeKernel(gl, {
        shader: shaders.get("cursor", "addForce"),
        mesh: cursor,
        blend: "add",
        uniforms: {
          px: px,
          force: vec2.create([0.0, 0.0]),
          center: vec2.create([0.0, 0.0]),
          scale: vec2.create([
            options.cursor_size * px_x,
            options.cursor_size * px_y,
          ]),
        },
        output: velocityFBO1,
      })),
      (divergenceKernel = new ComputeKernel(gl, {
        shader: shaders.get("kernel", "divergence"),
        mesh: all,
        uniforms: {
          velocity: velocityFBO1,
          px: px,
        },
        output: divergenceFBO,
      })),
      (jacobiKernel = new ComputeKernel(gl, {
        shader: shaders.get("kernel", "jacobi"),
        // use all so the simulation still works
        // even if the pressure boundary is not
        // properly enforced
        mesh: all,
        nounbind: true,
        uniforms: {
          pressure: pressureFBO0,
          divergence: divergenceFBO,
          alpha: -1.0,
          beta: 0.25,
          px: px,
        },
        output: pressureFBO1,
      })),
      (subtractPressureGradientKernel = new ComputeKernel(gl, {
        shader: shaders.get("kernel", "subtractPressureGradient"),
        mesh: all,
        uniforms: {
          scale: 1.0,
          pressure: pressureFBO0,
          velocity: velocityFBO1,
          px: px,
        },
        output: velocityFBO0,
      })),
      (drawKernel = new ComputeKernel(gl, {
        shader: shaders.get("kernel", "visualize"),
        mesh: all,
        uniforms: {
          velocity: velocityFBO0,
          pressure: pressureFBO0,
          px: px,
        },
        output: null,
      }));

    var x_prev = input.mouse.x;
    var y_prev = input.mouse.y;

    clock.ontick = function (dt) {
      var x_curr = input.mouse.x;
      var y_curr = input.mouse.y;
      var dx = x_curr - x_prev;
      var dy = y_curr - y_prev;

      // save the previous mouse position
      (x_prev = x_curr), (y_prev = y_curr);

      if (x_prev === 0 && y_prev === 0) dx = dy = 0;
      advectVelocityKernel.uniforms.dt = dt;
      advectVelocityKernel.run();

      vec2.set([dx * 0.1, -dy * 0.1], addForceKernel.uniforms.force);
      vec2.set(
        [x_prev * px_x * 2 - 1.0, (y_prev * px_y * 2 - 1.0) * -1],
        addForceKernel.uniforms.center
      );
      addForceKernel.run();

      divergenceKernel.run();

      var p0 = pressureFBO0,
        p1 = pressureFBO1,
        p_ = p0;
      for (var i = 0; i < options.iterations; i++) {
        jacobiKernel.uniforms.pressure = p0;
        jacobiKernel.outputFBO = p1;
        jacobiKernel.run();
        p_ = p0;
        p0 = p1;
        p1 = p_;
      }

      subtractPressureGradientKernel.run();

      drawKernel.run();
    };
  }

  if (gl)
    loader.load(
      [
        "shaders/advect.frag",
        "shaders/addForce.frag",
        "shaders/divergence.frag",
        "shaders/jacobi.frag",
        "shaders/subtractPressureGradient.frag",
        "shaders/visualize.frag",
        "shaders/cursor.vertex",
        "shaders/kernel.vertex",
      ],
      init
    );
});
