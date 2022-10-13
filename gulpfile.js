const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const pug = require('gulp-pug');
const sourcemaps = require('gulp-sourcemaps');
const fse = require('fs-extra');

const startServer = (done) => {
    browserSync.init({
        server: './bundle'
    });
    gulp.watch(['src/pug/**/*.pug']).on('change', gulp.series('buildPug'));
    gulp.watch(['src/sass/**/*.scss'], gulp.series('buildSass'));
    gulp.watch(['src/assets/**/*.*'], gulp.series('copyAssets'));
    done();
}

const watch = (done) => {
    gulp.watch(['src/pug/**/*.pug']).on('change', gulp.series('buildPug'));
    gulp.watch(['src/sass/**/*.scss'], gulp.series('buildSass'));
    gulp.watch(['src/assets/**/*.*'], gulp.series('copyAssets'));
    done();
}

const buildPug = () => {
    return gulp.src('./src/pug/pages/index.pug')
    .pipe(plumber({
        errorHandler: notify.onError((err)=> {
        return {
            title: 'Pug Error',
            message: err.message
        }
        })
    }))
    .pipe(pug({
        pretty: true,
        locals: {
            // jsonData: JSON.parse(fse.readFile(path, 'UTF-8'))
        }
    }))
    .pipe(gulp.dest('./bundle'))
    .pipe(browserSync.stream());
}

const buildSass = () => {
    return gulp.src('./src/sass/style.scss')
    .pipe(plumber({
        errorHandler: notify.onError((err)=> {
        return {
            title: 'Sass Error',
            message: err.message
        }
        })
    }))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        cascade: false
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./bundle'))
    .pipe(browserSync.stream());
}

const clean = (done) => {
    try {
        fse.removeSync('./bundle/');
    } catch (error) {
        console.error(error);
    }
    done();
}


const copyAssets = () => {
    return gulp.src('./src/assets/**/*.*')
    .pipe(gulp.dest('./bundle/assets/'))
    .pipe(browserSync.stream());
}


exports.server = startServer;
exports.buildPug = buildPug;
exports.clean = clean;
exports.buildSass = buildSass;
exports.copyAssets = copyAssets;
exports.watch = watch;
exports.start = gulp.series(clean, gulp.parallel(buildPug, buildSass, copyAssets), startServer);