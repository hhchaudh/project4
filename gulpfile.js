var gulp = require("gulp");
var typedoc = require("gulp-typedoc");

gulp.task("typedoc", function() {
  return gulp
    .src(["src/app/*.ts"])
    .pipe(typedoc({
      module: "commonjs",
      target: "es6",
      out: "frontendDocs/",
      name: "My project title",
      "experimentalDecorators": "true",
    }))
    ;
});
