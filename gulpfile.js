var gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemap = require('gulp-sourcemaps'),
    watch = require('gulp-watch'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    svgmin = require('gulp-svgmin'),
    svgstore = require('gulp-svgstore'),
    inject = require('gulp-inject'),
    grst = require('gulp-remove-svg-tag'),
    concat = require('gulp-concat');

gulp.task('watch', function() {
    // watch anything that ends in '.scss' inside the 'assets/scss' folder
    gulp.watch('assets/scss/**/*.scss', ['sass']);
    // watch anything that ends in '.js' inside the 'assets/js' folder
    gulp.watch('assets/js/**/*.js', ['js']);
    // watch anything that ends in .png, .jpg or .gif inside the 'assets/img' folder
    gulp.watch('assets/img/*.{png,gif,jpg}', ['imagemin']);
    // watch for svg inside the 'assets/img/svg' folder
    gulp.watch('assets/img/svg/*.svg', ['svgstore']);
});

gulp.task('imagemin', function() {
    return gulp.src('assets/img/*.{png,gif,jpg}')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('webroot/img'));
});

gulp.task('svgstore', function () {
    var svgs = gulp
        .src('assets/img/svg/*.svg')
        .pipe(svgmin())
        .pipe(grst({
            tagNames: ['style', 'title']
        }))
        .pipe(svgstore({
            inlineSvg: true
        }));
 
    function fileContents (filePath, file) {
        return file.contents.toString();
    }
 
    return gulp
        .src('assets/img/svg/svg.html')
        .pipe(inject(svgs, {
            transform: fileContents
        }))
        .pipe(gulp.dest('webroot/img/svg'));
});

gulp.task('js', function() {
    return gulp.src('assets/js/**/*.js')
        .pipe(plumber({
            errorHandler: function (err) {
                gutil.log(gutil.colors.red(err));
                gutil.beep();
                this.emit('end');
            }
        }))
        .pipe(sourcemap.init())
        .pipe(concat('scripts.js'))
        .pipe(uglify())
        .pipe(sourcemap.write('./'))
        .pipe(gulp.dest('webroot/js'));
});

gulp.task('sass', function() {
    return gulp.src('assets/scss/main.scss')
        .pipe(plumber({
            errorHandler: function (err) {
                gutil.log(gutil.colors.red(err));
                gutil.beep();
                this.emit('end');
            }
        }))
        .pipe(sourcemap.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(autoprefixer({
            browsers: ['last 3 version']
        }))
        .pipe(sourcemap.write('./'))
        .pipe(gulp.dest('webroot/css'));
});

gulp.task('default', ['svgstore', 'imagemin', 'js', 'sass']);