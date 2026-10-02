const { src, dest, watch, series, parallel } = require('gulp');
const fileInclude = require('gulp-file-include');
const sass        = require('gulp-sass')(require('sass'));
const cleanCSS    = require('gulp-clean-css');
const concat      = require('gulp-concat');
const terser      = require('gulp-terser');
const imagemin    = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

// Шляхи до файлів
const paths = {
  html: {
    src: ['src/**/*.html', '!src/components/**/*.html'], // Ігноруємо підключаємі частини
    watch: 'src/**/*.html',
    dest: 'dist/'
  },
  styles: {
    src: 'src/scss/**/*.scss',
    dest: 'dist/css/'
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/js/'
  },
  images: {
    src: 'src/imgs/**/*',
    dest: 'dist/img/'
  }
};

// 1. Обробка HTML з file include (@@include('html/_header.html'))
function htmlTask() {
  return src(paths.html.src)
    .pipe(fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// 2. Компіляція SCSS у CSS з мініфікацією
function stylesTask() {
  return src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// 3. Об'єднання та мініфікація JS
function scriptsTask() {
  return src(paths.scripts.src)
    .pipe(concat('main.min.js'))
    .pipe(terser())
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// 4. Оптимізація зображень
function imagesTask() {
  return src('src/imgs/**/*', { encoding: false }) // Обробляємо лише нові або змінені файли
    .pipe(dest(paths.images.dest))
    .pipe(browserSync.stream());
}

// 5. Локальний сервер BrowserSync
function serverTask() {
  browserSync.init({
    server: {
      baseDir: 'dist/'
    },
    port: 3000,
    notify: false
  });
}

// 6. Відстеження змін (Watcher)
function watchTask() {
  watch(paths.html.watch, htmlTask);
  watch(paths.styles.src, stylesTask);
  watch(paths.scripts.src, scriptsTask);
  watch(paths.images.src, imagesTask);
}

// Експорт тасок для консолі
exports.html   = htmlTask;
exports.styles = stylesTask;
exports.js     = scriptsTask;
exports.images = imagesTask;
exports.build  = series(parallel(htmlTask, stylesTask, scriptsTask, imagesTask));

// Дефолтна таска: запуск збірки, сервера та відстеження
exports.default = series(
  parallel(htmlTask, stylesTask, scriptsTask, imagesTask),
  parallel(serverTask, watchTask)
);